import crypto from "node:crypto";
import { NextFunction, Request, Response, Router } from "express";
import { env } from "../config";
import { query, transaction } from "../database/pool";
import { asyncRoute, HttpError } from "../http";
import { recordInvoiceSale } from "../services/inventory.service";
import { outbox } from "../services/integration.service";

type PaystackResponse = { status: boolean; message: string; data: Record<string, any> };
export const paystackRouter = Router();

function requirePaystack() {
  if (!env.paystackSecretKey) throw new HttpError(503, "Paystack is not configured yet. Add PAYSTACK_SECRET_KEY to the API environment.", "PAYSTACK_NOT_CONFIGURED");
}

export async function paystack(path: string, init?: RequestInit): Promise<PaystackResponse> {
  requirePaystack();
  const response = await fetch(`https://api.paystack.co${path}`, { ...init, headers: { Authorization: `Bearer ${env.paystackSecretKey}`, "Content-Type": "application/json", ...init?.headers } });
  const payload = await response.json() as PaystackResponse;
  if (!response.ok || !payload.status) throw new HttpError(502, payload.message || "Paystack could not process this request", "PAYSTACK_ERROR");
  return payload;
}

export async function settle(reference: string, providerData: Record<string, any>) {
  return transaction(async (client) => {
    const intentResult = await client.query("SELECT * FROM payment_intents WHERE reference=$1 FOR UPDATE", [reference]);
    const intent = intentResult.rows[0];
    if (!intent) throw new HttpError(404, "Payment reference not found");
    if (intent.status === "success") return intent;
    const paidAmount = Number(providerData.amount) / 100;
    if (providerData.status !== "success" || paidAmount !== Number(intent.amount) || providerData.currency !== intent.currency) throw new HttpError(409, `${intent.provider} payment details do not match this invoice`);
    const savedAllocations = Array.isArray(intent.allocations) ? intent.allocations as Array<{ invoiceId:string;amount:number }> : [];
    const allocations = savedAllocations.length ? savedAllocations : [{ invoiceId:intent.invoice_id,amount:paidAmount }];
    const allocatedTotal=allocations.reduce((sum,item)=>sum+Number(item.amount),0); if(Math.abs(allocatedTotal-paidAmount)>.001)throw new HttpError(409,`Payment allocations do not match the ${intent.provider} amount`);
    const paymentIds:string[]=[];
    for(const allocation of [...allocations].sort((a,b)=>a.invoiceId.localeCompare(b.invoiceId))){
      const invoiceResult=await client.query<{status:string;amount_paid:string;total:string}>("SELECT status,amount_paid,total FROM invoices WHERE id=$1 AND business_id=$2 FOR UPDATE",[allocation.invoiceId,intent.business_id]);const invoice=invoiceResult.rows[0];if(!invoice)throw new HttpError(404,"Invoice not found");
      const allocationAmount=Number(allocation.amount);const becomesPaid=invoice.status!=="paid"&&Number(invoice.amount_paid)+allocationAmount>=Number(invoice.total);const paymentReference=allocations.length>1?`${reference}:${allocation.invoiceId}`:reference;
      const paymentResult=await client.query(`INSERT INTO payments (business_id,invoice_id,amount,currency,method,reference,group_reference,status,received_at) VALUES ($1,$2,$3,$4,'card',$5,$6,'confirmed',COALESCE($7::timestamptz,now())) ON CONFLICT (business_id,reference) WHERE reference IS NOT NULL DO NOTHING RETURNING id`,[intent.business_id,allocation.invoiceId,allocationAmount,intent.currency,paymentReference,reference,providerData.paid_at||null]);
      await client.query(`UPDATE invoices SET amount_paid=LEAST(total,amount_paid+$1),status=CASE WHEN amount_paid+$1>=total THEN 'paid' ELSE 'part_paid' END,sync_version=sync_version+1,updated_at=now() WHERE id=$2 AND business_id=$3`,[allocationAmount,allocation.invoiceId,intent.business_id]);
      if(becomesPaid)await recordInvoiceSale(client,allocation.invoiceId,intent.business_id);if(paymentResult.rows[0]){paymentIds.push(paymentResult.rows[0].id);await outbox(client,intent.business_id,"payment.confirmed","payment",paymentResult.rows[0].id,{invoiceId:allocation.invoiceId,paymentId:paymentResult.rows[0].id,source:intent.provider},`payment.confirmed:${paymentResult.rows[0].id}`);}
      await client.query("INSERT INTO sync_changes (business_id,table_name,record_id,operation) VALUES ($1,'invoices',$2,'updated')",[intent.business_id,allocation.invoiceId]);
    }
    const updated = await client.query("UPDATE payment_intents SET status='success',provider_payload=$2,completed_at=now(),updated_at=now() WHERE id=$1 RETURNING *", [intent.id, JSON.stringify(providerData)]);
    for(const paymentId of paymentIds)await client.query("INSERT INTO sync_changes (business_id,table_name,record_id,operation) VALUES ($1,'payments',$2,'created')",[intent.business_id,paymentId]);
    return updated.rows[0];
  });
}

