import { Router } from "express";
import { query, transaction } from "../database/pool";
import { asyncRoute, HttpError } from "../http";
import { sendInvoiceEmail } from "../services/email.service";

export const resourcesRouter = Router();
const allowed = new Set(["clients", "items", "invoices", "payments"]);

function table(name: string): string {
  if (!allowed.has(name)) throw new HttpError(404, "Resource not found");
  return name;
}

resourcesRouter.get("/:resource", asyncRoute(async (req, res) => {
  const requestedResource = req.params.resource;
  const resource = table(Array.isArray(requestedResource) ? requestedResource[0]! : requestedResource!);
  const rows = resource === "invoices"
    ? await query<Record<string, unknown>>(
      `SELECT i.*,c.name AS client_name,c.email AS client_email,
       (SELECT count(*)::int FROM payment_claims pc WHERE pc.invoice_id=i.id AND pc.status='pending') AS pending_payment_count
       FROM invoices i LEFT JOIN clients c ON c.id=i.client_id
       WHERE i.business_id=$1 AND i.deleted_at IS NULL ORDER BY i.created_at DESC LIMIT 200`, [req.auth!.businessId],
    )
    : resource === "payments"
    ? await query<Record<string, unknown>>(
      `SELECT p.*,i.number AS invoice_number,c.name AS client_name,
       COALESCE(pi.provider,CASE WHEN p.reference LIKE 'LB-%' THEN 'paystack' WHEN p.reference LIKE 'CLAIM-%' THEN 'manual' ELSE 'direct' END) AS provider
       FROM payments p LEFT JOIN invoices i ON i.id=p.invoice_id LEFT JOIN clients c ON c.id=i.client_id
       LEFT JOIN payment_intents pi ON pi.reference=p.reference
       WHERE p.business_id=$1 AND p.deleted_at IS NULL ORDER BY p.received_at DESC LIMIT 200`, [req.auth!.businessId],
    )
    : await query<Record<string, unknown>>(
      `SELECT * FROM ${resource} WHERE business_id=$1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 200`, [req.auth!.businessId],
    );
  res.json({ success: true, data: rows });
}));

resourcesRouter.post("/clients", asyncRoute(async (req, res) => {
  const { name, email, phone, company, address } = req.body;
  if (!name?.trim()) throw new HttpError(400, "Client name is required");
  const [record] = await query<Record<string, unknown>>(
    `INSERT INTO clients (business_id,name,email,phone,company,address) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.auth!.businessId, name.trim(), email || null, phone || null, company || null, address || null],
  );
  await query("INSERT INTO sync_changes (business_id,table_name,record_id,operation) VALUES ($1,'clients',$2,'created')", [req.auth!.businessId, record!.id]);
  res.status(201).json({ success: true, data: record });
}));

resourcesRouter.patch("/clients/:id", asyncRoute(async (req, res) => {
  const { name, email, phone, company, address } = req.body;
  if (!name?.trim()) throw new HttpError(400, "Client name is required");
  const [record] = await query<Record<string, unknown>>(
    `UPDATE clients SET name=$1,email=$2,phone=$3,company=$4,address=$5,sync_version=sync_version+1,updated_at=now()
     WHERE id=$6 AND business_id=$7 AND deleted_at IS NULL RETURNING *`,
    [name.trim(), email || null, phone || null, company || null, address || null, req.params.id, req.auth!.businessId],
  );
  if (!record) throw new HttpError(404, "Client not found");
  await query("INSERT INTO sync_changes (business_id,table_name,record_id,operation) VALUES ($1,'clients',$2,'updated')", [req.auth!.businessId, record.id]);
  res.json({ success: true, message: "Client updated", data: record });
}));

resourcesRouter.post("/clients/bulk", asyncRoute(async (req, res) => {
  const rows = req.body.rows as Array<Record<string, unknown>>;
  if (!Array.isArray(rows) || !rows.length || rows.length > 1000) throw new HttpError(400, "Upload between 1 and 1,000 clients");
  const created = await transaction(async (client) => {
    const records: unknown[] = [];
    for (const [index, row] of rows.entries()) {
      const name = String(row.name ?? "").trim();
      if (!name) throw new HttpError(400, `Row ${index + 2}: name is required`);
      const result = await client.query(
        `INSERT INTO clients (business_id,name,email,phone,company,address) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [req.auth!.businessId, name, row.email || null, row.phone || null, row.company || null, row.address || null],
      );
      records.push(result.rows[0]);
      await client.query("INSERT INTO sync_changes (business_id,table_name,record_id,operation) VALUES ($1,'clients',$2,'created')", [req.auth!.businessId, result.rows[0].id]);
    }
    return records;
  });
  res.status(201).json({ success: true, message: `${created.length} clients imported`, data: created });
}));

