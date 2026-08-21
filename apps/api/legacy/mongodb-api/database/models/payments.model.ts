import mongoose, { Model, Schema } from "mongoose";
import { IPayment } from "../../interfaces/payment.interface";

const schema = new Schema<IPayment>(
    {
        ownerId: {
            type: String,
            required: true,
        },
        invoiceId: {
            type: String,
            required: true,
        },
        invoiceNumber: {
            type: String,
            required: true,
        },
        businessId: {
            type: String,
            required: true,
        },
        amount : {
            type : Number,
            required : true
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


const Payments: Model<IPayment> = mongoose.model("payments", schema);

export default Payments;
