# Bank Reconciliation and WhatsApp Business Integration

Status: production implementation specification  
Owner: LemonBooks product and engineering  
Last reviewed: 2026-08-20  
Initial market: Nigeria  
Initial banking candidate: Moniepoint  
Messaging platform: Meta WhatsApp Business Platform / Cloud API

## Implementation status — 2026-08-20

Implemented and locally testable:

- Shared tenant-scoped connection, immutable event, leased job, dead-letter, audit, and transactional-outbox persistence.
- Provider-neutral bank connector contract and signed Moniepoint-shaped simulator.
- Canonical bank accounts and transactions, CSV statement ingestion, webhook deduplication, asynchronous normalization, and retry worker.
- Exact invoice-reference and exact amount/currency candidate matching with versioned reasons and shadow-mode reporting.
- Manual accept, combined invoice allocations, ignore, and reversible reconciliation APIs with payment, invoice, inventory, audit, and outbox effects.
- Banking workspace with connected account health, statement import, signed credit simulation, money feed, confidence explanations, and suggested-match approval.
- WhatsApp connection, contact, conversation, message, template, consent, service-window, automation-rule, and automation-run persistence.
- Safe Embedded Signup simulator, signed production webhook verification/storage endpoint, inbound/status event deduplication, inbound message simulation, deterministic invoice/amount/payment-intent extraction, opt-out, human states, and template/free-form policy checks.
- WhatsApp workspace with health, inbox, conversation context, simulated inbound messages, delivery states, policy visibility, and automation controls.
- Outbox-driven payment-confirmation automation for Paystack, approved manual claims, and bank reconciliations.
- Automated tests for signed provider normalization, forged signatures, open/closed service windows, opt-out suppression, and evidence-only extraction.
- Production reconciliation workbench for searchable multi-invoice splits, debit-to-expense classification, transaction journeys, reversals, and tenant-scoped audit evidence.
- Configurable maker-checker controls with high-value thresholds, separate-requester approval enforcement, and owner/admin review queues.
- Operator retry/dead-letter views for integration jobs and transactional outbox messages, with explicit idempotent replay actions.
- Scheduled overdue-state detection and idempotent `invoice.overdue` events for downstream WhatsApp reminder automation.
- Opt-in PostgreSQL tests covering concurrent duplicate delivery, concurrent posting, tenant isolation, inventory posting, and dead-letter exhaustion (`RUN_DB_TESTS=1`).

Still dependent on external approval or follow-up hardening:

- Live Moniepoint account-feed adapter, credentials, account linking, complete event/status mapping, and certification.
- Live Meta Embedded Signup completion/token exchange, production connection creation, template synchronization API calls, outbound Cloud API delivery, coexistence confirmation, and app review.
- Broader performance/load testing still requires an isolated production-shaped database and traffic profile; deterministic database concurrency fixtures are active locally.
- Production secrets must move from environment variables to a managed secret store/KMS envelope-encryption implementation.
- Transfer reconciliation targets and provider-certified live traffic remain later implementation batches.

## 1. Outcome

Build two provider-neutral capabilities on one reliable event foundation:

1. A bank-feed reconciliation service that ingests transactions from Moniepoint and later other banks/providers, normalizes them, matches them to LemonBooks records, and exposes safe exception handling.
2. A WhatsApp Business integration that lets a merchant retain human conversation while LemonBooks automates opted-in operational messages and turns inbound customer messages into structured, reviewable business signals.

The combined product promise is:

> Keep running customer relationships in WhatsApp. LemonBooks observes authorized business events, verifies money against connected financial sources, and keeps invoices, payments, inventory, and books current.

## 2. Non-negotiable boundaries

- LemonBooks is an accounting, orchestration, and reconciliation layer. It does not claim to be the bank, payment processor, or WhatsApp provider.
- A WhatsApp message, screenshot, receipt, or customer statement is evidence, not proof that money settled.
- Bank/provider-confirmed transaction data is authoritative for financial settlement status.
- An automated match may post only when deterministic controls pass. Ambiguous matches remain suggestions.
- A user must be able to disconnect a bank or WhatsApp account, revoke consent, inspect automation history, and export/delete eligible data.
- Never request or store online-banking passwords, PINs, OTPs, full card numbers, BVNs from chat, or customer financial-account credentials.
- No unofficial WhatsApp scraping, browser automation, device mirroring, or historical-inbox harvesting.
- No automation whose purpose is merely to provoke a reply and extend the 24-hour customer-service window.
- Every external event is authenticated, persisted immutably, deduplicated, and processed asynchronously.

