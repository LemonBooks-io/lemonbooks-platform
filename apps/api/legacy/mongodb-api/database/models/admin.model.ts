import mongoose, { Model, Schema } from "mongoose";
import { IAdmin } from "../../interfaces/admin.interface";
import { AccountType, Roles } from "../../enums/users.enum";


const schema = new Schema<IAdmin>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    hasSetPassword: {
      type: Boolean,
      required: true,
      default : false
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(Roles),
      default : Roles.Admin
    },
    permissionSet: {
      type: [String],
      required: true,
      default: [],
    },
    accountType: {
      type: String,
      required: true,
      enum: Object.values(AccountType),
      default : AccountType.Business
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "businesses",
      required: true,
      index : true
    },
    tenantId: {
      type: String,
      ref: "tenants",
      required: true,
      index : true
    },
    userAgent:{
      type: String,
    },
    ipAddress:{
      type: String
    },
    rememberDeviceExpiration : {
      type: Date,
    },
    createdBy:{
      type: String,
    }
  },
  {
    timestamps: true,
    versionKey: false,
    id: false,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.adminId = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.userAgent;
        delete ret.ipAddress;
        delete ret.rememberDeviceExpiration;
        return ret;
      },
    },
  }
);




const Admin: Model<IAdmin> = mongoose.model("admins", schema);

export default Admin;
