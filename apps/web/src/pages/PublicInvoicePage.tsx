import { FormEvent, useEffect, useState } from "react";
import {
  ArrowRight2,
  Bank,
  Card,
  Copy,
  DocumentText,
  Lock1,
  Money,
  ShieldTick,
  TickCircle,
} from "iconsax-react";
import { useParams } from "react-router-dom";
import { api, post, postForm } from "../lib/api";

type Method = "monnify" | "paystack" | "cash" | "transfer";
type OnlineMethod = Extract<Method, "monnify" | "paystack">;
type PublicInvoice = {
  id: string;
  number: string;
  status: string;
  business_name: string;
  business_email: string;
  business_phone?: string;
  business_address?: string;
  client_name: string;
  client_email: string;
  currency: string;
  subtotal: string;
  tax: string;
  total: string;
  amount_paid: string;
  due_date?: string;
  notes?: string;
  virtual_bank_name?: string;
  virtual_account_number?: string;
  virtual_account_name?: string;
  transfer_bank_name?: string;
  transfer_account_number?: string;
  transfer_account_name?: string;
  lines: Array<{
    description: string;
    quantity: string;
    unit_price: string;
    total: string;
  }>;
  paymentOptions: {
    paystack: boolean;
    monnify: boolean;
    virtualAccount: boolean;
    cash: boolean;
    transfer: boolean;
  };
  pendingPaymentReview: boolean;
  clientAccountAvailable: boolean;
  clientAccountExists: boolean;
};

