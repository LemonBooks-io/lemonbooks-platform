import type { PoolClient } from "pg";

/** Posts the sale represented by an invoice to stock exactly once, when called on first transition to paid. */
export async function recordInvoiceSale(client: PoolClient, invoiceId: string, businessId: string) {
  const posted = await client.query<{ id:string }>(
    "UPDATE invoices SET inventory_posted_at=now() WHERE id=$1 AND business_id=$2 AND inventory_posted_at IS NULL RETURNING id",
    [invoiceId,businessId],
  );
  if (!posted.rows[0]) return 0;
  const result = await client.query<{ id:string }>(
    `WITH sold AS (
       SELECT item_id,sum(quantity) AS quantity FROM invoice_lines WHERE invoice_id=$1 AND item_id IS NOT NULL GROUP BY item_id
     )
     UPDATE items i SET stock_quantity=GREATEST(0,i.stock_quantity-sold.quantity),sync_version=i.sync_version+1,updated_at=now()
     FROM sold WHERE i.id=sold.item_id AND i.business_id=$2 AND i.kind='product' AND i.stock_quantity IS NOT NULL
     RETURNING i.id`, [invoiceId,businessId],
  );
  for (const item of result.rows) await client.query(
    "INSERT INTO sync_changes (business_id,table_name,record_id,operation) VALUES ($1,'items',$2,'updated')",
    [businessId,item.id],
  );
  return result.rows.length;
}
