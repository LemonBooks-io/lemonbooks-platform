import { Schema } from "mongoose";
import { AccountType, Roles } from "../enums/users.enum";
import IGenericRepository from "./generic.repository.interface";

export interface IUser {
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
    phone : {
      countryCode : string;
      number : string;
    };
    userAgent: string,
    ipAddress: string,
    rememberDeviceExpiration: Date,
    createdBy : string
  }


  export interface IUserRepository extends IGenericRepository<IUser> {
  }