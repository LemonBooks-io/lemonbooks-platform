import mongoose, { Model, Schema } from "mongoose";
import { Currency, ServiceDuration } from "../../enums/service.enum";
import { IOffering } from "../../interfaces/offering.interface";

export const cycleSchema = new Schema(
  {
    unit: {
      type: Number,
      required: true,
      default: 1,
    },
    duration: {
      type: String,
      required: true,
      enum: Object.keys(ServiceDuration),
      default : ServiceDuration.MONTH
    },
  },
  {
    timestamps: false,
    versionKey: false,
    id: false,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

const schema = new Schema<IOffering>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    cost: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      enum: Object.keys(Currency),
      default: Currency.KWD,
    },
    categoryId: {
      type: String,
      ref: "categories",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["PRODUCT", "SERVICE"],
    },
    businessId: {
      type: String,
      ref: "businesses",
      required: true,
    },
    billingCycle: cycleSchema,
    serviceCycle:cycleSchema,
    isSystemService: {
      type: Boolean,
      default: false,
    },
    serviceCode: String,
    createdBy: {
      type: String,
      required: true,
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

// Create a service code for each service..
schema.pre("validate", function (next) {
  if (
    this.isNew &&
    this.type === "SERVICE" &&
    this.isSystemService &&
    !this.serviceCode
  ) {
    const formatted = this.name.trim().replace(/\s+/g, "-");
    this.serviceCode = `SVC-${formatted}`;
  }
  next();
});
const Offering: Model<IOffering> = mongoose.model("offerings", schema);

export default Offering;
