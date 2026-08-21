export type Business = {
  id: string; name: string; tenantSlug: string; email: string; phone?: string; address?: string;
  countryCode?: string; currency?: string; timezone: string; logoUrl?: string;
  onboardingCompleted: boolean; paymentProvider?: string;
};
export type User = { id: string; email: string; name: string; role: string };
export type Session = { token: string; user: User; business: Business };
export type Summary = { clients: number; items: number; invoices: number; outstanding: number; receivedThisMonth: number };
export type Client = { id: string; name: string; email?: string; phone?: string; company?: string; address?: string; balance: string; created_at: string };
export type Item = { id: string; name: string; description?: string; kind: "product" | "service"; sku?: string; price: string; cost: string; stock_quantity?: string; low_stock_threshold?: string; active: boolean; created_at: string };
export type Invoice = { id: string; number: string; status: string; total: string; amount_paid: string; currency: string; issue_date: string; due_date?: string; sent_at?: string; client_name?: string; client_email?: string; created_at: string; pending_payment_count?: number };
export type InvoiceLine = { id: string; item_id?: string; description: string; quantity: string; unit_price: string; total: string; kind?: string; sku?: string };
export type InvoiceDetail = Invoice & { subtotal: string; tax: string; notes?: string; client_phone?: string; client_address?: string; lines: InvoiceLine[] };
export type Payment = { id: string; amount: string; currency: string; method: string; status: string; reference?: string; received_at: string };
export type TeamMember = { id: string; name: string; email: string; role: "owner" | "admin" | "member" | "accountant"; created_at: string };
