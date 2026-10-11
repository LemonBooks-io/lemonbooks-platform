import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import type { Business, Session } from "../lib/types";

type SessionContextValue = {
  session: Session | null; setSession: (session: Session) => void; updateBusiness: (business: Business) => void; signOut: () => void;
};
const SessionContext = createContext<SessionContextValue | null>(null);
const STORAGE_KEY = "lemonbooks.session";

function loadSession(): Session | null {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null"); } catch { return null; }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(loadSession);
  useEffect(() => {
    const expire = () => { localStorage.removeItem(STORAGE_KEY); setSessionState(null); };
    window.addEventListener("lemonbooks:session-expired", expire);
    return () => window.removeEventListener("lemonbooks:session-expired", expire);
  }, []);
  const value = useMemo<SessionContextValue>(() => ({
    session,
    setSession(next) { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setSessionState(next); },
    updateBusiness(business) {
      setSessionState((current) => { if (!current) return current; const next = { ...current, business }; localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); return next; });
    },
    signOut() { localStorage.removeItem(STORAGE_KEY); setSessionState(null); },
  }), [session]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider");
  return value;
}
