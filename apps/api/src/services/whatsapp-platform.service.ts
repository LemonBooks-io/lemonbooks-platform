import { env } from "../config";
import { query } from "../database/pool";
import { encryptMetaCredentials } from "./meta-whatsapp.service";

export type PlatformReplyInput = {
  body: string;
  displayName?: string | null;
  publicWebUrl: string;
};

export function platformReplyFor(input: PlatformReplyInput): string | null {
  const body = input.body.trim();
  const lower = body.toLowerCase();
  if (/^(stop|unsubscribe|opt\s*out)$/i.test(body)) return null;
  if (/\b(register|sign\s*up|create\s+(?:an?\s+)?account|get\s+started)\b/i.test(body)) {
    return `Create your secure LemonBooks workspace here: ${input.publicWebUrl}/login?mode=signup&utm_source=whatsapp\n\nWe will verify your email with a one-time code. Never send passwords, card PINs, or OTPs in this chat.`;
  }
  if (/\b(paid|payment|transfer|transferred|receipt)\b/i.test(body)) {
    return "Thanks — I captured your payment message for review. A payment is not marked as confirmed until LemonBooks matches it to provider or bank evidence. Include the invoice number and amount if available.";
  }
  if (/\b(invoice|order|sale|expense|stock|inventory|restock|record)\b/i.test(body)) {
    return "I captured your business request as a draft for review. Please include the customer or supplier, item, quantity, amount, and invoice/reference where available. LemonBooks will ask for confirmation before posting a financial or inventory record.";
  }
  const greeting = input.displayName ? `Hi ${input.displayName}` : "Hi";
  return `${greeting} — welcome to LemonBooks.\n\nReply with:\n• REGISTER to create a workspace\n• INVOICE or ORDER to capture a business request\n• PAYMENT to report payment evidence\n• HELP to see this menu again\n\nLemonBooks will not post financial records without confirmation.`;
}

export async function provisionWhatsAppPlatformConnection() {
  const values = [env.whatsapp.platformTenantSlug, env.whatsapp.platformWabaId, env.whatsapp.platformPhoneNumberId, env.whatsapp.platformAccessToken];
  if (values.every(value => !value)) return;
  if (values.some(value => !value)) throw new Error("Complete all WHATSAPP_PLATFORM_* environment variables or remove all of them");
  if (!env.whatsapp.credentialsKey) throw new Error("INTEGRATION_CREDENTIALS_KEY is required for the WhatsApp platform connection");
  const business = (await query<{ id: string }>("SELECT id FROM businesses WHERE tenant_slug=$1", [env.whatsapp.platformTenantSlug]))[0];
  if (!business) throw new Error(`WhatsApp platform tenant '${env.whatsapp.platformTenantSlug}' does not exist`);
  const existingConnection = (await query<{ business_id: string }>(
    `SELECT business_id FROM integration_connections
     WHERE provider='meta_whatsapp' AND environment='production'
       AND external_account_id=$1 AND deleted_at IS NULL
     LIMIT 1`,
    [env.whatsapp.platformPhoneNumberId],
  ))[0];
  if (existingConnection && existingConnection.business_id !== business.id) {
    throw new Error(`WhatsApp phone number ${env.whatsapp.platformPhoneNumberId} is already assigned to another tenant`);
  }
  const encrypted = encryptMetaCredentials({ accessToken: env.whatsapp.platformAccessToken, tokenType: "system_user" });
  await query(
    `INSERT INTO integration_connections(business_id,kind,provider,status,environment,external_account_id,external_business_id,capabilities,encrypted_credentials,consent_scope,consented_at,last_success_at)
     VALUES($1,'whatsapp','meta_whatsapp','active','production',$2,$3,$4,$5,$6,now(),now())
     ON CONFLICT(provider,environment,external_account_id) WHERE external_account_id IS NOT NULL AND deleted_at IS NULL
     DO UPDATE SET external_business_id=EXCLUDED.external_business_id,status='active',capabilities=EXCLUDED.capabilities,encrypted_credentials=EXCLUDED.encrypted_credentials,consent_scope=EXCLUDED.consent_scope,deleted_at=NULL,updated_at=now()`,
    [business.id, env.whatsapp.platformPhoneNumberId, env.whatsapp.platformWabaId, JSON.stringify({ messaging: true, templates: true, platformEntryPoint: true }), encrypted, JSON.stringify(["whatsapp_business_management", "whatsapp_business_messaging"])],
  );
  console.log(`WhatsApp platform connection ready for phone ${env.whatsapp.platformPhoneNumberId}`);
}
