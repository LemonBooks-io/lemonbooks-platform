import crypto from "node:crypto";
import type { PoolClient } from "pg";
import { query, transaction } from "../database/pool";
import { HttpError } from "../http";
import { recordInvoiceSale } from "./inventory.service";
import { createWhatsAppLink, createWhatsAppLoginLink, unlinkWhatsAppAccount } from "./whatsapp-account-link.service";

export type AssistantAction =
  | { type: "invoice"; customerName: string; itemName: string; quantity: number; unitPrice: number }
  | { type: "inventory"; itemName: string; quantity: number; price: number; cost: number }
  | { type: "sale"; customerName: string; itemName: string; quantity: number; unitPrice: number; method: "cash" | "transfer" | "card" | "pos" | "other" }
  | { type: "expense"; description: string; amount: number; category: string; vendorName: string }
  | { type: "payment"; invoiceNumber: string; amount: number; method: "cash" | "transfer"; reference: string };

export type AssistantActionParse =
  | { kind: "action"; action: AssistantAction }
  | { kind: "incomplete"; intent: AssistantAction["type"]; usage: string }
  | { kind: "none" };

export type AssistantMessageInput = {
  body: string;
  contactId: string;
  conversationId: string;
  sourceMessageId: string;
  displayName?: string | null;
  publicWebUrl: string;
};

const usage = {
  invoice: "INVOICE | customer | item | quantity | unit price",
  inventory: "ADD ITEM | item | quantity | selling price | cost (optional)",
  sale: "SALE | customer | item | quantity | unit price | cash/transfer/card/POS",
  expense: "EXPENSE | description | amount | category | vendor (optional)",
  payment: "PAYMENT | invoice number | amount | cash/transfer | reference (optional)",
} as const;

function clean(value: unknown, max = 180) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function money(value: string) {
  const normalized = value.replace(/[₦,$£€\s]/g, "").replace(/ngn|usd|gbp|eur/gi, "").replace(/,/g, "");
  const number = Number(normalized);
  return Number.isFinite(number) && number > 0 ? Math.round(number * 100) / 100 : NaN;
}

function quantity(value: string) {
  const number = Number(value.replace(/,/g, ""));
  return Number.isFinite(number) && number > 0 ? Math.round(number * 1000) / 1000 : NaN;
}

function intentFor(command: string): AssistantAction["type"] | undefined {
  if (/^(invoice|create invoice)$/.test(command)) return "invoice";
  if (/^(add item|inventory|stock|restock)$/.test(command)) return "inventory";
  if (/^(sale|record sale)$/.test(command)) return "sale";
  if (/^(expense|record expense)$/.test(command)) return "expense";
  if (/^(payment|record payment)$/.test(command)) return "payment";
  return undefined;
}

