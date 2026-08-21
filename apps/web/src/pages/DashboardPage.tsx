import { useEffect, useMemo, useState } from "react";
import { ArrowRight2, Card, DocumentText, MoneyRecive, People, TickCircle, Warning2, WalletMoney } from "iconsax-react";
import { Link } from "react-router-dom";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { useSession } from "../context/SessionContext";
import { api } from "../lib/api";
import type { Invoice, Summary } from "../lib/types";

type Claim = { id: string; amount: string; method: string; status: string; invoice_number: string; payer_name: string; paid_at: string };
const emptySummary: Summary = { clients: 0, items: 0, invoices: 0, outstanding: 0, receivedThisMonth: 0 };

export function DashboardPage() {
  const { session } = useSession();
  const [summary, setSummary] = useState(emptySummary); const [invoices, setInvoices] = useState<Invoice[]>([]); const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const summaryRequest = api<Summary>("/business/summary", {}, session!.token).then((value) => ({ value })).catch(() => ({ value: null }));
    const invoiceRequest = api<Invoice[]>("/resources/invoices", {}, session!.token).then((value) => ({ value })).catch(() => ({ value: null }));
    const claimRequest = api<Claim[]>("/payment-claims", {}, session!.token).then((value) => ({ value })).catch(() => ({ value: null }));
    Promise.all([summaryRequest, invoiceRequest, claimRequest]).then(([summaryResult, invoiceResult, claimResult]) => {
      if (!active) return;
      if (summaryResult.value) setSummary(summaryResult.value); else setError("Some business totals could not be loaded.");
      if (invoiceResult.value) setInvoices(invoiceResult.value); else setError("Some recent activity could not be loaded.");
      if (claimResult.value) setClaims(claimResult.value);
      setLoading(false);
    });
    return () => { active = false; };
  }, [session]);

  const currency = session!.business.currency ?? "NGN";
  const money = (value: number | string) => new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(value));
  const pendingClaims = claims.filter((claim) => claim.status === "pending"); const overdue = invoices.filter((invoice) => invoice.status === "overdue");
  const collectionRate = summary.receivedThisMonth + summary.outstanding > 0 ? Math.round((summary.receivedThisMonth / (summary.receivedThisMonth + summary.outstanding)) * 100) : 0;
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date());
  const recent = useMemo(() => [
    ...claims.map((claim) => ({ id: `claim-${claim.id}`, date: claim.paid_at, title: claim.payer_name || "Customer payment", detail: `${claim.method} · ${claim.invoice_number}`, amount: Number(claim.amount), status: claim.status })),
    ...invoices.map((invoice) => ({ id: `invoice-${invoice.id}`, date: invoice.created_at, title: invoice.client_name || "Walk-in customer", detail: `Invoice ${invoice.number}`, amount: Number(invoice.total), status: invoice.status })),
  ].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 6), [claims, invoices]);

  return <WorkspaceShell title={`Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, ${session!.user.name.split(" ")[0]}`} description="Here’s the clearest view of your money right now." action={<Link className="primary-button primary-button--compact" to="/invoices/new"><DocumentText size={18}/>Create invoice</Link>}>
    <div className="overview-period"><span className="status-dot"/><strong>{monthLabel}</strong><span>Updated from confirmed activity</span></div>
    {error && <div className="page-alert"><span><strong>Part of your overview is unavailable</strong><small>{error}</small></span><button onClick={() => window.location.reload()}>Retry</button></div>}
    <section className="money-grid" aria-label="Business money summary">
      <article className="money-card money-card--primary"><span className="money-card__icon"><MoneyRecive size={21}/></span><div><p>Money in</p><strong>{loading ? "—" : money(summary.receivedThisMonth)}</strong><small>Confirmed this month</small></div></article>
      <article className="money-card"><span className="money-card__icon money-card__icon--amber"><Card size={21}/></span><div><p>Money to collect</p><strong>{loading ? "—" : money(summary.outstanding)}</strong><small>Across unpaid invoices</small></div></article>
      <article className="money-card"><span className="money-card__icon money-card__icon--blue"><WalletMoney size={21}/></span><div><p>Collection progress</p><strong>{loading ? "—" : `${collectionRate}%`}</strong><small>Received versus currently outstanding</small></div></article>
    </section>
    <section className="overview-grid">
      <article className="panel attention-panel"><header><div><p className="section-kicker">Action centre</p><h2>Needs your attention</h2><p>Resolve the few things holding up your money.</p></div><span className="attention-count">{pendingClaims.length + overdue.length}</span></header><div className="attention-list">
        {pendingClaims.length > 0 && <Link to="/transactions"><span className="attention-icon attention-icon--warning"><Warning2 size={20}/></span><div><strong>{pendingClaims.length} payment {pendingClaims.length === 1 ? "report needs" : "reports need"} review</strong><small>{money(pendingClaims.reduce((sum, claim) => sum + Number(claim.amount), 0))} waiting for a decision</small></div><span className="attention-action">Review <ArrowRight2 size={15}/></span></Link>}
        {overdue.length > 0 && <Link to="/invoices"><span className="attention-icon attention-icon--danger"><DocumentText size={20}/></span><div><strong>{overdue.length} overdue {overdue.length === 1 ? "invoice" : "invoices"}</strong><small>{money(overdue.reduce((sum, invoice) => sum + Math.max(0, Number(invoice.total) - Number(invoice.amount_paid)), 0))} still to collect</small></div><span className="attention-action">View <ArrowRight2 size={15}/></span></Link>}
        {!loading && !pendingClaims.length && !overdue.length && <div className="attention-clear"><span><TickCircle size={23}/></span><div><strong>You’re all caught up</strong><small>No overdue invoices or payment reports need review.</small></div></div>}
      </div></article>
      <article className="panel snapshot-panel"><header><div><p className="section-kicker">Business snapshot</p><h2>Your workspace</h2></div></header><div className="snapshot-list"><Link to="/invoices"><span><DocumentText size={18}/>Invoices</span><strong>{loading ? "—" : summary.invoices}</strong></Link><Link to="/clients"><span><People size={18}/>Clients</span><strong>{loading ? "—" : summary.clients}</strong></Link><Link to="/transactions"><span><Card size={18}/>Payments to review</span><strong>{loading ? "—" : pendingClaims.length}</strong></Link></div></article>
    </section>
    <section className="panel activity-feed"><header><div><p className="section-kicker">Money movement</p><h2>Recent activity</h2><p>Invoices and customer-reported payments in one place.</p></div><Link to="/transactions">View payments <ArrowRight2 size={15}/></Link></header>{loading ? <div className="table-skeleton">{[1,2,3].map((row) => <span key={row}/>)}</div> : recent.length ? <div className="activity-list">{recent.map((item) => <div className="activity-row" key={item.id}><span className={`activity-marker activity-marker--${item.status}`}><TickCircle size={18}/></span><div><strong>{item.title}</strong><small>{item.detail} · {new Date(item.date).toLocaleDateString()}</small></div><strong>{money(item.amount)}</strong><span className={`status status--${item.status}`}>{item.status.replace("_", " ")}</span></div>)}</div> : <div className="attention-clear attention-clear--large"><span><MoneyRecive size={24}/></span><div><strong>Your activity will appear here</strong><small>Create an invoice to start tracking its journey from payment to reconciliation.</small></div></div>}</section>
  </WorkspaceShell>;
}
