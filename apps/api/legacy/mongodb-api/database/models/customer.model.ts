import mongoose, { Model, Schema } from "mongoose";
import { AccountType } from "../../enums/users.enum";
import { ICustomer } from "../../interfaces/customer.interface";


export const schema = new Schema<ICustomer>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index : true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      default : null
    },
    address: {
      type: String,
      default : null
    },
    city: {
      type: String,
      default : null
    },
    state: {
      type: String,
      default : null
    },
    country: {
      type: String,
      default : null
    },
    company: {
      type: String,
      required : true,
      default : null
    },
    phone: {
      countryCode : String,
      number : String,
    },
    // role: {
    //   type: String,
    //   enum: Object.values(Roles),
      
    // },
    accountType: {
      type: String,
      required: true,
      enum: Object.values(AccountType),
      default : AccountType.Customer
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "businesses",
      required: true,
    },
    createdBy:{
      type: String,
      ref : "admins",
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
        delete ret.password;
        return ret;
      },
    },
  }
);


export function getCustomerModel(businessName: string): Model<ICustomer> {
    const modelName = `${businessName}_customers`;
  
    try {
      return mongoose.model<ICustomer>(modelName, schema);
    } catch (e: any) {
      if (e.name === "OverwriteModelError") {
        return mongoose.model<ICustomer>(modelName);
      }
      throw e;
    }
  }


// const Admin: Model<ICustomer> = mongoose.model("admins", schema);

// export default Admin;
