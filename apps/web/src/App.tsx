import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { SessionProvider, useSession } from "./context/SessionContext";
import { AuthPage } from "./pages/AuthPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ClientsPage } from "./pages/ClientsPage";
import { ItemsPage } from "./pages/ItemsPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TeamPage } from "./pages/TeamPage";
import { CreateInvoicePage } from "./pages/CreateInvoicePage";
import { InvoiceDetailPage } from "./pages/InvoiceDetailPage";
import { PaystackCallbackPage } from "./pages/PaystackCallbackPage";
import { PublicInvoicePage } from "./pages/PublicInvoicePage";
import { CustomerPortalPage } from "./pages/CustomerPortalPage";
import { BankingPage } from "./pages/BankingPage";
import { WhatsAppEntryPage } from "./pages/WhatsAppEntryPage";
import { ReconciliationOperationsPage } from "./pages/ReconciliationOperationsPage";
import { DataDeletionPage } from "./pages/DataDeletionPage";

function ProductRoutes() {
  const { session } = useSession();
  const location = useLocation();
  if (location.pathname === "/data-deletion" || location.pathname === "/data-deletion/") return <DataDeletionPage/>;
  if (location.pathname.startsWith("/pay/invoice/")) return <Routes><Route path="/pay/invoice/:token" element={<PublicInvoicePage/>}/><Route path="*" element={<Navigate to="/customer-portal" replace/>}/></Routes>;
  if (location.pathname.startsWith("/client-portal")) {
    const suffix = location.pathname.slice("/client-portal".length);
    return <Navigate to={`/customer-portal${suffix}${location.search}${location.hash}`} replace />;
  }
  if (location.pathname.startsWith("/customer-portal")) return <Routes><Route path="/customer-portal/*" element={<CustomerPortalPage/>}/></Routes>;
  if (!session) return <AuthPage />;
  if (!session.business.onboardingCompleted) return <OnboardingPage />;
  return <Routes>
    <Route path="/" element={<DashboardPage />} />
    <Route path="/transactions" element={<TransactionsPage />} />
    <Route path="/banking" element={<BankingPage />} />
    <Route path="/banking/operations" element={<ReconciliationOperationsPage />} />
    <Route path="/whatsapp" element={<WhatsAppEntryPage />} />
    <Route path="/whatsapp/connect" element={<Navigate to="/whatsapp" replace />} />
    <Route path="/invoices" element={<InvoicesPage />} />
    <Route path="/invoices/new" element={<CreateInvoicePage />} />
    <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
    <Route path="/payments/paystack/callback" element={<PaystackCallbackPage />} />
    <Route path="/clients" element={<ClientsPage />} />
    <Route path="/items" element={<ItemsPage />} />
    <Route path="/team" element={<TeamPage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}

export default function App() { return <BrowserRouter><SessionProvider><ProductRoutes /></SessionProvider></BrowserRouter>; }
