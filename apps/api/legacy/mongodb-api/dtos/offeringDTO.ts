import { Currency, ServiceDuration } from "../enums/service.enum";
import { IOffering } from "../interfaces/offering.interface";

export class OfferingDTO {
    id: string;
    name: string;
    description: string;
    cost: number;
    currency: Currency;
    categoryId: string;
    type: "PRODUCT" | "SERVICE";
    businessId: string | null;
    billingCycle?: {unit : number, duration : ServiceDuration} | undefined;
    serviceCycle: {unit : number, duration : ServiceDuration} | undefined;
    serviceCode : string | null;
    createdBy: string;

    constructor(offering : IOffering) {
        this.id = offering._id!.toString();
        this.name = offering.name;
        this.description = offering.description;
        this.cost = offering.cost;
        this.currency = offering.currency;
        this.categoryId = offering.categoryId;
        this.type = offering.type;
        this.businessId = offering.businessId;
        this.billingCycle = offering.billingCycle;
        this.serviceCycle = offering.serviceCycle;
        this.createdBy = offering.createdBy;
        this.serviceCode = offering.serviceCode;
    }
}



export class UploadOfferingDTO{
    name: string;
    description: string;
    cost: number;
    currency: Currency;
    categoryId: string;
    type: "PRODUCT" | "SERVICE";
    businessId: string | null;
    billingCycle?: {unit : number, duration : ServiceDuration}  | undefined;
    serviceCycle: {unit : number, duration : ServiceDuration} | undefined;
    createdBy: string;

    constructor(offering : any, createdBy : string, businessId : string) {
        this.name = offering.name;
        this.description = offering.description;
        this.cost = offering.cost;
        this.currency = offering.currency;
        this.categoryId = offering.categoryId;
        this.type = offering.type;
        this.businessId = businessId;
        this.billingCycle = {
          unit: Number(offering.billingCycleUnit) ?? 1,
          duration: offering.billingCycleDuration ?? ServiceDuration.MONTH,
        };
        this.serviceCycle = {
          unit: Number(offering.serviceCycleUnit) ?? 1,
          duration: offering.serviceCycleDuration ?? ServiceDuration.MONTH,
        };
        this.createdBy = createdBy;
    }
}