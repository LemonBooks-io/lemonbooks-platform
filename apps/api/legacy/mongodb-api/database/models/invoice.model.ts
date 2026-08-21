import mongoose, { Model, Schema } from "mongoose";
import { IInvoice } from "../../interfaces/invoice.interface";
import Counter from "./counter.model";
// import config from "config"
import { PaymentMethod } from "../../enums/payment.enum";
import { InvoiceStatus } from "../../enums/invoice.enum";

const schema: Schema = new Schema<IInvoice>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "businesses",
    },
    invoiceNumber: { type: String, required: true, unique: true },
    recipientId: { type: String, required: true },
    tapInvoiceId: { type: String },
    tapInvoiceUrl: { type: String, default: null },
    customInvoiceUrl: { type: String },
    draft: { type: Boolean, required: true, default : false },
    due: { type: Number, default: null },
    expiry: { type: Number, default: null},
    description: { type: String, default: "" },
    note: { type: String, required: true, default: "test note" },
    customer: {
      email: { type: String, required: true },
      first_name: { type: String, required: true },
      last_name: { type: String, required: true },
      // phone: { type: {
      //   country_code: { type: String, required: true },
      //   number: { type: String, required: true },
      // }, required: true },
      phone: {
        country_code: { type: String, required: true },
        number: { type: String, required: true },
      },
      address : { type: String, required: false, default: "" },
      company : { type: String, required: false, default: null },
    },
    order: {
      amount: { type: Number, required: true },
      items: { type: [Schema.Types.Mixed], required: true },
      currency: { type: String, required: true },
    },
    createdBy: { type: String, default: null },
    paymentMethod: {
      type: String,
      required: true,
      default: PaymentMethod.UNSELECTED,
      enum: Object.keys(PaymentMethod),
    },
    status: {
      type: String,
      required: true,
      default: InvoiceStatus.UNPAID,
      enum: Object.keys(InvoiceStatus),
    },
    isBulk: {
      type: Boolean,
      default: false,
    },
    relatedInvoiceIds: {
      type: [String],
      default: [],
    },
    balanceBefore: {
      type: Number,
      default: 0,
    },
    bulkInvoiceExpiration: {
      type: Date,
      index: {
        expires: 10, // 10 seconds after expiration date
      },
      default: null,
    },
    view_status: {
      type: String,
      enum: ["READ", "UNREAD"],
      default: "UNREAD",
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
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

schema.index({ "order.amount": 1 });

schema.pre("validate", async function (next) {
  const invoice = this as unknown as IInvoice;
  // invoice should expire 24hours from creation time
  if (invoice.isBulk) {
    invoice.bulkInvoiceExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  // create custom invoice number
  if (!invoice.invoiceNumber) {
    try {
      // Increment the sequence in the counter collection
      const name = invoice.draft ? "estimate" : "invoice";
      const counter = await Counter.findOneAndUpdate(
        { name: name, businessId: invoice.businessId },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      // Generate the invoice number in the desired format
      const seq = counter!.seq.toString().padStart(12, "0"); // Ensure 12 digits
      invoice.invoiceNumber = invoice.draft ? `EST_${seq}` : `INV_${seq}`;

      invoice.status = invoice.draft
        ? InvoiceStatus.DELIVERED
        : InvoiceStatus.UNPAID;
      next();
    } catch (error: any) {
      next(error);
    }
  } else {
    next(); // Skip if invoiceNumber already exists
  }
});
// schema.statics.createInvoice = async function (invoiceData: Partial<IInvoice>) {
//   const name = invoiceData.draft ? "estimate" : "invoice";

//   const counter = await Counter.findOneAndUpdate(
//     { name, businessId: invoiceData.businessId },
//     { $inc: { seq: 1 } },
//     { new: true, upsert: true }
//   );

//   const seq = counter!.seq.toString().padStart(12, "0");
//   const invoiceNumber = invoiceData.draft ? `EST_${seq}` : `INV_${seq}`;

//   const status = invoiceData.draft ? PaymentStatus.DELIVERED : PaymentStatus.UNPAID;

//   return new this({
//     ...invoiceData,
//     invoiceNumber,
//     status
//   });
// };

export function getInvoiceModel(businessName: string): Model<IInvoice> {
  const modelName = `${businessName}_invoice`;

  try {
    return mongoose.model<IInvoice>(modelName, schema);
  } catch (e: any) {
    if (e.name === "OverwriteModelError") {
      return mongoose.model<IInvoice>(modelName);
    }
    throw e;
  }
}
// export default mongoose.model<IInvoice>("Invoice", InvoiceSchema);
