import { FormEvent, useState } from "react";
import { ArrowRight2, Building4, Card, TickCircle } from "iconsax-react";
import { patch } from "../lib/api";
import type { Business } from "../lib/types";
import { useSession } from "../context/SessionContext";

const currencies = [
  ["NGN", "Nigerian naira"], ["GHS", "Ghanaian cedi"], ["KES", "Kenyan shilling"], ["ZAR", "South African rand"],
  ["USD", "US dollar"], ["GBP", "British pound"], ["EUR", "Euro"], ["KWD", "Kuwaiti dinar"],
];

export function OnboardingPage() {
  const { session, updateBusiness } = useSession();
  const business = session!.business;
  const [form, setForm] = useState({ name: business.name, phone: business.phone ?? "", address: business.address ?? "", countryCode: business.countryCode ?? "NG", currency: business.currency ?? "NGN", timezone: business.timezone ?? "Africa/Lagos" });
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { updateBusiness(await patch<Business>("/business/me", form, session!.token)); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not save your business"); }
    finally { setBusy(false); }
  }
  return <main className="onboarding-page">
    <header className="onboarding-header"><img className="brand-mark" src="/brand/lemonbooks-logo-mark.png" alt="LemonBooks"/><strong>LemonBooks</strong><span className="step-label">Workspace setup · 1 of 1</span></header>
    <section className="onboarding-layout">
      <div className="onboarding-copy">
        <p className="eyebrow">MAKE LEMONBOOKS YOURS</p><h1>A few details, then you’re ready.</h1>
        <p>This information appears on invoices and helps LemonBooks format money and dates correctly.</p>
        <div className="setup-summary"><div><Building4 size={22} /><span>Workspace</span><strong>{business.tenantSlug}.lemonbooks.app</strong></div><div><TickCircle size={22} /><span>Owner</span><strong>{session!.user.email}</strong></div></div>
      </div>
      <form className="setup-card" onSubmit={submit}>
        <div className="setup-card__heading"><div className="auth-icon"><Building4 size={24} /></div><div><h2>Business details</h2><p>You can change these later in Settings.</p></div></div>
        <div className="form-grid"><label className="span-2">Business name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <label>Phone number<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+234 800 000 0000" /></label>
          <label>Country<select value={form.countryCode} onChange={(e) => setForm({ ...form, countryCode: e.target.value })}><option value="NG">Nigeria</option><option value="GH">Ghana</option><option value="KE">Kenya</option><option value="ZA">South Africa</option><option value="GB">United Kingdom</option><option value="US">United States</option></select></label>
          <label className="span-2">Business address<textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, city, state" rows={3} /></label>
          <label>Primary currency<select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>{currencies.map(([code, name]) => <option key={code} value={code}>{code} — {name}</option>)}</select></label>
          <label>Timezone<select value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}><option>Africa/Lagos</option><option>Africa/Accra</option><option>Africa/Nairobi</option><option>Africa/Johannesburg</option><option>Europe/London</option></select></label>
        </div>
        <div className="provider-preview"><span className="provider-icon"><Card size={22} /></span><span><strong>Paystack payments</strong><small>Virtual POS and online payments are coming soon.</small></span><button type="button" disabled>Coming soon</button></div>
        {error && <p className="form-error">{error}</p>}
        <button className="primary-button" disabled={busy}>{busy ? "Saving…" : <>Open my workspace <ArrowRight2 size={18} /></>}</button>
      </form>
    </section>
  </main>;
}