resourcesRouter.post("/items", asyncRoute(async (req, res) => {
  const { name, description, kind = "product", sku, price = 0, cost = 0, stockQuantity, lowStockThreshold } = req.body;
  if (!name?.trim()) throw new HttpError(400, "Item name is required");
  if (!["product", "service"].includes(kind)) throw new HttpError(400, "Type must be product or service");
  if (!Number.isFinite(Number(price)) || Number(price) < 0) throw new HttpError(400, "Selling price must be a positive number");
  const [record] = await query<Record<string, unknown>>(
    `INSERT INTO items (business_id,name,description,kind,sku,price,cost,stock_quantity,low_stock_threshold)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [req.auth!.businessId, name.trim(), description || null, kind, sku || null, price, cost, stockQuantity ?? null, lowStockThreshold ?? null],
  );
  await query("INSERT INTO sync_changes (business_id,table_name,record_id,operation) VALUES ($1,'items',$2,'created')", [req.auth!.businessId, record!.id]);
  res.status(201).json({ success: true, data: record });
}));

resourcesRouter.patch("/items/:id", asyncRoute(async (req, res) => {
  const { name, description, kind = "product", sku, price = 0, cost = 0, stockQuantity, lowStockThreshold, active = true } = req.body;
  if (!name?.trim()) throw new HttpError(400, "Item name is required");
  if (!["product", "service"].includes(kind)) throw new HttpError(400, "Type must be product or service");
  const [record] = await query<Record<string, unknown>>(
    `UPDATE items SET name=$1,description=$2,kind=$3,sku=$4,price=$5,cost=$6,stock_quantity=$7,
     low_stock_threshold=$8,active=$9,sync_version=sync_version+1,updated_at=now()
     WHERE id=$10 AND business_id=$11 AND deleted_at IS NULL RETURNING *`,
    [name.trim(), description || null, kind, sku || null, price, cost, kind === "product" ? stockQuantity ?? null : null, lowStockThreshold ?? null, active, req.params.id, req.auth!.businessId],
  );
  if (!record) throw new HttpError(404, "Item not found");
  await query("INSERT INTO sync_changes (business_id,table_name,record_id,operation) VALUES ($1,'items',$2,'updated')", [req.auth!.businessId, record.id]);
  res.json({ success: true, message: "Item updated", data: record });
}));

resourcesRouter.post("/items/bulk", asyncRoute(async (req, res) => {
  const rows = req.body.rows as Array<Record<string, unknown>>;
  if (!Array.isArray(rows) || !rows.length || rows.length > 1000) throw new HttpError(400, "Upload between 1 and 1,000 items");
  const created = await transaction(async (client) => {
    const records: unknown[] = [];
    for (const [index, row] of rows.entries()) {
      const name = String(row.name ?? "").trim();
      const kind = String(row.type ?? row.kind ?? "product").trim().toLowerCase();
      if (!name) throw new HttpError(400, `Row ${index + 2}: name is required`);
      if (!["product", "service"].includes(kind)) throw new HttpError(400, `Row ${index + 2}: type must be product or service`);
      if (!Number.isFinite(Number(row.price)) || Number(row.price) < 0) throw new HttpError(400, `Row ${index + 2}: price must be a positive number`);
      const result = await client.query(
        `INSERT INTO items (business_id,name,description,kind,sku,price,cost,stock_quantity,low_stock_threshold)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [req.auth!.businessId, name, row.description || null, kind, row.sku || null, Number(row.price || 0), Number(row.cost || 0), kind === "product" && row.stock_quantity !== "" ? Number(row.stock_quantity ?? 0) : null, row.low_stock_threshold !== "" ? Number(row.low_stock_threshold ?? 0) : null],
      );
      records.push(result.rows[0]);
      await client.query("INSERT INTO sync_changes (business_id,table_name,record_id,operation) VALUES ($1,'items',$2,'created')", [req.auth!.businessId, result.rows[0].id]);
    }
    return records;
  });
  res.status(201).json({ success: true, message: `${created.length} items imported`, data: created });
}));

