import mongoose, { Model, Schema } from "mongoose";
import { IPaymentProof } from "../../interfaces/payment.interface";
import { PaymentMethod, PaymentProofStatus } from "../../enums/payment.enum";

const schema = new Schema<IPaymentProof>(
    {
        ownerId: {
            type: String,
            required: true,
        },
        invoiceId: {
            type: String,
            required: true,
        },
        proofDocumentUrl: {
            type: String,
            required: true,
        },
        referenceId: {
            type: String,
            default: null,
        },
        additionalDetails: {
            type: String,
            default: null,
        },
        businessId: {
            type: String,
            required: true,
        },
        status :{
            type: String,
            enum: Object.values(PaymentProofStatus),
            default: PaymentProofStatus.PENDING,
        },
        paymentMethod:{
            type : String,
            required : true,
            enum : Object.values(PaymentMethod)
        },
        otherPaymentMethod : {
            type : String,
            default : null
        },
        approvedBy: {
            type: String,
            default: null,
        },
        approvedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        id: true,
        toJSON: {
            virtuals: true,
            transform: (_, ret: any) => {
                delete ret._id;
                return ret;
            },
        },
    }
);


const PaymentProof: Model<IPaymentProof> = mongoose.model("payment_proofs", schema);

export default PaymentProof;
