import { ArrowLeft2, Message, ShieldTick, TickCircle, Trash } from "iconsax-react";

export function DataDeletionPage() {
  return <main className="policy-page">
    <header className="policy-header">
      <a className="brand" href="/"><img className="brand-mark" src="/brand/lemonbooks-logo-mark.png" alt=""/><span>LemonBooks</span></a>
      <nav><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/data-deletion" aria-current="page">Data deletion</a></nav>
      <a href="mailto:privacy@lemonbooks.io">privacy@lemonbooks.io</a>
    </header>
    <section className="policy-hero">
      <span className="policy-icon"><Trash size={26}/></span>
      <p className="eyebrow">PRIVACY &amp; ACCOUNT CONTROL</p>
      <h1>Data deletion instructions</h1>
      <p>You can disconnect WhatsApp or ask LemonBooks to delete personal and business-account data associated with your account.</p>
      <small>Last updated: September 5, 2026</small>
    </section>
    <div className="policy-layout">
      <aside>
        <strong>On this page</strong>
        <a href="#disconnect">Disconnect WhatsApp</a>
        <a href="#request">Request deletion</a>
        <a href="#deleted">What we delete</a>
        <a href="#retention">Required retention</a>
        <a href="#confirmation">Confirmation</a>
      </aside>
      <article className="policy-content">
        <section className="policy-summary"><ShieldTick size={22}/><div><strong>Your request is handled securely</strong><p>We verify that the requester controls the relevant LemonBooks account before deleting data. Never send passwords, access tokens, payment-card details, or government identification by email unless our privacy team specifically requests a secure verification method.</p></div></section>

        <section id="disconnect"><span className="policy-step">1</span><div><h2>Disconnect WhatsApp Business</h2><p>An owner or administrator can request disconnection by emailing <a href="mailto:privacy@lemonbooks.io?subject=Disconnect%20WhatsApp%20from%20LemonBooks">privacy@lemonbooks.io</a> from the email address associated with the LemonBooks business account.</p><p>Use the subject <strong>“Disconnect WhatsApp from LemonBooks”</strong> and include:</p><ul><li>Your LemonBooks business or workspace name</li><li>The email address used to administer the workspace</li><li>The WhatsApp business phone number being disconnected</li></ul><p>Disconnection revokes LemonBooks’ active connection and stops new messages and webhook events from being processed for that business. It does not automatically delete accounting records.</p></div></section>

        <section id="request"><span className="policy-step">2</span><div><h2>Request deletion of your data</h2><p>Send a request to <a href="mailto:privacy@lemonbooks.io?subject=LemonBooks%20data%20deletion%20request">privacy@lemonbooks.io</a> using the subject <strong>“LemonBooks data deletion request.”</strong></p><p>Include your account email and business/workspace name, identify whether you want the complete account deleted or only WhatsApp integration data, and provide a safe contact method for confirmation. If a customer is requesting deletion of a conversation, include the phone number used in that conversation and the name of the LemonBooks business involved.</p><p>We may ask for additional account-level verification. We will not ask for your password.</p></div></section>

        <section id="deleted"><span className="policy-step">3</span><div><h2>What is deleted</h2><p>Depending on the scope of the verified request, deletion may include:</p><ul><li>WhatsApp integration credentials and connection identifiers</li><li>WhatsApp contacts, conversations, message content and delivery events held by LemonBooks</li><li>Message templates and automation execution history associated with the disconnected integration</li><li>User profile and workspace-access information</li><li>Other personal information not required for legal, security or accounting purposes</li></ul><p>Deleting data from LemonBooks does not delete information independently retained by Meta, WhatsApp, the merchant, a payment provider, a bank, or another third party. Contact those organizations directly regarding data they control.</p></div></section>

        <section id="retention"><span className="policy-step">4</span><div><h2>Information we may retain</h2><p>Some information may be retained when reasonably necessary to meet legal, tax, accounting, fraud-prevention, dispute-resolution, security or regulatory obligations. Where possible, retained information is restricted, minimized or de-identified and is no longer used for ordinary product activity.</p><p>Deleting a WhatsApp connection does not automatically delete invoices, payments, reconciliations or other financial records that a business must retain.</p></div></section>

        <section id="confirmation"><span className="policy-step">5</span><div><h2>Timing and confirmation</h2><p>We acknowledge verified deletion requests and aim to complete them within 30 days. If applicable law permits or requires additional time, we will explain the reason and provide an updated timeframe.</p><p>After completion, we send confirmation to the verified contact address. Backup copies may remain for a limited period until overwritten through normal backup rotation, while remaining protected from ordinary use.</p></div></section>

        <section className="policy-contact"><Message size={24}/><div><h2>Questions or deletion requests</h2><p>Email <a href="mailto:privacy@lemonbooks.io">privacy@lemonbooks.io</a>. If that address is unavailable, contact <a href="mailto:support@lemonbooks.io">support@lemonbooks.io</a>.</p></div></section>
      </article>
    </div>
    <footer className="policy-footer"><span>© 2026 LemonBooks</span><a href="/privacy">Privacy policy</a><a href="/terms">Terms of service</a><a href="/"><ArrowLeft2 size={15}/>Return to LemonBooks</a><span><TickCircle size={15}/>Public deletion instructions</span></footer>
  </main>;
}
