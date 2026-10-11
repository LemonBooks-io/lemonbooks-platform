import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight2, Lock1, Refresh2, Whatsapp } from "iconsax-react";
import { api, post } from "../lib/api";
import { useSession } from "../context/SessionContext";
import type { Session } from "../lib/types";
import { WhatsAppAccessShell } from "../components/WhatsAppAccessShell";

type Verified = { proof: string; existing: true; workspaces: {id:string;name:string}[] };
type WhatsAppEntry = { available:boolean; signInUrl:string|null };

export function WhatsAppAuthPage() {
  const navigate = useNavigate();
  const { setSession } = useSession();
  const started = useRef(false);
  const [whatsappLoginToken] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get("whatsapp_login"));
  const [verified,setVerified] = useState<Verified|null>(null);
  const [businessId,setBusinessId] = useState("");
  const [busy,setBusy] = useState(true);
  const [error,setError] = useState("");
  const [assistantUrl,setAssistantUrl] = useState<string|null>(null);

  async function finish(proof:string,id:string) {
    const session = await post<Session>("/auth/whatsapp/finish",{whatsappLinkToken:whatsappLoginToken,proof,businessId:id});
    setSession(session);
    navigate("/",{replace:true});
  }

  useEffect(() => {
    void api<WhatsAppEntry>("/auth/whatsapp/entry").then(result=>setAssistantUrl(result.signInUrl)).catch(()=>undefined);
    if (started.current) return;
    started.current = true;
    void (async () => {
      try {
        if (!whatsappLoginToken) throw new Error("This WhatsApp sign-in link is incomplete. Request a new one in your LemonBooks chat.");
        const result = await post<Verified>("/auth/whatsapp/magic",{whatsappLoginToken});
        setVerified(result);
        setBusinessId(result.workspaces[0]?.id ?? "");
        if (result.workspaces.length === 1) await finish(result.proof,result.workspaces[0]!.id);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "This sign-in link could not be used.");
      } finally { setBusy(false); }
    })();
  }, [whatsappLoginToken]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!verified || !businessId) return;
    setBusy(true); setError("");
    try { await finish(verified.proof,businessId); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "This sign-in link could not be used."); setBusy(false); }
  }

  const chooseWorkspace=!busy&&!error&&verified&&verified.workspaces.length>1;
  return <WhatsAppAccessShell><div className="whatsapp-access-heading">
    <span className={`whatsapp-access-icon ${error?"is-error":""}`}>{error?<Refresh2 size={25}/>:<Lock1 size={25}/>}</span>
    <p className="eyebrow">WHATSAPP · SECURE ACCESS</p>
    <h1>{error?"This link is no longer available":chooseWorkspace?"Choose your business":"Opening LemonBooks"}</h1>
    <p>{error?"Request a fresh private link from the official LemonBooks WhatsApp chat.":chooseWorkspace?"This WhatsApp number can access more than one workspace. Choose where you want to continue.":"We’re checking your private sign-in link. You don’t need to enter a password or copy a code."}</p>
  </div>
  {busy&&!error&&<div className="whatsapp-access-progress" role="status"><span className="whatsapp-spinner"/><div><strong>Signing you in securely</strong><small>This should only take a moment.</small></div></div>}
  {chooseWorkspace&&<form onSubmit={submit} className="form-stack whatsapp-access-form">
    <label>Business workspace<select autoFocus value={businessId} onChange={event=>setBusinessId(event.target.value)} required><option value="">Choose workspace</option>{verified.workspaces.map(workspace=><option key={workspace.id} value={workspace.id}>{workspace.name}</option>)}</select></label>
    <button className="primary-button" disabled={busy||!businessId}>{busy?"Opening…":<>Open workspace <ArrowRight2 size={18}/></>}</button>
  </form>}
  {error&&<div className="whatsapp-access-error"><p className="form-error" role="alert">{error}</p><div className="whatsapp-access-actions">{assistantUrl&&<a className="primary-button" href={assistantUrl}><Whatsapp size={19}/>Request link in WhatsApp</a>}<a className="secondary-button" href="/auth?mode=signin">Use email instead</a></div></div>}
  <p className="whatsapp-access-expiry">Sign-in links expire after 10 minutes and work once.</p>
  </WhatsAppAccessShell>;
}