async function captureVirtualAccountPayment(providerData: Record<string, any>) {
  const accountNumber = String(providerData.authorization?.receiver_bank_account_number ?? providerData.authorization?.account_number ?? "");
  const customerCode = String(providerData.customer?.customer_code ?? "");
  const accounts = await query<Record<string, any>>(
    `SELECT * FROM business_payment_accounts WHERE status='active' AND (virtual_account_number=NULLIF($1,'') OR provider_customer_code=NULLIF($2,'')) LIMIT 1`,
    [accountNumber, customerCode],
  );
  const account = accounts[0]; if (!account) return;
  const amount = Number(providerData.amount) / 100; const reference = String(providerData.reference ?? "");
  if (!reference || !Number.isFinite(amount) || amount <= 0) return;
  await query(
    `INSERT INTO payments (business_id,invoice_id,amount,currency,method,reference,status,received_at)
     VALUES ($1,NULL,$2,$3,'transfer',$4,'confirmed',COALESCE($5::timestamptz,now()))
     ON CONFLICT (business_id,reference) WHERE reference IS NOT NULL DO NOTHING`,
    [account.business_id, amount, providerData.currency ?? account.currency, reference, providerData.paid_at || null],
  );
}

async function completeDvaAssignment(data: Record<string, any>) {
  const customerCode = String(data.customer?.customer_code ?? ""); if (!customerCode) return;
  await query(
    `UPDATE business_payment_accounts SET status='active',provider_dva_id=$2,virtual_bank_name=$3,virtual_bank_slug=$4,
     virtual_account_number=$5,virtual_account_name=$6,currency=$7,provider_payload=$8,failure_reason=NULL,updated_at=now()
     WHERE provider_customer_code=$1`,
    [customerCode, String(data.id), data.bank?.name, data.bank?.slug, data.account_number, data.account_name, data.currency ?? "NGN", JSON.stringify(data)],
  );
}

paystackRouter.post("/initialize/:invoiceId", asyncRoute(async (req, res) => {
  requirePaystack();
  const invoices = await query<Record<string, any>>(
    `SELECT i.*,c.email AS client_email FROM invoices i LEFT JOIN clients c ON c.id=i.client_id
     WHERE i.id=$1 AND i.business_id=$2 AND i.status IN ('sent','part_paid','overdue') AND i.deleted_at IS NULL`, [req.params.invoiceId, req.auth!.businessId],
  );
  const invoice = invoices[0];
  if (!invoice) throw new HttpError(409, "Send the invoice before collecting an online payment");
  if (!invoice.client_email) throw new HttpError(400, "Add an email address to this invoice's client before using Paystack");
  const amount = Number(invoice.total) - Number(invoice.amount_paid);
  if (amount <= 0) throw new HttpError(409, "This invoice is already paid");
  const reference = `LB-${invoice.number.replace(/[^a-zA-Z0-9]/g, "")}-${Date.now()}`;
  const response = await paystack("/transaction/initialize", { method: "POST", body: JSON.stringify({ email: invoice.client_email, amount: String(Math.round(amount * 100)), currency: invoice.currency, reference, callback_url: env.paystackCallbackUrl, metadata: JSON.stringify({ invoiceId: invoice.id, businessId: req.auth!.businessId, invoiceNumber: invoice.number }) }) });
  const data = response.data;
  await query(
    `INSERT INTO payment_intents (business_id,invoice_id,provider,reference,access_code,authorization_url,amount,currency)
     VALUES ($1,$2,'paystack',$3,$4,$5,$6,$7)`,
    [req.auth!.businessId, invoice.id, data.reference, data.access_code, data.authorization_url, amount, invoice.currency],
  );
  res.status(201).json({ success: true, message: "Paystack checkout created", data: { authorizationUrl: data.authorization_url, accessCode: data.access_code, reference: data.reference } });
}));

paystackRouter.get("/verify/:reference", asyncRoute(async (req, res) => {
  const referenceParam = req.params.reference;
  const reference = Array.isArray(referenceParam) ? referenceParam[0]! : referenceParam!;
  const intents = await query<{ business_id: string }>("SELECT business_id FROM payment_intents WHERE reference=$1", [reference]);
  if (intents[0]?.business_id !== req.auth!.businessId) throw new HttpError(404, "Payment reference not found");
  const response = await paystack(`/transaction/verify/${encodeURIComponent(reference)}`);
  const result = response.data.status === "success" ? await settle(reference, response.data) : { status: response.data.status, reference };
  res.json({ success: true, data: result });
}));

export async function paystackWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    requirePaystack();
    const signature = req.headers["x-paystack-signature"];
    if (typeof signature !== "string" || !req.rawBody) throw new HttpError(401, "Invalid Paystack signature");
    const digest = crypto.createHmac("sha512", env.paystackSecretKey).update(req.rawBody).digest("hex");
    const valid = signature.length === digest.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
    if (!valid) throw new HttpError(401, "Invalid Paystack signature");
    if (req.body.event === "charge.success") {
      const intents = await query<{ reference: string }>("SELECT reference FROM payment_intents WHERE reference=$1", [String(req.body.data.reference)]);
      if (intents[0]) await settle(String(req.body.data.reference), req.body.data); else await captureVirtualAccountPayment(req.body.data);
    }
    if (req.body.event === "dedicatedaccount.assign.success") await completeDvaAssignment(req.body.data);
    if (req.body.event === "dedicatedaccount.assign.failed") await query("UPDATE business_payment_accounts SET status='failed',failure_reason=$2,provider_payload=$3,updated_at=now() WHERE provider_customer_code=$1", [String(req.body.data?.customer?.customer_code ?? ""), String(req.body.data?.message ?? "Paystack could not assign the account"), JSON.stringify(req.body.data ?? {})]);
    res.sendStatus(200);
  } catch (error) { next(error); }
}
