import config from "config";
import { ITapInvoiceOrderItem } from "../interfaces/invoice.interface";

export default class TapInvoiceDTO {
  invoiceNumber: string;
  draft: boolean;
  due: number;
  expiry: number;
  description: string;
  mode: string;
  note: string;
  notifications: {
    channels: string[];
    dispatch: boolean;
  };
  metadata: {
    // udf1: string;
    // udf2: string;
    // udf3: string;
    invoiceNumber: string;
    tenant?: string;
  };
  charge: {
    receipt: {
      email: boolean;
      sms: boolean;
    };
  };
  customer: {
    email: string;
    first_name: string;
    last_name: string;
    phone: {
      country_code: string;
      number: string;
    };
    // address: string;
  };
  order: {
    amount: number;
    items: ITapInvoiceOrderItem[];
    currency: string;
  };
  post: {
    url: string;
  };
  redirect: {
    url: string;
  };
  reference: {
    invoice: string;
    order: string;
  };
  retry_for_captured: boolean;
  statement_descriptor: string;

constructor(payload: {
    invoiceNumber: string;
    draft: boolean;
    due: number;
    expiry: number;
    description: string;
    note: string;
    customer: {
        email: string;
        first_name: string;
        last_name: string;
        phone: { country_code: string; number: string };
        // address: string;
    };
    order: { amount: number; items: ITapInvoiceOrderItem[]; currency: string };
    
}, redirect : string, tenant: string) {
    const { invoiceNumber, draft, due, expiry, description, note, customer, order } = payload;
    this.invoiceNumber = invoiceNumber;
    this.draft = draft;
    this.due = due;
    this.expiry = expiry;
    this.description = description;
    this.note = note;
    this.customer = customer;
    this.order = {
      ...order,
      items: formatItemsForTap(order.items),
    };
    this.mode = "INVOICE";
    this.notifications = { channels: ["EMAIL"], dispatch: false };
    this.metadata = { invoiceNumber: invoiceNumber, tenant: tenant };
    this.retry_for_captured = true;
    this.charge = { receipt: { email: true, sms: false } };
    this.post = { url: `${config.get("API_HOST")}/api/v2/payment/callback` };
    this.redirect = { url: redirect  };
    this.reference = { invoice: invoiceNumber, order: `ORD_${invoiceNumber.split("_")[1] ?? 0}` };
    this.statement_descriptor = "statement";
}
}

function formatItemsForTap(items: any[]) {
  return items.map((item) => ({
    amount: item.amount,
    description: item.description,
    quantity: item.quantity,
    currency: item.currency,
    name: item.name,
  }));
}