## 3. Confirmed external capabilities and open dependencies

### WhatsApp

Meta's published policy confirms that businesses need opt-in, must honor opt-out, may use free-form replies within 24 hours of the user's last message, and must use approved templates outside that window. Automation must provide a clear path to human escalation. The platform uses webhooks for incoming messages and outgoing delivery states.

Production dependency:

- LemonBooks must complete Meta Business verification, app review, required advanced access, Tech Provider onboarding where applicable, and Embedded Signup approval.
- Coexistence eligibility must be determined during onboarding. It must not be promised for every existing WhatsApp Business App number.
- Pricing and template-category rules must be loaded from configuration and reviewed before release; they must not be hard-coded into product copy.

### Moniepoint

Moniepoint's public POS developer material confirms API-key based token authentication, merchant references, transaction-status queries, sandbox/test accounts, and signed webhooks using a webhook ID, timestamp, and HMAC-SHA256 signature.

It does **not**, from the reviewed public material, establish that a third-party accounting SaaS can retrieve a merchant's complete Moniepoint business-bank account transaction feed or statements.

Commercial gate before direct-bank-feed implementation:

- Written confirmation of the appropriate partner program and contracting entity.
- Consent/account-linking mechanism for each merchant.
- Supported account and transaction endpoints, pagination, historical range, pending/booked semantics, balances, reversals, fees, counterparties, and rate limits.
- Webhook catalogue and replay/retry contract.
- Sandbox credentials and certification checklist.
- Data retention, permitted-use, subprocessor, incident, support, and SLA terms.

If direct account feeds are unavailable, ship the same normalized reconciliation engine behind one of these sources:

1. A regulated open-banking partner with explicit merchant consent.
2. Moniepoint POS/collection events where the merchant is eligible.
3. Read-only CSV/OFX/statement import as a controlled fallback.

The CBN open-banking guidelines recognize customer control of data, authorization to service providers, API providers/consumers, and minimum privacy, security, risk, consent-revocation, and customer-experience requirements. Legal/compliance review is a release gate, not a post-launch task.

## 4. Shared integration architecture

```text
Provider webhook / scheduled poll / statement upload
                         |
                         v
             Edge webhook or import endpoint
             - authenticate source
             - timestamp/replay check
             - payload size/content check
             - persist raw event
             - return quickly
                         |
                         v
                Durable integration queue
                         |
              +----------+-----------+
              |                      |
              v                      v
      Provider normalizer       Dead-letter queue
              |
              v
         Canonical events
              |
       +------+----------------+
       |                       |
       v                       v
 Reconciliation engine   WhatsApp workflow engine
       |                       |
       +----------+------------+
                  v
       Domain commands + audit log
                  |
         payments / invoices / items
```

The Express API may host initial endpoints, but external processing must not remain synchronous request work. Introduce a durable queue and worker before production traffic. PostgreSQL-backed jobs are acceptable initially if jobs are claimed with `FOR UPDATE SKIP LOCKED`, attempts are bounded, leases expire, and a dead-letter state exists. A managed queue is preferred once throughput or operational requirements justify it.

## 5. Shared canonical tables

All records are tenant-scoped. Provider secrets are encrypted using envelope encryption and never returned after creation.

### `integration_connections`

- `id`, `business_id`
- `kind`: `bank`, `payment_provider`, `whatsapp`
- `provider`: `moniepoint`, future provider identifier, or `meta_whatsapp`
- `status`: `pending`, `active`, `attention`, `revoked`, `failed`
- `external_account_id`, `external_business_id`
- `capabilities` JSON: balances, transactions, webhooks, messaging, coexistence
- `encrypted_credentials`, `credential_key_version`
- `consented_by`, `consented_at`, `consent_scope`, `consent_expires_at`
- `last_success_at`, `last_cursor`, `last_error_code`
- timestamps and soft deletion

