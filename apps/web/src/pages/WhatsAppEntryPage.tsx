import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useSession } from "../context/SessionContext";
import { MetaWhatsAppConnectPage } from "./MetaWhatsAppConnectPage";
import { WhatsAppPage } from "./WhatsAppPage";

type Connection = { id: string; status: string; environment: string };

export function WhatsAppEntryPage() {
  const { session } = useSession();
  const [connection, setConnection] = useState<Connection | null | undefined>(undefined);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let current = true;
    void api<Connection | null>("/whatsapp/connection", {}, session!.token)
      .then((result) => { if (current) setConnection(result); })
      .catch(() => { if (current) setConnection(null); });
    return () => { current = false; };
  }, [revision, session]);

  if (connection === undefined) return <div className="app-loading"><span className="brand-mark">L</span><p>Loading WhatsApp…</p></div>;
  if (!connection || connection.status !== "active" || connection.environment !== "production") return <MetaWhatsAppConnectPage onConnected={() => setRevision(value => value + 1)} />;
  return <WhatsAppPage />;
}
