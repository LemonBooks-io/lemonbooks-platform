# Edartee → LemonBooks functional migration map

`/home/tinkerpal/projects/edartee-files` is the canonical behavioral reference. LemonBooks preserves useful workflows, but uses self-service tenants, PostgreSQL, clearer permissions, a unified item catalogue, and provider-neutral payments.

## Authentication and tenancy

- [x] Owner self-signup, OTP verification, and atomic business provisioning
- [x] Tenant-aware login and membership verification on every request
- [x] Team creation and role editing
- [ ] Password reset/change and production email delivery
- [ ] Granular permission sets and team bulk import
- [x] Customer portal authentication scoped to the issuing business

## Business configuration

- [x] Business identity, address, phone, country, currency, and timezone
- [x] Paystack server checkout, verification, signed webhook, and invoice allocation
- [ ] Logo upload and invoice branding
- [ ] Tax defaults, invoice numbering, payment terms, and document templates
- [ ] Production Paystack credentials, settlement reporting, refunds, and disputes

## Clients

- [x] Create, list, search, edit, and CSV import
- [ ] Client detail workspace
- [ ] Client invoices, estimates, payments, subscriptions, support notes, and statement
- [ ] Archive/delete and opening balances
- [x] Customer invoice and payment-history portal
- [ ] Customer account statements

## Items and inventory

- [x] Unified product/service catalogue, create/edit, filtering, stock fields, and CSV import
- [ ] Categories and category bulk import
- [ ] Stock movements, adjustments, reorder alerts, and inventory valuation
- [ ] Recurring/service billing cycles
- [ ] Item archive and detailed activity history

## Invoices and estimates

- [x] Multi-line invoice composer from saved items
- [x] Draft and sent lifecycle with tenant-safe transition
- [x] Transactional invoice email delivery, resend, secure public/customer view, and payment link
- [ ] Invoice detail, editing, duplication, print/PDF, and void
- [ ] Estimates, approval/rejection, and conversion to invoice
- [ ] Recurring invoices and batch operations
- [ ] Reminders and read status

## Payments and accounting

- [x] Customer cash/transfer payment reports and allocation to invoices after approval
- [x] Payment list, protected receipts, and customer payment history
- [x] Payment-proof upload, review, approval, and rejection
- [ ] Cash/transfer/POS/card ledgers and expense capture
- [ ] Account categories, journal/audit trail, statements, and tax reporting
- [ ] Bank feeds, Paystack settlements, matching, and reconciliation

## Offline and integrations

- [x] PostgreSQL source of truth and initial WatermelonDB-compatible sync boundary
- [ ] Complete conflict-safe sync for every mutable domain
- [ ] Mobile WatermelonDB schema and migrations
- [ ] WhatsApp workflow and public SDK

## Migration order

1. Finish invoice detail/edit/send/void and transactional email.
2. Add estimates and conversion.
3. Add manual payments, allocations, receipts, and client statements.
4. Add categories, inventory movements, and stock controls.
5. Add client detail, portal, payment proof, and subscriptions.
6. Add Paystack and reconciliation.
7. Complete offline sync, audit reporting, tax, WhatsApp, and SDK surfaces.
