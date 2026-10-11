# LemonBooks WhatsApp assistant

LemonBooks uses one shared, Lemon-owned WhatsApp number as a private business assistant. A merchant's customer-facing WhatsApp Business connection remains separate.

## Merchant flows

- **Create an account:** send `GET STARTED`, enter the business name, optionally add an email, review the summary, then send `CREATE`.
- **Connect an existing workspace:** send `CONNECT`, open the 10-minute private link, sign in by email code, and explicitly approve the link.
- **Return to the portal from WhatsApp:** send `LOGIN`. The one-time link opens the linked workspace without a password.
- **Sign in on another device:** select **Continue with WhatsApp** on the login page. On desktop, scan the QR code or open WhatsApp directly, send the prepared `LOGIN XXXX-XXXX` message, then explicitly reply `APPROVE XXXX-XXXX`. The browser signs in automatically after approval. Requests expire after five minutes and work once.
- **Multiple businesses:** send `BUSINESSES`, then `SWITCH | business name`.
- **Disconnect:** send `UNLINK`, or use **Settings → WhatsApp assistant**.

## Bookkeeping commands

```text
ADD ITEM
Name: POS Ipad
Quantity: 20
Price: 12500
Cost: 5000
Description: Epson low data POS ipad

ADD CUSTOMER
Name: Ada Okafor
Phone: 08012345678
Email: ada@example.com

INVOICE
Customer: Ada
Item: Rice
Quantity: 2
Price: 45000

SALE
Customer: Ada
Item: Rice
Quantity: 2
Price: 45000
Method: POS

EXPENSE
Description: Generator fuel
Amount: 25000
Category: Utilities

PAYMENT
Invoice: INV-00001
Amount: 25000
Method: transfer
```

Labels are case-insensitive, surrounding spaces are trimmed, and fields can appear in any order. `Cost` and `Description` are optional for items. Common shortcuts include `AI` for **Add Item**, `AC` for **Add Customer**, and contextual field labels such as `N`, `Q`, `P`, `C`, and `D`.

Items and customers are safe workspace records, so complete commands save them immediately to the same catalogue and customer list used by the web dashboard. Invoice, sale, expense, and payment commands create an expiring draft; the merchant must reply `CONFIRM`, while `CANCEL` discards it. A reported payment creates a pending payment claim and does not confirm money until bank or provider evidence is matched. The older pipe-delimited commands remain supported for compatibility.

## Meta configuration

Configure the webhook callback as:

```text
GET/POST https://<api-host>/api/v3/webhooks/whatsapp
```

Set these API environment variables:

```text
META_APP_ID=
META_APP_SECRET=
META_WHATSAPP_CONFIG_ID=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
WHATSAPP_PLATFORM_TENANT_SLUG=
WHATSAPP_PLATFORM_WABA_ID=
WHATSAPP_PLATFORM_PHONE_NUMBER_ID=
WHATSAPP_PLATFORM_DISPLAY_NUMBER=2348012345678
WHATSAPP_PLATFORM_ACCESS_TOKEN=
INTEGRATION_CREDENTIALS_KEY=
PUBLIC_WEB_URL=https://app.lemonbooks.io
PUBLIC_API_URL=https://api.lemonbooks.io
```

`WHATSAPP_PLATFORM_DISPLAY_NUMBER` is the public international number without spaces or a leading `+`. It powers the **Continue with WhatsApp** and **Open Lemon in WhatsApp** buttons. The platform access token should be a permanent System User token with the required WhatsApp permissions. Never place it in the web application.

The Meta app must subscribe the WABA to message webhooks. The webhook receiver verifies `X-Hub-Signature-256`, rejects unknown phone IDs, deduplicates provider message IDs, and stores an audit trail.

## Verification

```bash
npm run typecheck -w @lemonbooks/api
npm run typecheck -w @lemonbooks/web
RUN_DB_TESTS=1 npm test -w @lemonbooks/api
npm run build -w @lemonbooks/api
npm run build -w @lemonbooks/web
```

The database-backed suite covers chat-native registration, existing-account linking, browser-bound WhatsApp approval, one-time login, denial and replay protection, email-code login, workspace isolation, action confirmation, provider failure retry, and opt-out behavior.
