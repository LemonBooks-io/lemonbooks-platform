import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import multer from "multer";
import { Router } from "express";
import { env } from "../config";
import { query, transaction } from "../database/pool";
import { asyncRoute, HttpError } from "../http";
import { paystack, settle } from "./paystack.routes";
import { activeMonnify } from "./monnify.routes";
import { monnifyRequest } from "../services/monnify.service";
import {
  emailConfigured,
  sendCustomerAccessCode,
} from "../services/email.service";

export const publicRouter = Router();
const receiptUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, done) {
    done(
      null,
      ["image/jpeg", "image/png", "application/pdf"].includes(file.mimetype),
    );
  },
});

function clientClaims(authorization?: string) {
  const token = authorization?.replace(/^Bearer\s+/i, "");
  if (!token) throw new HttpError(401, "Sign in to continue");
  try {
    return jwt.verify(token, env.jwtSecret, {
      issuer: "lemonbooks-api",
      audience: "lemonbooks-client",
    }) as jwt.JwtPayload & { businessId: string; clientId: string };
  } catch {
    throw new HttpError(401, "Customer session expired");
  }
}
function clientSession(row: Record<string, any>) {
  return jwt.sign(
    {
      sub: row.account_id,
      businessId: row.business_id,
      clientId: row.client_id,
      type: "client",
    },
    env.jwtSecret,
    {
      expiresIn: "7d",
      issuer: "lemonbooks-api",
      audience: "lemonbooks-client",
    },
  );
}
async function createClientChallenge(
  row: Record<string, any>,
  purpose: "activate" | "login",
) {
  if (!emailConfigured())
    throw new HttpError(
      503,
      "Customer sign-in email is not configured",
      "EMAIL_NOT_CONFIGURED",
    );
  const otp = String(crypto.randomInt(100000, 1000000));
  await query(
    "DELETE FROM client_auth_challenges WHERE (business_id=$1 AND lower(email)=$2 AND purpose=$3) OR expires_at<now()",
    [row.business_id, String(row.email).toLowerCase(), purpose],
  );
  const [challenge] = await query<{ id: string; expires_at: Date }>(
    `INSERT INTO client_auth_challenges(business_id,client_id,email,purpose,otp_hash,expires_at) VALUES($1,$2,$3,$4,$5,now()+($6||' minutes')::interval) RETURNING id,expires_at`,
    [
      row.business_id,
      row.client_id,
      String(row.email).toLowerCase(),
      purpose,
      await bcrypt.hash(otp, 10),
      env.otpTtlMinutes,
    ],
  );
  await sendCustomerAccessCode({
    email: row.email,
    name: row.name,
    businessName: row.business_name,
    otp,
    purpose,
  });
  return {
    challengeId: challenge!.id,
    email: row.email,
    expiresAt: challenge!.expires_at,
  };
}
async function verifyClientChallenge(
  challengeId: string,
  otp: string,
  purpose: "activate" | "login",
  expected?: { businessId: string; clientId: string },
) {
  const [challenge] = await query<Record<string, any>>(
    `SELECT cac.*,c.name,b.name AS business_name,b.tenant_slug,ca.id AS account_id FROM client_auth_challenges cac JOIN clients c ON c.id=cac.client_id JOIN businesses b ON b.id=cac.business_id LEFT JOIN client_accounts ca ON ca.business_id=cac.business_id AND ca.client_id=cac.client_id WHERE cac.id=$1 AND cac.purpose=$2 AND cac.expires_at>now()`,
    [challengeId, purpose],
  );
  if (!challenge)
    throw new HttpError(
      410,
      "This verification code has expired. Request a new one.",
    );
  if (
    expected &&
    (challenge.business_id !== expected.businessId ||
      challenge.client_id !== expected.clientId)
  )
    throw new HttpError(403, "This code does not belong to this invoice");
  if (Number(challenge.attempts) >= 5)
    throw new HttpError(429, "Too many attempts. Request a new code.");
  if (!(await bcrypt.compare(String(otp), challenge.otp_hash))) {
    await query(
      "UPDATE client_auth_challenges SET attempts=attempts+1 WHERE id=$1",
      [challengeId],
    );
    throw new HttpError(400, "That verification code is not correct");
  }
  let accountId = challenge.account_id;
  if (purpose === "activate" && !accountId) {
    const [account] = await query<{ id: string }>(
      `INSERT INTO client_accounts(business_id,client_id,email,password_hash) VALUES($1,$2,$3,NULL) ON CONFLICT (business_id,client_id) DO UPDATE SET email=EXCLUDED.email RETURNING id`,
      [challenge.business_id, challenge.client_id, challenge.email],
    );
    accountId = account!.id;
  }
  if (!accountId)
    throw new HttpError(
      404,
      "Create your customer account from an invoice first",
    );
  await query("DELETE FROM client_auth_challenges WHERE id=$1", [challengeId]);
  const row: Record<string, any> = { ...challenge, account_id: accountId };
  return {
    token: clientSession(row),
    client: { name: row.name, email: row.email },
    workspace: row.tenant_slug,
  };
}
async function recoverPaystackIntent(intent: Record<string, any>) {
  const response = await paystack(
    `/transaction/verify/${encodeURIComponent(intent.reference)}`,
  );
  const providerStatus = String(response.data.status ?? "pending");
  if (providerStatus === "success") {
    await settle(intent.reference, response.data);
    return "success";
  }
  if (["failed", "abandoned", "reversed"].includes(providerStatus))
    await query(
      "UPDATE payment_intents SET status=$2,provider_payload=$3,updated_at=now() WHERE id=$1",
      [
        intent.id,
        providerStatus === "reversed" ? "failed" : providerStatus,
        JSON.stringify(response.data),
      ],
    );
  return providerStatus;
}

