import type { ReactNode } from "react";
import { Lock1, MessageText1, ShieldTick } from "iconsax-react";

export function WhatsAppAccessShell({ children }: { children: ReactNode }) {
  return <main className="auth-page whatsapp-access-page">
    <section className="auth-story whatsapp-access-story">
      <a className="brand brand--light" href="/" aria-label="LemonBooks home">
        <img className="brand-mark" src="/brand/lemonbooks-logo-mark.png" alt=""/>
        <span>LemonBooks</span>
      </a>
      <div className="auth-story__content">
        <p className="eyebrow eyebrow--light">LEMON ON WHATSAPP</p>
        <h1>Your business,<br/>one chat away.</h1>
        <p>Open your workspace securely from the official LemonBooks chat. No password to remember and no code to copy.</p>
        <div className="whatsapp-access-steps" aria-label="How secure WhatsApp access works">
          <span><MessageText1 size={21}/><b>Request</b><small>Send LOGIN or CONNECT to Lemon.</small></span>
          <span><Lock1 size={21}/><b>Verify</b><small>Use the private, one-time link.</small></span>
          <span><ShieldTick size={21}/><b>Continue</b><small>Open only the workspace you can access.</small></span>
        </div>
      </div>
      <p className="auth-story__foot">Private links expire after 10 minutes and work once.</p>
    </section>
    <section className="auth-form-wrap whatsapp-access-wrap">
      <div className="whatsapp-access-card">
        <a className="mobile-brand whatsapp-access-mobile-brand" href="/" aria-label="LemonBooks home">
          <img className="brand-mark" src="/brand/lemonbooks-logo-mark.png" alt=""/>
          <strong>LemonBooks</strong>
        </a>
        {children}
        <footer className="whatsapp-access-security"><ShieldTick size={18}/><span><strong>Private and time limited</strong><small>LemonBooks never asks for your password in WhatsApp.</small></span></footer>
      </div>
    </section>
  </main>;
}