resourcesRouter.post("/invoices/:id/send", asyncRoute(async (req, res) => {
  const invoices = await query<Record<string, any>>(
    `SELECT i.*,c.name AS client_name,c.email AS client_email,b.name AS business_name,
      pa.virtual_bank_name,pa.virtual_account_number,pa.virtual_account_name FROM invoices i
     LEFT JOIN clients c ON c.id=i.client_id JOIN businesses b ON b.id=i.business_id
     LEFT JOIN business_payment_accounts pa ON pa.business_id=i.business_id AND pa.status='active'
     WHERE i.id=$1 AND i.business_id=$2 AND i.status IN ('draft','sent') AND i.deleted_at IS NULL`, [req.params.id, req.auth!.businessId],
  );
  const invoice = invoices[0];
  if (!invoice) throw new HttpError(409, "Only a draft or sent invoice can be delivered");
  if (!invoice.client_email) throw new HttpError(400, "Add an email address to the client before sending this invoice");
  const lines = await query<Record<string, any>>("SELECT * FROM invoice_lines WHERE invoice_id=$1 ORDER BY id", [invoice.id]);
  try { await sendInvoiceEmail(invoice, lines); }
  catch (error) { await query("UPDATE invoices SET delivery_status='failed',delivery_error=$1 WHERE id=$2", [error instanceof Error ? error.message : "Delivery failed", invoice.id]); throw error; }
  const [updated] = await query<Record<string, unknown>>(
    `UPDATE invoices SET status='sent',sent_at=now(),delivery_status='delivered',delivery_error=NULL,sync_version=sync_version+1,updated_at=now()
     WHERE id=$1 AND business_id=$2 RETURNING *`, [invoice.id, req.auth!.businessId],
  );
  await query("INSERT INTO sync_changes (business_id,table_name,record_id,operation) VALUES ($1,'invoices',$2,'updated')", [req.auth!.businessId, invoice.id]);
  res.json({ success: true, message: `Invoice emailed to ${invoice.client_email}`, data: updated });
}));

resourcesRouter.get("/invoices/:id", asyncRoute(async (req, res) => {
  const invoices = await query<Record<string, unknown>>(
    `SELECT i.*,c.name AS client_name,c.email AS client_email,c.phone AS client_phone,c.address AS client_address,
     (SELECT count(*)::int FROM payment_claims pc WHERE pc.invoice_id=i.id AND pc.status='pending') AS pending_payment_count
     FROM invoices i LEFT JOIN clients c ON c.id=i.client_id
     WHERE i.id=$1 AND i.business_id=$2 AND i.deleted_at IS NULL`, [req.params.id, req.auth!.businessId],
  );
  if (!invoices[0]) throw new HttpError(404, "Invoice not found");
  const lines = await query<Record<string, unknown>>(
    `SELECT il.*,it.kind,it.sku FROM invoice_lines il LEFT JOIN items it ON it.id=il.item_id
     WHERE il.invoice_id=$1 ORDER BY il.id`, [req.params.id],
  );
  res.json({ success: true, data: { ...invoices[0], lines } });
}));

