export const whatsappLinkSchema = `
CREATE TABLE IF NOT EXISTS whatsapp_account_link_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  contact_id uuid NOT NULL REFERENCES whatsapp_contacts(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
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
`;
