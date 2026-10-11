import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import { post } from "../lib/api";
import { ArrowRight2, Link21, TickCircle, Whatsapp } from "iconsax-react";
import { WhatsAppAccessShell } from "../components/WhatsAppAccessShell";

export function WhatsAppAccountLinkPage() {
  const { session, signOut } = useSession();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ status: string; message: string } | null>(null);
  const [error, setError] = useState("");
  async function connect() {
    if (!session) return;
    setBusy(true); setError("");
    try {
      const whatsappLinkToken = new URLSearchParams(window.location.hash.slice(1)).get("whatsapp_link");
      setResult(await post<{ status: string; message: string }>("/auth/whatsapp-link", { whatsappLinkToken }, session.token));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not connect WhatsApp"); }
    finally { setBusy(false); }
  }
  const connected=result?.status==="linked";
  return <WhatsAppAccessShell><div className="whatsapp-access-heading">
    <span className={`whatsapp-access-icon ${connected?"is-success":""}`}>{connected?<TickCircle size={26}/>:<Link21 size={25}/>}</span>
    <p className="eyebrow">WHATSAPP · WORKSPACE ACCESS</p>
    <h1>{connected?"WhatsApp connected":"Connect your WhatsApp"}</h1>
    <p>{connected?result.message:<>Link the WhatsApp number that requested this private link to <strong>{session?.business.name}</strong>.</>}</p>
  </div>
  {!result&&<><div className="whatsapp-link-summary"><span><Whatsapp size={21}/></span><div><small>Workspace</small><strong>{session?.business.name}</strong></div><i/><div><small>Access</small><strong>WhatsApp assistant</strong></div></div><div className="whatsapp-access-note">Only continue if you requested this link from your own LemonBooks WhatsApp chat. We’ll confirm the connection there.</div><div className="whatsapp-access-actions"><button className="primary-button" onClick={connect} disabled={busy}>{busy?"Connecting…":<>Connect to workspace <ArrowRight2 size={18}/></>}</button><button className="secondary-button" disabled={busy} onClick={signOut}>Use a different account</button></div></>}
  {error&&<p className="form-error" role="alert">{error}</p>}
  <button className="whatsapp-access-cancel" disabled={busy} onClick={()=>navigate("/",{replace:true})}>{result?"Continue to workspace":"Cancel"}</button>
  </WhatsAppAccessShell>;
}
