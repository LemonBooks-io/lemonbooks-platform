# LemonBooks

LemonBooks brings bookkeeping, invoicing, inventory, payments, and reconciliation into one workspace for businesses operating across fragmented payment rails.

## Applications

- `apps/web` — React, TypeScript, Vite, and Tailwind web application
- `apps/api` — Node.js, Express, TypeScript, and PostgreSQL API

Future mobile applications and integration SDKs belong in `apps/mobile` and `packages/sdk` respectively.

## Development

From this directory, install dependencies, start PostgreSQL, then run both applications:

```sh
npm install
npm run infra:up
npm run dev
```

Open `http://localhost:5173` (Vite will print a different port if that one is busy). The API runs at `http://localhost:5000` and automatically applies its idempotent PostgreSQL schema at startup.

In development, the OTP is shown on the verification screen so local signup works without an email provider. A user signs up with their name, email, password, and business name; verification atomically creates the user, owner membership, and isolated business tenant. No super-admin provisioning is involved.

`infra:up` starts PostgreSQL 17 and persists its data in a named Docker volume. PostgreSQL is the server source of truth. The authenticated `/api/v3/sync/pull` and `/api/v3/sync/push` endpoints implement the change shape needed by a future WatermelonDB mobile client; WatermelonDB itself belongs in the mobile application as its offline local database, not in the web or server runtime.

Paystack checkout is enabled when `PAYSTACK_SECRET_KEY` is configured in `apps/api/.env`. Set `PUBLIC_WEB_URL` to the web origin customers can reach and configure the Paystack dashboard webhook as `https://your-api.example.com/api/v3/payments/paystack/webhook`. LemonBooks initializes transactions only on the server, verifies redirects and signed webhooks, and allocates successful payments idempotently. Checkout belongs to the customer's secure invoice page; the business workspace never asks the issuer to pay its own invoice.

Each eligible business can activate a Paystack-backed payment account from **Business settings**. LemonBooks verifies the settlement bank account, creates a Paystack subaccount, creates a provider customer mapping, and requests a dedicated virtual account linked to that subaccount. Set `PAYSTACK_PLATFORM_FEE_PERCENT` to the percentage Paystack should route to the LemonBooks main account; the remainder follows Paystack's settlement schedule to the business bank account. Provisioning may remain pending until Paystack emits `dedicatedaccount.assign.success`. This requires a live Paystack integration approved for Dedicated Virtual Accounts in the relevant country and may require BVN/bank identity data depending on the integration category.

Invoice delivery uses SMTP and intentionally does not pretend that an email was sent. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` in `apps/api/.env`. If delivery fails or SMTP is absent, the API returns an error and preserves the invoice as a draft. A successfully delivered email links to the customer invoice, where the customer can:

- pay online with Paystack;
- report cash payment and identify who received it;
- report a bank transfer and attach a PNG, JPEG, or PDF receipt;
- create a password-protected customer account to review that business's invoices and payment history.

Cash and transfer reports remain pending until the business approves or rejects them from **Payments**. For local development, ensure `PUBLIC_WEB_URL` matches the port Vite actually prints (commonly `http://localhost:5173` or `http://localhost:5174`).

The active workspace includes tenant-scoped team management, editable clients and items, CSV bulk imports with downloadable templates, a unified product/service item catalogue, and multi-line invoices built from saved items. Every read and mutation derives its business scope from the verified membership rather than accepting a tenant identifier from the request body.

## Quality checks

```sh
npm run typecheck
npm run lint
npm run build
```

## Deployment

The repository is an npm-workspaces monorepo. Commit the root `package-lock.json`; nested npm/yarn lockfiles and `pnpm-lock.yaml` are intentionally ignored.

For the web application on Vercel, import this repository and set the project **Root Directory** to `apps/web`. Vercel uses `apps/web/vercel.json` for Vite detection, immutable asset caching, security headers, and the SPA fallback required by routes such as `/data-deletion`, `/whatsapp`, `/customer-portal`, and public invoice links. Configure `VITE_API_URL` with the public API origin, for example `https://api.lemonbooks.io`.

Deploy `apps/api` to a persistent Node.js service with PostgreSQL rather than a request-scoped Vercel Function. The API runs background integration, outbox, retry, reconciliation, and overdue-event workers. Configure `CLIENT_URL` with the exact deployed web origins and `PUBLIC_WEB_URL` with the canonical customer-facing web origin.

The former Idati implementations are retained under each application's `legacy/` directory for migration reference and are excluded from active builds and linting.

The original Edartee application at `/home/tinkerpal/projects/edartee-files` is the canonical workflow reference. Its migration status and LemonBooks-specific adaptations are tracked in [`docs/EDARTEE_FEATURE_MAP.md`](docs/EDARTEE_FEATURE_MAP.md).

The production architecture and delivery scope for planned bank-feed reconciliation and WhatsApp Business integration is documented in [`docs/BANK_AND_WHATSAPP_INTEGRATION_SCOPE.md`](docs/BANK_AND_WHATSAPP_INTEGRATION_SCOPE.md). It deliberately treats direct Moniepoint business-bank feed access and Meta coexistence as partner-dependent capabilities that must be confirmed during discovery.

### Meta WhatsApp Embedded Signup

Configure the Meta app in `apps/api/.env` with `META_APP_ID`, `META_APP_SECRET`, `META_WHATSAPP_CONFIG_ID`, `META_GRAPH_API_VERSION`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, and a 32-byte base64 `INTEGRATION_CREDENTIALS_KEY`. Configure the public web app with `VITE_META_APP_ID` and `VITE_META_WHATSAPP_CONFIG_ID`. In Meta, use `https://YOUR_API/api/v3/webhooks/whatsapp` as the callback and subscribe the app to the WhatsApp `messages` field. The single merchant-facing destination is `/whatsapp`: disconnected businesses see Embedded Signup, while connected businesses see their inbox and automations.
