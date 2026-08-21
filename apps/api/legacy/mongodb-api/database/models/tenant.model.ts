import mongoose, { Model, Schema } from "mongoose";
import { ITenant } from "../../interfaces/tenant.interface";

const tenantSchema = new Schema<ITenant>(
  {
    tenantId: {
      type: String,
      required: true,
      unique: true,
    },
   businessId :  {
        type: String,
        unique: true,
        required: true,
      }
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



const Tenant: Model<ITenant> = mongoose.model("tenants", tenantSchema);

export default Tenant;
