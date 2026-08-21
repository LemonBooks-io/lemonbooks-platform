import { Schema } from "mongoose";
import IGenericRepository from "./generic.repository.interface";
import { PaymentMethod, PaymentProofStatus } from "../enums/payment.enum";


export interface IPayment{
  _id? : Schema.Types.ObjectId | string,
  invoiceId : string,
  invoiceNumber : string,
  ownerId : string,
  businessId : string,
  amount : number,
  // paymentDate? : Date,
  receivableBalance? : number,
  createdAt?: Date,
}

export interface IPaymentProof {
    _id? : Schema.Types.ObjectId,
    ownerId : string,
    invoiceId : string,
    proofDocumentUrl : string,
    referenceId? : string,
    additionalDetails? : string,
    businessId : string,
    status : PaymentProofStatus,
    paymentMethod : PaymentMethod,
    otherPaymentMethod? : string,
    createdAt?: Date,
    approvedBy : string | null,
    approvedAt : Date | null,
}

export interface ITapCredentials{
    key : string;
    iv : string;
}
export interface IPaymentProofRepository extends IGenericRepository<IPaymentProof>{
}
export interface IPaymentRepository extends IGenericRepository<IPayment>{
}