export function PublicInvoicePage() {
  const { token = "" } = useParams();
  const [invoice, setInvoice] = useState<PublicInvoice | null>(null);
  const [method, setMethod] = useState<Method>("transfer");
  const [form, setForm] = useState({
    payerName: "",
    paidTo: "",
    amount: "",
    paidAt: new Date().toISOString().slice(0, 10),
    note: "",
  });
  const [receipt, setReceipt] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [showAccount, setShowAccount] = useState(false);
  const [showAccountSuccess, setShowAccountSuccess] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [accountChallenge, setAccountChallenge] = useState("");
  const [accountOtp, setAccountOtp] = useState("");
  const [copied, setCopied] = useState(false);
  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams(window.location.search);
      const reference = params.get("reference");
      const provider =
        params.get("provider") === "monnify" ? "monnify" : "paystack";
      if (reference) {
        await api(
          `/public/invoices/${token}/${provider}/verify?reference=${encodeURIComponent(reference)}`,
        );
        setDone(
          `Your ${provider === "monnify" ? "Monnify" : "Paystack"} payment was confirmed and applied to this invoice.`,
        );
        window.history.replaceState({}, "", window.location.pathname);
      }
      const data = await api<PublicInvoice>(`/public/invoices/${token}`);
      setInvoice(data);
      setForm((current) => ({
        ...current,
        amount: String(
          Math.max(0, Number(data.total) - Number(data.amount_paid)),
        ),
      }));
      setMethod(
        data.paymentOptions.monnify
          ? "monnify"
          : data.paymentOptions.paystack
            ? "paystack"
            : data.paymentOptions.transfer
              ? "transfer"
              : "cash",
      );
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Invoice unavailable",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, [token]);
  async function pay(provider: OnlineMethod) {
    setBusy(true);
    setError("");
    try {
      const result = await post<{ authorizationUrl: string }>(
        `/public/invoices/${token}/${provider}`,
        {},
      );
      window.location.assign(result.authorizationUrl);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not start payment",
      );
      setBusy(false);
    }
  }
  async function claim(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      Object.entries({ ...form, method }).forEach(([key, value]) =>
        body.append(key, value),
      );
      if (receipt) body.append("receipt", receipt);
      await postForm(`/public/invoices/${token}/payment-claims`, body);
      setInvoice((current) =>
        current ? { ...current, pendingPaymentReview: true } : current,
      );
      setDone(
        "Your payment information is now waiting for the business to verify it. The invoice will update after approval.",
      );
      setShowPaymentDetails(false);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not submit payment",
      );
    } finally {
      setBusy(false);
    }
  }
  async function requestAccountCode() {
    setBusy(true);
    setError("");
    try {
      const result = await post<{ challengeId: string }>(
        `/public/invoices/${token}/client-account/code`,
        {},
      );
      setAccountChallenge(result.challengeId);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not send verification code",
      );
    } finally {
      setBusy(false);
    }
  }
  async function createAccount(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await post<{ token: string }>(
        `/public/invoices/${token}/client-account/verify`,
        { challengeId: accountChallenge, otp: accountOtp },
      );
      localStorage.setItem("lemonbooks.client.session", result.token);
      setInvoice((current) =>
        current ? { ...current, clientAccountExists: true } : current,
      );
      setShowAccount(false);
      setShowAccountSuccess(true);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not verify code",
      );
    } finally {
      setBusy(false);
    }
  }
  async function copyAccount() {
    if (!invoice?.transfer_account_number) return;
    await navigator.clipboard.writeText(invoice.transfer_account_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }
  if (loading)
    return (
      <main className="public-invoice-shell">
        <div className="public-state" role="status">
          <span className="public-state-icon">
            <DocumentText size={27} />
          </span>
          <strong>Opening secure invoice</strong>
          <p>Checking the latest balance and payment options…</p>
        </div>
      </main>
    );
  if (!invoice)
    return (
      <main className="public-invoice-shell">
        <div className="public-state" role="alert">
          <span className="public-state-icon public-state-icon--error">
            <DocumentText size={27} />
          </span>
          <strong>This invoice couldn’t be opened</strong>
          <p>{error}</p>
          <button className="secondary-button" onClick={() => void load()}>
            Try again
          </button>
        </div>
      </main>
    );
  const balance = Math.max(
    0,
    Number(invoice.total) - Number(invoice.amount_paid),
  );
  const paid = balance === 0 || invoice.status === "paid";
  const money = (value: string | number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: invoice.currency,
    }).format(Number(value));
  const isOnline = method === "monnify" || method === "paystack";
  const selectedProvider = method === "monnify" ? "Monnify" : "Paystack";
  const methods: Array<{
    id: Method;
    label: string;
    detail: string;
    icon: typeof Card;
    show: boolean;
  }> = [
    {
      id: "monnify",
      label: "Monnify",
      detail: "Card, transfer or USSD",
      icon: Card,
      show: invoice.paymentOptions.monnify,
    },
    {
      id: "paystack",
      label: "Paystack",
      detail: "Card, transfer or USSD",
      icon: Card,
      show: invoice.paymentOptions.paystack,
    },
    {
      id: "transfer",
      label: "Bank transfer",
      detail: "Transfer and upload receipt",
      icon: Bank,
      show: invoice.paymentOptions.transfer,
    },
    {
      id: "cash",
      label: "Cash",
      detail: "Submit payment for verification",
      icon: Money,
      show: invoice.paymentOptions.cash,
    },
  ];
  const availableMethods = methods.filter((item) => item.show);
  const actionLabel = isOnline
    ? `Pay ${money(balance)} with ${selectedProvider}`
    : method === "cash"
      ? "Record cash payment"
      : "Continue with bank transfer";
  return (
    <main className="public-invoice-shell">
      <header className="public-invoice-header">
        <span className="brand">
          <img className="brand-mark" src="/brand/lemonbooks-logo-mark.png" alt=""/>LemonBooks
        </span>
        <span className="secure-label">
          <Lock1 size={14} />
          Secure invoice
        </span>
      </header>
      <div className="public-invoice-layout public-invoice-layout--modern">
        <section className="public-document">
          <div className="invoice-status-strip">
            <span
              className={`status status--${paid ? "paid" : invoice.pendingPaymentReview ? "pending" : invoice.status}`}
            >
              {paid
                ? "Paid"
                : invoice.pendingPaymentReview
                  ? "Payment awaiting review"
                  : invoice.status === "sent"
                    ? "Payment due"
                    : invoice.status.replace("_", " ")}
            </span>
            <span>Invoice {invoice.number}</span>
          </div>
          <div className="public-document__top">
            <div>
              <p>FROM</p>
              <h1>{invoice.business_name}</h1>
              <span>
                {invoice.business_email}
                {invoice.business_phone && (
                  <>
                    <br />
                    {invoice.business_phone}
                  </>
                )}
                {invoice.business_address && (
                  <>
                    <br />
                    {invoice.business_address}
                  </>
                )}
              </span>
            </div>
            <div>
              <p>BALANCE DUE</p>
              <strong className="public-balance">{money(balance)}</strong>
              <span>
                Due{" "}
                {invoice.due_date
                  ? new Date(invoice.due_date).toLocaleDateString()
                  : "on receipt"}
              </span>
            </div>
          </div>
          <div className="public-billto">
            <p>BILL TO</p>
            <strong>{invoice.client_name}</strong>
            <span>{invoice.client_email}</span>
          </div>
          <div className="public-items">
            <div className="public-items-head">
              <span>Description</span>
              <span>Qty</span>
              <span>Amount</span>
            </div>
            {invoice.lines.map((line, index) => (
              <div className="public-item" key={index}>
                <span>
                  <strong>{line.description}</strong>
                  <small>{money(line.unit_price)} each</small>
                </span>
                <span>{Number(line.quantity).toLocaleString()}</span>
                <strong>{money(line.total)}</strong>
              </div>
            ))}
          </div>
          <div className="public-total">
            <span>
              Subtotal <strong>{money(invoice.subtotal)}</strong>
            </span>
            <span>
              Tax <strong>{money(invoice.tax)}</strong>
            </span>
            {Number(invoice.amount_paid) > 0 && (
              <span>
                Paid <strong>− {money(invoice.amount_paid)}</strong>
              </span>
            )}
            <span>
              Balance due <strong>{money(balance)}</strong>
            </span>
          </div>
          {invoice.notes && (
            <div className="public-note">
              <strong>Note from {invoice.business_name}</strong>
              <p>{invoice.notes}</p>
            </div>
          )}
        </section>
        <aside className="public-payment">
          <div className="payment-heading">
            <p className="eyebrow">PAYMENT OPTIONS</p>
            <h2>
              {paid
                ? "Payment complete"
                : invoice.pendingPaymentReview
                  ? "Verification in progress"
                  : "Choose how to pay"}
            </h2>
            <p>
              {paid
                ? "There is no remaining balance on this invoice."
                : invoice.pendingPaymentReview
                  ? "The business has received your payment information and needs to verify it."
                  : `Select a payment method for ${money(balance)}.`}
            </p>
          </div>
          {paid || invoice.pendingPaymentReview || done ? (
            <div className="claim-success">
              <span>
                <TickCircle size={31} />
              </span>
              <strong>
                {paid
                  ? "Invoice paid"
                  : invoice.pendingPaymentReview
                    ? "Awaiting business review"
                    : "Submitted"}
              </strong>
              <p>{done || "You don’t need to submit the payment again."}</p>
            </div>
          ) : availableMethods.length ? (
            <div
              className="payment-methods"
              role="tablist"
              aria-label="Payment method"
            >
              {availableMethods.map(({ id, label, detail, icon: Icon }) => (
                <button
                  role="tab"
                  aria-selected={method === id}
                  className={method === id ? "active" : ""}
                  key={id}
                  onClick={() => {
                    setMethod(id);
                    setError("");
                  }}
                >
                  <span>
                    <Icon size={20} />
                  </span>
                  <strong>{label}</strong>
                  <small>{detail}</small>
                </button>
              ))}
            </div>
          ) : (
            <div className="payment-empty">
              <Bank size={22} />
              <strong>Online payment is unavailable</strong>
              <span>
                Contact {invoice.business_name} for payment instructions.
              </span>
            </div>
          )}
          {invoice.clientAccountAvailable && (
            <section className="public-account">
              <span className="public-account__icon">
                <Lock1 size={21} />
              </span>
              <div>
                <strong>
                  {invoice.clientAccountExists
                    ? "Your customer account is ready."
                    : "Every invoice. One secure view."}
                </strong>
                <span>
                  {invoice.clientAccountExists
                    ? "Sign in to view invoices, confirmed payments, and statements."
                    : "Create your free customer account with a one-time email code—no password to remember."}
                </span>
              </div>
              <button
                className="secondary-button"
                onClick={() => {
                  if (invoice.clientAccountExists) {
                    window.location.assign("/customer-portal");
                    return;
                  }
                  setShowAccount(true);
                  setError("");
                  setAccountChallenge("");
                  setAccountOtp("");
                }}
              >
                {invoice.clientAccountExists
                  ? "Log in to manage account"
                  : "Create customer account"}{" "}
                <ArrowRight2 size={17} />
              </button>
            </section>
          )}
          {error && !showPaymentDetails && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </aside>
      </div>
      {!paid &&
        !invoice.pendingPaymentReview &&
        !done &&
        availableMethods.length > 0 && (
          <div className="public-payment-action">
            <div>
              <span className="public-payment-action__label">
                SELECTED PAYMENT METHOD
              </span>
              <strong>{actionLabel}</strong>
              <span>
                {isOnline
                  ? "Secure checkout opens in the next step."
                  : "You’ll provide the payment details in a secure form."}
              </span>
            </div>
            <button
              className="primary-button"
              disabled={busy}
              onClick={() =>
                isOnline
                  ? void pay(method as OnlineMethod)
                  : setShowPaymentDetails(true)
              }
            >
              {busy ? (
                "Opening secure checkout…"
              ) : (
                <>
                  {actionLabel} <ArrowRight2 size={18} />
                </>
              )}
            </button>
          </div>
        )}
      {showAccount && (
        <div
          className="modal-layer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="account-modal-title"
        >
          <button
            className="modal-backdrop"
            aria-label="Close customer account setup"
            onClick={() => setShowAccount(false)}
          />
          <section className="modal customer-account-modal">
            <header>
              <div>
                <p className="eyebrow">CUSTOMER PORTAL</p>
                <h2 id="account-modal-title">
                  {accountChallenge
                    ? "Check your email"
                    : "Create your customer account"}
                </h2>
                <p>
                  {accountChallenge
                    ? `Enter the 6-digit code sent to ${invoice.client_email}.`
                    : `We’ll verify ${invoice.client_email} before creating your secure account.`}
                </p>
              </div>
              <button aria-label="Close" onClick={() => setShowAccount(false)}>
                ×
              </button>
            </header>
            <div className="modal-body">
              {!accountChallenge ? (
                <div className="account-email-card">
                  <span>{invoice.client_name}</span>
                  <strong>{invoice.client_email}</strong>
                  <small>
                    Your account will be connected to invoices from{" "}
                    {invoice.business_name}.
                  </small>
                  <button
                    className="primary-button"
                    disabled={busy}
                    onClick={() => void requestAccountCode()}
                  >
                    {busy ? (
                      "Sending code…"
                    ) : (
                      <>
                        Email me a verification code <ArrowRight2 size={18} />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <form className="form-stack" onSubmit={createAccount}>
                  <label>
                    Verification code
                    <input
                      className="otp-input"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={accountOtp}
                      onChange={(event) =>
                        setAccountOtp(
                          event.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      placeholder="000000"
                      autoFocus
                      required
                    />
                  </label>
                  {error && (
                    <p className="form-error" role="alert">
                      {error}
                    </p>
                  )}
                  <button
                    className="primary-button"
                    disabled={busy || accountOtp.length !== 6}
                  >
                    {busy ? "Verifying…" : "Verify and create account"}
                  </button>
                  <button
                    type="button"
                    className="text-button"
                    disabled={busy}
                    onClick={() => void requestAccountCode()}
                  >
                    Send a new code
                  </button>
                </form>
              )}
              {error && !accountChallenge && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
            </div>
          </section>
        </div>
      )}
      {showAccountSuccess && (
        <div
          className="modal-layer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="account-success-title"
        >
          <button
            className="modal-backdrop"
            aria-label="Close account confirmation"
            onClick={() => setShowAccountSuccess(false)}
          />
          <section className="modal customer-account-modal account-success-modal">
            <header>
              <div>
                <p className="eyebrow">ACCOUNT CREATED</p>
                <h2 id="account-success-title">Your customer account is ready</h2>
                <p>
                  View all your invoices and confirmed payments from one secure
                  customer portal.
                </p>
              </div>
              <button
                aria-label="Close"
                onClick={() => setShowAccountSuccess(false)}
              >
                ×
              </button>
            </header>
            <div className="modal-body">
              <div className="account-success-modal__icon">
                <TickCircle size={34} />
              </div>
              <button
                className="primary-button"
                onClick={() => window.location.assign("/customer-portal")}
              >
                Open customer portal <ArrowRight2 size={18} />
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowAccountSuccess(false)}
              >
                Stay on this invoice
              </button>
            </div>
          </section>
        </div>
      )}
      {showPaymentDetails && !isOnline && (
        <div
          className="modal-layer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-details-title"
        >
          <button
            className="modal-backdrop"
            aria-label="Close payment details"
            onClick={() => setShowPaymentDetails(false)}
          />
          <section className="modal public-payment-modal">
            <header>
              <div>
                <p className="eyebrow">{money(balance)} DUE</p>
                <h2 id="payment-details-title">
                  {method === "cash"
                    ? "Cash payment details"
                    : "Bank transfer details"}
                </h2>
                <p>
                  Submit the information below for {invoice.business_name} to
                  verify.
                </p>
              </div>
              <button
                aria-label="Close"
                onClick={() => setShowPaymentDetails(false)}
              >
                ×
              </button>
            </header>
            <div className="modal-body">
              {method === "transfer" &&
                invoice.transfer_account_number && (
                  <div className="bank-instructions">
                    <p>TRANSFER TO</p>
                    <strong>{invoice.transfer_bank_name}</strong>
                    <div>
                      <span>{invoice.transfer_account_number}</span>
                      <button
                        type="button"
                        onClick={() => void copyAccount()}
                        aria-label="Copy account number"
                      >
                        <Copy size={17} />
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <span>{invoice.transfer_account_name}</span>
                    <small>
                      Use {invoice.number} as your transfer reference, then
                      submit the receipt below.
                    </small>
                  </div>
                )}
              <form onSubmit={claim} className="form-stack payment-report-form">
                <label>
                  Your name
                  <input
                    value={form.payerName}
                    onChange={(event) =>
                      setForm({ ...form, payerName: event.target.value })
                    }
                    required
                  />
                </label>
                {method === "cash" && (
                  <label>
                    Who received the cash?
                    <input
                      value={form.paidTo}
                      onChange={(event) =>
                        setForm({ ...form, paidTo: event.target.value })
                      }
                      placeholder="Staff member or representative"
                      required
                    />
                  </label>
                )}
                <div className="form-grid">
                  <label>
                    Amount paid
                    <input
                      type="number"
                      min="0.01"
                      max={balance}
                      step="0.01"
                      value={form.amount}
                      onChange={(event) =>
                        setForm({ ...form, amount: event.target.value })
                      }
                      required
                    />
                  </label>
                  <label>
                    Payment date
                    <input
                      type="date"
                      max={new Date().toISOString().slice(0, 10)}
                      value={form.paidAt}
                      onChange={(event) =>
                        setForm({ ...form, paidAt: event.target.value })
                      }
                      required
                    />
                  </label>
                </div>
                {method === "transfer" && (
                  <label>
                    Transfer receipt
                    <input
                      type="file"
                      accept="image/png,image/jpeg,application/pdf"
                      onChange={(event) =>
                        setReceipt(event.target.files?.[0] ?? null)
                      }
                      required
                    />
                    <small>PDF, JPG, or PNG up to 5 MB.</small>
                  </label>
                )}
                <label>
                  Additional information{" "}
                  <span className="optional">Optional</span>
                  <textarea
                    rows={3}
                    value={form.note}
                    onChange={(event) =>
                      setForm({ ...form, note: event.target.value })
                    }
                    placeholder="Reference or helpful payment details"
                  />
                </label>
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                <div className="public-payment-modal__actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setShowPaymentDetails(false)}
                  >
                    Cancel
                  </button>
                  <button className="primary-button" disabled={busy}>
                    {busy
                      ? "Submitting for review…"
                      : "Submit for verification"}
                  </button>
                </div>
                <p className="verification-note">
                  <ShieldTick size={16} />
                  This does not mark the invoice paid. {
                    invoice.business_name
                  }{" "}
                  will verify it first.
                </p>
              </form>
            </div>
          </section>
        </div>
      )}
      <footer className="public-footer">
        <ShieldTick size={16} />
        <span>Secure payments and invoice status powered by LemonBooks.</span>
      </footer>
    </main>
  );
}