export function parseAssistantAction(body: string): AssistantActionParse {
  const parts = body.split("|").map(part => clean(part));
  const first = parts[0]!.toLowerCase();
  const intent = intentFor(first) ?? (/\binvoice\b/i.test(body) ? "invoice"
    : /\b(?:add item|inventory|restock)\b/i.test(body) ? "inventory"
    : /\b(?:record sale|sale)\b/i.test(body) ? "sale"
    : /\b(?:record expense|expense)\b/i.test(body) ? "expense"
    : /\b(?:record payment|payment)\b/i.test(body) ? "payment" : undefined);
  if (!intent) return { kind: "none" };
  if (parts.length === 1) return { kind: "incomplete", intent, usage: usage[intent] };
  if (intent === "invoice") {
    const [, customerName, itemName, quantityText, unitPriceText] = parts;
    const qty = quantity(quantityText ?? ""), unitPrice = money(unitPriceText ?? "");
    if (!customerName || !itemName || !Number.isFinite(qty) || !Number.isFinite(unitPrice)) return { kind: "incomplete", intent, usage: usage.invoice };
    return { kind: "action", action: { type: intent, customerName, itemName, quantity: qty, unitPrice } };
  }
  if (intent === "inventory") {
    const [, itemName, quantityText, priceText, costText = "0"] = parts;
    const qty = quantity(quantityText ?? ""), price = money(priceText ?? ""), parsedCost = costText === "0" ? 0 : money(costText);
    if (!itemName || !Number.isFinite(qty) || !Number.isFinite(price) || !Number.isFinite(parsedCost) || parsedCost < 0) return { kind: "incomplete", intent, usage: usage.inventory };
    return { kind: "action", action: { type: intent, itemName, quantity: qty, price, cost: parsedCost } };
  }
  if (intent === "sale") {
    const [, customerName, itemName, quantityText, unitPriceText, methodText] = parts;
    const qty = quantity(quantityText ?? ""), unitPrice = money(unitPriceText ?? "");
    const method = clean(methodText).toLowerCase();
    if (!customerName || !itemName || !Number.isFinite(qty) || !Number.isFinite(unitPrice) || !["cash", "transfer", "card", "pos", "other"].includes(method)) return { kind: "incomplete", intent, usage: usage.sale };
    return { kind: "action", action: { type: intent, customerName, itemName, quantity: qty, unitPrice, method: method as "cash" | "transfer" | "card" | "pos" | "other" } };
  }
  if (intent === "expense") {
    const [, description, amountText, category = "uncategorized", vendorName = ""] = parts;
    const amount = money(amountText ?? "");
    if (!description || !Number.isFinite(amount)) return { kind: "incomplete", intent, usage: usage.expense };
    return { kind: "action", action: { type: intent, description, amount, category, vendorName } };
  }
  const [, invoiceNumber, amountText, methodText, reference = ""] = parts;
  const amount = money(amountText ?? ""), method = clean(methodText).toLowerCase();
  if (!invoiceNumber || !Number.isFinite(amount) || !["cash", "transfer"].includes(method)) return { kind: "incomplete", intent, usage: usage.payment };
  return { kind: "action", action: { type: "payment", invoiceNumber, amount, method: method as "cash" | "transfer", reference } };
}

function formatMoney(value: number, currency = "NGN") {
  try { return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 2 }).format(value); }
  catch { return `${currency} ${value.toLocaleString()}`; }
}

function actionSummary(action: AssistantAction, currency = "NGN") {
  if (action.type === "invoice") return `Invoice draft\nCustomer: ${action.customerName}\nItem: ${action.itemName}\nQuantity: ${action.quantity}\nUnit price: ${formatMoney(action.unitPrice, currency)}\nTotal: ${formatMoney(action.quantity * action.unitPrice, currency)}`;
  if (action.type === "inventory") return `Inventory draft\nItem: ${action.itemName}\nAdd quantity: ${action.quantity}\nSelling price: ${formatMoney(action.price, currency)}\nCost: ${formatMoney(action.cost, currency)}`;
  if (action.type === "sale") return `Sale draft\nCustomer: ${action.customerName}\nItem: ${action.itemName}\nQuantity: ${action.quantity}\nTotal: ${formatMoney(action.quantity * action.unitPrice, currency)}\nPayment: ${action.method.toUpperCase()}`;
  if (action.type === "expense") return `Expense draft\nDescription: ${action.description}\nAmount: ${formatMoney(action.amount, currency)}\nCategory: ${action.category}${action.vendorName ? `\nVendor: ${action.vendorName}` : ""}`;
  return `Payment report draft\nInvoice: ${action.invoiceNumber}\nAmount: ${formatMoney(action.amount, currency)}\nMethod: ${action.method.toUpperCase()}${action.reference ? `\nReference: ${action.reference}` : ""}`;
}

async function activeContext(contactId: string) {
  return (await query<Record<string, any>>(`SELECT l.business_id,l.user_id,b.name AS business_name,b.tenant_slug,b.currency,u.name AS user_name
    FROM whatsapp_account_links l JOIN memberships m ON m.business_id=l.business_id AND m.user_id=l.user_id
    JOIN businesses b ON b.id=l.business_id JOIN users u ON u.id=l.user_id WHERE l.contact_id=$1`, [contactId]))[0];
}

