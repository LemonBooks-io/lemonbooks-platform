import { useEffect, useState } from "react";
import { Card, TickCircle } from "iconsax-react";
import { Link } from "react-router-dom";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { useSession } from "../context/SessionContext";
import { api } from "../lib/api";

export function PaystackCallbackPage() {
  const { session } = useSession(); const reference = new URLSearchParams(window.location.search).get("reference") ?? ""; const [state, setState] = useState<"checking" | "success" | "failed">("checking"); const [message, setMessage] = useState("Confirming this payment securely with Paystack.");
  useEffect(() => { if (!reference) { setState("failed"); setMessage("No Paystack reference was supplied."); return; } api<{ status: string }>(`/payments/paystack/verify/${encodeURIComponent(reference)}`, {}, session!.token).then((result) => { if (result.status === "success") { setState("success"); setMessage("Payment confirmed and allocated to the invoice."); } else { setState("failed"); setMessage(`Paystack reports this payment as ${result.status}.`); } }).catch((reason) => { setState("failed"); setMessage(reason instanceof Error ? reason.message : "Payment could not be verified."); }); }, [reference, session]);
  return <WorkspaceShell title="Payment verification" description="Secure confirmation from Paystack."><section className={`callback-card callback-card--${state}`}><span>{state === "success" ? <TickCircle size={32} /> : <Card size={32} />}</span><p className="eyebrow">{state === "checking" ? "VERIFYING PAYMENT" : state === "success" ? "PAYMENT CONFIRMED" : "ACTION REQUIRED"}</p><h2>{state === "checking" ? "Just a moment…" : state === "success" ? "The invoice is updated" : "We could not confirm payment"}</h2><p>{message}</p><Link className="primary-button primary-button--compact" to="/invoices">Return to invoices</Link></section></WorkspaceShell>;
}
