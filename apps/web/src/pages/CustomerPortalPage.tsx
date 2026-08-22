import { FormEvent, useEffect, useState } from "react";
import {
  ArrowRight2,
  Bank,
  Card,
  Copy,
  DocumentDownload,
  DocumentText,
  Home2,
  LogoutCurve,
  Money,
  MoneyRecive,
  Printer,
  SearchNormal1,
  ShieldTick,
  TickCircle,
  Warning2,
} from "iconsax-react";
import { Link } from "react-router-dom";
import { api, post, postForm } from "../lib/api";
import { Modal } from "../components/Modal";
import { useNotifications } from "../context/NotificationContext";

type PortalInvoice = {
  id: string;
  number: string;
  status: string;
  issue_date: string;
  due_date?: string;
  currency: string;
  total: string;
  amount_paid: string;
  public_token: string;
  pending_payment_count?: number;
};
type PortalPayment = {
  id: string;
  invoice_id: string;
  invoice_number: string;
  amount: string;
  currency: string;
  method: string;
  reference?: string;
  group_reference?: string;
  received_at: string;
};
type Portal = {
  client_name: string;
  client_email: string;
  business_name: string;
  business_email: string;
  business_phone?: string;
  tenant_slug: string;
  paystack_available: boolean;
  transfer_bank_name?: string;
  transfer_account_number?: string;
  transfer_account_name?: string;
  payment_options: Array<{
    id: string;
    label: string;
    description: string;
    kind: "gateway" | "manual";
  }>;
  invoices: PortalInvoice[];
  payments: PortalPayment[];
};
type View = "overview" | "invoices" | "payments" | "statement";