async function startOnboarding(input: AssistantMessageInput) {
  const contact = (await query<Record<string, any>>("SELECT phone_e164 FROM whatsapp_contacts WHERE id=$1", [input.contactId]))[0];
  if (!contact) return "I couldn’t start setup from this chat. Please try again.";
  const identity = (await query<{ user_id: string }>("SELECT user_id FROM whatsapp_auth_identities WHERE phone=$1", [contact.phone_e164]))[0];
  if (identity) return "This WhatsApp number already has a LemonBooks identity. Reply LOGIN to open it, or CONNECT to link an existing workspace.";
  await query(`INSERT INTO whatsapp_onboarding_sessions(contact_id,conversation_id,stage,data,expires_at)
    VALUES($1,$2,'business_name','{}',now()+interval '24 hours')
    ON CONFLICT(contact_id) DO UPDATE SET conversation_id=EXCLUDED.conversation_id,stage='business_name',data='{}',expires_at=EXCLUDED.expires_at,updated_at=now()`, [input.contactId, input.conversationId]);
  return "Let’s set up your LemonBooks business. What is your business called?\n\nReply CANCEL at any time to stop.";
}

async function continueOnboarding(input: AssistantMessageInput, session: Record<string, any>) {
  const body = clean(input.body, 240);
  if (/^(cancel|stop setup)$/i.test(body)) {
    await query("DELETE FROM whatsapp_onboarding_sessions WHERE contact_id=$1", [input.contactId]);
    return "Setup cancelled. Reply GET STARTED whenever you’re ready.";
  }
  if (/^(restart|start again)$/i.test(body)) return startOnboarding(input);
  if (session.stage === "business_name") {
    if (body.length < 2) return "Enter the name customers know your business by.";
    await query(`UPDATE whatsapp_onboarding_sessions SET stage='email',data=jsonb_set(data,'{businessName}',to_jsonb($2::text)),updated_at=now(),expires_at=now()+interval '24 hours' WHERE contact_id=$1`, [input.contactId, body.slice(0, 160)]);
    return `Great — ${body.slice(0, 160)}.\n\nWhat email should the business use? Reply SKIP if you want to add one later.`;
  }
  if (session.stage === "email") {
    const email = /^(skip|not now)$/i.test(body) ? "" : body.toLowerCase();
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return "That email doesn’t look right. Enter a business email, or reply SKIP.";
    const data = { ...(session.data ?? {}), email };
    await query("UPDATE whatsapp_onboarding_sessions SET stage='confirm',data=$2,updated_at=now(),expires_at=now()+interval '24 hours' WHERE contact_id=$1", [input.contactId, JSON.stringify(data)]);
    return `Ready to create your business?\n\nBusiness: ${data.businessName}\nCountry: Nigeria\nCurrency: Naira${email ? `\nEmail: ${email}` : "\nEmail: Add later"}\n\nReply CREATE to finish, BACK to change the email, or CANCEL.`;
  }
  if (/^back$/i.test(body)) {
    await query("UPDATE whatsapp_onboarding_sessions SET stage='email',updated_at=now() WHERE contact_id=$1", [input.contactId]);
    return "What email should the business use? Reply SKIP if you want to add one later.";
  }
  if (!/^(create|confirm|yes)$/i.test(body)) return "Reply CREATE to create this business, BACK to change the email, or CANCEL.";
  return transaction(async client => {
    const locked = (await client.query<Record<string, any>>(`SELECT s.*,c.phone_e164 FROM whatsapp_onboarding_sessions s
      JOIN whatsapp_contacts c ON c.id=s.contact_id WHERE s.contact_id=$1 AND s.stage='confirm' AND s.expires_at>now() FOR UPDATE OF s,c`, [input.contactId])).rows[0];
    if (!locked) throw new HttpError(409, "This setup session expired. Reply GET STARTED to begin again.");
    const existing = (await client.query("SELECT user_id FROM whatsapp_auth_identities WHERE phone=$1", [locked.phone_e164])).rows[0];
    if (existing) throw new HttpError(409, "This WhatsApp number is already connected to a LemonBooks account. Reply LOGIN.");
    const businessName = clean(locked.data.businessName, 160), email = clean(locked.data.email, 200).toLowerCase() || null;
    const ownerName = clean(input.displayName, 120) || `${businessName} owner`;
    const slugBase = businessName.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "business";
    const tenantSlug = `${slugBase}-${crypto.randomBytes(4).toString("hex")}`;
    const user = (await client.query<{ id: string }>("INSERT INTO users(name) VALUES($1) RETURNING id", [ownerName])).rows[0]!;
    const business = (await client.query<{ id: string }>(`INSERT INTO businesses(tenant_slug,name,email,phone,country_code,currency,timezone,onboarding_completed)
      VALUES($1,$2,$3,$4,'NG','NGN','Africa/Lagos',true) RETURNING id`, [tenantSlug, businessName, email, locked.phone_e164])).rows[0]!;
    await client.query(`INSERT INTO memberships(business_id,user_id,role,permissions) VALUES($1,$2,'owner','["all"]')`, [business.id, user.id]);
    await client.query("INSERT INTO whatsapp_auth_identities(phone,user_id) VALUES($1,$2)", [locked.phone_e164, user.id]);
    await client.query(`INSERT INTO whatsapp_account_links(contact_id,business_id,user_id) VALUES($1,$2,$3)
      ON CONFLICT(contact_id) DO UPDATE SET business_id=EXCLUDED.business_id,user_id=EXCLUDED.user_id,created_at=now()`, [input.contactId, business.id, user.id]);
    await client.query(`INSERT INTO integration_audit_log(business_id,actor_type,actor_id,action,resource_type,resource_id,after_summary)
      VALUES($1,'whatsapp_contact',$2,'whatsapp.business_created','business',$3,$4)`, [business.id, input.contactId, business.id, JSON.stringify({ tenantSlug, phone: locked.phone_e164 })]);
    await client.query("DELETE FROM whatsapp_onboarding_sessions WHERE contact_id=$1", [input.contactId]);
    return `${businessName} is ready.\n\nWorkspace: ${tenantSlug}.lemonbooks.app\n\nYou can now create invoices, add stock, record sales and see today’s summary here. Reply HELP to see examples, or LOGIN to open the full workspace.`;
  });
}

