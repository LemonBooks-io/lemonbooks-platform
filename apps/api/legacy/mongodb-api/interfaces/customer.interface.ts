import { Schema } from "mongoose";
import { AccountType } from "../enums/users.enum";
import IGenericRepository from "./generic.repository.interface";

export interface ICustomer{
  _id: Schema.Types.ObjectId;
  businessId :string | null;
  firstName : string;
  lastName : string;
  email: string;
  password : string;
  phone : {
    countryCode : string;
    number : string;
  };
  address : string;
  city : string;
  state : string;
  country : string;
  createdBy : string;
  company : string;
  accountType : AccountType;
  // role : Roles;
//   hasSetPassword : boolean,
//   permissionSet : string[];
//   phone? : IPhone;
}

export interface ICustomerRepository extends IGenericRepository<ICustomer>{
}