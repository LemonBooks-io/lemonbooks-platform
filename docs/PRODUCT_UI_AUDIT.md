# LemonBooks product and UI audit

Updated: 20 August 2026

LemonBooks should feel like a calm money workspace for a business owner, not a smaller ERP. Its primary visible journey is `invoice → payment → processor fee → settlement → bank deposit → reconciliation`.

Priority: **P0** trust/completion blocker, **P1** core competitive gap, **P2** important depth, **P3** later polish.

## Product-wide

- [x] **P1** Group navigation around Workspace, Money, and Business.
- [x] **P1** Rebuild the overview around Money In, Money to collect, net position, attention, and activity.
- [ ] **P0** Add reliable loading, error, retry, empty, and success states to every screen.
- [ ] **P0** A production-grade global notification system now confirms invoice, client, import, and payment-review mutations; remaining mutations still need migration and duplicate-submit auditing.
- [ ] **P1** Make invoice, customer, item, and payment rows open detail workspaces.
- [ ] **P1** Standardize sortable/filterable responsive tables, status language, alerts, skeletons, and dialogs.
- [ ] **P1** Complete accessibility: shared dialogs now trap/restore focus, support Escape, and lock background scrolling; remaining screens still need a full keyboard/announcement pass.
- [ ] **P1** Add Arabic/RTL, locale-aware dates/numbers, and correct KWD three-decimal formatting.
- [ ] **P2** Add global search/quick-create, notifications, contextual help, and reusable UI primitives.

## Authentication and onboarding

- [ ] **P0** Password reset/change, production email, and secure resend/recovery states.
- [ ] **P1** Inline validation, password requirements, return destination, language selector, and localized terms.
- [ ] **P0** Allow PSP setup to be skipped without blocking workspace creation.
- [ ] **P1** Turn onboarding into a saved checklist: business, invoice defaults, get paid, invite team.
- [ ] **P1** Add Kuwait/UAE, KWD/AED, regional timezones, Arabic, tax identity, and three-decimal previews.
- [ ] **P1** Explain clearly that the regulated PSP processes and settles merchant funds.

## Overview

- [x] **P1** Replace catalogue-heavy KPIs with money outcomes and an action centre.
- [x] **P1** Combine recent invoices and reported payments into one money activity feed.
- [ ] **P0** Add real expenses and bank balance; neither should be inferred from invoice data.
- [ ] **P1** Add payment-channel breakdown, settlements, date comparison, charts, and customizable cards.

## Payments

- [x] **P0** Separate the confirmed payment ledger from the customer-reported-payment review queue; Paystack and approved manual payments now share the ledger.
- [x] **P0** Add confirmation before approve/reject decisions; the backend status change provides the current audit record.
- [ ] **P1** Add payment detail showing invoice, method, processor, fee, net, settlement, bank, and reconciliation.
- [ ] **P1** Status and text filters are implemented; provider/method/date/amount filters, sorting, export, batch review, refunds, and disputes remain.
- [ ] **P1** Preview proof files safely in-app with type/size and download fallback.

## Invoices and composer

- [ ] **P0** Invoice detail, void, lifecycle view, and print are implemented; edit, duplicate, generated PDF, and audit history remain.
- [ ] **P0** Enforce and show Draft → Approval → Unpaid → Overdue → Paid.
- [ ] **P1** Status and text filters are implemented; multi-column sorting, batch send/remind/export, delivery/read state, estimates, and recurring invoices remain.
- [x] **P0** Send the invoice issue date to the API and persist it on the invoice.
- [ ] **P0** Autosave drafts, recover work, and warn before leaving with unsaved changes.
- [ ] **P1** Add inline customer/item creation, descriptions, discounts, percentage/fixed tax, attachments, and a true customer preview.
- [ ] **P1** Rework mobile line items as stacked cards with a persistent total/action bar.
- [x] **P0** Replace unbounded client and catalogue dropdowns with reusable searchable selection dialogs, keyboard navigation, incremental rendering, rich metadata, and responsive mobile presentation.

## Clients

- [ ] **P0** Add client detail with balance, overdue amount, invoices, payments, timeline, notes, and statement.
- [ ] **P1** Format balances in currency; add archive, merge detection, tags, import validation/export, and bulk actions.
- [ ] **P2** Add contacts, tax details, billing/shipping addresses, and default payment terms.

