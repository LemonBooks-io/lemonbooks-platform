import { ArrowRight2, Bank, Box, MessageText1, Receipt2, ShieldTick, TickCircle, Wallet3 } from "iconsax-react";

const capabilities = [
  { icon: Receipt2, title: "Invoices that get paid", copy: "Create polished invoices, offer the right payment options, and automatically keep every payment connected to the right customer." },
  { icon: Bank, title: "Reconciliation without the chase", copy: "Bring transfers, gateway payments, cash, and bank activity into one reliable operating picture." },
  { icon: Box, title: "Inventory that keeps up", copy: "Know what is moving, what is running low, and what needs restocking before it slows the business down." },
  { icon: MessageText1, title: "Business through WhatsApp", copy: "Connect customer conversations to orders, invoices, payments, and support without losing the human relationship." },
];

export function PublicSitePage() {
  return <main className="site-page">
    <header className="site-nav">
      <a className="brand" href="/" aria-label="LemonBooks home"><img className="brand-mark" src="/brand/lemonbooks-logo-mark.png" alt=""/><span>LemonBooks</span></a>
      <nav aria-label="Main navigation"><a href="#product">Product</a><a href="#how-it-works">How it works</a><a href="#security">Security</a></nav>
      <div><a className="site-link" href="/login">Sign in</a><a className="site-button site-button--small" href="/login?mode=signup">Get started <ArrowRight2 size={17}/></a></div>
    </header>

    <section className="site-hero">
      <div className="site-hero__copy">
        <span className="site-pill"><span/> Built for businesses moving every day</span>
        <h1>Run the business.<br/><em>See the whole picture.</em></h1>
        <p>LemonBooks connects invoices, payments, inventory, reconciliation, and customer conversations in one calm workspace—designed for how business really happens.</p>
        <div className="site-actions"><a className="site-button" href="/login?mode=signup">Create your workspace <ArrowRight2 size={19}/></a><a className="site-text-link" href="#product">Explore LemonBooks</a></div>
        <div className="site-proof"><span><TickCircle size={18}/> Clear setup</span><span><TickCircle size={18}/> Multi-channel payments</span><span><TickCircle size={18}/> Built for growing teams</span></div>
      </div>
      <div className="site-hero__visual" aria-label="LemonBooks business overview preview">
        <div className="site-preview-top"><span><i/> Business overview</span><small>Today</small></div>
        <div className="site-preview-balance"><small>NET CASH POSITION</small><strong>₦8,420,750</strong><span>+12.8% this month</span></div>
        <div className="site-preview-grid">
          <article><span className="site-preview-icon"><Wallet3 size={20}/></span><small>Collected</small><strong>₦12.6m</strong><em>Across all channels</em></article>
          <article><span className="site-preview-icon"><Receipt2 size={20}/></span><small>Outstanding</small><strong>₦2.4m</strong><em>8 open invoices</em></article>
        </div>
        <div className="site-preview-chart"><div><span>Cash flow</span><strong>Healthy</strong></div><svg viewBox="0 0 500 150" role="img" aria-label="Rising cash flow chart"><defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d9ee55" stopOpacity=".45"/><stop offset="1" stopColor="#d9ee55" stopOpacity="0"/></linearGradient></defs><path d="M0 130 C45 118,55 78,105 94 S165 130,205 87 S265 49,305 67 S370 98,410 51 S465 35,500 12 L500 150 L0 150Z" fill="url(#chart-fill)"/><path d="M0 130 C45 118,55 78,105 94 S165 130,205 87 S265 49,305 67 S370 98,410 51 S465 35,500 12" fill="none" stroke="#d9ee55" strokeWidth="5" strokeLinecap="round"/></svg></div>
        <div className="site-float-card"><span><MessageText1 size={20}/></span><div><small>WhatsApp order captured</small><strong>Invoice draft ready</strong></div><TickCircle size={19}/></div>
      </div>
    </section>

    <section className="site-strip"><span>ONE OPERATING PICTURE</span><strong>Invoices</strong><i/> <strong>Payments</strong><i/> <strong>Banking</strong><i/> <strong>Inventory</strong><i/> <strong>WhatsApp</strong></section>

    <section className="site-section" id="product">
      <div className="site-section__intro"><p className="site-kicker">THE BUSINESS SYSTEM OF RECORD</p><h2>Less fragmentation.<br/>More confident decisions.</h2><p>Every workflow is designed to remove uncertainty without adding accounting complexity.</p></div>
      <div className="site-capability-grid">{capabilities.map(({ icon: Icon, title, copy }, index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><div className="site-capability-icon"><Icon size={24}/></div><h3>{title}</h3><p>{copy}</p><a href="/login?mode=signup">Set up your workspace <ArrowRight2 size={16}/></a></article>)}</div>
    </section>

    <section className="site-workflow" id="how-it-works">
      <div><p className="site-kicker">FROM ACTIVITY TO CLARITY</p><h2>Your operations stay connected.</h2><p>A sale should not create five separate admin tasks. LemonBooks keeps the customer, invoice, payment, stock movement, and reconciliation trail together.</p><a className="site-button site-button--light" href="/login?mode=signup">Start with LemonBooks <ArrowRight2 size={18}/></a></div>
      <ol><li><span>1</span><div><strong>Capture</strong><p>Create an invoice or receive an order from the channel your customer already uses.</p></div></li><li><span>2</span><div><strong>Collect</strong><p>Offer connected payment methods and retain a clear trail for cash and transfers.</p></div></li><li><span>3</span><div><strong>Reconcile</strong><p>Match activity, surface exceptions, and keep balances dependable.</p></div></li><li><span>4</span><div><strong>Act</strong><p>See what is due, what needs restocking, and what deserves attention next.</p></div></li></ol>
    </section>

    <section className="site-trust" id="security"><div className="site-trust__icon"><ShieldTick size={32}/></div><div><p className="site-kicker">SECURITY BY DESIGN</p><h2>Your financial operations deserve careful infrastructure.</h2></div><div className="site-trust__points"><span><strong>Protected credentials</strong><small>Sensitive integration credentials are encrypted and never exposed in the interface.</small></span><span><strong>Controlled access</strong><small>Workspace access, tenant boundaries, and auditable activity protect business information.</small></span><span><strong>You stay in control</strong><small>Clear privacy and deletion processes support responsible handling of account data.</small></span></div></section>

    <section className="site-cta"><p className="site-kicker">A CLEARER BUSINESS STARTS HERE</p><h2>Bring every moving part<br/>into one dependable view.</h2><p>Set up your LemonBooks workspace and build a cleaner operating rhythm from day one.</p><a className="site-button" href="/login?mode=signup">Create your workspace <ArrowRight2 size={19}/></a></section>

    <footer className="site-footer"><div><a className="brand brand--light" href="/"><img className="brand-mark" src="/brand/lemonbooks-logo-mark.png" alt=""/><span>LemonBooks</span></a><p>Financial operations and reconciliation for ambitious businesses.</p></div><div><strong>Product</strong><a href="#product">Capabilities</a><a href="#how-it-works">How it works</a><a href="/login">Sign in</a></div><div><strong>Legal</strong><a href="/privacy">Privacy policy</a><a href="/terms">Terms of service</a><a href="/data-deletion">Data deletion</a></div><div><strong>Support</strong><a href="mailto:support@lemonbooks.io">Contact support</a><a href="mailto:privacy@lemonbooks.io">Privacy contact</a></div><small>© 2026 LemonBooks. All rights reserved.</small></footer>
  </main>;
}
