
import mongoose, { Model, Schema } from "mongoose";
import { ISubscription } from "../../interfaces/subscription.interface";
import { cycleSchema } from "./offering.model";

const schema = new Schema<ISubscription>(
  {
    serviceCode: {
      type: String,
      default : null,
    },
    serviceId : {
      type : String,
      default : null
    },
    ownerId: {
      type: String,
      required: true,
      default : null
    },
    isSystemService : {
      type : Boolean,
      default : false
    },
    amount: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      required: false,
      default: ""
    },
    billingCycle: cycleSchema,
    nextBillingDate : {
      type : Date,
    },
    lastPaymentDate :{
      type: Date, 
      default :null,
    },
    metaData: {
      customerDetails: {
        businessId: { type: String },
        firstName: { type: String, required: true, default : "" },
        lastName: { type: String, required: true, default : "" },
        email: { type: String, required: true },
        tenantId: { type: String, required: true },
      },
      beneficiaryDetails: {
        type: Object,
        default : {}
      }
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expireDate: {
      type: Date,
      index: {
        expires: 1,
      },
      default: () => new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
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

const Subscription: Model<ISubscription> = mongoose.model(
  "subscriptions",
  schema
);

export default Subscription;
