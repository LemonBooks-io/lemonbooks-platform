import crypto from "node:crypto";
import { env } from "../config";
import { query, transaction } from "../database/pool";
import { HttpError } from "../http";
import { createSessionToken } from "../middleware/auth";
import { publicBusiness } from "./auth.service";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ACTIVE_STATUSES = ["pending", "awaiting_approval", "approved"];

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function normalizeDeviceLoginCode(value: unknown) {
  if (typeof value !== "string") return null;
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return /^[A-HJ-NP-Z2-9]{8}$/.test(compact) ? compact : null;
}

function displayCode(compact: string) {
  return `${compact.slice(0, 4)}-${compact.slice(4)}`;
}

function randomCode() {
  let value = "";
  for (let index = 0; index < 8; index += 1) value += CODE_ALPHABET[crypto.randomInt(0, CODE_ALPHABET.length)];
  return value;
}

export function describeLoginDevice(userAgent: unknown) {
  const value = typeof userAgent === "string" ? userAgent.slice(0, 500) : "";
  const browser = /Edg\//.test(value) ? "Edge" : /Firefox\//.test(value) ? "Firefox" : /Chrome\//.test(value) ? "Chrome" : /Safari\//.test(value) ? "Safari" : "Web browser";
  const platform = /Android/.test(value) ? "Android" : /iPhone|iPad/.test(value) ? "iPhone or iPad" : /Windows/.test(value) ? "Windows" : /Mac OS X|Macintosh/.test(value) ? "macOS" : /Linux/.test(value) ? "Linux" : "a device";
  return `${browser} on ${platform}`;
}

export type DeviceLoginCommand = { action: "request" | "approve" | "deny"; code: string };

export function parseDeviceLoginCommand(value: unknown): DeviceLoginCommand | null {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(LOGIN|APPROVE|DENY)\s+([A-Z0-9-]+)$/i);
  const code = normalizeDeviceLoginCode(match?.[2]);
  if (!match || !code) return null;
  return { action: match[1]!.toLowerCase() === "login" ? "request" : match[1]!.toLowerCase() as "approve" | "deny", code };
}

async function expireOldChallenges() {
  await query(`UPDATE whatsapp_device_login_challenges SET status='expired',updated_at=now()
    WHERE status=ANY($1::text[]) AND expires_at<=now()`, [ACTIVE_STATUSES]);
  await query(`DELETE FROM whatsapp_device_login_challenges
    WHERE status IN ('denied','consumed','cancelled','expired') AND updated_at<now()-interval '7 days'`);
}

export async function createDeviceLoginChallenge(input: { userAgent?: string; ip?: string }) {
  if (!env.whatsapp.platformDisplayNumber) throw new HttpError(503, "WhatsApp sign-in is temporarily unavailable.");
  await expireOldChallenges();
  const browserToken = crypto.randomBytes(32).toString("hex");
  const deviceLabel = describeLoginDevice(input.userAgent);
  const requesterIpHash = input.ip ? crypto.createHmac("sha256", env.jwtSecret).update(input.ip).digest("hex") : null;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const compactCode = randomCode();
    try {
      const [row] = await query<{ expires_at: Date }>(`INSERT INTO whatsapp_device_login_challenges
        (code_hash,browser_token_hash,device_label,requester_ip_hash,expires_at)
        VALUES($1,$2,$3,$4,now()+interval '5 minutes') RETURNING expires_at`,
      [sha256(compactCode), sha256(browserToken), deviceLabel, requesterIpHash]);
      const code = displayCode(compactCode);
      return {
        browserToken,
        code,
        deviceLabel,
        expiresAt: row!.expires_at,
        whatsappUrl: `https://wa.me/${env.whatsapp.platformDisplayNumber}?text=${encodeURIComponent(`LOGIN ${code}`)}`,
      };
    } catch (error: any) {
      if (error?.code !== "23505" || attempt === 3) throw error;
    }
  }
  throw new HttpError(503, "Could not prepare WhatsApp sign-in. Try again.");
}

async function linkedIdentity(client: any, contactId: string) {
  const { rows: [row] } = await client.query(`SELECT l.user_id,l.business_id,b.name AS business_name
    FROM whatsapp_account_links l
    JOIN memberships m ON m.user_id=l.user_id AND m.business_id=l.business_id
    JOIN businesses b ON b.id=l.business_id
    WHERE l.contact_id=$1`, [contactId]);
  return row as { user_id: string; business_id: string; business_name: string } | undefined;
}