Unique external identities must be scoped by provider and environment.

### `integration_events`

- provider event ID and event type
- connection/business IDs
- SHA-256 payload hash
- encrypted or access-restricted raw payload
- signature validation result
- occurred, received, processed timestamps
- status: `received`, `processing`, `processed`, `ignored`, `failed`, `dead_letter`
- attempt count and sanitized failure code

Unique constraint: `(provider, environment, provider_event_id)`. If the provider supplies no stable ID, use a documented deterministic idempotency fingerprint and retain collision diagnostics.

### `integration_jobs`

- event ID, job type, state, available time, lease owner/expiry
- attempts, maximum attempts, last sanitized error
- correlation ID and trace context

### `integration_audit_log`

- actor type/id, business, connection, resource
- action, before/after summaries, reason, IP/device where applicable
- append-only timestamp and correlation ID

Raw provider payloads must not be copied into ordinary application logs.

## 6. Bank connector contract

Every provider adapter implements the same interface:

```ts
interface BankConnector {
  beginConnection(input: ConnectionRequest): Promise<ConnectionChallenge>;
  completeConnection(input: ConnectionCallback): Promise<ConnectedAccount[]>;
  refreshCredentials(connectionId: string): Promise<void>;
  listAccounts(connectionId: string): Promise<ProviderAccount[]>;
  fetchBalance(accountId: string): Promise<ProviderBalance>;
  fetchTransactions(input: TransactionCursorRequest): Promise<TransactionPage>;
  verifyWebhook(request: RawWebhookRequest): VerifiedWebhook;
  normalizeWebhook(event: VerifiedWebhook): CanonicalBankEvent[];
  disconnect(connectionId: string): Promise<void>;
}
```

Provider adapters translate transport and terminology only. Matching rules, ledger posting, notifications, and invoice logic do not belong in a Moniepoint adapter.

## 7. Canonical bank data model

### `bank_accounts`

- connection/business IDs
- provider account ID and masked account number
- institution/name/type/currency
- current and available balance with provider timestamps
- status and last-synced cursor

### `bank_transactions`

- immutable provider identity and account ID
- `pending`, `booked`, `reversed`, or `deleted`
- direction, amount, currency
- transaction time, value date, booked time
- description, narration, provider category
- provider/reference/session IDs
- counterparty name, bank, and masked account identifier when permitted
- running balance when supplied
- raw-event pointer, not duplicated raw JSON
- normalized fingerprint and timestamps

Use integer minor units plus currency, or a decimal abstraction that supports each currency's exponent. Do not use JavaScript floating-point arithmetic for financial matching.

Unique constraints should include provider/account/provider-transaction ID. Pending-to-booked transitions must update the canonical transaction rather than create income twice.

### `reconciliation_candidates`

- bank transaction ID
- target type/id: invoice, payment intent, settlement, expense, transfer, payout
- proposed allocation amount
- score and rule-version
- reason codes and explainable evidence
- state: `suggested`, `accepted`, `rejected`, `expired`, `superseded`

### `reconciliations`

- bank transaction and one or more allocations
- status: `matched`, `partially_matched`, `unmatched`, `ignored`, `reversed`
- method: `automatic`, `manual`, `rule`
- actor, rule version, confidence, timestamp
- immutable reversal link rather than destructive deletion

### `reconciliation_rules`

Tenant-specific rules such as known counterparty, narration pattern, fixed fee, or recurring expense. Rules require preview, audit history, permissions, and safe rollback.

## 8. Bank ingestion and synchronization

Use webhook-first plus polling repair:

1. Verify webhook signature using the raw request bytes.
2. Reject stale timestamps outside the configured tolerance unless provider replay semantics require otherwise.
3. Persist the unique event before acknowledging it.
4. Return `2xx` quickly after durable acceptance.
5. Normalize and upsert asynchronously.
6. Poll recent history periodically to repair missed or delayed webhooks.
7. Run a daily rolling-window overlap sync and a less frequent balance/statement integrity check.
8. Alert on cursor stalls, balance divergence, signature failures, schema drift, and webhook lag.

For the documented Moniepoint webhook scheme, verification must use the exact provider-specified concatenation of webhook ID, timestamp, and raw body with HMAC-SHA256. Obtain the definitive encoding, replay window, retry schedule, and secret-rotation behavior during certification.

