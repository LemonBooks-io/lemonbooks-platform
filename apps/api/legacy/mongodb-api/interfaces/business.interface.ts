import { Schema } from "mongoose";
import IGenericRepository from "./generic.repository.interface";
import { Currency } from "../enums/service.enum";
export interface IBusiness{
    _id :  Schema.Types.ObjectId;
    tapEncryptedKeys : ITapCredentials;
    name : string;
    email : string;
    address? : string;
    phone : object;
    customerId? : string;
    logoUrl : string;
    createdBy : Schema.Types.ObjectId;
    currency : Currency | null;
    enableTapPayment : boolean;
}
export interface ITapCredentials {
    key : string;
    iv : string;
}

export interface IBusinessRepository extends IGenericRepository<IBusiness>{
}
