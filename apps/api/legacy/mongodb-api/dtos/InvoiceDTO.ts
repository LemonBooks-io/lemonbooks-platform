import { InvoiceStatus } from "../enums/invoice.enum";
import { PaymentMethod } from "../enums/payment.enum";
import { ICustomer } from "../interfaces/customer.interface";
import { IInvoice } from "../interfaces/invoice.interface";

export class GetInvoiceDTO {
  id: string;
  businessId: any;
  recipientId: string;
  invoiceNumber: string;
  tapInvoiceId: string;
  tapInvoiceUrl: string;
  customInvoiceUrl: string;
  draft: boolean;
  due: number;
  expiry: number;
  description: string;
  note: string;
  customer: object;
  order: object;
  createdBy: string;
  paymentMethod: PaymentMethod;
  status: InvoiceStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(invoice: IInvoice) {
    this.id = invoice._id!;
    this.due = invoice.due;
    this.draft = invoice.draft;
    this.expiry = invoice.expiry;
    this.businessId = invoice.businessId;
    this.recipientId = invoice.recipientId;
    this.createdBy = invoice.createdBy;
    this.customer = invoice.customer;
    this.description = invoice.description;
    this.invoiceNumber = invoice.invoiceNumber;
    this.tapInvoiceUrl = invoice.tapInvoiceUrl;
    this.customInvoiceUrl = invoice.customInvoiceUrl;
    this.tapInvoiceId = invoice.tapInvoiceId;
    this.note = invoice.note;
    this.order = invoice.order;
    this.paymentMethod = invoice.paymentMethod;
    this.status = invoice.status;
    this.createdAt = invoice.createdAt;
    this.updatedAt = invoice.updatedAt;
  }
}

export class GetInvoiceByIdDTO {
  id: string;
  business: any;
  recipientId: string;
  invoiceNumber: string;
  tapInvoiceId: string;
  tapInvoiceUrl: string;
  customInvoiceUrl: string;
  draft: boolean;
  due: number;
  expiry: number;
  description: string;
  note: string;
  customer: object;
  order: object;
  createdBy: string;
  paymentMethod: PaymentMethod;
  status: InvoiceStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(invoice: IInvoice, customer? : Partial<ICustomer>) {
    this.id = invoice._id!;
    this.due = invoice.due;
    this.draft = invoice.draft;
    this.expiry = invoice.expiry;
    this.business = {
      name: (invoice.businessId as any).name,
      email: (invoice.businessId as any).email,
      address: (invoice.businessId as any).address,
      logoUrl: (invoice.businessId as any).logoUrl,
        };
    this.recipientId = invoice.recipientId;
    this.createdBy = invoice.createdBy;
    this.customer = customer || invoice.customer;
    this.description = invoice.description;
    this.invoiceNumber = invoice.invoiceNumber;
    this.tapInvoiceUrl = invoice.tapInvoiceUrl;
    this.customInvoiceUrl = invoice.customInvoiceUrl;
    this.tapInvoiceId = invoice.tapInvoiceId;
    this.note = invoice.note;
    this.order = invoice.order;
    this.paymentMethod = invoice.paymentMethod;
    this.status = invoice.status;
    this.createdAt = invoice.createdAt;
    this.updatedAt = invoice.updatedAt;
  }
}