Never mark a transaction final solely because a notification arrived. Normalize provider status and support pending, failure, reversal, refund, and chargeback transitions.

## 9. Reconciliation engine

### Candidate generation

Generate candidates using bounded windows and indexed fields:

- exact provider or merchant reference
- exact invoice/payment reference in narration
- exact amount and currency within a date window
- counterparty/customer phone or normalized name where legally permitted
- expected Paystack settlement net of known fees
- combined-invoice payment group amount
- user-defined rule

### Scoring

Example signals, with weights stored in a versioned rule configuration:

- exact unique reference: strongest
- exact amount and currency
- account/counterparty identity
- time proximity
- invoice/client relationship
- expected fee/net calculation
- WhatsApp-stated invoice or customer intent: supporting evidence only
- negative signals: reused reference, currency mismatch, reversed transaction, conflicting allocations

### Automatic posting policy

Auto-match only when all are true:

- transaction is authoritative/booked and not reversed
- currency matches
- allocations equal the transaction amount within an explicit tolerance
- there is one unambiguous target set
- no prior reconciliation or payment with the same provider identity exists
- confidence exceeds the approved threshold
- the rule is allowed to auto-post for that target type

Otherwise create a suggestion in **Needs attention**.

### Accounting effects

Acceptance is one database transaction:

1. Lock the bank transaction and targets.
2. Re-check availability and idempotency.
3. Create or link the payment/expense/transfer.
4. Allocate across invoices.
5. Update invoice states.
6. Post inventory only under the existing one-time paid-invoice control.
7. Create reconciliation and audit records.
8. Emit domain/outbox events.

Reversals create compensating records and reopen invoice balances where policy permits. Never silently mutate historical confirmed money.

## 10. Reconciliation product surfaces

### Connect bank

- provider selection with capability and region labels
- explicit read-only scope and purpose
- redirect/embedded provider authorization
- account selection
- initial sync progress
- consent expiry and disconnect controls

### Money feed

- all connected accounts, current sync status, and last updated time
- booked/pending/reversed distinction
- search, date, amount, account, direction, and reconciliation-status filters
- provider reference and source provenance

### Needs attention

- side-by-side bank transaction and suggested targets
- explanation: “Exact amount + invoice reference; received 14 minutes after invoice”
- accept, split, choose another target, create expense, transfer, or ignore
- conflict and duplicate warnings
- maker-checker approval for high-value/manual overrides when enabled

### Transaction journey

Expose:

```text
Invoice -> payment intent -> processor event -> fee -> settlement -> bank transaction -> reconciled
```

Every stage shows source, timestamp, reference, actor, status, and corrective action.

## 11. Bank API surface

Suggested authenticated endpoints:

- `POST /integrations/banks/:provider/connect`
- `GET /integrations/banks/:provider/callback`
- `GET /integrations/banks/connections`
- `DELETE /integrations/banks/connections/:id`
- `POST /integrations/banks/connections/:id/sync`
- `GET /bank-accounts`
- `GET /bank-transactions`
- `GET /reconciliation/candidates`
- `POST /reconciliation/:transactionId/accept`
- `POST /reconciliation/:transactionId/split`
- `POST /reconciliation/:transactionId/ignore`
- `POST /reconciliation/:id/reverse`
- `POST /webhooks/banks/:provider`

All mutations require idempotency keys, tenant authorization, and an append-only audit event.

## 12. WhatsApp connection model

Use Meta Embedded Signup as the production onboarding path. Store:

- WABA ID, phone-number ID, masked/display number
- business portfolio identity where required
- access-token secret and expiry/rotation metadata
- app subscription state
- coexistence capability and state
- quality rating, messaging status, and health information made available by Meta
- default timezone and language preferences

Connection states:

```text
not_connected -> onboarding -> connected -> attention -> suspended/revoked
```

The UI must explain whether the merchant can continue using the WhatsApp Business App on the same number. Only show “keep using your app” after Meta confirms coexistence for that number.

## 13. WhatsApp canonical model

### `whatsapp_contacts`

- business/client IDs
- normalized E.164 phone and provider contact ID
- display name and consent state/source/timestamp
- opt-out timestamp and reason
- last inbound time and derived service-window expiry

