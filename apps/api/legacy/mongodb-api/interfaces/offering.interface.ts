import { Schema } from "mongoose";
import IGenericRepository from "./generic.repository.interface";
import { Currency, ServiceDuration } from "../enums/service.enum";

export interface IOffering {
    _id? : Schema.Types.ObjectId,
    name : string,
    description : string,
    cost  : number,
    currency : Currency,
    categoryId : string,
    // categoryName? : string,
    type : "PRODUCT" | "SERVICE",
    businessId : string | null,
    billingCycle? : {unit : number, duration : ServiceDuration},
    serviceCycle? : {unit : number, duration : ServiceDuration},
    isSystemService? : boolean,
    serviceCode : string,
    createdBy : string,
}


export interface IOfferingRepository extends IGenericRepository<IOffering>{
}