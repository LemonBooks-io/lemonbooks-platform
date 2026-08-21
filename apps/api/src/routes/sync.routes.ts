import { Router } from "express";
import { query, transaction } from "../database/pool";
import { asyncRoute, HttpError } from "../http";

export const syncRouter = Router();
const syncTables = ["clients", "items", "invoices", "payments"] as const;

syncRouter.get("/pull", asyncRoute(async (req, res) => {
  const since = Math.max(0, Number(req.query.since ?? 0));
  const changes = await query<{ sequence: string; table_name: string; record_id: string; operation: string }>(
    "SELECT sequence,table_name,record_id,operation FROM sync_changes WHERE business_id=$1 AND sequence>$2 ORDER BY sequence LIMIT 5000",
    [req.auth!.businessId, since],
  );
  const payload: Record<string, { created: unknown[]; updated: unknown[]; deleted: string[] }> = {};
  for (const name of syncTables) payload[name] = { created: [], updated: [], deleted: [] };
  for (const change of changes) {
    if (!syncTables.includes(change.table_name as typeof syncTables[number])) continue;
    const bucket = payload[change.table_name]!;
    if (change.operation === "deleted") bucket.deleted.push(change.record_id);
    else {
      const rows = await query<Record<string, unknown>>(`SELECT * FROM ${change.table_name} WHERE id=$1 AND business_id=$2`, [change.record_id, req.auth!.businessId]);
      if (rows[0]) bucket[change.operation === "created" ? "created" : "updated"].push(rows[0]);
    }
  }
  res.json({ success: true, data: { changes: payload, timestamp: Number(changes.at(-1)?.sequence ?? since) } });
}));

syncRouter.post("/push", asyncRoute(async (req, res) => {
  const changes = req.body.changes as Record<string, { created?: any[]; updated?: any[]; deleted?: string[] }>;
  if (!changes || typeof changes !== "object") throw new HttpError(400, "Sync changes are required");
  // Initial safe boundary: clients and items can be created offline; server remains authoritative for invoices/payments.
  await transaction(async (client) => {
    for (const name of ["clients", "items"] as const) {
      for (const record of changes[name]?.created ?? []) {
        if (name === "clients") await client.query(
          `INSERT INTO clients (id,business_id,name,email,phone,company,address,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,now()) ON CONFLICT (id) DO NOTHING`,
          [record.id, req.auth!.businessId, record.name, record.email || null, record.phone || null, record.company || null, record.address || null],
        );
        if (name === "items") await client.query(
          `INSERT INTO items (id,business_id,name,description,kind,sku,price,cost,stock_quantity,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,now()) ON CONFLICT (id) DO NOTHING`,
          [record.id, req.auth!.businessId, record.name, record.description || null, record.kind || "product", record.sku || null, record.price || 0, record.cost || 0, record.stock_quantity ?? null],
        );
        await client.query("INSERT INTO sync_changes (business_id,table_name,record_id,operation) VALUES ($1,$2,$3,'created')", [req.auth!.businessId, name, record.id]);
      }
    }
  });
  res.json({ success: true, message: "Offline changes synchronized" });
}));
