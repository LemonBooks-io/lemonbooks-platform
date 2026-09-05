import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight2, Bank, Card, Copy, Link21, ShieldTick, TickCircle } from "iconsax-react";
import { Link, useSearchParams } from "react-router-dom";
import { Modal } from "../components/Modal";
import { SearchSelection } from "../components/SearchSelection";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { useNotifications } from "../context/NotificationContext";
import { useSession } from "../context/SessionContext";
import { api, patch, post } from "../lib/api";
import type { Business } from "../lib/types";

type PaymentAccount = { status:"pending"|"active"|"failed"; settlement_account_number:string; settlement_bank_name?:string; virtual_bank_name?:string; virtual_account_number?:string; virtual_account_name?:string; failure_reason?:string };
type BankOption = { name:string; code:string };
type MonnifyConnection = { id:string; status:string; environment:"sandbox"|"production"; external_business_id:string; webhookUrl:string };
type BankConnection = { id:string; provider:string; status:string; environment:string; external_account_id?:string; last_success_at?:string };
type TransferAccount = { bank_code:string; bank_name:string; account_number:string; account_name:string; verified_at:string };
type SettingsTab = "profile"|"integrations";

function mask(value?:string, visible=4) {
  if (!value) return "Not available";
  return `•••• ${value.slice(-visible)}`;
}

function StatusPill({ tone, children }:{ tone:"connected"|"pending"|"available"; children:string }) {
  return <span className={`integration-status integration-status--${tone}`}><i/>{children}</span>;
}

