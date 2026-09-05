import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { post } from "../lib/api";
import { useSession } from "../context/SessionContext";
import type { Session } from "../lib/types";

type Verified = { proof: string; existing: boolean; workspaces: {id:string;name:string}[] };
export function WhatsAppAuthPage() {
  const navigate = useNavigate();
  const { setSession } = useSession();
  const [whatsappLinkToken] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get("whatsapp_link"));
  const [phone,setPhone] = useState("");
  const [otp,setOtp] = useState("");
  const [verified,setVerified] = useState<Verified|null>(null);
  const [businessId,setBusinessId] = useState("");
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  const [form,setForm] = useState({name:"",businessName:"",address:"",countryCode:"NG",currency:"NGN",timezone:"Africa/Lagos"});
  async function run(action:()=>Promise<void>) {
    setBusy(true); setError("");
    try { await action(); } catch(e) { setError(e instanceof Error ? e.message : "Please try again."); }
    finally { setBusy(false); }
  }
  async function send() { await run(async()=> {
    const result = await post<{phone:string}>("/auth/whatsapp/code",{whatsappLinkToken});
    setPhone(result.phone); setOtp("");
  }); }
  async function finish(proof:string,id?:string) {
    const session = await post<Session>("/auth/whatsapp/finish",{whatsappLinkToken,proof,businessId:id,...form});
    navigate("/",{replace:true}); setSession(session);
  }
  function submit(e:FormEvent) { e.preventDefault(); void run(async()=> {
    if (!verified) {
      const result = await post<Verified>("/auth/whatsapp/verify",{whatsappLinkToken,otp});
      setVerified(result); setBusinessId(result.workspaces[0]?.id ?? "");
      if (result.existing && result.workspaces.length===1) await finish(result.proof,result.workspaces[0].id);
    } else await finish(verified.proof,businessId);
  }); }
  return <main className="auth-form-wrap" style={{minHeight:"100vh"}}><section className="auth-form-card">
    <img className="brand-mark" src="/brand/lemonbooks-logo-mark.png" alt="LemonBooks"/>
    <p className="eyebrow">WHATSAPP · SECURE ACCESS</p>
    <h1>{verified ? verified.existing ? "Welcome back" : "Tell us about your business" : phone ? "Check your WhatsApp" : "Welcome to LemonBooks"}</h1>
    <p>{verified ? "Your WhatsApp number is verified. No password or email is required." : "We’ll send a one-time code to the WhatsApp number that received this private link. Enter it here, never in the chat."}</p>
    {!phone ? <button className="primary-button" disabled={busy} onClick={send}>{busy?"Sending…":"Send code to my WhatsApp"}</button> :
    <form onSubmit={submit}>
      {!verified ? <><label>Verification code · {phone}<input autoFocus inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,""))} required/></label><p className="muted">The code expires in 10 minutes.</p></> :
      verified.existing ? <label>Workspace<select value={businessId} onChange={e=>setBusinessId(e.target.value)} required><option value="">Choose workspace</option>{verified.workspaces.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select></label> :
      <div className="form-grid">
        <label>Your name<input autoComplete="name" maxLength={120} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></label>
        <label>Business name<input autoComplete="organization" maxLength={160} value={form.businessName} onChange={e=>setForm({...form,businessName:e.target.value})} required/></label>
        <label className="span-2">Business address (optional)<textarea maxLength={500} value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></label>
        <label>Country<select value={form.countryCode} onChange={e=>setForm({...form,countryCode:e.target.value})}>{[["NG","Nigeria"],["GH","Ghana"],["KE","Kenya"],["ZA","South Africa"],["US","United States"],["GB","United Kingdom"]].map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
        <label>Currency<select value={form.currency} onChange={e=>setForm({...form,currency:e.target.value})}>{["NGN","GHS","KES","ZAR","USD","GBP","EUR"].map(c=><option key={c}>{c}</option>)}</select></label>
        <label className="span-2">Timezone<select value={form.timezone} onChange={e=>setForm({...form,timezone:e.target.value})}>{["Africa/Lagos","Africa/Accra","Africa/Nairobi","Africa/Johannesburg","America/New_York","Europe/London"].map(t=><option key={t}>{t}</option>)}</select></label>
      </div>}
      <button className="primary-button" disabled={busy}>{busy?"Please wait…":!verified?"Verify and continue":verified.existing?"Open workspace":"Finish and open workspace"}</button>
      {!verified && <button className="text-button" type="button" disabled={busy} onClick={send}>Resend code</button>}
    </form>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <p className="muted">By continuing, you agree to our <a href="/terms" target="_blank" rel="noreferrer">Terms</a> and <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.</p>
  </section></main>;
}
