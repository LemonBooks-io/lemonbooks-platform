import { PaymentMethod, PaymentProofStatus } from "../enums/payment.enum";
import { IPaymentProof } from "../interfaces/payment.interface";

export default class PaymentProofDTO{
    id : string;
    ownerId : string;
    invoiceId? : string;
    proofDocumentUrl : string;
    referenceId : string | null;
    additionalDetails? : string | null;
    businessId : string;
    paymentMethod : PaymentMethod;
    status : PaymentProofStatus;
    otherPaymentMethod : string | null;
    createdAt?: Date | undefined;


    constructor(paymentProof : IPaymentProof){
        this.id = paymentProof._id!.toString();
        this.ownerId = paymentProof.ownerId;
        this.invoiceId = paymentProof.invoiceId;
        this.proofDocumentUrl = paymentProof.proofDocumentUrl;
        this.referenceId = paymentProof.referenceId ?? null;
        this.additionalDetails = paymentProof.additionalDetails ?? null;
        this.paymentMethod = paymentProof.paymentMethod;
        this.otherPaymentMethod = paymentProof.otherPaymentMethod ?? null;
        this.businessId = paymentProof.businessId;
        this.status = paymentProof.status;
        this.createdAt = paymentProof.createdAt;
    }
}