export async function handleDeviceLoginCommand(contactId: string, command: DeviceLoginCommand) {
  return transaction(async client => {
    const { rows: [challenge] } = await client.query(`SELECT * FROM whatsapp_device_login_challenges
      WHERE code_hash=$1 FOR UPDATE`, [sha256(command.code)]);
    if (!challenge || new Date(challenge.expires_at).getTime() <= Date.now() || !ACTIVE_STATUSES.includes(challenge.status)) {
      if (challenge && ACTIVE_STATUSES.includes(challenge.status)) await client.query("UPDATE whatsapp_device_login_challenges SET status='expired',updated_at=now() WHERE id=$1", [challenge.id]);
      return "That sign-in request is no longer available. Start again from the LemonBooks login page on your computer.";
    }
    const identity = await linkedIdentity(client, contactId);
    if (!identity) return "Connect this WhatsApp number to LemonBooks first. Reply CONNECT to link your account.";
    const code = displayCode(command.code);
    if (command.action === "request") {
      if (challenge.contact_id && challenge.contact_id !== contactId) return "That sign-in request belongs to another WhatsApp account.";
      await client.query(`UPDATE whatsapp_device_login_challenges SET status='awaiting_approval',contact_id=$2,user_id=$3,business_id=$4,claimed_at=COALESCE(claimed_at,now()),updated_at=now() WHERE id=$1`, [challenge.id, contactId, identity.user_id, identity.business_id]);
      return `Sign in to ${identity.business_name}?\n\nDevice: ${challenge.device_label}\nCode: ${code}\n\nReply APPROVE ${code} to sign in, or DENY ${code} if you did not request this.`;
    }
    if (challenge.status !== "awaiting_approval" || challenge.contact_id !== contactId) return "Open the sign-in request from your computer again before approving it.";
    if (command.action === "deny") {
      await client.query("UPDATE whatsapp_device_login_challenges SET status='denied',denied_at=now(),updated_at=now() WHERE id=$1", [challenge.id]);
      await client.query(`INSERT INTO integration_audit_log(business_id,actor_type,actor_id,action,resource_type,resource_id)
        VALUES($1,'whatsapp_contact',$2,'auth.whatsapp_device_login_denied','whatsapp_device_login_challenge',$3)`, [identity.business_id, contactId, challenge.id]);
      return "Sign-in request denied. The computer was not signed in.";
    }
    await client.query("UPDATE whatsapp_device_login_challenges SET status='approved',approved_at=now(),updated_at=now() WHERE id=$1", [challenge.id]);
    await client.query(`INSERT INTO integration_audit_log(business_id,actor_type,actor_id,action,resource_type,resource_id)
      VALUES($1,'whatsapp_contact',$2,'auth.whatsapp_device_login_approved','whatsapp_device_login_challenge',$3)`, [identity.business_id, contactId, challenge.id]);
    return `Approved. Return to ${challenge.device_label}; LemonBooks will finish signing you in. This approval works once.`;
  });
}

async function challengeForBrowser(client: any, browserToken: unknown, lock = false) {
  if (typeof browserToken !== "string" || !/^[a-f0-9]{64}$/.test(browserToken)) throw new HttpError(400, "This sign-in request is invalid.");
  const { rows: [row] } = await client.query(`SELECT * FROM whatsapp_device_login_challenges
    WHERE browser_token_hash=$1${lock ? " FOR UPDATE" : ""}`, [sha256(browserToken)]);
  if (!row) throw new HttpError(404, "This sign-in request was not found.");
  if (new Date(row.expires_at).getTime() <= Date.now() && ACTIVE_STATUSES.includes(row.status)) {
    await client.query("UPDATE whatsapp_device_login_challenges SET status='expired',updated_at=now() WHERE id=$1", [row.id]);
    row.status = "expired";
  }
  return row;
}

export async function deviceLoginStatus(browserToken: unknown) {
  return transaction(async client => {
    const row = await challengeForBrowser(client, browserToken);
    return { status: row.status, deviceLabel: row.device_label, expiresAt: row.expires_at };
  });
}

export async function cancelDeviceLogin(browserToken: unknown) {
  return transaction(async client => {
    const row = await challengeForBrowser(client, browserToken, true);
    if (["pending", "awaiting_approval"].includes(row.status)) await client.query("UPDATE whatsapp_device_login_challenges SET status='cancelled',updated_at=now() WHERE id=$1", [row.id]);
    return { status: ["pending", "awaiting_approval"].includes(row.status) ? "cancelled" : row.status };
  });
}

export async function finishDeviceLogin(browserToken: unknown) {
  return transaction(async client => {
    const row = await challengeForBrowser(client, browserToken, true);
    if (row.status !== "approved" || !row.user_id || !row.business_id) throw new HttpError(409, row.status === "denied" ? "This sign-in request was denied." : "Approve this sign-in request from WhatsApp first.");
    const { rows: [member] } = await client.query(`SELECT b.*,m.role,u.name AS user_name,u.email AS user_email
      FROM memberships m JOIN businesses b ON b.id=m.business_id JOIN users u ON u.id=m.user_id
      WHERE m.user_id=$1 AND m.business_id=$2 FOR UPDATE OF m`, [row.user_id, row.business_id]);
    if (!member) throw new HttpError(403, "This workspace is no longer available.");
    await client.query("UPDATE whatsapp_device_login_challenges SET status='consumed',consumed_at=now(),updated_at=now() WHERE id=$1", [row.id]);
    return {
      token: createSessionToken({ sub: row.user_id, businessId: row.business_id, tenantSlug: member.tenant_slug, role: member.role }),
      user: { id: row.user_id, name: member.user_name, email: member.user_email, role: member.role },
      business: publicBusiness(member),
    };
  });
}
