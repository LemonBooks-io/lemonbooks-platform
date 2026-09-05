import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import { post } from "../lib/api";

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
  return <main className="auth-form-wrap" style={{ minHeight: "100vh" }}><section className="auth-form-card">
    <img className="brand-mark" src="/brand/lemonbooks-logo-mark.png" alt="LemonBooks" />
    <h1>{result?.status === "linked" ? "WhatsApp connected" : "Connect your WhatsApp"}</h1>
    {result ? <p role="status">{result.message}</p> : <>
      <p>Connect the WhatsApp number that received this link to <strong>{session?.business.name}</strong>.</p>
      <p className="muted">Continue only if you requested this private link from your own WhatsApp chat. A confirmation will be sent there.</p>
      <button className="primary-button" onClick={connect} disabled={busy}>{busy ? "Connecting…" : "Connect to this workspace"}</button>
      <button className="text-button" disabled={busy} onClick={signOut}>Sign in to a different account</button>
    </>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="text-button" disabled={busy} onClick={() => navigate("/", { replace: true })}>{result ? "Continue to workspace" : "Cancel"}</button>
  </section></main>;
}
