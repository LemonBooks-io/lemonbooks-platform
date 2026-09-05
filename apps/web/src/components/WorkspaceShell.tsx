import { ReactNode, useState } from "react";
import { Add, Bank, Box, Building4, Card, CloseCircle, DocumentText, Home2, LogoutCurve, Menu, Message, People, Profile2User, Setting2 } from "iconsax-react";
import { NavLink } from "react-router-dom";
import { useSession } from "../context/SessionContext";

const navigation = [
  { label: "Workspace", links: [["/", "Overview", Home2]] },
  { label: "Money", links: [["/transactions", "Payments", Card], ["/invoices", "Invoices", DocumentText], ["/banking", "Banking", Bank]] },
  { label: "Connect", links: [["/whatsapp", "WhatsApp", Message]] },
  { label: "Business", links: [["/clients", "Clients", People], ["/items", "Items & inventory", Box], ["/team", "Team", Profile2User], ["/settings", "Settings", Setting2]] },
] as const;

export function WorkspaceShell({ children, title, description, action }: { children: ReactNode; title: string; description?: string; action?: ReactNode }) {
  const { session, signOut } = useSession(); const [open, setOpen] = useState(false);
  const initials = session!.business.name.split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase();
  return <div className="workspace">
    {open && <button className="sidebar-backdrop" onClick={() => setOpen(false)} aria-label="Close navigation" />}
    <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>
      <div className="sidebar-brand"><a className="brand" href="/"><img className="brand-mark" src="/brand/lemonbooks-logo-mark.png" alt=""/><span>LemonBooks</span></a><button className="mobile-close" onClick={() => setOpen(false)}><CloseCircle size={23} /></button></div>
      <div className="business-switcher"><span className="business-avatar">{initials}</span><span><strong>{session!.business.name}</strong><small>{session!.business.tenantSlug}</small></span></div>
      <nav>{navigation.map((group) => <div className="nav-group" key={group.label}><p>{group.label}</p>{group.links.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === "/"} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? "active" : ""}><Icon size={20} /><span>{label}</span></NavLink>)}</div>)}</nav>
      <div className="sidebar-help"><Building4 size={21} /><strong>Need a hand?</strong><p>Learn the basics of clean business books.</p><button>Open quick guide</button></div>
      <button className="signout" onClick={signOut}><LogoutCurve size={19} /> Sign out</button>
    </aside>
    <div className="workspace-main">
      <header className="topbar"><button className="menu-button" onClick={() => setOpen(true)}><Menu size={23} /></button><div className="topbar-context"><span className="status-dot" /> All systems ready</div><div className="user-menu"><span>{session!.user.name}</span><span className="user-avatar">{session!.user.name.charAt(0).toUpperCase()}</span></div></header>
      <main className="page"><header className="page-header"><div><p className="mobile-eyebrow">{session!.business.name}</p><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</header>{children}</main>
    </div>
  </div>;
}

export function AddButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button className="primary-button primary-button--compact" onClick={onClick}><Add size={19} />{children}</button>;
}