Do not assume phone equality proves customer identity. Linking a contact to a LemonBooks client can be suggested, but ambiguous identity requires confirmation.

### `whatsapp_conversations`

- contact and connection
- state: open, awaiting_customer, awaiting_business, resolved, blocked
- assigned user/team
- last inbound/outbound timestamps
- service-window expiry
- linked invoice/order/lead IDs

### `whatsapp_messages`

- provider message ID, direction, type, provider status
- conversation/contact
- body or media pointer according to retention policy
- reply-to/context ID
- template ID/version/category when applicable
- automation ID, cost attribution record, timestamps
- failure code with sanitized explanation

### `whatsapp_templates`

- Meta identity/name/language/category/status/version
- parameter schema
- LemonBooks use case and fallback channel
- last synchronized timestamp

### `automation_rules` and `automation_runs`

- trigger, eligibility conditions, delay, quiet hours, action
- template/free-form policy and human escalation path
- enabled/version/creator/approver
- run idempotency key, eligibility snapshot, outcome, provider message ID

## 14. WhatsApp webhook handling

1. Support Meta's verification challenge endpoint.
2. Verify request authenticity using the currently documented Meta mechanism and raw body.
3. Persist and deduplicate provider message/status events.
4. Acknowledge quickly and process asynchronously.
5. Handle inbound text, supported media, interactive replies, delivery/read/failure status, template status, account/quality changes, and unknown future event types.
6. Download media only when necessary, scan it, enforce type/size limits, encrypt storage, and delete it under retention policy.
7. Preserve provider ordering metadata, but make processors safe for out-of-order status events.

The system must tolerate duplicate delivery, delayed delivery, retries, webhook outages, and new fields without failing the entire payload.

## 15. WhatsApp service-window and policy engine

The service window is derived from the last valid customer message, not from a business message.

Before every send, a centralized policy check evaluates:

- merchant connection health
- customer opt-in/opt-out and block state
- current Meta policy/configuration version
- whether the 24-hour service window is open
- free-form versus approved-template requirement
- template approval, category, language, and parameter completeness
- quiet hours, frequency cap, duplicate automation, invoice state
- budget/plan allowance and estimated billable category
- human-escalation availability

No feature may call Meta directly without passing this policy service.

Do not advertise inbound processing as “free forever.” Record it as currently non-billable under the reviewed pricing model and keep pricing rules configurable because Meta can change them.

## 16. WhatsApp automation catalogue

### Phase-one transactional automations

- invoice sent
- invoice due soon
- invoice overdue
- payment confirmed
- payment under review
- receipt available
- low-stock alert to the merchant's own operational number, if opted in

### Window-aware commerce automations

- follow up on a genuine unanswered product inquiry
- follow up on an abandoned quotation
- confirm whether reserved stock is still wanted
- create/send an invoice after explicit customer confirmation

Required guardrails:

- only unresolved, configured business events
- merchant-configurable delay, quiet hours, and frequency limits
- suppress when paid, cancelled, out of stock, opted out, already answered, or manually resolved
- never send merely because the window is about to expire

### Inbound interpretation

Start deterministic and reviewable:

- extract invoice number/reference
- extract amount/currency
- identify payment claim language
- identify product/SKU and requested quantity
- detect yes/no/stop/help intents

An AI model may propose structured fields but cannot directly confirm a bank payment, post inventory, create a refund, or make an irreversible accounting decision. Store model version, input reference, confidence, output, and human correction. Redact sensitive data and contractually prohibit training on tenant content where applicable.

## 17. WhatsApp-to-reconciliation flow

```text
Customer: “Transferred 250,000 for LB-1088”
                    |
                    v
Inbound message persisted and authenticated
                    |
                    v
Extract {amount, invoice reference, customer}
                    |
                    v
Search booked bank transactions and provider events
          +---------+----------+
          |                    |
      exact match          no/ambiguous match
          |                    |
          v                    v
safe reconciliation       Needs attention
          |
          v
invoice/payment/inventory domain update
          |
          v
send confirmation only if consent + window/template policy permits
```

The chat event contributes a candidate and explanation. It does not itself create a confirmed payment.