async function invoiceByToken(token: string) {
  const rows = await query<Record<string, any>>(
    `SELECT i.*,b.name AS business_name,b.email AS business_email,b.phone AS business_phone,b.address AS business_address,
      c.name AS client_name,c.email AS client_email,c.phone AS client_phone,
      (ca.id IS NOT NULL) AS client_account_exists,pa.provider_subaccount_code,
      pa.virtual_bank_name,pa.virtual_account_number,pa.virtual_account_name,
      ta.bank_name AS transfer_bank_name,ta.account_number AS transfer_account_number,ta.account_name AS transfer_account_name
     FROM invoices i JOIN businesses b ON b.id=i.business_id LEFT JOIN clients c ON c.id=i.client_id
     LEFT JOIN client_accounts ca ON ca.business_id=i.business_id AND ca.client_id=i.client_id
     LEFT JOIN business_payment_accounts pa ON pa.business_id=i.business_id AND pa.status='active'
     LEFT JOIN business_transfer_accounts ta ON ta.business_id=i.business_id
     WHERE i.public_token=$1 AND i.status NOT IN ('draft','cancelled') AND i.deleted_at IS NULL`,
    [token],
  );
  if (!rows[0])
    throw new HttpError(404, "Invoice link is invalid or no longer available");
  return rows[0];
}

publicRouter.get(
  "/invoices/:token",
  asyncRoute(async (req, res) => {
    const invoice = await invoiceByToken(String(req.params.token));
    const lines = await query<Record<string, unknown>>(
      "SELECT description,quantity,unit_price,total FROM invoice_lines WHERE invoice_id=$1 ORDER BY id",
      [invoice.id],
    );
    const pendingClaims = await query<{ count: string }>(
      "SELECT count(*)::text AS count FROM payment_claims WHERE invoice_id=$1 AND status='pending'",
      [invoice.id],
    );
    const monnify = await query<{ count: string }>(
      "SELECT count(*)::text AS count FROM integration_connections WHERE business_id=$1 AND kind='payment_provider' AND provider='monnify' AND status='active' AND deleted_at IS NULL",
      [invoice.business_id],
    );
    res.json({
      success: true,
      data: {
        ...invoice,
        lines,
        pendingPaymentReview: Number(pendingClaims[0]?.count ?? 0) > 0,
        paymentOptions: {
          paystack: Boolean(
            env.paystackSecretKey &&
            invoice.client_email &&
            invoice.provider_subaccount_code,
          ),
          monnify: Boolean(Number(monnify[0]?.count) && invoice.client_email),
          virtualAccount: Boolean(invoice.virtual_account_number),
          cash: true,
          transfer: Boolean(invoice.transfer_account_number),
        },
        clientAccountAvailable: Boolean(
          invoice.client_id && invoice.client_email,
        ),
        clientAccountExists: Boolean(invoice.client_account_exists),
      },
    });
  }),
);

