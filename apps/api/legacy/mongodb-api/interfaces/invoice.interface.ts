import { Schema } from "mongoose";
import IGenericRepository from "./generic.repository.interface";
import { PaymentMethod } from "../enums/payment.enum";
import { InvoiceStatus } from "../enums/invoice.enum";

export interface IInvoice {
    _id? : string;
    businessId : Schema.Types.ObjectId;
    recipientId : string;
    invoiceNumber: string;
    tapInvoiceId: string;
    tapInvoiceUrl : string;
    customInvoiceUrl : string;
    draft: boolean;
    due: number;
    expiry: number;
    description: string;
    note: string;
    customer: {
        email: string;
        first_name: string;
        last_name: string;
        phone: {
            country_code: string;
            number: string;
        };
        address: string;
        company? : string;
    }; 
    order: {
        amount: number;
        items: object[];
        currency: string;
    };
    createdBy : string,
    paymentMethod : PaymentMethod;
    status : InvoiceStatus;
    balanceBefore? : number; // The due invoice balance of the customer before this invoice is created
    isBulk : boolean,
    relatedInvoiceIds : string[]; //  The ids of the invoices bulk paid
    bulkInvoiceExpiration? : Date | null;
    view_status: "READ" | "UNREAD";
    metadata : Record<string, any>; 
    createdAt : Date;
    updatedAt: Date;
}


export interface ICounter {
    businessId : Schema.Types.ObjectId
    seq: number;
    name: string;
  }

export interface IInvoiceRepository extends IGenericRepository<IInvoice> {
}

export interface ITapInvoiceOrderItem {
    amount: number;
    description: string;
    quantity: number;
    currency: string;
    name: string;
}