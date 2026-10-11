export const whatsappLinkSchema = `
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE businesses ALTER COLUMN email DROP NOT NULL;
CREATE TABLE IF NOT EXISTS whatsapp_auth_identities (
 phone text PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS whatsapp_account_link_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  contact_id uuid NOT NULL REFERENCES whatsapp_contacts(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE whatsapp_account_link_tickets ADD COLUMN IF NOT EXISTS purpose text NOT NULL DEFAULT 'link';
ALTER TABLE whatsapp_account_link_tickets DROP CONSTRAINT IF EXISTS whatsapp_account_link_tickets_purpose_check;
ALTER TABLE whatsapp_account_link_tickets ADD CONSTRAINT whatsapp_account_link_tickets_purpose_check CHECK(purpose IN ('link','login'));
CREATE TABLE IF NOT EXISTS whatsapp_account_links (
  contact_id uuid PRIMARY KEY REFERENCES whatsapp_contacts(id) ON DELETE CASCADE,
  business_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(business_id,user_id) REFERENCES memberships(business_id,user_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS whatsapp_link_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL UNIQUE REFERENCES whatsapp_account_link_tickets(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES whatsapp_account_links(contact_id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
  body text NOT NULL,
  state text NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','sent','failed','suppressed')),
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  provider_message_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS whatsapp_link_notifications_pending_idx
  ON whatsapp_link_notifications(next_attempt_at) WHERE state='pending';
CREATE TABLE IF NOT EXISTS whatsapp_auth_challenges (
 ticket_id uuid PRIMARY KEY REFERENCES whatsapp_account_link_tickets(id) ON DELETE CASCADE,
 otp_hash text NOT NULL, attempts integer NOT NULL DEFAULT 0,
 expires_at timestamptz NOT NULL, sent_at timestamptz NOT NULL DEFAULT now(),
 proof_hash text, verified_at timestamptz
);
ALTER TABLE whatsapp_auth_challenges ADD COLUMN IF NOT EXISTS send_count integer NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS whatsapp_onboarding_sessions (
 contact_id uuid PRIMARY KEY REFERENCES whatsapp_contacts(id) ON DELETE CASCADE,
 conversation_id uuid NOT NULL REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
 stage text NOT NULL CHECK(stage IN ('business_name','email','confirm')),
 data jsonb NOT NULL DEFAULT '{}'::jsonb,
 expires_at timestamptz NOT NULL DEFAULT now()+interval '24 hours',
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS whatsapp_onboarding_expiry_idx ON whatsapp_onboarding_sessions(expires_at);

CREATE TABLE IF NOT EXISTS whatsapp_action_drafts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
 contact_id uuid NOT NULL REFERENCES whatsapp_contacts(id) ON DELETE CASCADE,
 conversation_id uuid NOT NULL REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
 requested_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 action_type text NOT NULL CHECK(action_type IN ('invoice','inventory','sale','expense','payment')),
 payload jsonb NOT NULL,
 source_message_id text NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','cancelled','expired','failed')),
 result_type text,
 result_id text,
 failure_reason text,
 expires_at timestamptz NOT NULL DEFAULT now()+interval '24 hours',
 confirmed_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(contact_id,source_message_id)
);
CREATE INDEX IF NOT EXISTS whatsapp_action_drafts_pending_idx
 ON whatsapp_action_drafts(contact_id,created_at DESC) WHERE status='pending';
`;