publicRouter.post(
  "/invoices/:token/payment-claims",
  receiptUpload.single("receipt"),
  asyncRoute(async (req, res) => {
    const invoice = await invoiceByToken(String(req.params.token));
    const { method, payerName, paidTo, amount, paidAt, note } = req.body;
    if (!["cash", "transfer"].includes(method))
      throw new HttpError(400, "Choose cash or bank transfer");
    if (
      !payerName?.trim() ||
      !paidAt ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0
    )
      throw new HttpError(
        400,
        "Payer name, amount, and payment date are required",
      );
    if (method === "cash" && !paidTo?.trim())
      throw new HttpError(
        400,
        "Enter the person or representative who received the cash",
      );
    if (method === "transfer" && !invoice.transfer_account_number)
      throw new HttpError(
        409,
        "Bank transfer is not currently available for this business",
      );
    if (Number(amount) > Number(invoice.total) - Number(invoice.amount_paid))
      throw new HttpError(400, "Claim amount exceeds the invoice balance");
    if (method === "transfer" && !req.file)
      throw new HttpError(
        400,
        "Upload a transfer receipt or bank confirmation",
      );
    const pending = await query<{ amount: string }>(
      "SELECT COALESCE(sum(amount),0)::text AS amount FROM payment_claims WHERE invoice_id=$1 AND status='pending'",
      [invoice.id],
    );
    if (
      Number(amount) >
      Number(invoice.total) -
        Number(invoice.amount_paid) -
        Number(pending[0]?.amount ?? 0)
    )
      throw new HttpError(
        409,
        "This amount is already covered by payment information awaiting review",
      );
    const [claim] = await query<Record<string, unknown>>(
      `INSERT INTO payment_claims (business_id,invoice_id,method,payer_name,paid_to,amount,paid_at,note,receipt_name,receipt_mime,receipt_data)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id,status,method,amount,created_at`,
      [
        invoice.business_id,
        invoice.id,
        method,
        payerName.trim(),
        paidTo || null,
        amount,
        paidAt,
        note || null,
        req.file?.originalname || null,
        req.file?.mimetype || null,
        req.file?.buffer || null,
      ],
    );
    res.status(201).json({
      success: true,
      message: "Payment information submitted for business review",
      data: claim,
    });
  }),
);

publicRouter.post(
  "/invoices/:token/paystack",
  asyncRoute(async (req, res) => {
    if (!env.paystackSecretKey)
      throw new HttpError(503, "Paystack is not available for this invoice");
    const invoice = await invoiceByToken(String(req.params.token));
    if (!invoice.client_email)
      throw new HttpError(400, "This invoice has no customer email address");
    const amount = Number(invoice.total) - Number(invoice.amount_paid);
    if (amount <= 0) throw new HttpError(409, "This invoice is already paid");
    const reference = `LB-${invoice.number.replace(/[^a-zA-Z0-9]/g, "")}-${Date.now()}`;
    const callback = `${env.publicWebUrl}/pay/invoice/${invoice.public_token}?reference=${encodeURIComponent(reference)}`;
    if (!invoice.provider_subaccount_code)
      throw new HttpError(
        409,
        "This business has not activated its Paystack settlement account",
      );
    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: invoice.client_email,
          amount: String(Math.round(amount * 100)),
          currency: invoice.currency,
          reference,
          callback_url: callback,
          subaccount: invoice.provider_subaccount_code,
          metadata: JSON.stringify({
            invoiceId: invoice.id,
            businessId: invoice.business_id,
          }),
        }),
      },
    );
    const payload = (await response.json()) as {
      status: boolean;
      message: string;
      data?: Record<string, string>;
    };
    if (!response.ok || !payload.status || !payload.data)
      throw new HttpError(
        502,
        payload.message || "Paystack checkout could not be created",
      );
    await query(
      `INSERT INTO payment_intents (business_id,invoice_id,provider,reference,access_code,authorization_url,amount,currency) VALUES ($1,$2,'paystack',$3,$4,$5,$6,$7)`,
      [
        invoice.business_id,
        invoice.id,
        reference,
        payload.data.access_code,
        payload.data.authorization_url,
        amount,
        invoice.currency,
      ],
    );
    res.status(201).json({
      success: true,
      data: { authorizationUrl: payload.data.authorization_url, reference },
    });
  }),
);

