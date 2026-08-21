import mongoose, { Model, Schema } from "mongoose";
import { IBusiness } from "../../interfaces/business.interface";
import { Currency } from "../../enums/service.enum";

const schema = new Schema<IBusiness>(
  {
    name : {
      type: String,
      required: true,
      unique : true
    },
    email : {
      type: String,
      required: true,
      unique : true
    },
    address : {
      type: String,
      default : null
    },
    phone : {
      countryCode : String,
      number : String,
    },
    customerId: {
      type: String,
    },
    tapEncryptedKeys: {
      key: String,
      iv: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "admins",
    },
    logoUrl : {
      type: String,
      default : null
    },
    currency : {
      type: String,
      default : null,
      enum : Object.keys(Currency)
    },
    enableTapPayment:{
      type: Boolean,
      default : false,
    }
  },
  {
    timestamps: true,
    versionKey: false,
    id: false,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.businessId = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

const Business: Model<IBusiness> = mongoose.model("businesses", schema);

export default Business;