async function listBusinesses(contactId: string) {
  const context = await activeContext(contactId);
  if (!context) return "Connect your account first by replying CONNECT.";
  const rows = await query<{ name: string; tenant_slug: string; active: boolean }>(`SELECT b.name,b.tenant_slug,(b.id=$2) AS active
    FROM memberships m JOIN businesses b ON b.id=m.business_id WHERE m.user_id=$1 ORDER BY b.name`, [context.user_id, context.business_id]);
  return `Your businesses\n\n${rows.map(row => `${row.active ? "✓" : "•"} ${row.name} · ${row.tenant_slug}`).join("\n")}\n\nTo change workspace, reply SWITCH | business name.`;
}

async function switchBusiness(contactId: string, requested: string) {
  const context = await activeContext(contactId);
  if (!context) return "Connect your account first by replying CONNECT.";
  const needle = clean(requested, 160).toLowerCase();
  if (!needle) return "Use: SWITCH | business name";
  const rows = await query<Record<string, any>>(`SELECT b.id,b.name,b.tenant_slug FROM memberships m JOIN businesses b ON b.id=m.business_id
    WHERE m.user_id=$1 AND (lower(b.name)= $2 OR lower(b.tenant_slug)= $2 OR lower(b.name) LIKE '%'||$2||'%') ORDER BY CASE WHEN lower(b.name)=$2 THEN 0 ELSE 1 END LIMIT 3`, [context.user_id, needle]);
  if (!rows.length) return `I couldn’t find “${requested}” in your businesses. Reply BUSINESSES to see your workspaces.`;
  if (rows.length > 1 && rows[0]!.name.toLowerCase() !== needle && rows[0]!.tenant_slug.toLowerCase() !== needle) return `More than one business matches. Reply with the exact name:\n${rows.map(row => `• ${row.name}`).join("\n")}`;
  await transaction(async client => {
    await client.query("UPDATE whatsapp_account_links SET business_id=$1,created_at=now() WHERE contact_id=$2 AND user_id=$3", [rows[0]!.id, contactId, context.user_id]);
    await client.query(`INSERT INTO integration_audit_log(business_id,actor_type,actor_id,action,resource_type,resource_id,after_summary)
      VALUES($1,'whatsapp_contact',$2,'whatsapp.workspace_switched','business',$3,$4)`, [rows[0]!.id, contactId, rows[0]!.id, JSON.stringify({ previousBusinessId: context.business_id })]);
  });
  return `You’re now working in ${rows[0]!.name}.`;
}