publicRouter.get(
  "/invoices/:token/paystack/verify",
  asyncRoute(async (req, res) => {
    if (!env.paystackSecretKey)
      throw new HttpError(503, "Paystack is not available");
    const invoice = await invoiceByToken(String(req.params.token));
    const reference = String(req.query.reference ?? "");
    const intents = await query<{ invoice_id: string }>(
      "SELECT invoice_id FROM payment_intents WHERE reference=$1",
      [reference],
    );
    if (!reference || intents[0]?.invoice_id !== invoice.id)
      throw new HttpError(404, "Payment reference not found for this invoice");
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${env.paystackSecretKey}` } },
    );
    const payload = (await response.json()) as {
      status: boolean;
      message: string;
      data?: Record<string, any>;
    };
    if (!response.ok || !payload.status || !payload.data)
      throw new HttpError(
        502,
        payload.message || "Paystack verification failed",
      );
    if (payload.data.status !== "success")
      return res.json({ success: true, data: { status: payload.data.status } });
    const result = await settle(reference, payload.data);
    return res.json({ success: true, data: result });
  }),
);

publicRouter.post(
  "/invoices/:token/monnify",
  asyncRoute(async (req, res) => {
    const invoice = await invoiceByToken(String(req.params.token));
    if (!invoice.client_email)
      throw new HttpError(400, "This invoice has no customer email address");
    const amount = Number(invoice.total) - Number(invoice.amount_paid);
    if (amount <= 0) throw new HttpError(409, "This invoice is already paid");
    const { connection, credentials } = await activeMonnify(
      invoice.business_id,
    );
    const reference = `LB-MON-${invoice.number.replace(/[^a-zA-Z0-9]/g, "")}-${Date.now()}`;
    const callback = `${env.publicWebUrl}/pay/invoice/${invoice.public_token}?provider=monnify&reference=${encodeURIComponent(reference)}`;
    const data = await monnifyRequest<Record<string, string>>(
      credentials,
      connection.environment,
      "/api/v1/merchant/transactions/init-transaction",
      {
        method: "POST",
        body: JSON.stringify({
          amount,
          customerName: invoice.client_name,
          customerEmail: invoice.client_email,
          paymentReference: reference,
          paymentDescription: `Invoice ${invoice.number}`,
          currencyCode: invoice.currency,
          contractCode: credentials.contractCode,
          redirectUrl: callback,
        }),
      },
    );
    await query(
      "INSERT INTO payment_intents(business_id,invoice_id,provider,reference,access_code,authorization_url,amount,currency,provider_payload) VALUES($1,$2,'monnify',$3,$4,$5,$6,$7,$8)",
      [
        invoice.business_id,
        invoice.id,
        reference,
        data.transactionReference,
        data.checkoutUrl,
        amount,
        invoice.currency,
        JSON.stringify(data),
      ],
    );
    res.status(201).json({
      success: true,
      data: { authorizationUrl: data.checkoutUrl, reference },
    });
  }),
);

publicRouter.get(
  "/invoices/:token/monnify/verify",
  asyncRoute(async (req, res) => {
    const invoice = await invoiceByToken(String(req.params.token));
    const reference = String(req.query.reference ?? "");
    const intent = (
      await query<Record<string, any>>(
        "SELECT * FROM payment_intents WHERE reference=$1 AND invoice_id=$2 AND provider='monnify'",
        [reference, invoice.id],
      )
    )[0];
    if (!intent)
      throw new HttpError(404, "Payment reference not found for this invoice");
    const { connection, credentials } = await activeMonnify(
      invoice.business_id,
    );
    const data = await monnifyRequest<Record<string, any>>(
      credentials,
      connection.environment,
      `/api/v2/transactions/${encodeURIComponent(String(intent.access_code))}`,
    );
    const normalized = {
      ...data,
      status: data.paymentStatus === "PAID" ? "success" : "pending",
      amount: Math.round(Number(data.amountPaid ?? 0) * 100),
      currency: data.currencyCode,
      paid_at: data.paidOn,
    };
    const result =
      normalized.status === "success"
        ? await settle(reference, normalized)
        : { status: normalized.status, reference };
    res.json({ success: true, data: result });
  }),
);

publicRouter.post(
  "/invoices/:token/client-account/code",
  asyncRoute(async (req, res) => {
    const invoice = await invoiceByToken(String(req.params.token));
    if (!invoice.client_id || !invoice.client_email)
      throw new HttpError(400, "This invoice is not connected to a customer");
    const data = await createClientChallenge(
      {
        business_id: invoice.business_id,
        client_id: invoice.client_id,
        email: invoice.client_email,
        name: invoice.client_name,
        business_name: invoice.business_name,
      },
      "activate",
    );
    res
      .status(201)
      .json({ success: true, message: "Verification code sent", data });
  }),
);
publicRouter.post(
  "/invoices/:token/client-account/verify",
  asyncRoute(async (req, res) => {
    const invoice = await invoiceByToken(String(req.params.token));
    const result = await verifyClientChallenge(
      String(req.body.challengeId ?? ""),
      String(req.body.otp ?? ""),
      "activate",
      { businessId: invoice.business_id, clientId: invoice.client_id },
    );
    res.status(201).json({
      success: true,
      message: "Customer account created",
      data: result,
    });
  }),
);
publicRouter.post(
  "/client/login/code",
  asyncRoute(async (req, res) => {
    const email = String(req.body.email ?? "")
      .trim()
      .toLowerCase();
    const workspace = String(req.body.workspace ?? "")
      .trim()
      .toLowerCase();
    if (!email || !workspace)
      throw new HttpError(400, "Email and business workspace are required");
    const [account] = await query<Record<string, any>>(
      `SELECT ca.id AS account_id,ca.business_id,ca.client_id,ca.email,c.name,b.name AS business_name,b.tenant_slug FROM client_accounts ca JOIN businesses b ON b.id=ca.business_id JOIN clients c ON c.id=ca.client_id WHERE lower(ca.email)=$1 AND b.tenant_slug=$2`,
      [email, workspace],
    );
    if (!account)
      throw new HttpError(401, "Email or business workspace is incorrect");
    const data = await createClientChallenge(account, "login");
    res
      .status(201)
      .json({ success: true, message: "Verification code sent", data });
  }),
);
publicRouter.post(
  "/client/login/verify",
  asyncRoute(async (req, res) => {
    const result = await verifyClientChallenge(
      String(req.body.challengeId ?? ""),
      String(req.body.otp ?? ""),
      "login",
    );
    res.json({ success: true, data: result });
  }),
);

publicRouter.get(
  "/client/portal",
  asyncRoute(async (req, res) => {
    const claims = clientClaims(req.headers.authorization);
    const invoices = await query<Record<string, unknown>>(
      `SELECT i.id,i.number,i.status,i.issue_date,i.due_date,i.currency,i.total,i.amount_paid,i.public_token,
    (SELECT count(*)::int FROM payment_claims pc WHERE pc.invoice_id=i.id AND pc.status='pending') AS pending_payment_count
    FROM invoices i WHERE i.business_id=$1 AND i.client_id=$2 AND i.deleted_at IS NULL AND i.status<>'draft' ORDER BY i.created_at DESC`,
      [claims.businessId, claims.clientId],
    );
    const payments = await query<Record<string, unknown>>(
      `SELECT p.id,p.invoice_id,p.amount,p.currency,p.method,p.reference,p.group_reference,p.received_at,i.number AS invoice_number FROM payments p JOIN invoices i ON i.id=p.invoice_id WHERE p.business_id=$1 AND i.client_id=$2 AND p.deleted_at IS NULL ORDER BY p.received_at DESC`,
      [claims.businessId, claims.clientId],
    );
    const context = await query<Record<string, unknown>>(
      `SELECT c.name AS client_name,c.email AS client_email,b.name AS business_name,b.email AS business_email,b.phone AS business_phone,b.tenant_slug,
       (pa.id IS NOT NULL AND pa.status='active' AND pa.provider_subaccount_code IS NOT NULL) AS paystack_available,
       EXISTS(SELECT 1 FROM integration_connections ic WHERE ic.business_id=b.id AND ic.kind='payment_provider' AND ic.provider='monnify' AND ic.status='active' AND ic.deleted_at IS NULL) AS monnify_available,
       ta.bank_name AS transfer_bank_name,ta.account_number AS transfer_account_number,ta.account_name AS transfer_account_name
       FROM clients c JOIN businesses b ON b.id=c.business_id
       LEFT JOIN business_payment_accounts pa ON pa.business_id=b.id
       LEFT JOIN business_transfer_accounts ta ON ta.business_id=b.id
       WHERE c.id=$1 AND c.business_id=$2`,
      [claims.clientId, claims.businessId],
    );
    const paystackAvailable = Boolean(
      env.paystackSecretKey && (context[0] as any)?.paystack_available,
    );
    const monnifyAvailable = Boolean((context[0] as any)?.monnify_available);
    res.json({
      success: true,
      data: {
        ...context[0],
        paystack_available: paystackAvailable,
        payment_options: [
          ...(monnifyAvailable
            ? [
                {
                  id: "monnify",
                  label: "Monnify",
                  description: "Card, bank transfer, or USSD",
                  kind: "gateway",
                },
              ]
            : []),
          ...(paystackAvailable
            ? [
                {
                  id: "paystack",
                  label: "Pay online",
                  description: "Card, bank, or USSD through Paystack",
                  kind: "gateway",
                },
              ]
            : []),
          ...((context[0] as any)?.transfer_account_number
            ? [{ id: "transfer", label: "Bank transfer", description: "Transfer to the verified business account", kind: "manual" }]
            : []),
          {
            id: "cash",
            label: "Cash",
            description: "Report one cash payment for the selected invoices",
            kind: "manual",
          },
        ],
        invoices,
        payments,
      },
    });
  }),
);

publicRouter.post(
  "/client/payment-claims",
  receiptUpload.single("receipt"),
  asyncRoute(async (req, res) => {
    const claims = clientClaims(req.headers.authorization);
    let parsedIds: unknown;
    try {
      parsedIds = JSON.parse(String(req.body.invoiceIds ?? "[]"));
    } catch {
      throw new HttpError(400, "Invoice selection is invalid");
    }
    const invoiceIds = Array.isArray(parsedIds)
      ? [...new Set(parsedIds.map(String))]
      : [];
    const method = String(req.body.method ?? "");
    const payerName = String(req.body.payerName ?? "").trim();
    const paidTo = String(req.body.paidTo ?? "").trim();
    const paidAt = String(req.body.paidAt ?? "");
    const note = String(req.body.note ?? "");
    if (!invoiceIds.length || invoiceIds.length > 50)
      throw new HttpError(400, "Select between 1 and 50 invoices");
    if (!["cash", "transfer"].includes(method) || !payerName || !paidAt)
      throw new HttpError(
        400,
        "Payment method, payer name, and date are required",
      );
    if (method === "cash" && !paidTo)
      throw new HttpError(400, "Enter who received the cash");
    if (method === "transfer" && !req.file)
      throw new HttpError(400, "Upload the transfer receipt");
    if (method === "transfer") {
      const [transferAccount] = await query<{ account_number: string }>(
        "SELECT account_number FROM business_transfer_accounts WHERE business_id=$1",
        [claims.businessId],
      );
      if (!transferAccount) throw new HttpError(409, "This business has not configured bank transfer payments");
    }
    const invoices = await query<Record<string, any>>(
      "SELECT id,total,amount_paid,currency FROM invoices WHERE id=ANY($1::uuid[]) AND business_id=$2 AND client_id=$3 AND status IN ('sent','part_paid','overdue') AND deleted_at IS NULL ORDER BY id",
      [invoiceIds, claims.businessId, claims.clientId],
    );
    if (invoices.length !== invoiceIds.length)
      throw new HttpError(
        400,
        "One or more selected invoices cannot be reported as paid",
      );
    if (new Set(invoices.map((row) => row.currency)).size !== 1)
      throw new HttpError(400, "Selected invoices must use the same currency");
    const existing = await query<{ invoice_id: string }>(
      "SELECT DISTINCT invoice_id FROM payment_claims WHERE invoice_id=ANY($1::uuid[]) AND status='pending'",
      [invoiceIds],
    );
    if (existing.length)
      throw new HttpError(
        409,
        "A selected invoice already has payment information awaiting review",
      );
    const groupReference = `LB-CLAIM-${crypto.randomUUID()}`;
    const created = await transaction(async (client) => {
      const rows = [];
      for (const invoice of invoices) {
        const amount = Number(invoice.total) - Number(invoice.amount_paid);
        if (amount <= 0)
          throw new HttpError(409, "A selected invoice is already paid");
        const result = await client.query(
          `INSERT INTO payment_claims (business_id,invoice_id,method,payer_name,paid_to,amount,paid_at,note,receipt_name,receipt_mime,receipt_data,group_reference) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id,invoice_id,status,amount`,
          [
            claims.businessId,
            invoice.id,
            method,
            payerName,
            paidTo || null,
            amount,
            paidAt,
            note || null,
            req.file?.originalname || null,
            req.file?.mimetype || null,
            req.file?.buffer || null,
            groupReference,
          ],
        );
        rows.push(result.rows[0]);
      }
      return rows;
    });
    res.status(201).json({
      success: true,
      message: "Combined payment submitted for business review",
      data: { groupReference, claims: created },
    });
  }),
);

publicRouter.post(
  "/client/monnify",
  asyncRoute(async (req, res) => {
    const claims = clientClaims(req.headers.authorization);
    const invoiceIds = Array.isArray(req.body.invoiceIds)
      ? [...new Set(req.body.invoiceIds.map(String))]
      : [];
    if (!invoiceIds.length || invoiceIds.length > 50)
      throw new HttpError(400, "Select between 1 and 50 invoices");
    const invoices = await query<Record<string, any>>(
      `SELECT i.*,c.name AS client_name,c.email AS client_email FROM invoices i JOIN clients c ON c.id=i.client_id WHERE i.id=ANY($1::uuid[]) AND i.business_id=$2 AND i.client_id=$3 AND i.deleted_at IS NULL ORDER BY i.id`,
      [invoiceIds, claims.businessId, claims.clientId],
    );
    if (invoices.length !== invoiceIds.length)
      throw new HttpError(400, "One or more selected invoices cannot be paid");
    if (new Set(invoices.map((row) => row.currency)).size !== 1)
      throw new HttpError(400, "Selected invoices must use the same currency");
    if (
      invoices.some(
        (row) => !["sent", "part_paid", "overdue"].includes(row.status),
      )
    )
      throw new HttpError(
        409,
        "A selected invoice is already paid or no longer payable",
      );
    const pending = await query<{ invoice_id: string }>(
      "SELECT DISTINCT invoice_id FROM payment_claims WHERE invoice_id=ANY($1::uuid[]) AND status='pending'",
      [invoiceIds],
    );
    if (pending.length)
      throw new HttpError(
        409,
        "A selected invoice already has payment information awaiting review",
      );
    const { connection, credentials } = await activeMonnify(claims.businessId);
    const first = invoices[0]!;
    const allocations = invoices.map((row) => ({
      invoiceId: row.id,
      amount: Number(row.total) - Number(row.amount_paid),
    }));
    if (allocations.some((item) => item.amount <= 0))
      throw new HttpError(409, "A selected invoice is already paid");
    const amount = allocations.reduce((sum, item) => sum + item.amount, 0);
    const currency = first.currency;
    const reference = `LB-MON-BATCH-${Date.now()}`;
    const callback = `${env.publicWebUrl}/customer-portal?provider=monnify&reference=${encodeURIComponent(reference)}`;
    const data = await monnifyRequest<Record<string, string>>(
      credentials,
      connection.environment,
      "/api/v1/merchant/transactions/init-transaction",
      {
        method: "POST",
        body: JSON.stringify({
          amount,
          customerName: first.client_name,
          customerEmail: first.client_email,
          paymentReference: reference,
          paymentDescription: `Payment for ${invoiceIds.length} LemonBooks invoice(s)`,
          currencyCode: currency,
          contractCode: credentials.contractCode,
          redirectUrl: callback,
        }),
      },
    );
    await query(
      `INSERT INTO payment_intents (business_id,invoice_id,provider,reference,access_code,authorization_url,amount,currency,allocations,provider_payload) VALUES ($1,$2,'monnify',$3,$4,$5,$6,$7,$8,$9)`,
      [
        claims.businessId,
        first.id,
        reference,
        data.transactionReference,
        data.checkoutUrl,
        amount,
        currency,
        JSON.stringify(allocations),
        JSON.stringify(data),
      ],
    );
    res.status(201).json({
      success: true,
      data: {
        authorizationUrl: data.checkoutUrl,
        reference,
        amount,
        currency,
      },
    });
  }),
);

publicRouter.get(
  "/client/monnify/verify",
  asyncRoute(async (req, res) => {
    const claims = clientClaims(req.headers.authorization);
    const reference = String(req.query.reference ?? "");
    const intent = (
      await query<Record<string, any>>(
        "SELECT * FROM payment_intents WHERE reference=$1 AND business_id=$2 AND provider='monnify'",
        [reference, claims.businessId],
      )
    )[0];
    if (!intent) throw new HttpError(404, "Payment reference not found");
    const ids = (
      Array.isArray(intent.allocations) ? intent.allocations : []
    ).map((item: any) => item.invoiceId);
    if (ids.length) {
      const owned = await query<{ count: string }>(
        "SELECT count(*)::text AS count FROM invoices WHERE id=ANY($1::uuid[]) AND client_id=$2 AND business_id=$3",
        [ids, claims.clientId, claims.businessId],
      );
      if (Number(owned[0]?.count) !== ids.length)
        throw new HttpError(404, "Payment reference not found");
    }
    const { connection, credentials } = await activeMonnify(claims.businessId);
    const data = await monnifyRequest<Record<string, any>>(
      credentials,
      connection.environment,
      `/api/v2/transactions/${encodeURIComponent(String(intent.access_code))}`,
    );
    const normalized = {
      ...data,
      status: data.paymentStatus === "PAID" ? "success" : "pending",
      amount: Math.round(Number(data.amountPaid ?? 0) * 100),
      currency: data.currencyCode,
      paid_at: data.paidOn,
    };
    const result =
      normalized.status === "success"
        ? await settle(reference, normalized)
        : { status: normalized.status, reference };
    res.json({ success: true, data: result });
  }),
);

publicRouter.post(
  "/client/paystack",
  asyncRoute(async (req, res) => {
    const claims = clientClaims(req.headers.authorization);
    const invoiceIds = Array.isArray(req.body.invoiceIds)
      ? [...new Set(req.body.invoiceIds.map(String))]
      : [];
    if (!invoiceIds.length || invoiceIds.length > 50)
      throw new HttpError(400, "Select between 1 and 50 invoices");
    const invoices = await query<Record<string, any>>(
      `SELECT i.*,c.email AS client_email,pa.provider_subaccount_code FROM invoices i JOIN clients c ON c.id=i.client_id LEFT JOIN business_payment_accounts pa ON pa.business_id=i.business_id AND pa.status='active' WHERE i.id=ANY($1::uuid[]) AND i.business_id=$2 AND i.client_id=$3 AND i.deleted_at IS NULL ORDER BY i.id`,
      [invoiceIds, claims.businessId, claims.clientId],
    );
    if (invoices.length !== invoiceIds.length)
      throw new HttpError(400, "One or more selected invoices cannot be paid");
    const currencies = new Set(invoices.map((row) => row.currency));
    if (currencies.size !== 1)
      throw new HttpError(400, "Selected invoices must use the same currency");
    if (!invoices[0]?.provider_subaccount_code)
      throw new HttpError(
        409,
        "This business has not activated Paystack payments",
      );
    const pending = await query<{ invoice_id: string }>(
      "SELECT DISTINCT invoice_id FROM payment_claims WHERE invoice_id=ANY($1::uuid[]) AND status='pending'",
      [invoiceIds],
    );
    if (pending.length)
      throw new HttpError(
        409,
        "A selected invoice already has payment information awaiting review",
      );
    const openIntents = await query<Record<string, any>>(
      "SELECT * FROM payment_intents WHERE business_id=$1 AND provider='paystack' AND status='pending' ORDER BY created_at DESC",
      [claims.businessId],
    );
    for (const intent of openIntents) {
      const attempted = (
        Array.isArray(intent.allocations) ? intent.allocations : []
      ).map((item: any) => String(item.invoiceId));
      if (!attempted.some((id: string) => invoiceIds.includes(id))) continue;
      const status = await recoverPaystackIntent(intent);
      if (status === "success") {
        res.json({
          success: true,
          data: { reconciled: true, reference: intent.reference },
        });
        return;
      }
      const same =
        attempted.length === invoiceIds.length &&
        attempted.every((id: string) => invoiceIds.includes(id));
      if (
        status === "pending" ||
        status === "ongoing" ||
        status === "processing"
      ) {
        if (same && intent.authorization_url) {
          res.json({
            success: true,
            data: {
              authorizationUrl: intent.authorization_url,
              reference: intent.reference,
              reused: true,
            },
          });
          return;
        }
        throw new HttpError(
          409,
          "A Paystack payment attempt is still active for one or more selected invoices. Check its status before starting another payment.",
        );
      }
    }
    if (
      invoices.some(
        (row) => !["sent", "part_paid", "overdue"].includes(row.status),
      )
    )
      throw new HttpError(
        409,
        "A selected invoice is already paid or no longer payable",
      );
    const allocations = invoices.map((row) => ({
      invoiceId: row.id,
      amount: Number(row.total) - Number(row.amount_paid),
    }));
    if (allocations.some((item) => item.amount <= 0))
      throw new HttpError(409, "A selected invoice is already paid");
    const amount = allocations.reduce((sum, item) => sum + item.amount, 0);
    const currency = invoices[0].currency;
    const reference = `LB-BATCH-${Date.now()}`;
    const callback = `${env.publicWebUrl}/customer-portal?reference=${encodeURIComponent(reference)}`;
    const response = await paystack("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify({
        email: invoices[0].client_email,
        amount: String(Math.round(amount * 100)),
        currency,
        reference,
        callback_url: callback,
        subaccount: invoices[0].provider_subaccount_code,
        metadata: JSON.stringify({
          businessId: claims.businessId,
          clientId: claims.clientId,
          invoiceIds,
        }),
      }),
    });
    await query(
      `INSERT INTO payment_intents (business_id,invoice_id,provider,reference,access_code,authorization_url,amount,currency,allocations) VALUES ($1,$2,'paystack',$3,$4,$5,$6,$7,$8)`,
      [
        claims.businessId,
        invoices[0].id,
        reference,
        response.data.access_code,
        response.data.authorization_url,
        amount,
        currency,
        JSON.stringify(allocations),
      ],
    );
    res.status(201).json({
      success: true,
      data: {
        authorizationUrl: response.data.authorization_url,
        reference,
        amount,
        currency,
      },
    });
  }),
);

publicRouter.get(
  "/client/paystack/verify",
  asyncRoute(async (req, res) => {
    const claims = clientClaims(req.headers.authorization);
    const reference = String(req.query.reference ?? "");
    const intents = await query<Record<string, any>>(
      "SELECT * FROM payment_intents WHERE reference=$1 AND business_id=$2",
      [reference, claims.businessId],
    );
    const intent = intents[0];
    if (!intent) throw new HttpError(404, "Payment reference not found");
    const ids = (
      Array.isArray(intent.allocations) ? intent.allocations : []
    ).map((item: any) => item.invoiceId);
    if (ids.length) {
      const owned = await query<{ count: string }>(
        "SELECT count(*)::text AS count FROM invoices WHERE id=ANY($1::uuid[]) AND client_id=$2 AND business_id=$3",
        [ids, claims.clientId, claims.businessId],
      );
      if (Number(owned[0]?.count) !== ids.length)
        throw new HttpError(404, "Payment reference not found");
    }
    const response = await paystack(
      `/transaction/verify/${encodeURIComponent(reference)}`,
    );
    const result =
      response.data.status === "success"
        ? await settle(reference, response.data)
        : { status: response.data.status, reference };
    res.json({ success: true, data: result });
  }),
);