## 18. WhatsApp product surfaces

### Connection and health

- Embedded Signup
- connected number and coexistence status
- quality/messaging health, webhook health, last event
- template sync status
- disconnect/revoke

### Inbox and customer context

- conversation list with assignment and unread state
- customer, invoices, open balance, payment status, and item availability alongside chat
- human handoff and automation pause
- link/unlink client with audit record

### Automation center

- templates grouped by operational use case
- trigger, timing, audience, quiet hours, cap, and estimated charging behavior
- preview with actual variable validation
- test send to authorized test recipient
- activity log and failure recovery

### Cost and policy visibility

- messages by category, region, status, and automation
- estimated provider charges versus LemonBooks plan allowance
- open-window versus template send
- template rejection and quality warnings

Do not promise exact final Meta cost until delivery and provider billing data are available.

## 19. WhatsApp API surface

- `POST /integrations/whatsapp/embedded-signup/session`
- `POST /integrations/whatsapp/embedded-signup/complete`
- `GET /integrations/whatsapp/connection`
- `DELETE /integrations/whatsapp/connection`
- `GET /integrations/whatsapp/templates`
- `POST /integrations/whatsapp/templates/sync`
- `GET /whatsapp/conversations`
- `GET /whatsapp/conversations/:id/messages`
- `POST /whatsapp/conversations/:id/messages`
- `POST /whatsapp/conversations/:id/assign`
- `POST /whatsapp/conversations/:id/resolve`
- `GET/POST/PATCH /whatsapp/automations`
- `GET /whatsapp/automation-runs`
- `GET /webhooks/whatsapp` for challenge verification
- `POST /webhooks/whatsapp` for events

Sending endpoints return an accepted command/run, not a false claim that Meta delivered the message.

## 20. Outbox and domain events

Add a transactional outbox. When LemonBooks changes invoice/payment/inventory state, write the domain change and outbox event in the same database transaction. Workers consume events such as:

- `invoice.sent`
- `invoice.due_soon`
- `invoice.overdue`
- `payment.confirmed`
- `payment.reversed`
- `inventory.low_stock`
- `bank_transaction.booked`
- `reconciliation.completed`

Event consumers are idempotent. A unique automation key such as `(business, rule_version, event_id, recipient)` prevents duplicate messages.

## 21. Security and privacy controls

- Encrypt provider credentials and sensitive payload fields at rest; TLS in transit.
- Use separate secrets per environment and provider connection where supported.
- Automated secret rotation, revocation, and key-version migration.
- Least-privilege scopes and short-lived access tokens.
- Webhook signature verification over raw bytes, timestamp validation, and replay detection.
- SSRF protection for provider/media URLs; allowlists where feasible.
- Malware scanning, MIME sniffing, size limits, and quarantining for attachments.
- Tenant-scoped authorization on every query and job.
- Separate permissions: connect integrations, view bank data, reconcile, override, manage WhatsApp, send templates, view conversations.
- Maker-checker for manual high-value reconciliation and rule changes.
- PII redaction in logs and support tooling.
- Defined retention for raw webhooks, chat content, media, financial records, and audit logs.
- DSAR, correction, portability, objection, and eligible deletion workflows.
- Data processing agreements, subprocessor register, cross-border transfer assessment, DPIA, breach plan, and annual compliance review.

Nigeria's data-protection rules can apply to a foreign company processing Nigerian data. Consent, transparency, purpose limitation, minimization, security, retention, and data-subject rights must be designed into onboarding and operations.

## 22. Reliability and observability

Initial proposed SLOs, to be validated against provider SLAs:

- 99.9% LemonBooks integration API availability monthly.
- 99% of valid webhooks durably accepted within 2 seconds.
- 99% of accepted webhook events normalized within 60 seconds.
- 99% of bank feeds no more than 15 minutes stale when provider service is healthy.
- Zero known duplicate financial postings.
- 100% of automatic matches carry rule version and explanation.

Metrics:

- webhook signature failures, lag, duplicates, and unknown schemas
- queue depth, oldest job, retries, dead letters
- token refresh failures and disconnected accounts
- feed cursor stalls and balance divergence
- match rate by confidence/rule/provider
- manual override and reversal rate
- WhatsApp send/delivered/read/failed by template and automation
- opt-outs, quality warnings, template rejection, and estimated cost

