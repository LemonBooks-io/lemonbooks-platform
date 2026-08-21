import { Router } from "express";
import { asyncRoute, HttpError } from "../http";
import { query, transaction } from "../database/pool";
import { recordInvoiceSale } from "../services/inventory.service";
import { outbox } from "../services/integration.service";

export const paymentsRouter = Router();
paymentsRouter.get("/", asyncRoute(async (req, res) => {
  const rows = await query<Record<string, unknown>>(`SELECT pc.id,pc.method,pc.payer_name,pc.paid_to,pc.amount,pc.paid_at,pc.note,pc.receipt_name,pc.status,pc.created_at,pc.group_reference,i.number AS invoice_number,c.name AS client_name FROM payment_claims pc JOIN invoices i ON i.id=pc.invoice_id LEFT JOIN clients c ON c.id=i.client_id WHERE pc.business_id=$1 ORDER BY pc.created_at DESC`, [req.auth!.businessId]);
  res.json({ success: true, data: rows });
}));
paymentsRouter.get("/:id/receipt", asyncRoute(async (req, res) => {
  const rows = await query<{ receipt_data: Buffer; receipt_mime: string; receipt_name: string }>("SELECT receipt_data,receipt_mime,receipt_name FROM payment_claims WHERE id=$1 AND business_id=$2", [req.params.id, req.auth!.businessId]);
  if (!rows[0]?.receipt_data) throw new HttpError(404, "Receipt not found"); res.type(rows[0].receipt_mime); res.setHeader("Content-Disposition", `inline; filename=\"${rows[0].receipt_name.replace(/[\"\r\n]/g, "")}\"`); res.send(rows[0].receipt_data);
}));
paymentsRouter.patch("/:id", asyncRoute(async (req, res) => {
  const decision = req.body.status; if (!["approved","rejected"].includes(decision)) throw new HttpError(400, "Choose approved or rejected");
  const reviewed = await transaction(async (client) => {
    const selected=await client.query("SELECT * FROM payment_claims WHERE id=$1 AND business_id=$2 AND status='pending' FOR UPDATE",[req.params.id,req.auth!.businessId]);const first=selected.rows[0];if(!first)throw new HttpError(409,"This payment has already been reviewed or does not exist");
    const grouped=first.group_reference?await client.query("SELECT * FROM payment_claims WHERE business_id=$1 AND group_reference=$2 AND status='pending' ORDER BY invoice_id FOR UPDATE",[req.auth!.businessId,first.group_reference]):selected;
    for(const row of grouped.rows){if(decision==="approved"){const invoiceResult=await client.query<{status:string;amount_paid:string;total:string}>("SELECT status,amount_paid,total FROM invoices WHERE id=$1 AND business_id=$2 FOR UPDATE",[row.invoice_id,row.business_id]);const invoice=invoiceResult.rows[0];if(!invoice)throw new HttpError(404,"Invoice not found");const becomesPaid=invoice.status!=="paid"&&Number(invoice.amount_paid)+Number(row.amount)>=Number(invoice.total);
        const reference=`CLAIM-${row.id}`;const payment=await client.query(`INSERT INTO payments (business_id,invoice_id,amount,currency,method,reference,group_reference,status,received_at) SELECT $1,$2,$3,currency,$4,$5,$6,'confirmed',$7 FROM invoices WHERE id=$2 AND business_id=$1 RETURNING id`,[row.business_id,row.invoice_id,row.amount,row.method,reference,row.group_reference||reference,row.paid_at]);await client.query(`UPDATE invoices SET amount_paid=LEAST(total,amount_paid+$1),status=CASE WHEN amount_paid+$1>=total THEN 'paid' ELSE 'part_paid' END,sync_version=sync_version+1,updated_at=now() WHERE id=$2 AND business_id=$3`,[row.amount,row.invoice_id,row.business_id]);if(becomesPaid)await recordInvoiceSale(client,row.invoice_id,row.business_id);if(payment.rows[0]){await client.query("INSERT INTO sync_changes (business_id,table_name,record_id,operation) VALUES ($1,'payments',$2,'created')",[row.business_id,payment.rows[0].id]);await outbox(client,row.business_id,"payment.confirmed","payment",payment.rows[0].id,{invoiceId:row.invoice_id,paymentId:payment.rows[0].id,source:"manual_claim"},`payment.confirmed:${payment.rows[0].id}`);}}
      await client.query("UPDATE payment_claims SET status=$1,reviewed_by=$2,reviewed_at=now() WHERE id=$3",[decision,req.auth!.userId,row.id]);}
    return {status:decision,count:grouped.rows.length,groupReference:first.group_reference??null};
  });
  res.json({ success: true, message: `${reviewed.count} payment allocation${reviewed.count===1?"":"s"} ${decision}`, data: reviewed });
}));