export function CustomerPortalPage() {
  const { notify } = useNotifications();
  const [session, setSession] = useState(
    () => localStorage.getItem("lemonbooks.client.session") ?? "",
  );
  const [portal, setPortal] = useState<Portal | null>(null);
  const [form, setForm] = useState({ email: "", workspace: "", otp: "" });
  const [loginChallenge, setLoginChallenge] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(Boolean(session));
  const [view, setView] = useState<View>("overview");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [batchBusy, setBatchBusy] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("paystack");
  const [manual, setManual] = useState({
    payerName: "",
    paidTo: "",
    paidAt: new Date().toISOString().slice(0, 10),
    note: "",
  });
  const [receipt, setReceipt] = useState<File | null>(null);
  async function load(token = session) {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const reference = new URLSearchParams(window.location.search).get(
        "reference",
      );
      if (reference) {
        const provider =
          new URLSearchParams(window.location.search).get("provider") ===
          "monnify"
            ? "monnify"
            : "paystack";
        await api(
          `/public/client/${provider}/verify?reference=${encodeURIComponent(reference)}`,
          {},
          token,
        );
        window.history.replaceState({}, "", window.location.pathname);
      }
      const nextPortal = await api<Portal>("/public/client/portal", {}, token);
      setPortal(nextPortal);
      setPaymentMethod((current) =>
        nextPortal.payment_options.some((option) => option.id === current)
          ? current
          : (nextPortal.payment_options[0]?.id ?? "transfer"),
      );
      setSelected([]);
    } catch (reason) {
      if (
        reason instanceof Error &&
        reason.message.toLowerCase().includes("session")
      ) {
        localStorage.removeItem("lemonbooks.client.session");
        setSession("");
        setPortal(null);
      }
      setError(
        reason instanceof Error
          ? reason.message
          : "Your account could not be loaded",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (session) void load(session);
  }, [session]);
  async function login(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (!loginChallenge) {
        const result = await post<{ challengeId: string }>(
          "/public/client/login/code",
          { email: form.email, workspace: form.workspace },
        );
        setLoginChallenge(result.challengeId);
        return;
      }
      const result = await post<{ token: string }>(
        "/public/client/login/verify",
        { challengeId: loginChallenge, otp: form.otp },
      );
      localStorage.setItem("lemonbooks.client.session", result.token);
      setSession(result.token);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }
  function logout() {
    localStorage.removeItem("lemonbooks.client.session");
    setSession("");
    setPortal(null);
  }
  if (!session)
    return (
      <PortalLogin
        form={form}
        setForm={setForm}
        error={error}
        busy={busy}
        challenge={loginChallenge}
        onRestart={() => {
          setLoginChallenge("");
          setForm({ ...form, otp: "" });
          setError("");
        }}
        onSubmit={login}
      />
    );
  if (loading || !portal)
    return (
      <main className="portal-loading" role="status">
        <span className="brand">
          <span className="brand-mark">L</span>LemonBooks
        </span>
        <div>
          <span>
            <DocumentText size={27} />
          </span>
          <strong>Opening your account</strong>
          <p>Loading invoices and confirmed payments…</p>
        </div>
      </main>
    );
  const outstanding = portal.invoices.reduce(
    (sum, row) =>
      sum + Math.max(0, Number(row.total) - Number(row.amount_paid)),
    0,
  );
  const overdue = portal.invoices.filter(
    (row) =>
      row.status === "overdue" && Number(row.total) > Number(row.amount_paid),
  );
  const awaiting = portal.invoices.filter(
    (row) => Number(row.pending_payment_count) > 0,
  );
  const paidTotal = portal.payments.reduce(
    (sum, row) => sum + Number(row.amount),
    0,
  );
  const primaryCurrency =
    portal.invoices[0]?.currency ?? portal.payments[0]?.currency ?? "USD";
  const money = (value: string | number, currency = primaryCurrency) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency }).format(
      Number(value),
    );
  const invoiceRows = portal.invoices.filter(
    (row) =>
      (filter === "all" ||
        (filter === "awaiting"
          ? Number(row.pending_payment_count) > 0
          : row.status === filter)) &&
      row.number.toLowerCase().includes(search.toLowerCase()),
  );
  const paymentRows = portal.payments.filter((row) =>
    `${row.invoice_number} ${row.reference ?? ""} ${row.method}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  function navigate(next: View) {
    setView(next);
    setSearch("");
    setFilter("all");
  }
  async function submitCombined(event: FormEvent) {
    event.preventDefault();
    if (!selected.length || !portal) return;
    if (paymentMethod === "cash" || paymentMethod === "transfer") {
      setError("");
      setCheckoutOpen(false);
      setManualOpen(true);
      return;
    }
    setBatchBusy(true);
    setError("");
    try {
      if (paymentMethod === "paystack" || paymentMethod === "monnify") {
        const result = await post<{
          authorizationUrl?: string;
          reconciled?: boolean;
        }>(
          `/public/client/${paymentMethod}`,
          { invoiceIds: selected },
          session,
        );
        if (result.reconciled) {
          setCheckoutOpen(false);
          await load(session);
          notify({
            tone: "success",
            title: "Payment reconciled",
            message:
              `${paymentMethod === "monnify" ? "Monnify" : "Paystack"} confirmed the earlier payment and all covered invoices were updated.`,
          });
          return;
        }
        if (!result.authorizationUrl)
          throw new Error(
            `${paymentMethod === "monnify" ? "Monnify" : "Paystack"} checkout is unavailable`,
          );
        window.location.assign(result.authorizationUrl);
        return;
      }
    } catch (reason) {
      const message =
        reason instanceof Error
          ? reason.message
          : "Could not submit combined payment";
      setError(message);
      notify({ tone: "error", title: "Payment could not continue", message });
    } finally {
      setBatchBusy(false);
    }
  }
  async function submitManualPayment(event: FormEvent) {
    event.preventDefault();
    if (!selected.length || !portal || !["cash", "transfer"].includes(paymentMethod)) return;
    setBatchBusy(true); setError("");
    try {
      const body = new FormData();
      body.append("invoiceIds", JSON.stringify(selected));
      body.append("method", paymentMethod);
      Object.entries(manual).forEach(([key, value]) => body.append(key, value));
      if (receipt) body.append("receipt", receipt);
      await postForm("/public/client/payment-claims", body, session);
      setManualOpen(false);
      await load(session);
      notify({ tone:"success", title:"Payment submitted", message:`${selected.length} invoice allocations are waiting for ${portal.business_name} to verify them.` });
    } catch (reason) {
      const message=reason instanceof Error?reason.message:"Could not submit payment";
      setError(message); notify({tone:"error",title:"Payment could not be submitted",message});
    } finally { setBatchBusy(false); }
  }
  function openCheckout() {
    if (!portal || !selected.length) return;
    setPaymentMethod(portal.payment_options[0]?.id ?? "transfer");
    setError("");
    setCheckoutOpen(true);
  }
  function downloadStatement() {
    if (!portal) return;
    const rows = [["Date", "Type", "Reference", "Debit", "Credit", "Balance"]];
    let balance = 0;
    const entries = [
      ...portal.invoices.map((row) => ({
        date: row.issue_date,
        type: "Invoice",
        reference: row.number,
        debit: Number(row.total),
        credit: 0,
      })),
      ...portal.payments.map((row) => ({
        date: row.received_at,
        type: "Payment",
        reference: row.invoice_number,
        debit: 0,
        credit: Number(row.amount),
      })),
    ].sort((a, b) => +new Date(a.date) - +new Date(b.date));
    for (const entry of entries) {
      balance += entry.debit - entry.credit;
      rows.push([
        new Date(entry.date).toLocaleDateString(),
        entry.type,
        entry.reference,
        String(entry.debit || ""),
        String(entry.credit || ""),
        String(balance),
      ]);
    }
    const blob = new Blob(
      [
        rows
          .map((row) =>
            row
              .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
              .join(","),
          )
          .join("\n"),
      ],
      { type: "text/csv" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${portal.business_name.replace(/\W+/g, "-").toLowerCase()}-statement.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <main className="customer-workspace">
      <header className="customer-topbar">
        <span className="brand">
          <span className="brand-mark">L</span>LemonBooks
        </span>
        <div>
          <span>
            <small>Account with</small>
            <strong>{portal.business_name}</strong>
          </span>
          <span className="customer-avatar">
            {portal.client_name.charAt(0).toUpperCase()}
          </span>
          <button onClick={logout}>
            <LogoutCurve size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </header>
      <div className="customer-layout">
        <aside className="customer-nav">
          <div>
            <p>Signed in as</p>
            <strong>{portal.client_name}</strong>
            <small>{portal.client_email}</small>
          </div>
          <nav>
            {(
              [
                { id: "overview", label: "Overview", icon: Home2 },
                { id: "invoices", label: "Invoices", icon: DocumentText },
                { id: "payments", label: "Payments", icon: Card },
                { id: "statement", label: "Statement", icon: DocumentDownload },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                className={view === item.id ? "active" : ""}
                onClick={() => navigate(item.id)}
              >
                <item.icon size={19} />
                <span>{item.label}</span>
                {item.id === "invoices" && overdue.length > 0 && (
                  <em>{overdue.length}</em>
                )}
              </button>
            ))}
          </nav>
          <div className="customer-support">
            <strong>Need help?</strong>
            <p>
              Questions about an invoice or payment should go directly to{" "}
              {portal.business_name}.
            </p>
            <a href={`mailto:${portal.business_email}`}>Contact business</a>
            {portal.business_phone && <small>{portal.business_phone}</small>}
          </div>
        </aside>
        <section className="customer-content">
          {view === "overview" && (
            <>
              <header className="customer-page-heading">
                <div>
                  <p className="eyebrow">CUSTOMER ACCOUNT</p>
                  <h1>Welcome back, {portal.client_name.split(" ")[0]}</h1>
                  <p>
                    Stay on top of invoices and payments with{" "}
                    {portal.business_name}.
                  </p>
                </div>
                {outstanding > 0 && (
                  <button
                    onClick={() => navigate("invoices")}
                    className="primary-button primary-button--compact"
                  >
                    View what’s due <ArrowRight2 size={17} />
                  </button>
                )}
              </header>
              <div className="customer-metrics">
                <article className="customer-metric customer-metric--primary">
                  <span>
                    <MoneyRecive size={21} />
                  </span>
                  <p>Outstanding balance</p>
                  <strong>{money(outstanding)}</strong>
                  <small>
                    {
                      portal.invoices.filter(
                        (row) => Number(row.total) > Number(row.amount_paid),
                      ).length
                    }{" "}
                    open invoices
                  </small>
                </article>
                <article>
                  <span className="customer-metric--danger">
                    <Warning2 size={21} />
                  </span>
                  <p>Past due</p>
                  <strong>
                    {money(
                      overdue.reduce(
                        (sum, row) =>
                          sum + Number(row.total) - Number(row.amount_paid),
                        0,
                      ),
                    )}
                  </strong>
                  <small>{overdue.length} overdue invoices</small>
                </article>
                <article>
                  <span>
                    <TickCircle size={21} />
                  </span>
                  <p>Confirmed payments</p>
                  <strong>{money(paidTotal)}</strong>
                  <small>{portal.payments.length} payments recorded</small>
                </article>
              </div>
              {awaiting.length > 0 && (
                <div className="customer-verification">
                  <span>
                    <Warning2 size={21} />
                  </span>
                  <div>
                    <strong>
                      {awaiting.length} payment{" "}
                      {awaiting.length === 1 ? "is" : "are"} being verified
                    </strong>
                    <p>
                      No need to submit again. The invoice balance updates after{" "}
                      {portal.business_name} approves the payment information.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigate("invoices");
                      setFilter("awaiting");
                    }}
                  >
                    View status
                  </button>
                </div>
              )}
              <div className="customer-overview-grid">
                <article className="portal-panel">
                  <header>
                    <div>
                      <h2>Invoices needing attention</h2>
                      <p>
                        Open an invoice to pay or submit payment information.
                      </p>
                    </div>
                    <button onClick={() => navigate("invoices")}>
                      View all
                    </button>
                  </header>
                  <InvoiceCards
                    rows={portal.invoices
                      .filter(
                        (row) => Number(row.total) > Number(row.amount_paid),
                      )
                      .slice(0, 4)}
                    money={money}
                  />
                </article>
                <article className="portal-panel">
                  <header>
                    <div>
                      <h2>Recent payments</h2>
                      <p>Confirmed by {portal.business_name}.</p>
                    </div>
                    <button onClick={() => navigate("payments")}>
                      View all
                    </button>
                  </header>
                  <PaymentList
                    rows={portal.payments.slice(0, 5)}
                    money={money}
                  />
                </article>
              </div>
            </>
          )}
          {view === "invoices" && (
            <>
              <PortalHeading
                eyebrow="BILLING"
                title="Your invoices"
                description="Select one or more invoices, then choose any payment method this business currently accepts."
              />
              <div className="portal-toolbar">
                <div className="search-box">
                  <SearchNormal1 size={18} />
                  <input
                    aria-label="Search invoices"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search invoice number"
                  />
                </div>
                <div className="filter-pills">
                  {["all", "sent", "overdue", "awaiting", "paid"].map(
                    (value) => (
                      <button
                        key={value}
                        className={filter === value ? "active" : ""}
                        onClick={() => setFilter(value)}
                      >
                        {value === "sent" ? "unpaid" : value}
                      </button>
                    ),
                  )}
                </div>
                <button
                  className="select-all-button"
                  onClick={() => {
                    const eligible = invoiceRows
                      .filter(
                        (row) =>
                          Number(row.total) > Number(row.amount_paid) &&
                          !Number(row.pending_payment_count),
                      )
                      .map((row) => row.id);
                    setSelected(
                      selected.length === eligible.length ? [] : eligible,
                    );
                  }}
                >
                  {selected.length ? "Clear selection" : "Select all due"}
                </button>
              </div>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <InvoiceCards
                rows={invoiceRows}
                money={money}
                expanded
                selectable
                selected={selected}
                onSelect={(id) =>
                  setSelected((current) =>
                    current.includes(id)
                      ? current.filter((value) => value !== id)
                      : [...current, id],
                  )
                }
              />
              {selected.length > 0 && (
                <div className="batch-payment-bar">
                  <div>
                    <span>
                      {selected.length}{" "}
                      {selected.length === 1 ? "invoice" : "invoices"} selected
                    </span>
                    <strong>
                      {money(
                        portal.invoices
                          .filter((row) => selected.includes(row.id))
                          .reduce(
                            (sum, row) =>
                              sum + Number(row.total) - Number(row.amount_paid),
                            0,
                          ),
                      )}
                    </strong>
                  </div>
                  <button
                    className="primary-button primary-button--compact"
                    disabled={batchBusy}
                    onClick={openCheckout}
                  >
                    Choose payment method <ArrowRight2 size={17} />
                  </button>
                </div>
              )}
            </>
          )}
          {view === "payments" && (
            <>
              <PortalHeading
                eyebrow="PAYMENT HISTORY"
                title="Confirmed payments"
                description={`Payments verified and recorded by ${portal.business_name}.`}
              />
              <div className="portal-toolbar">
                <div className="search-box">
                  <SearchNormal1 size={18} />
                  <input
                    aria-label="Search payments"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search invoice, method, or reference"
                  />
                </div>
              </div>
              <article className="portal-panel">
                <PaymentList rows={paymentRows} money={money} expanded />
              </article>
            </>
          )}
          {view === "statement" && (
            <>
              <PortalHeading
                eyebrow="ACCOUNT STATEMENT"
                title="Invoices and payments"
                description={`A complete running account with ${portal.business_name}.`}
                action={
                  <div className="page-actions print-hidden">
                    <button
                      className="secondary-button"
                      onClick={downloadStatement}
                    >
                      <DocumentDownload size={17} />
                      Download CSV
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => window.print()}
                    >
                      <Printer size={17} />
                      Print
                    </button>
                  </div>
                }
              />
              <article className="portal-panel statement-card">
                <div className="statement-brand">
                  <div>
                    <span className="brand-mark">L</span>
                    <span>
                      <strong>{portal.business_name}</strong>
                      <small>Customer account statement</small>
                    </span>
                  </div>
                  <div>
                    <strong>{portal.client_name}</strong>
                    <small>{portal.client_email}</small>
                  </div>
                </div>
                <Statement portal={portal} money={money} />
                <footer>
                  <span>Current balance</span>
                  <strong>{money(outstanding)}</strong>
                </footer>
              </article>
            </>
          )}
        </section>
      </div>
      <Modal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSubmit={submitCombined}
        title={`Pay ${selected.length} ${selected.length === 1 ? "invoice" : "invoices"}`}
        description="One payment will be allocated to every selected invoice."
        submitLabel={
          paymentMethod === "paystack" || paymentMethod === "monnify"
            ? `Continue with ${paymentMethod === "monnify" ? "Monnify" : "Paystack"}`
            : "Continue"
        }
        busy={batchBusy}
        wide
      >
        <div className="combined-payment-summary">
          <span>TOTAL TO PAY</span>
          <strong>
            {money(
              portal.invoices
                .filter((row) => selected.includes(row.id))
                .reduce(
                  (sum, row) =>
                    sum + Number(row.total) - Number(row.amount_paid),
                  0,
                ),
            )}
          </strong>
          <small>
            {selected
              .map((id) => portal.invoices.find((row) => row.id === id)?.number)
              .filter(Boolean)
              .join(" · ")}
          </small>
        </div>
        <div className="combined-section-heading">
          <strong>Choose a payment method</strong>
          <span>Select one option to continue.</span>
        </div>
        <div
          className="combined-methods"
          role="radiogroup"
          aria-label="Payment method"
        >
          {portal.payment_options.map((option) => {
            const Icon =
              option.kind === "gateway"
                ? Card
                : option.id === "transfer"
                  ? Bank
                  : Money;
            return (
              <button
                type="button"
                role="radio"
                aria-checked={paymentMethod === option.id}
                className={paymentMethod === option.id ? "active" : ""}
                key={option.id}
                onClick={() => setPaymentMethod(option.id)}
              >
                <Icon size={21} />
                <span>
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </span>
              </button>
            );
          })}
        </div>
        {paymentMethod === "paystack" || paymentMethod === "monnify" ? (
          <div className="payment-assurance">
            <ShieldTick size={22} />
            <div>
              <strong>Secure, automatically reconciled checkout</strong>
              <p>
                LemonBooks checks earlier {paymentMethod === "monnify" ? "Monnify" : "Paystack"} attempts before opening checkout. A completed payment is allocated across the selected invoices automatically.
              </p>
            </div>
          </div>
        ) : <div className="payment-assurance"><ShieldTick size={22}/><div><strong>{paymentMethod === "transfer" ? "Verified receiving account" : "Payment confirmation required"}</strong><p>Continue to provide the payment details. They will open in a separate, secure dialog.</p></div></div>}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </Modal>
      <Modal
        open={manualOpen}
        onClose={()=>!batchBusy&&setManualOpen(false)}
        onSubmit={submitManualPayment}
        title={paymentMethod === "transfer" ? "Confirm bank transfer" : "Confirm cash payment"}
        description={`Report one payment for ${selected.length} selected ${selected.length === 1 ? "invoice" : "invoices"}.`}
        submitLabel={paymentMethod === "transfer" ? "Submit transfer receipt" : "Submit cash payment"}
        busy={batchBusy}
      >
        <div className="form-stack">
          {paymentMethod === "transfer" && portal.transfer_account_number && <div className="transfer-destination"><span>TRANSFER TO</span><strong>{portal.transfer_bank_name}</strong><b>{portal.transfer_account_number}</b><small>{portal.transfer_account_name}</small><button type="button" className="secondary-button" onClick={()=>void navigator.clipboard.writeText(portal.transfer_account_number!)}><Copy size={16}/>Copy account number</button></div>}
          <div className="form-grid">
            <label className="span-2">Name of payer<input value={manual.payerName} onChange={event=>setManual({...manual,payerName:event.target.value})} required/></label>
            {paymentMethod === "cash" && <label className="span-2">Who received the cash?<input value={manual.paidTo} onChange={event=>setManual({...manual,paidTo:event.target.value})} required/></label>}
            <label>Date paid<input type="date" value={manual.paidAt} onChange={event=>setManual({...manual,paidAt:event.target.value})} required/></label>
            {paymentMethod === "transfer" && <label>Transfer receipt<input type="file" accept="image/*,.pdf" onChange={event=>setReceipt(event.target.files?.[0]??null)} required/></label>}
            <label className="span-2">Note <span className="optional">Optional</span><textarea rows={2} value={manual.note} onChange={event=>setManual({...manual,note:event.target.value})}/></label>
            <p className="payment-review-note span-2"><Warning2 size={18}/>{portal.business_name} will verify this once, then all selected invoices will update together.</p>
          </div>
          {error&&<p className="form-error" role="alert">{error}</p>}
        </div>
      </Modal>
    </main>
  );
}

function PortalLogin({
  form,
  setForm,
  error,
  busy,
  challenge,
  onRestart,
  onSubmit,
}: {
  form: { email: string; workspace: string; otp: string };
  setForm: (value: { email: string; workspace: string; otp: string }) => void;
  error: string;
  busy: boolean;
  challenge: string;
  onRestart: () => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <main className="client-login-page client-login-page--premium">
      <section>
        <span className="brand">
          <span className="brand-mark">L</span>LemonBooks
        </span>
        <div className="client-login-copy">
          <p className="eyebrow">CUSTOMER PORTAL</p>
          <h1>Invoices, payments, and statements—together.</h1>
          <p>
            {challenge
              ? `Enter the code sent to ${form.email}.`
              : "Sign in with a one-time email code. No password required."}
          </p>
        </div>
        <form onSubmit={onSubmit} className="form-stack">
          {!challenge && (
            <>
              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  autoComplete="email"
                  required
                />
              </label>
              <label>
                Business workspace
                <input
                  value={form.workspace}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      workspace: event.target.value.toLowerCase().trim(),
                    })
                  }
                  placeholder="business-workspace"
                  required
                />
                <small>The part before .lemonbooks.app</small>
              </label>
            </>
          )}
          {challenge && (
            <label>
              Verification code
              <input
                className="otp-input"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                value={form.otp}
                onChange={(event) =>
                  setForm({
                    ...form,
                    otp: event.target.value.replace(/\D/g, "").slice(0, 6),
                  })
                }
                placeholder="000000"
                autoFocus
                required
              />
            </label>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="primary-button"
            disabled={busy || Boolean(challenge && form.otp.length !== 6)}
          >
            {busy ? (
              "Opening your account…"
            ) : (
              <>
                {challenge ? "Verify and sign in" : "Email me a sign-in code"}{" "}
                <ArrowRight2 size={18} />
              </>
            )}
          </button>
          {challenge && (
            <button type="button" className="text-button" onClick={onRestart}>
              Use a different email or workspace
            </button>
          )}
        </form>
        <p className="portal-security">
          Your account is scoped to one business workspace. LemonBooks never
          exposes another business’s records.
        </p>
      </section>
      <aside>
        <div>
          <p className="eyebrow eyebrow--light">A CLEAR VIEW OF YOUR ACCOUNT</p>
          <h2>
            Know what’s due.
            <br />
            Pay with confidence.
          </h2>
          <ul>
            <li>
              <TickCircle size={19} />
              Open and pay invoices securely
            </li>
            <li>
              <TickCircle size={19} />
              Track payment verification
            </li>
            <li>
              <TickCircle size={19} />
              Download your account statement
            </li>
          </ul>
        </div>
      </aside>
    </main>
  );
}

function PortalHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="customer-page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}
function InvoiceCards({
  rows,
  money,
  expanded = false,
  selectable = false,
  selected = [],
  onSelect,
}: {
  rows: PortalInvoice[];
  money: (value: string | number, currency?: string) => string;
  expanded?: boolean;
  selectable?: boolean;
  selected?: string[];
  onSelect?: (id: string) => void;
}) {
  if (!rows.length)
    return (
      <div className="portal-empty">
        <span>
          <TickCircle size={24} />
        </span>
        <strong>You’re all caught up</strong>
        <p>No invoices match this view.</p>
      </div>
    );
  return (
    <div
      className={`portal-invoices ${expanded ? "portal-invoices--expanded" : ""}`}
    >
      {rows.map((row) => {
        const balance = Math.max(
          0,
          Number(row.total) - Number(row.amount_paid),
        );
        const pending = Number(row.pending_payment_count) > 0;
        const paid = balance === 0 || row.status === "paid";
        return (
          <article
            key={row.id}
            className={`${selected.includes(row.id) ? "selected" : ""} ${selectable && !paid && !pending ? "selectable" : ""}`}
          >
            {selectable && !paid && !pending && (
              <label className="portal-select">
                <input
                  type="checkbox"
                  checked={selected.includes(row.id)}
                  onChange={() => onSelect?.(row.id)}
                />
                <span className="sr-only">Select {row.number}</span>
              </label>
            )}
            <div className="portal-invoice-icon">
              <DocumentText size={20} />
            </div>
            <div>
              <Link to={`/pay/invoice/${row.public_token}`}>
                <strong>{row.number}</strong>
              </Link>
              <small>
                Issued {new Date(row.issue_date).toLocaleDateString()} · Due{" "}
                {row.due_date
                  ? new Date(row.due_date).toLocaleDateString()
                  : "on receipt"}
              </small>
            </div>
            <span
              className={`status status--${pending ? "pending" : paid ? "paid" : row.status}`}
            >
              {pending
                ? "awaiting review"
                : paid
                  ? "paid"
                  : row.status === "sent"
                    ? "unpaid"
                    : row.status}
            </span>
            <div className="portal-invoice-amount">
              <strong>{money(balance, row.currency)}</strong>
              <small>of {money(row.total, row.currency)}</small>
            </div>
            <Link
              className={
                paid
                  ? "secondary-button"
                  : "primary-button primary-button--compact"
              }
              to={`/pay/invoice/${row.public_token}`}
            >
              {paid ? "View" : "View & pay"}
              <ArrowRight2 size={15} />
            </Link>
          </article>
        );
      })}
    </div>
  );
}
function PaymentList({
  rows,
  money,
  expanded = false,
}: {
  rows: PortalPayment[];
  money: (value: string | number, currency?: string) => string;
  expanded?: boolean;
}) {
  if (!rows.length)
    return (
      <div className="portal-empty">
        <span>
          <Card size={24} />
        </span>
        <strong>No confirmed payments yet</strong>
        <p>Approved payments will appear here.</p>
      </div>
    );
  return (
    <div
      className={`portal-payments ${expanded ? "portal-payments--expanded" : ""}`}
    >
      {rows.map((row) => (
        <div key={row.id}>
          <span>
            <TickCircle size={18} />
          </span>
          <div>
            <strong>{row.invoice_number}</strong>
            <small>
              {new Date(row.received_at).toLocaleString()} · {row.method}
            </small>
          </div>
          <strong>{money(row.amount, row.currency)}</strong>
          {expanded && <small>{row.reference || "Confirmed payment"}</small>}
        </div>
      ))}
    </div>
  );
}
function Statement({
  portal,
  money,
}: {
  portal: Portal;
  money: (value: string | number, currency?: string) => string;
}) {
  let balance = 0;
  const entries = [
    ...portal.invoices.map((row) => ({
      id: `i-${row.id}`,
      date: row.issue_date,
      type: "Invoice",
      reference: row.number,
      debit: Number(row.total),
      credit: 0,
      currency: row.currency,
    })),
    ...portal.payments.map((row) => ({
      id: `p-${row.id}`,
      date: row.received_at,
      type: "Payment",
      reference: row.invoice_number,
      debit: 0,
      credit: Number(row.amount),
      currency: row.currency,
    })),
  ].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  return (
    <div className="table-wrap">
      <table className="statement-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Activity</th>
            <th>Reference</th>
            <th className="align-right">Debit</th>
            <th className="align-right">Credit</th>
            <th className="align-right">Balance</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            balance += entry.debit - entry.credit;
            return (
              <tr key={entry.id}>
                <td>{new Date(entry.date).toLocaleDateString()}</td>
                <td>
                  <span
                    className={`statement-type statement-type--${entry.type.toLowerCase()}`}
                  >
                    {entry.type}
                  </span>
                </td>
                <td>
                  <strong>{entry.reference}</strong>
                </td>
                <td className="align-right">
                  {entry.debit ? money(entry.debit, entry.currency) : "—"}
                </td>
                <td className="align-right">
                  {entry.credit ? money(entry.credit, entry.currency) : "—"}
                </td>
                <td className="align-right">
                  <strong>{money(balance, entry.currency)}</strong>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
