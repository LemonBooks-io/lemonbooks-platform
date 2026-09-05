import { FormEvent, useState } from "react";
import { ArrowLeft2, ArrowRight2, Building4, Eye, EyeSlash, Lock1, TickCircle } from "iconsax-react";
import { post } from "../lib/api";
import type { Session } from "../lib/types";
import { useSession } from "../context/SessionContext";

type Mode = "login" | "signup" | "verify";
type Challenge = { challengeId: string; tenantSlug: string; email: string; expiresAt: string; devOtp?: string };

export function AuthPage() {
  const { setSession } = useSession();
  const [mode, setMode] = useState<Mode>(() => new URLSearchParams(window.location.search).get("mode") === "signup" ? "signup" : "login");
  const [form, setForm] = useState({ name: "", email: "", password: "", businessName: "", tenantSlug: "", otp: "" });
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function update(field: keyof typeof form, value: string) { setForm((current) => ({ ...current, [field]: value })); setError(""); }

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      if (mode === "login") {
        const session = await post<Session>("/auth/login", { email: form.email, password: form.password, tenantSlug: form.tenantSlug || undefined });
        setSession(session);
      } else if (mode === "signup") {
        const next = await post<Challenge>("/auth/signup", { name: form.name, email: form.email, password: form.password, businessName: form.businessName });
        setChallenge(next); setMode("verify");
      } else if (challenge) {
        const session = await post<Session & { nextStep: string }>("/auth/signup/verify", { challengeId: challenge.challengeId, otp: form.otp });
        setSession(session);
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setBusy(false); }
  }

  const signup = mode === "signup";
  return (
    <main className="auth-page">
      <section className="auth-story">
        <a className="brand brand--light" href="/" aria-label="LemonBooks home"><span className="brand-mark">L</span><span>LemonBooks</span></a>
        <div className="auth-story__content">
          <p className="eyebrow eyebrow--light">BUILT FOR HOW BUSINESS REALLY HAPPENS</p>
          <h1>Every payment.<br />One clear picture.</h1>
          <p>Bring cash, transfers, POS sales, invoices, inventory, and expenses together—even when connectivity is unreliable.</p>
          <div className="auth-benefits">
            <span><TickCircle size={20} /> One workspace for every payment rail</span>
            <span><TickCircle size={20} /> Simple books without accounting jargon</span>
            <span><TickCircle size={20} /> Offline-ready architecture for mobile</span>
          </div>
        </div>
        <p className="auth-story__foot">Know what came in, what went out, and what comes next.</p>
      </section>

      <section className="auth-form-wrap">
        <div className="auth-form-card">
          {mode === "verify" ? (
            <>
              <button className="text-button back-button" onClick={() => { setMode("signup"); setForm((f) => ({ ...f, otp: "" })); }}><ArrowLeft2 size={18} /> Change details</button>
              <div className="auth-icon"><Lock1 size={25} /></div>
              <p className="eyebrow">SECURE SIGN UP</p>
              <h2>Verify your email</h2>
              <p className="muted">We sent a 6-digit code to <strong>{challenge?.email}</strong>.</p>
              <div className="tenant-preview"><Building4 size={20} /><span>Your workspace</span><strong>{challenge?.tenantSlug}.lemonbooks.app</strong></div>
              {challenge?.devOtp && <div className="dev-code"><span>Development code</span><strong>{challenge.devOtp}</strong></div>}
              <form onSubmit={submit}>
                <label>Verification code<input autoFocus className="otp-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={form.otp} onChange={(e) => update("otp", e.target.value.replace(/\D/g, ""))} placeholder="000000" /></label>
                {error && <p className="form-error">{error}</p>}
                <button className="primary-button" disabled={busy || form.otp.length !== 6}>{busy ? "Creating your workspace…" : <>Verify and create business <ArrowRight2 size={18} /></>}</button>
              </form>
            </>
          ) : (
            <>
              <div className="mobile-brand"><span className="brand-mark">L</span><strong>LemonBooks</strong></div>
              <p className="eyebrow">{signup ? "START YOUR BUSINESS WORKSPACE" : "WELCOME BACK"}</p>
              <h2>{signup ? "Create your business account" : "Sign in to LemonBooks"}</h2>
              <p className="muted">{signup ? "No administrator needed. Your workspace is created as soon as you verify your email." : "Continue to your business workspace."}</p>
              <div className="auth-switch"><button className={!signup ? "active" : ""} onClick={() => setMode("login")}>Sign in</button><button className={signup ? "active" : ""} onClick={() => setMode("signup")}>Create account</button></div>
              <form onSubmit={submit} className="form-stack">
                {signup && <label>Your name<input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Ada Okafor" autoComplete="name" required /></label>}
                {signup && <label>Business name<input value={form.businessName} onChange={(e) => update("businessName", e.target.value)} placeholder="Ada's Market" required /><small>This becomes your unique workspace ID.</small></label>}
                <label>Email address<input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@business.com" autoComplete="email" required /></label>
                {!signup && <label>Workspace ID <span className="optional">Optional</span><div className="input-suffix"><input value={form.tenantSlug} onChange={(e) => update("tenantSlug", e.target.value.toLowerCase())} placeholder="adas-market" /><span>.lemonbooks.app</span></div></label>}
                <label>Password<div className="password-input"><input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder={signup ? "At least 8 characters" : "Your password"} autoComplete={signup ? "new-password" : "current-password"} minLength={8} required /><button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeSlash size={19} /> : <Eye size={19} />}</button></div></label>
                {error && <p className="form-error">{error}</p>}
                <button className="primary-button" disabled={busy}>{busy ? "Please wait…" : <>{signup ? "Continue to verification" : "Sign in"}<ArrowRight2 size={18} /></>}</button>
              </form>
              {signup && <p className="legal">By continuing, you agree to the LemonBooks <a href="/terms" target="_blank" rel="noreferrer">Terms of Service</a> and acknowledge the <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.</p>}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
