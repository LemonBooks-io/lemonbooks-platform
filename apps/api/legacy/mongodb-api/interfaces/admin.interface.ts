import { Schema } from "mongoose";
import IGenericRepository from "./generic.repository.interface";
import { AccountType, Roles } from "../enums/users.enum";

export interface IDevice{
  userAgent: string,
  ipAddress: string,
  rememberMeExpires: Date,
}

export interface IAdmin {
  _id?: Schema.Types.ObjectId;
  businessId : Schema.Types.ObjectId;
  tenantId : string;
  email: string;
  name: string;
  password: string;
  hasSetPassword : boolean,
  role: Roles;
  accountType : AccountType;
  permissionSet: string[];
  userAgent: string,
  ipAddress: string,
  rememberDeviceExpiration: Date,
  createdBy : string
}

export interface IAdminRepository extends IGenericRepository<IAdmin> {
}
