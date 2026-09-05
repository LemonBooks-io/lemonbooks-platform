import bcrypt from "bcryptjs";
import { PoolClient } from "pg";
import { env } from "../config";
import { query, transaction } from "../database/pool";
import { HttpError } from "../http";
import { createSessionToken } from "../middleware/auth";
import { emailConfigured, sendCustomerAccessCode } from "./email.service";

type SignupInput = { name: string; email: string; password: string; businessName: string };
type Challenge = { id: string; tenant_slug: string; expires_at: Date };

function slugify(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
}

function publicBusiness(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    tenantSlug: row.tenant_slug,
    email: row.email,
    phone: row.phone,
    address: row.address,
    countryCode: row.country_code,
    currency: row.currency,
    timezone: row.timezone,
    logoUrl: row.logo_url,
    onboardingCompleted: row.onboarding_completed,
    paymentProvider: row.payment_provider,
  };
}

export async function startSignup(input: SignupInput) {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const businessName = input.businessName?.trim();
  if (!name || !email || !businessName || !input.password) throw new HttpError(400, "Complete all required fields");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new HttpError(400, "Enter a valid email address");
  if (input.password.length < 8) throw new HttpError(400, "Password must have at least 8 characters");
  if (!emailConfigured()) throw new HttpError(503, "Email delivery is not configured. Add SMTP settings before signing up.", "EMAIL_NOT_CONFIGURED");

  const existingUser = await query<{ id: string }>("SELECT id FROM users WHERE lower(email) = $1", [email]);
  if (existingUser[0]) throw new HttpError(409, "An account already exists for this email");

  const baseSlug = slugify(businessName);
  if (!baseSlug) throw new HttpError(400, "Business name must contain letters or numbers");
  let tenantSlug = baseSlug;
  const occupied = await query<{ tenant_slug: string }>("SELECT tenant_slug FROM businesses WHERE tenant_slug LIKE $1", [`${baseSlug}%`]);
  if (occupied.some((row) => row.tenant_slug === tenantSlug)) tenantSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const [otpHash, passwordHash] = await Promise.all([bcrypt.hash(otp, 10), bcrypt.hash(input.password, 12)]);
  await query("DELETE FROM signup_challenges WHERE lower(email) = $1 OR expires_at < now()", [email]);
  const rows = await query<Challenge>(
    `INSERT INTO signup_challenges (email, tenant_slug, payload, otp_hash, expires_at)
     VALUES ($1,$2,$3::jsonb,$4,now() + ($5 || ' minutes')::interval)
     RETURNING id, tenant_slug, expires_at`,
    [email, tenantSlug, JSON.stringify({ name, email, businessName, passwordHash }), otpHash, env.otpTtlMinutes],
  );
  const challenge = rows[0]!;

  try {
    await sendCustomerAccessCode({ email, name, businessName, otp, purpose: "business_signup" });
  } catch {
    await query("DELETE FROM signup_challenges WHERE id=$1", [challenge.id]);
    console.error("Business signup verification email failed; check SMTP configuration and provider delivery logs");
    throw new HttpError(502, "We could not send your verification email. Please try again shortly.", "EMAIL_DELIVERY_FAILED");
  }
  return { challengeId: challenge.id, tenantSlug: challenge.tenant_slug, email, expiresAt: challenge.expires_at };
}

export async function verifySignup(challengeId: string, otp: string) {
  const challenges = await query<{ id: string; email: string; tenant_slug: string; payload: SignupInput & { passwordHash: string }; otp_hash: string; attempts: number }>(
    "SELECT * FROM signup_challenges WHERE id=$1 AND expires_at > now()", [challengeId],
  );
  const challenge = challenges[0];
  if (!challenge) throw new HttpError(410, "This verification code has expired. Start again.");
  if (challenge.attempts >= 5) throw new HttpError(429, "Too many attempts. Start again for a new code.");
  if (!(await bcrypt.compare(String(otp), challenge.otp_hash))) {
    await query("UPDATE signup_challenges SET attempts=attempts+1 WHERE id=$1", [challengeId]);
    throw new HttpError(400, "That verification code is not correct");
  }

  return transaction(async (client: PoolClient) => {
    const payload = challenge.payload;
    const businessResult = await client.query(
      `INSERT INTO businesses (tenant_slug,name,email) VALUES ($1,$2,$3) RETURNING *`,
      [challenge.tenant_slug, payload.businessName, challenge.email],
    );
    const business = businessResult.rows[0];
    const userResult = await client.query(
      `INSERT INTO users (email,name,password_hash,email_verified_at) VALUES ($1,$2,$3,now()) RETURNING id,email,name`,
      [challenge.email, payload.name, payload.passwordHash],
    );
    const user = userResult.rows[0];
    await client.query("INSERT INTO memberships (business_id,user_id,role,permissions) VALUES ($1,$2,'owner','[\"all\"]')", [business.id, user.id]);
    await client.query("DELETE FROM signup_challenges WHERE id=$1", [challenge.id]);
    const token = createSessionToken({ sub: user.id, businessId: business.id, tenantSlug: business.tenant_slug, role: "owner" });
    return { token, user: { ...user, role: "owner" }, business: publicBusiness(business), nextStep: "business-profile" };
  });
}

export async function login(emailInput: string, password: string, tenantInput?: string) {
  const email = emailInput?.trim().toLowerCase();
  const tenant = tenantInput?.trim().toLowerCase();
  const rows = await query<Record<string, any>>(
    `SELECT u.id AS user_id,u.email,u.name,u.password_hash,m.role,b.*
     FROM users u JOIN memberships m ON m.user_id=u.id JOIN businesses b ON b.id=m.business_id
     WHERE lower(u.email)=$1 AND ($2::text IS NULL OR b.tenant_slug=$2) ORDER BY m.created_at LIMIT 2`,
    [email, tenant || null],
  );
  if (!rows[0] || !(await bcrypt.compare(password, rows[0].password_hash))) throw new HttpError(401, "Email or password is incorrect");
  if (!tenant && rows.length > 1) throw new HttpError(409, "Choose a business workspace to continue", "TENANT_REQUIRED");
  const row = rows[0];
  const token = createSessionToken({ sub: row.user_id, businessId: row.id, tenantSlug: row.tenant_slug, role: row.role });
  return { token, user: { id: row.user_id, email: row.email, name: row.name, role: row.role }, business: publicBusiness(row) };
}

export { publicBusiness, slugify };