export function SettingsPage() {
  const { session, updateBusiness } = useSession();
  const { notify } = useNotifications();
  const business = session!.business; const token = session!.token;
  const [searchParams,setSearchParams] = useSearchParams();
  const tab:SettingsTab = searchParams.get("tab") === "integrations" ? "integrations" : "profile";
  const [form,setForm] = useState({ name:business.name, email:business.email??"", phone:business.phone??"", address:business.address??"", countryCode:business.countryCode??"NG", currency:business.currency??"NGN", timezone:business.timezone });
  const [paymentForm,setPaymentForm] = useState({ bankCode:"", accountNumber:"", bvn:"" });
  const [transferForm,setTransferForm] = useState({ bankCode:"", accountNumber:"" });
  const [monnifyForm,setMonnifyForm] = useState({ environment:"sandbox", apiKey:"", secretKey:"", contractCode:"" });
  const [account,setAccount] = useState<PaymentAccount|null>(null);
  const [banks,setBanks] = useState<BankOption[]>([]);
  const [monnify,setMonnify] = useState<MonnifyConnection|null>(null);
  const [connections,setConnections] = useState<BankConnection[]>([]);
  const [transferAccount,setTransferAccount] = useState<TransferAccount|null>(null);
  const [loading,setLoading] = useState(true);
  const [saved,setSaved] = useState(false);
  const [busy,setBusy] = useState(false);
  const [paymentBusy,setPaymentBusy] = useState(false);
  const [transferBusy,setTransferBusy] = useState(false);
  const [monnifyBusy,setMonnifyBusy] = useState(false);
  const [monnifyOpen,setMonnifyOpen] = useState(false);
  const [paymentOpen,setPaymentOpen] = useState(false);
  const [transferOpen,setTransferOpen] = useState(false);
  const [disconnectOpen,setDisconnectOpen] = useState(false);
  const [error,setError] = useState("");
  const [paymentError,setPaymentError] = useState("");
  const [transferError,setTransferError] = useState("");
  const [monnifyError,setMonnifyError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    void Promise.all([
      api<PaymentAccount|null>("/business/payment-account",{},token).catch(()=>null),
      api<BankOption[]>("/business/payment-account/banks",{},token).catch(()=>[]),
      api<MonnifyConnection|null>("/payments/monnify/connection",{},token).catch(()=>null),
      api<BankConnection[]>("/integrations/connections",{},token).catch(()=>[]),
      api<TransferAccount|null>("/business/transfer-account",{},token).catch(()=>null),
    ]).then(([nextAccount,nextBanks,nextMonnify,nextConnections,nextTransferAccount]) => {
      if (!active) return;
      setAccount(nextAccount); setBanks(nextBanks); setMonnify(nextMonnify); setConnections(nextConnections); setTransferAccount(nextTransferAccount); setLoading(false);
    });
    return () => { active=false; };
  },[token]);

  const moniepoint = useMemo(()=>connections.find(row=>row.provider==="moniepoint"&&row.status==="active")??null,[connections]);
  const connectedCount = (monnify?1:0)+(account?.status==="active"?1:0)+(moniepoint?1:0)+(transferAccount?1:0);
  function selectTab(next:SettingsTab) { setSearchParams(next==="integrations"?{tab:"integrations"}:{}); }

  async function submit(event:FormEvent) {
    event.preventDefault(); setSaved(false); setError(""); setBusy(true);
    try { updateBusiness(await patch<Business>("/business/me",form,token)); setSaved(true); notify({tone:"success",title:"Business profile updated"}); }
    catch (reason) { setError(reason instanceof Error?reason.message:"Could not save settings"); }
    finally { setBusy(false); }
  }
  async function provision(event:FormEvent) {
    event.preventDefault(); setPaymentError(""); setPaymentBusy(true);
    try { const result=await post<PaymentAccount>("/business/payment-account/provision",paymentForm,token); setAccount(result); setPaymentOpen(false); setPaymentForm({bankCode:"",accountNumber:"",bvn:""}); notify({tone:"success",title:result.status==="active"?"Paystack activated":"Paystack verification started"}); }
    catch (reason) { setPaymentError(reason instanceof Error?reason.message:"Could not create payment account"); }
    finally { setPaymentBusy(false); }
  }
  async function activateMonnify(event:FormEvent) {
    event.preventDefault(); setMonnifyError(""); setMonnifyBusy(true);
    try { const result=await post<MonnifyConnection>("/payments/monnify/connect",monnifyForm,token); setMonnify(result); setMonnifyOpen(false); setMonnifyForm(current=>({...current,apiKey:"",secretKey:"",contractCode:""})); notify({tone:"success",title:"Monnify connected",message:"Invoice checkout can now use this payment gateway."}); }
    catch (reason) { setMonnifyError(reason instanceof Error?reason.message:"Could not activate Monnify"); }
    finally { setMonnifyBusy(false); }
  }
  async function saveTransferAccount(event:FormEvent) {
    event.preventDefault(); setTransferError(""); setTransferBusy(true);
    try {
      const result=await api<TransferAccount>("/business/transfer-account",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(transferForm)},token);
      setTransferAccount(result); setTransferOpen(false); setTransferForm({bankCode:"",accountNumber:""});
      notify({tone:"success",title:"Transfer account verified",message:`Customers can now transfer to ${result.bank_name} · ${mask(result.account_number)}.`});
    } catch (reason) { setTransferError(reason instanceof Error?reason.message:"Could not verify this account"); }
    finally { setTransferBusy(false); }
  }
  async function disconnectMonnify(event:FormEvent) {
    event.preventDefault(); setMonnifyError(""); setMonnifyBusy(true);
    try { await api("/payments/monnify/connection",{method:"DELETE"},token); setMonnify(null); setDisconnectOpen(false); notify({tone:"success",title:"Monnify disconnected"}); }
    catch (reason) { setMonnifyError(reason instanceof Error?reason.message:"Could not disconnect Monnify"); }
    finally { setMonnifyBusy(false); }
  }

  return <WorkspaceShell title="Settings" description="Manage your workspace, payment gateways, and connected bank accounts.">
    <div className="settings-tabs" role="tablist" aria-label="Settings sections">
      <button role="tab" aria-selected={tab==="profile"} className={tab==="profile"?"active":""} onClick={()=>selectTab("profile")}>Business profile</button>
      <button role="tab" aria-selected={tab==="integrations"} className={tab==="integrations"?"active":""} onClick={()=>selectTab("integrations")}>Banks &amp; payments <span>{connectedCount}</span></button>
    </div>

    {tab==="profile"&&<form className="settings-profile" onSubmit={submit} role="tabpanel">
      <section className="profile-hero"><div className="profile-avatar">{form.name.trim().slice(0,2).toUpperCase()||"LB"}</div><div><p className="section-kicker">BUSINESS IDENTITY</p><h2>{form.name||"Your business"}</h2><p>Manage the information LemonBooks uses across invoices, receipts, and customer communications.</p></div><span><ShieldTick size={17}/>Private workspace</span></section>
      <div className="profile-layout">
        <section className="panel profile-section"><label>Business contact email (optional)<input type="email" autoComplete="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><p className="muted">For customer communications and payment providers. This does not change your WhatsApp sign-in.</p></section>
        <section className="panel profile-section"><header><div><p className="section-kicker">PUBLIC DETAILS</p><h3>Business information</h3><p>Shown to customers on documents and payment pages.</p></div></header><div className="form-grid"><label className="span-2">Business name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></label><label>Phone<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required/></label><label>Country<select value={form.countryCode} onChange={e=>setForm({...form,countryCode:e.target.value})}><option value="NG">Nigeria</option><option value="GH">Ghana</option><option value="KE">Kenya</option></select></label><label className="span-2">Business address<textarea rows={4} value={form.address} onChange={e=>setForm({...form,address:e.target.value})} placeholder="Street, city, state"/></label></div></section>
        <aside className="profile-sidebar"><section className="panel profile-section"><header><div><p className="section-kicker">LOCALIZATION</p><h3>Regional settings</h3><p>Controls monetary values and reporting dates.</p></div></header><div className="form-stack profile-fields"><label>Currency<select value={form.currency} onChange={e=>setForm({...form,currency:e.target.value})}>{["NGN","GHS","KES","USD","GBP"].map(code=><option key={code}>{code}</option>)}</select></label><label>Timezone<select value={form.timezone} onChange={e=>setForm({...form,timezone:e.target.value})}><option>Africa/Lagos</option><option>Africa/Accra</option><option>Africa/Nairobi</option></select></label></div></section><section className="panel profile-section profile-workspace"><header><div><p className="section-kicker">WORKSPACE</p><h3>Workspace address</h3><p>Your permanent LemonBooks identifier.</p></div></header><div className="copy-field"><input value={`${business.tenantSlug}.lemonbooks.app`} readOnly aria-label="Workspace address"/><button type="button" aria-label="Copy workspace ID" onClick={()=>void navigator.clipboard.writeText(business.tenantSlug)}><Copy size={18}/></button></div></section></aside>
      </div>
      <footer className="profile-actions"><div>{error&&<p className="form-error" role="alert">{error}</p>}{!error&&<p>Changes apply to newly generated documents and customer-facing pages.</p>}</div><button className="primary-button primary-button--compact" disabled={busy}>{saved?<><TickCircle size={18}/>Saved</>:busy?"Saving…":"Save changes"}</button></footer>
    </form>}

    {tab==="integrations"&&<div className="integration-settings" role="tabpanel">
      <section className="integration-overview"><div><span><Link21 size={23}/></span><div><p className="section-kicker">FINANCIAL CONNECTIONS</p><h2>Bring payments and banking into one place</h2><p>Activate a payment gateway for invoice checkout or connect a bank feed for automatic reconciliation.</p></div></div><strong>{loading?"Loading…":`${connectedCount} connected`}</strong></section>

      <section className="integration-category"><header><div><h2>Payment gateways</h2><p>Accept customer payments from online invoices.</p></div></header><div className="integration-grid">
        <article className="integration-card integration-card--monnify"><div className="integration-card__head"><span className="integration-logo integration-logo--monnify"><Card size={23}/></span><div><strong>Monnify</strong><small>Online invoice checkout</small></div>{monnify?<StatusPill tone="connected">Connected</StatusPill>:<StatusPill tone="available">Available</StatusPill>}</div><p>Accept cards, transfers and other Monnify payment methods, then reconcile successful invoice payments automatically.</p><div className="integration-capabilities"><span>Cards</span><span>Bank transfer</span><span>Auto-reconciliation</span></div>{monnify&&<dl className="integration-details"><div><dt>Environment</dt><dd>{monnify.environment==="production"?"Production":"Sandbox"}</dd></div><div><dt>Contract code</dt><dd>{mask(monnify.external_business_id)}</dd></div><div><dt>Credentials</dt><dd>Stored securely · never displayed</dd></div></dl>}<footer>{monnify?<><button className="secondary-button" onClick={()=>setDisconnectOpen(true)}>Disconnect</button><button className="secondary-button" onClick={()=>void navigator.clipboard.writeText(monnify.webhookUrl)}><Copy size={16}/>Copy webhook</button></>:<button className="primary-button" onClick={()=>{setMonnifyError("");setMonnifyOpen(true);}}>Connect Monnify <ArrowRight2 size={17}/></button>}</footer></article>

        <article className="integration-card integration-card--paystack"><div className="integration-card__head"><span className="integration-logo integration-logo--paystack"><Card size={23}/></span><div><strong>Paystack</strong><small>Dedicated payment account</small></div>{account?.status==="active"?<StatusPill tone="connected">Connected</StatusPill>:account?.status==="pending"?<StatusPill tone="pending">Pending</StatusPill>:<StatusPill tone="available">Available</StatusPill>}</div><p>Create a verified customer payment account that settles invoice payments directly to your business bank account.</p><div className="integration-capabilities"><span>Dedicated account</span><span>Instant settlement</span><span>Verified payouts</span></div>{account?.status==="active"&&<dl className="integration-details"><div><dt>Customer account</dt><dd>{account.virtual_bank_name} · {mask(account.virtual_account_number)}</dd></div><div><dt>Settlement account</dt><dd>{account.settlement_bank_name} · {mask(account.settlement_account_number)}</dd></div><div><dt>Account name</dt><dd>{account.virtual_account_name}</dd></div></dl>}{account?.status==="pending"&&<div className="integration-notice"><ShieldTick size={18}/><span><strong>Verification in progress</strong><small>Paystack will activate the account when its checks complete.</small></span></div>}{account?.status==="failed"&&<p className="form-error">{account.failure_reason||"Paystack could not verify this account."}</p>}<footer>{account?.status==="active"?<span className="integration-managed"><ShieldTick size={16}/>Managed securely by LemonBooks</span>:account?.status==="pending"?<span className="integration-managed">No action is needed right now</span>:<button className="primary-button" onClick={()=>{setPaymentError("");setPaymentOpen(true);}}>Set up Paystack <ArrowRight2 size={17}/></button>}</footer></article>
      </div></section>

      <section className="integration-category"><header><div><h2>Customer bank transfer</h2><p>Choose the verified account customers see when reporting a bank transfer.</p></div></header><div className="integration-grid"><article className="integration-card"><div className="integration-card__head"><span className="integration-logo"><Bank size={23}/></span><div><strong>Receiving account</strong><small>Manual bank transfer instructions</small></div>{transferAccount?<StatusPill tone="connected">Configured</StatusPill>:<StatusPill tone="available">Not configured</StatusPill>}</div><p>Account details appear in the customer portal only after the bank verifies the account name.</p>{transferAccount?<dl className="integration-details"><div><dt>Bank</dt><dd>{transferAccount.bank_name}</dd></div><div><dt>Account number</dt><dd>{mask(transferAccount.account_number)}</dd></div><div><dt>Account name</dt><dd>{transferAccount.account_name}</dd></div></dl>:<div className="integration-notice"><ShieldTick size={18}/><span><strong>Bank transfer is hidden from customers</strong><small>Add and verify a receiving account to make this payment method available.</small></span></div>}<footer><button className={transferAccount?"secondary-button":"primary-button"} onClick={()=>{setTransferError("");setTransferForm({bankCode:transferAccount?.bank_code??"",accountNumber:transferAccount?.account_number??""});setTransferOpen(true);}}>{transferAccount?"Change account":"Add transfer account"}<ArrowRight2 size={17}/></button></footer></article></div></section>

      <section className="integration-category"><header><div><h2>Bank connections</h2><p>Import balances and transactions for reconciliation.</p></div></header><div className="integration-grid"><article className="integration-card"><div className="integration-card__head"><span className="integration-logo integration-logo--moniepoint"><Bank size={23}/></span><div><strong>Moniepoint</strong><small>Business bank feed</small></div>{moniepoint?<StatusPill tone="connected">{moniepoint.environment==="mock"?"Test connected":"Connected"}</StatusPill>:<StatusPill tone="pending">Approval required</StatusPill>}</div><p>Bring Moniepoint transactions into LemonBooks and match incoming transfers to open invoices.</p>{moniepoint?<dl className="integration-details"><div><dt>Connection</dt><dd>{moniepoint.environment==="mock"?"Simulation environment":"Live bank feed"}</dd></div><div><dt>External account</dt><dd>{mask(moniepoint.external_account_id)}</dd></div><div><dt>Status</dt><dd>Active</dd></div></dl>:<div className="integration-notice"><ShieldTick size={18}/><span><strong>Live activation is not available yet</strong><small>Provider approval is required before customers can connect a real Moniepoint account.</small></span></div>}<footer><Link className="secondary-button" to="/banking">{moniepoint?"View bank feed":"View bank integration"}<ArrowRight2 size={17}/></Link></footer></article></div></section>

      <div className="integration-security"><ShieldTick size={20}/><div><strong>Your financial data stays protected</strong><p>Secrets are encrypted at rest. LemonBooks never displays saved API secrets and masks account identifiers after setup.</p></div></div>
    </div>}

    <Modal open={monnifyOpen} title="Connect Monnify" description="Verify the credentials from your Monnify developer settings before activating checkout." submitLabel="Verify and connect" busy={monnifyBusy} onClose={()=>!monnifyBusy&&setMonnifyOpen(false)} onSubmit={activateMonnify}><div className="form-stack"><label>Environment<select value={monnifyForm.environment} onChange={e=>setMonnifyForm({...monnifyForm,environment:e.target.value})}><option value="sandbox">Sandbox — test first</option><option value="production">Production — accept live payments</option></select></label><label>API key<input autoComplete="off" value={monnifyForm.apiKey} onChange={e=>setMonnifyForm({...monnifyForm,apiKey:e.target.value})} required/></label><label>Secret key<input type="password" autoComplete="new-password" value={monnifyForm.secretKey} onChange={e=>setMonnifyForm({...monnifyForm,secretKey:e.target.value})} required/></label><label>Contract code<input value={monnifyForm.contractCode} onChange={e=>setMonnifyForm({...monnifyForm,contractCode:e.target.value})} required/></label>{monnifyError&&<p className="form-error" role="alert">{monnifyError}</p>}<div className="secure-form-note"><ShieldTick size={18}/><span><strong>Encrypted credential storage</strong><small>Your secret key is used for payment processing and is never shown again.</small></span></div></div></Modal>

    <Modal open={paymentOpen} title="Set up Paystack payments" description="Verify the business settlement account that will receive customer payments." submitLabel="Verify and activate" busy={paymentBusy} onClose={()=>!paymentBusy&&setPaymentOpen(false)} onSubmit={provision}><div className="form-stack"><SearchSelection label="Settlement bank" value={paymentForm.bankCode} onChange={bankCode=>setPaymentForm({...paymentForm,bankCode})} options={banks.map(bank=>({id:bank.code,title:bank.name,subtitle:`Bank code ${bank.code}`}))} placeholder={banks.length?"Choose bank":"Loading banks…"} searchPlaceholder="Search banks" emptyTitle="No banks match" disabled={!banks.length}/><label>Settlement account number<input inputMode="numeric" maxLength={10} value={paymentForm.accountNumber} onChange={e=>setPaymentForm({...paymentForm,accountNumber:e.target.value.replace(/\D/g,"")})} required/></label><label>BVN <small>(required by Paystack for some categories)</small><input type="password" inputMode="numeric" autoComplete="off" value={paymentForm.bvn} onChange={e=>setPaymentForm({...paymentForm,bvn:e.target.value.replace(/\D/g,"")})}/></label>{paymentError&&<p className="form-error" role="alert">{paymentError}</p>}<div className="secure-form-note"><ShieldTick size={18}/><span><strong>Used only for provider verification</strong><small>Sensitive values will be masked after this step.</small></span></div></div></Modal>

    <Modal open={transferOpen} title="Add a transfer account" description="LemonBooks will resolve the account name with the bank before saving it." submitLabel="Verify and save account" busy={transferBusy} onClose={()=>!transferBusy&&setTransferOpen(false)} onSubmit={saveTransferAccount}><div className="form-stack"><SearchSelection label="Receiving bank" value={transferForm.bankCode} onChange={bankCode=>setTransferForm({...transferForm,bankCode})} options={banks.map(bank=>({id:bank.code,title:bank.name,subtitle:`Bank code ${bank.code}`}))} placeholder={banks.length?"Choose bank":"Loading banks…"} searchPlaceholder="Search banks" emptyTitle="No banks match" disabled={!banks.length}/><label>Account number<input inputMode="numeric" maxLength={10} value={transferForm.accountNumber} onChange={e=>setTransferForm({...transferForm,accountNumber:e.target.value.replace(/\D/g,"")})} required/></label>{transferError&&<p className="form-error" role="alert">{transferError}</p>}<div className="secure-form-note"><ShieldTick size={18}/><span><strong>Verified details only</strong><small>The resolved account name will be saved and shown to customers with these transfer instructions.</small></span></div></div></Modal>

    <Modal open={disconnectOpen} title="Disconnect Monnify?" description="Online Monnify checkout will stop working for new invoice payments." submitLabel="Disconnect Monnify" busy={monnifyBusy} onClose={()=>!monnifyBusy&&setDisconnectOpen(false)} onSubmit={disconnectMonnify}><div className="disconnect-warning"><strong>Existing payment records will remain in LemonBooks.</strong><p>You can reconnect Monnify later with valid credentials.</p>{monnifyError&&<p className="form-error" role="alert">{monnifyError}</p>}</div></Modal>
  </WorkspaceShell>;
}