Alerts must be tenant-safe and include correlation IDs, never raw financial/chat content.

Operational tooling must support replaying an immutable event, re-running normalization with a version, pausing a connector/rule, and inspecting sanitized traces. Replaying may not bypass idempotency.

## 23. Testing and certification

### Contract tests

- captured provider fixtures, signed webhook fixtures, unknown fields
- schema/enum drift and missing optional fields
- token expiration/rotation and pagination
- pending-to-booked, reversal, duplicate, delayed, and out-of-order events

### Reconciliation tests

- exact, split, combined-invoice, partial, overpayment, fee/net settlement
- duplicate reference, same amount from different customers, currency mismatch
- reversal after reconciliation and inventory/accounting compensation
- concurrency tests proving one posting under webhook/poll/manual races
- property tests: allocations never exceed source; debits/credits remain balanced

### WhatsApp tests

- open/closed service window at boundary times and tenant timezone
- approved/rejected/paused template
- opt-in/opt-out and block handling
- duplicate inbound messages and status events
- automation frequency caps, quiet hours, cancellation after payment
- human handoff and failed-message recovery
- coexistence eligible/ineligible onboarding paths

### Security tests

- forged/replayed webhooks, timing-safe signature comparisons
- broken tenant access, privilege escalation, secret exposure
- malicious files/media and SSRF
- deletion/retention/consent revocation
- load and queue backpressure

No provider integration launches without sandbox certification, failure-mode exercise, runbook, rollback switch, and partner sign-off.

## 24. Delivery plan

### Phase 0 — discovery and partner gates (2–4 weeks)

- Moniepoint technical/commercial workshop and written capability matrix
- Meta business/app/Tech Provider readiness assessment
- legal basis, DPA, DPIA, privacy notice, consent language
- accounting treatment and reconciliation-control sign-off
- event taxonomy, provider contracts, threat model, and SLO approval

Exit: credentials/sandbox and permitted use are known; no speculative connector build.

### Phase 1 — integration foundation (3–5 weeks)

- connections, encrypted secrets, raw events, jobs, dead letters, audit log
- transactional outbox and domain events
- admin health/replay tools and metrics
- connector contract and test harness

Exit: duplicate/replay/load/failure tests pass without touching production money or messaging.

### Phase 2 — bank ingestion and manual reconciliation (4–6 weeks)

- first available Moniepoint/open-banking/statement adapter
- accounts, balances, normalized transactions, cursor/poll repair
- money feed and Needs attention UI
- manual match/split/create-expense/ignore/reverse with audit

Exit: pilot statements reconcile deterministically; provider totals and LemonBooks totals agree.

### Phase 3 — safe auto-reconciliation (3–5 weeks)

- candidate scoring/explanations
- exact-reference rules first
- automatic posting with confidence/configuration controls
- combined invoices, settlements, fees, reversals
- daily integrity jobs and exception alerts

Exit: shadow-mode precision target is met before posting is enabled tenant by tenant.

Recommended shadow gate: at least 99.5% precision on automatic candidates; prefer lower recall over incorrect posting.

### Phase 4 — WhatsApp connection and transactional messaging (4–7 weeks, parallel after foundation)

- Embedded Signup, webhook ingest, contact/conversation/message model
- consent/opt-out, policy/window service, template sync
- invoice/payment transactional automations
- delivery states, activity history, cost attribution, human escalation

Exit: Meta review/certification complete and all sends pass the centralized policy service.

### Phase 5 — inbound commerce and cross-signal reconciliation (4–6 weeks)

- deterministic intent extraction and review UI
- chat-to-client/invoice candidate linking
- bank-confirmed payment matching using chat as supporting evidence
- genuine inquiry follow-ups and commerce actions
- optional AI extraction in shadow mode, then human-assisted mode

Exit: no chat-derived signal can independently post a confirmed financial transaction.

### Phase 6 — multi-provider scale

- second bank connector proves adapter portability
- provider-specific capabilities and regional configuration
- reconciliation-rule library, additional settlement/fee models
- WhatsApp inbox/team workflow and advanced automations
- usage metering, plan enforcement, and enterprise audit exports