async function createDraft(input: AssistantMessageInput, context: Record<string, any>, action: AssistantAction) {
  const draft = await transaction(async client => {
    await client.query("UPDATE whatsapp_action_drafts SET status='expired',updated_at=now() WHERE contact_id=$1 AND status='pending' AND expires_at<=now()", [input.contactId]);
    const duplicate = (await client.query<Record<string, any>>("SELECT * FROM whatsapp_action_drafts WHERE contact_id=$1 AND source_message_id=$2", [input.contactId, input.sourceMessageId])).rows[0];
    if (duplicate) return duplicate;
    await client.query("UPDATE whatsapp_action_drafts SET status='cancelled',updated_at=now() WHERE contact_id=$1 AND status='pending'", [input.contactId]);
    const row = (await client.query<Record<string, any>>(`INSERT INTO whatsapp_action_drafts(business_id,contact_id,conversation_id,requested_by,action_type,payload,source_message_id)
      VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`, [context.business_id, input.contactId, input.conversationId, context.user_id, action.type, JSON.stringify(action), input.sourceMessageId])).rows[0]!;
    await client.query(`INSERT INTO integration_audit_log(business_id,actor_type,actor_id,action,resource_type,resource_id,after_summary)
      VALUES($1,'whatsapp_contact',$2,'whatsapp.draft_created','whatsapp_action_draft',$3,$4)`, [context.business_id, input.contactId, row.id, JSON.stringify(action)]);
    return row;
  });
  return `${actionSummary(draft.payload as AssistantAction, context.currency)}\n\nReply CONFIRM to save it or CANCEL to discard it. This draft expires in 24 hours.`;
}

async function ensureClient(client: PoolClient, businessId: string, name: string) {
  const existing = (await client.query<{ id: string }>("SELECT id FROM clients WHERE business_id=$1 AND lower(name)=lower($2) AND deleted_at IS NULL ORDER BY created_at LIMIT 1", [businessId, name])).rows[0];
  if (existing) return existing.id;
  const created = (await client.query<{ id: string }>("INSERT INTO clients(business_id,name) VALUES($1,$2) RETURNING id", [businessId, name])).rows[0]!;
  await client.query("INSERT INTO sync_changes(business_id,table_name,record_id,operation) VALUES($1,'clients',$2,'created')", [businessId, created.id]);
  return created.id;
}

async function ensureItem(client: PoolClient, businessId: string, name: string, price: number) {
  const existing = (await client.query<Record<string, any>>("SELECT * FROM items WHERE business_id=$1 AND lower(name)=lower($2) AND active=true AND deleted_at IS NULL ORDER BY created_at LIMIT 1 FOR UPDATE", [businessId, name])).rows[0];
  if (existing) return existing;
  const created = (await client.query<Record<string, any>>("INSERT INTO items(business_id,name,kind,price,stock_quantity) VALUES($1,$2,'product',$3,NULL) RETURNING *", [businessId, name, price])).rows[0]!;
  await client.query("INSERT INTO sync_changes(business_id,table_name,record_id,operation) VALUES($1,'items',$2,'created')", [businessId, created.id]);
  return created;
}