## Items and inventory

- [ ] **P0** Paid invoices now post stock exactly once with safe historical backfill; a visible item-level movement ledger still remains.
- [ ] **P1** Add low-stock attention, valuation, adjustments, categories, units, variants, archive, and activity.
- [ ] **P1** Format price/cost in currency and show permission-aware margin.
- [ ] **P2** Add images, barcodes, warehouses, reorder points, and suppliers.

## Team

- [ ] **P0** Replace shared temporary passwords with expiring invitations and forced password setup.
- [ ] **P0** Add granular permissions with plain-language role explanations.
- [ ] **P1** Add invite status, resend/revoke, deactivate, last active, session security, and audit log.

## Settings and integrations

- [ ] **P0** Add Kuwait, UAE, KWD, AED, Asia/Kuwait, and Asia/Dubai with coherent defaults.
- [ ] **P0** Separate sensitive provider onboarding from profile settings; mask identifiers and explain compliance ownership.
- [ ] **P1** Add branding, numbering, taxes, payment terms, templates, notifications, and language.
- [ ] **P1** Add provider connection status, capabilities, last sync, reconnect, settlements, refunds, and disputes.
- [ ] **P1** Add security, data export, billing, and destructive-action safeguards.
- [x] **P1** Replace the provider settlement-bank dropdown with the shared searchable large-list selector.

## Public invoice and customer portal

- [ ] **P0** Loading, error/retry, already-paid, and awaiting-verification states are implemented; explicit expired-link semantics remain.
- [x] **P0** Identify Paystack as the processor and the destination merchant before checkout.
- [ ] **P1** Responsive invoice rendering and a clearer mobile payment flow are implemented; receipts, payment timeline, PDF export, and localization remain.
- [x] **P0** Combined payments now allocate one provider transaction or manual-payment group across every selected invoice, updating customer and business records together.
- [x] **P0** Interrupted Paystack attempts are persisted by provider reference, verified before a new checkout is opened, reused while active, and reconciled when already successful.
- [x] **P0** Combined checkout is driven by the business's available payment-method response and supports Paystack, bank-transfer evidence, and cash verification without hard-coding Paystack into the selection flow.
- [ ] **P1** Portal now includes actionable invoices, combined checkout, verification status, confirmed-payment history, printable/CSV statements, search/filtering, and direct business support; provider-specific refunds/disputes, receipts, and notification preferences remain.

## Payment and inventory reliability follow-up (2026-08-20)

- [x] Persist a group reference on every payment allocation so one checkout remains traceable across all cleared invoices.
- [x] Make Paystack settlement idempotent and transactional, including invoice balances, payment ledger entries, sync changes, and one-time stock posting.
- [x] Approve or reject all allocations from one combined cash/transfer report as a single business review decision.
- [x] Warn when active products reach their configured low-stock threshold and visually identify affected catalogue rows.
- [x] Show an automatic Restock action and preview the intended vendor → payment → delivery → verification lifecycle without activating purchasing logic yet.
- [ ] Add provider adapters/capability metadata when the next regional gateway is integrated; the portal UI can already render API-supplied methods, but each gateway still needs initialize/verify/webhook handlers.
- [ ] Add scheduled server-side recovery for abandoned provider callbacks. Retry-time verification and webhooks are implemented; a background reconciliation worker will cover payments when the customer never returns.
- [ ] Add persistent, server-generated low-stock notifications across dashboard/inbox/email. The current warning is shown when the inventory workspace loads.
- [ ] Build the purchasing/restock domain: vendors, purchase orders, acceptance, vendor payments, delivery, verification, inventory receipts, and audit history.

## Delivery order

1. Workspace and overview foundation. **First batch implemented.**
2. Reliability, shared states, accessibility, and responsive data views. **In progress: shared states, accessible dialogs, and Clients completed.**
3. Invoice lifecycle, detail, actions, and composer safety. **In progress: detail, lifecycle, send, void, print, filtering, and issue-date correctness implemented.**
4. Payment ledger and visible transaction journey. **In progress: review queue renamed, filtered, and confirmation-protected.**
5. Client and catalogue detail workspaces.
6. Kuwait localization, settings, and provider transparency.
7. Customer surfaces, team permissions, audit, and reporting.