resourcesRouter.post("/invoices/:id/void", asyncRoute(async (req, res) => {
  const [invoice] = await query<Record<string, unknown>>(
    `UPDATE invoices SET status='cancelled',sync_version=sync_version+1,updated_at=now()
     WHERE id=$1 AND business_id=$2 AND status IN ('draft','sent','overdue') AND deleted_at IS NULL RETURNING *`,
    [req.params.id, req.auth!.businessId],
  );
  if (!invoice) throw new HttpError(409, "This invoice cannot be voided");
  await query("INSERT INTO sync_changes (business_id,table_name,record_id,operation) VALUES ($1,'invoices',$2,'updated')", [req.auth!.businessId, req.params.id]);
  res.json({ success: true, message: "Invoice voided", data: invoice });
}));

resourcesRouter.post("/invoices", asyncRoute(async (req, res) => {
  const { clientId, issueDate, dueDate, notes, lines = [] } = req.body;
  if (!Array.isArray(lines) || !lines.length) throw new HttpError(400, "Add at least one invoice item");
  const currencyRows = await query<{ currency: string }>("SELECT currency FROM businesses WHERE id=$1", [req.auth!.businessId]);
  const currency = currencyRows[0]?.currency;
  if (!currency) throw new HttpError(409, "Choose your business currency before creating an invoice");
  if (clientId) {
    const clients = await query<{ id: string }>("SELECT id FROM clients WHERE id=$1 AND business_id=$2 AND deleted_at IS NULL", [clientId, req.auth!.businessId]);
    if (!clients[0]) throw new HttpError(400, "The selected client does not belong to this business");
  }
  const itemIds = lines.map((line: { itemId?: string }) => line.itemId).filter(Boolean);
  if (itemIds.length !== lines.length) throw new HttpError(400, "Every invoice line must use a saved item");
  const savedItems = await query<{ id: string; name: string; price: string }>(
    "SELECT id,name,price FROM items WHERE business_id=$1 AND id=ANY($2::uuid[]) AND active=true AND deleted_at IS NULL",
    [req.auth!.businessId, itemIds],
  );
  if (savedItems.length !== new Set(itemIds).size) throw new HttpError(400, "One or more invoice items are unavailable in this business");
  const itemMap = new Map(savedItems.map((item) => [item.id, item]));
  const normalizedLines = lines.map((line: { itemId: string; quantity?: number; unitPrice?: number }) => {
    const item = itemMap.get(line.itemId)!;
    const quantity = Number(line.quantity || 1);
    const unitPrice = line.unitPrice === undefined ? Number(item.price) : Number(line.unitPrice);
    if (quantity <= 0 || unitPrice < 0) throw new HttpError(400, "Invoice quantities and prices must be valid");
    return { itemId: item.id, description: item.name, quantity, unitPrice };
  });
  const subtotal = normalizedLines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const tax = Number(req.body.tax || 0);
  const numberRows = await query<{ next: string }>("SELECT ('INV-' || lpad((count(*)+1)::text,5,'0')) AS next FROM invoices WHERE business_id=$1", [req.auth!.businessId]);

  const invoice = await transaction(async (client) => {
    const result = await client.query(
      `INSERT INTO invoices (business_id,client_id,number,issue_date,due_date,currency,subtotal,tax,total,notes)
       VALUES ($1,$2,$3,COALESCE($4::date,CURRENT_DATE),$5,$6,$7,$8,$9,$10) RETURNING *`,
      [req.auth!.businessId, clientId || null, numberRows[0]!.next, issueDate || null, dueDate || null, currency, subtotal, tax, subtotal + tax, notes || null],
    );
    for (const line of normalizedLines) await client.query(
      `INSERT INTO invoice_lines (invoice_id,item_id,description,quantity,unit_price,total) VALUES ($1,$2,$3,$4,$5,$6)`,
      [result.rows[0].id, line.itemId || null, line.description, line.quantity || 1, line.unitPrice || 0, Number(line.quantity || 1) * Number(line.unitPrice || 0)],
    );
    await client.query("INSERT INTO sync_changes (business_id,table_name,record_id,operation) VALUES ($1,'invoices',$2,'created')", [req.auth!.businessId, result.rows[0].id]);
    return result.rows[0];
  });
  res.status(201).json({ success: true, data: invoice });
}));