async function invoiceNumber(client: PoolClient, businessId: string) {
  await client.query("SELECT id FROM businesses WHERE id=$1 FOR UPDATE", [businessId]);
  const row = (await client.query<{ next: string }>(`SELECT ('INV-' || lpad((COALESCE(MAX(CASE WHEN number ~ '^INV-[0-9]+$' THEN substring(number from 5)::bigint END),0)+1)::text,5,'0')) AS next FROM invoices WHERE business_id=$1`, [businessId])).rows[0];
  return row?.next ?? `INV-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

async function createInvoiceRecord(client: PoolClient, businessId: string, action: Extract<AssistantAction, { type: "invoice" | "sale" }>, paid: boolean, draftId: string) {
  const business = (await client.query<{ currency: string }>("SELECT currency FROM businesses WHERE id=$1", [businessId])).rows[0];
  if (!business?.currency) throw new HttpError(409, "Choose your business currency before recording this transaction.");
  const customerId = await ensureClient(client, businessId, action.customerName);
  const item = await ensureItem(client, businessId, action.itemName, action.unitPrice);
  if (paid && item.stock_quantity !== null && Number(item.stock_quantity) < action.quantity) throw new HttpError(409, `${item.name} has only ${item.stock_quantity} in stock.`);
  const total = Math.round(action.quantity * action.unitPrice * 100) / 100;
  const number = await invoiceNumber(client, businessId);
  const invoice = (await client.query<Record<string, any>>(`INSERT INTO invoices(business_id,client_id,number,status,currency,subtotal,total,amount_paid,notes)
    VALUES($1,$2,$3,$4,$5,$6,$6,$7,$8) RETURNING *`, [businessId, customerId, number, paid ? "paid" : "draft", business.currency, total, paid ? total : 0, `Created from confirmed WhatsApp draft ${draftId}`])).rows[0]!;
  await client.query("INSERT INTO invoice_lines(invoice_id,item_id,description,quantity,unit_price,total) VALUES($1,$2,$3,$4,$5,$6)", [invoice.id, item.id, item.name, action.quantity, action.unitPrice, total]);
  await client.query("INSERT INTO sync_changes(business_id,table_name,record_id,operation) VALUES($1,'invoices',$2,'created')", [businessId, invoice.id]);
  return { invoice, total, currency: business.currency };
}

async function executeDraft(client: PoolClient, draft: Record<string, any>) {
  const action = draft.payload as AssistantAction;
  if (action.type === "invoice") {
    const { invoice } = await createInvoiceRecord(client, draft.business_id, action, false, draft.id);
    return { type: "invoice", id: invoice.id, message: `Invoice ${invoice.number} was created as a draft.` };
  }
  if (action.type === "inventory") {
    const existing = (await client.query<Record<string, any>>("SELECT * FROM items WHERE business_id=$1 AND lower(name)=lower($2) AND deleted_at IS NULL FOR UPDATE", [draft.business_id, action.itemName])).rows[0];
    const item = existing
      ? (await client.query<Record<string, any>>(`UPDATE items SET stock_quantity=COALESCE(stock_quantity,0)+$1,price=$2,cost=$3,active=true,sync_version=sync_version+1,updated_at=now() WHERE id=$4 RETURNING *`, [action.quantity, action.price, action.cost, existing.id])).rows[0]!
      : (await client.query<Record<string, any>>(`INSERT INTO items(business_id,name,kind,price,cost,stock_quantity) VALUES($1,$2,'product',$3,$4,$5) RETURNING *`, [draft.business_id, action.itemName, action.price, action.cost, action.quantity])).rows[0]!;
    await client.query("INSERT INTO sync_changes(business_id,table_name,record_id,operation) VALUES($1,'items',$2,$3)", [draft.business_id, item.id, existing ? "updated" : "created"]);
    return { type: "item", id: item.id, message: `${item.name} is saved. Current stock: ${item.stock_quantity}.` };
  }
  if (action.type === "sale") {
    const { invoice, total, currency } = await createInvoiceRecord(client, draft.business_id, action, true, draft.id);
    await client.query(`INSERT INTO payments(business_id,invoice_id,amount,currency,method,reference,status,group_reference)
      VALUES($1,$2,$3,$4,$5,$6,'confirmed',$6)`, [draft.business_id, invoice.id, total, currency, action.method, `WA-SALE-${draft.id}`]);
    await recordInvoiceSale(client, invoice.id, draft.business_id);
    return { type: "sale", id: invoice.id, message: `Sale ${invoice.number} was recorded. Total: ${formatMoney(total, currency)}.` };
  }
  if (action.type === "expense") {
    const currency = (await client.query<{ currency: string }>("SELECT currency FROM businesses WHERE id=$1", [draft.business_id])).rows[0]?.currency ?? "NGN";
    const expense = (await client.query<{ id: string }>(`INSERT INTO expenses(business_id,vendor_name,category,description,amount,currency,expense_date,status,created_by)
      VALUES($1,$2,$3,$4,$5,$6,current_date,'recorded',$7) RETURNING id`, [draft.business_id, action.vendorName || null, action.category || "uncategorized", action.description, action.amount, currency, draft.requested_by])).rows[0]!;
    return { type: "expense", id: expense.id, message: `Expense recorded: ${formatMoney(action.amount, currency)} for ${action.description}.` };
  }
  const invoice = (await client.query<Record<string, any>>(`SELECT i.*,c.name AS customer_name FROM invoices i LEFT JOIN clients c ON c.id=i.client_id
    WHERE i.business_id=$1 AND lower(regexp_replace(i.number,'[^a-zA-Z0-9]','','g'))=lower(regexp_replace($2,'[^a-zA-Z0-9]','','g')) AND i.deleted_at IS NULL FOR UPDATE`, [draft.business_id, action.invoiceNumber])).rows[0];
  if (!invoice) throw new HttpError(404, `Invoice ${action.invoiceNumber} was not found.`);
  if (action.amount > Number(invoice.total) - Number(invoice.amount_paid) + 0.005) throw new HttpError(409, "The reported payment is greater than the invoice balance.");
  const claim = (await client.query<{ id: string }>(`INSERT INTO payment_claims(business_id,invoice_id,method,payer_name,amount,paid_at,note,status)
    VALUES($1,$2,$3,$4,$5,now(),$6,'pending') RETURNING id`, [draft.business_id, invoice.id, action.method, invoice.customer_name || "Customer", action.amount, action.reference || "Reported through LemonBooks WhatsApp assistant"])).rows[0]!;
  return { type: "payment_claim", id: claim.id, message: `Payment reported for ${invoice.number}. LemonBooks will confirm it after matching the bank or provider record.` };
}

async function confirmDraft(contactId: string) {
  try {
    return await transaction(async client => {
      const draft = (await client.query<Record<string, any>>(`SELECT d.* FROM whatsapp_action_drafts d JOIN whatsapp_account_links l
        ON l.contact_id=d.contact_id AND l.business_id=d.business_id AND l.user_id=d.requested_by
        WHERE d.contact_id=$1 AND d.status='pending' ORDER BY d.created_at DESC LIMIT 1 FOR UPDATE OF d`, [contactId])).rows[0];
      if (!draft) return "There is no pending draft to confirm.";
      if (new Date(draft.expires_at).getTime() <= Date.now()) {
        await client.query("UPDATE whatsapp_action_drafts SET status='expired',updated_at=now() WHERE id=$1", [draft.id]);
        return "That draft expired. Send the instruction again to create a new one.";
      }
      const result = await executeDraft(client, draft);
      await client.query(`UPDATE whatsapp_action_drafts SET status='confirmed',result_type=$2,result_id=$3,confirmed_at=now(),updated_at=now() WHERE id=$1`, [draft.id, result.type, result.id]);
      await client.query(`INSERT INTO integration_audit_log(business_id,actor_type,actor_id,action,resource_type,resource_id,after_summary)
        VALUES($1,'whatsapp_contact',$2,'whatsapp.draft_confirmed','whatsapp_action_draft',$3,$4)`, [draft.business_id, contactId, draft.id, JSON.stringify({ resultType: result.type, resultId: result.id })]);
      return result.message;
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The draft could not be saved.";
    return `I couldn’t save that draft: ${message}\n\nIt is still pending. Reply CANCEL to discard it or correct the underlying information in LemonBooks.`;
  }
}

async function cancelDraft(contactId: string) {
  const rows = await query("UPDATE whatsapp_action_drafts SET status='cancelled',updated_at=now() WHERE contact_id=$1 AND status='pending' RETURNING id", [contactId]);
  return rows.length ? "Draft discarded." : "There is no pending draft to discard.";
}

async function todaySummary(context: Record<string, any>) {
  const row = (await query<Record<string, any>>(`SELECT
    COALESCE((SELECT sum(amount) FROM payments WHERE business_id=$1 AND deleted_at IS NULL AND received_at>=date_trunc('day',now() AT TIME ZONE b.timezone) AT TIME ZONE b.timezone),0) AS payments,
    (SELECT count(*) FROM invoices WHERE business_id=$1 AND deleted_at IS NULL AND created_at>=date_trunc('day',now() AT TIME ZONE b.timezone) AT TIME ZONE b.timezone) AS invoices,
    (SELECT count(*) FROM items WHERE business_id=$1 AND deleted_at IS NULL AND active=true AND stock_quantity IS NOT NULL AND stock_quantity<=COALESCE(low_stock_threshold,0)) AS low_stock
    FROM businesses b WHERE b.id=$1`, [context.business_id]))[0];
  return `${context.business_name} today\n\nPayments received: ${formatMoney(Number(row?.payments ?? 0), context.currency)}\nInvoices created: ${row?.invoices ?? 0}\nLow-stock items: ${row?.low_stock ?? 0}`;
}

function help(workspace?: string) {
  return `${workspace ? `Workspace: ${workspace}\n\n` : ""}What you can do\n\n• Create invoice\n${usage.invoice}\n\n• Add stock\n${usage.inventory}\n\n• Record a sale\n${usage.sale}\n\n• Record an expense\n${usage.expense}\n\n• Report a payment\n${usage.payment}\n\nReply TODAY for a summary, BUSINESSES to switch workspace, LOGIN to open the portal, or UNLINK to disconnect.`;
}

export async function handleWhatsAppAssistant(input: AssistantMessageInput): Promise<string | null> {
  const body = clean(input.body, 1200);
  if (!body) return "I received that message, but I need text or a caption to understand the business action.";
  if (/^(stop|unsubscribe|opt\s*out)$/i.test(body)) return null;
  const onboarding = (await query<Record<string, any>>("SELECT * FROM whatsapp_onboarding_sessions WHERE contact_id=$1 AND expires_at>now()", [input.contactId]))[0];
  if (onboarding) return continueOnboarding({ ...input, body }, onboarding);
  const context = await activeContext(input.contactId);
  if (!context) {
    if (/^(register|sign\s*up|create\s+(?:an?\s+)?account|get\s+started|start)$/i.test(body)) return startOnboarding(input);
    if (/^(connect|link|login|sign\s*in)$/i.test(body)) {
      const url = await createWhatsAppLink(input.contactId, input.conversationId, "link");
      return `Connect this WhatsApp number to an existing LemonBooks account:\n${url}\n\nThe private link expires in 10 minutes. Sign in to the workspace you want to connect.`;
    }
    return `Hi${input.displayName ? ` ${input.displayName}` : ""} — welcome to LemonBooks.\n\nReply GET STARTED to create a business here, or CONNECT to link an existing LemonBooks account.`;
  }
  if (/^unlink$/i.test(body)) {
    await unlinkWhatsAppAccount(input.contactId);
    return "This WhatsApp number has been disconnected from LemonBooks. Your business records are unchanged. Reply CONNECT whenever you want to reconnect.";
  }
  if (/^(help|menu|start)$/i.test(body)) return help(context.business_name);
  if (/^(businesses|workspaces|switch business)$/i.test(body)) return listBusinesses(input.contactId);
  if (/^switch\s*\|/i.test(body)) return switchBusiness(input.contactId, body.split("|").slice(1).join("|").trim());
  if (/^(login|sign\s*in|open workspace)$/i.test(body)) {
    const url = await createWhatsAppLoginLink(input.contactId, input.conversationId);
    return `Open ${context.business_name}:\n${url}\n\nThis private sign-in link expires in 10 minutes and works once.`;
  }
  if (/^(confirm|save|yes)$/i.test(body)) return confirmDraft(input.contactId);
  if (/^(cancel|discard|no)$/i.test(body)) return cancelDraft(input.contactId);
  if (/^(today|today's summary|todays summary|summary|sales today)$/i.test(body)) return todaySummary(context);
  const parsed = parseAssistantAction(body);
  if (parsed.kind === "incomplete") return `I can prepare that. Send it like this:\n\n${parsed.usage}\n\nI’ll show you a draft before anything is saved.`;
  if (parsed.kind === "action") return createDraft(input, context, parsed.action);
  return `I didn’t understand that request. Reply HELP to see the actions I can handle, or TODAY for your business summary.`;
}