## 25. Team and ownership

Minimum production team for overlapping delivery:

- product manager/domain owner
- technical lead/platform engineer
- 2 backend/integration engineers
- 1 frontend engineer
- QA automation engineer
- part-time SRE/security engineer
- product designer
- accounting/control owner
- privacy/legal/compliance counsel
- provider partnership owner

Do not assign accounting correctness, privacy approval, or provider certification solely to engineering.

## 26. Release strategy

1. Internal synthetic accounts.
2. Provider sandbox.
3. Employee/test businesses with no auto-posting.
4. Design partners in shadow mode.
5. Manual reconciliation pilot.
6. Exact-reference auto-match for selected tenants.
7. Gradual expansion by provider, transaction type, and confidence rule.

Every stage has kill switches per provider, connection, automation, and reconciliation rule. A provider outage degrades to “data delayed,” never to invented or duplicated records.

## 27. Production definition of done

The program is not production-ready until:

- commercial and permitted-data-use agreements are signed
- Meta and bank/provider approvals are complete
- consent, revocation, privacy, and retention workflows are live
- webhook authentication, replay defense, idempotency, queues, and dead letters are proven
- credentials are encrypted and rotatable
- reconciliation is explainable, reversible, tenant-safe, and audited
- no WhatsApp signal alone confirms money
- opt-out and human escalation work end to end
- dashboards, alerts, runbooks, on-call ownership, and incident drills exist
- contract, concurrency, load, security, and disaster-recovery tests pass
- accounting/control, security, privacy, and provider owners sign off

## 28. Immediate decisions and partner questions

### Moniepoint

1. Is the target integration a business-bank account feed, POS transaction feed, Monnify collection feed, or all three?
2. Can a U.S. SaaS entity be the API consumer, or is a Nigerian entity/licensed partner required?
3. What merchant consent/account-linking flow is supported?
4. Are balances and complete historical transactions available, or only transactions initiated through the integration?
5. How are pending, booked, failed, reversed, refunded, charged-back, fee, and settlement events represented?
6. What are rate limits, pagination/cursors, retention, replay, webhook retry, support, and SLA terms?
7. Are sandbox and production schemas identical, and what certification is required?

### Meta

1. Will LemonBooks onboard as a direct Tech Provider or initially through an approved BSP?
2. Which countries/numbers are eligible for Embedded Signup and coexistence at launch?
3. Which permissions and advanced access reviews are required for the intended features?
4. What exact pricing, free-entry-point, template-category, and utility-window rules apply at launch?
5. What content may LemonBooks retain, for how long, and under which merchant/customer disclosures?

### Product

1. Is bank access read-only for the first release? Recommended: yes.
2. Is manual override maker-checker by default above a threshold? Recommended: configurable, enabled for high value.
3. Will LemonBooks host a shared inbox in phase one? Recommended: no; start with connection, automation, and operational history.
4. Will AI be allowed to post transactions? Recommended: no; extraction/suggestion only.
5. What retention periods and WhatsApp usage allowance belong to each plan?

## 29. Primary references reviewed

- [Meta WhatsApp Business Messaging Policy](https://whatsappbusiness.com/policy/)
- [Meta WhatsApp Business Platform API collection](https://www.postman.com/meta/whatsapp-business-platform/overview)
- [Moniepoint POS developer getting started](https://teamapt.atlassian.net/wiki/spaces/EI/pages/2170421476/Getting+Started)
- [Moniepoint webhook documentation](https://teamapt.atlassian.net/wiki/spaces/EI/pages/1492648078/Webhooks)
- [Moniepoint ERP/POS transaction API reference](https://teamapt.atlassian.net/wiki/spaces/EI/pages/1039826999/ERP+Integration+API+Reference)
- [CBN Operational Guidelines for Open Banking in Nigeria](https://www.cbn.gov.ng/Out/2023/CCD/Operational%20Guidelines%20for%20Open%20Banking%20in%20Nigeria.pdf)
- [Nigeria Data Protection Commission FAQs](https://www.ndpc.gov.ng/faqs/)

These references establish planning constraints, not automatic approval for LemonBooks to access any merchant account or message data. Provider contracts, current technical documentation, and counsel review control the launch decision.
