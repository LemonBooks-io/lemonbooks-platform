import { ICustomer } from "../interfaces/customer.interface";
import { IOffering } from "../interfaces/offering.interface";
import { ISubscription } from "../interfaces/subscription.interface";

export default class GetCustomerSubscriptions {
  id: string;
  serviceCode: string | null;
  serviceId: string;
  ownerId: string;
  isSystemService: boolean;
  billingCycle: {
    unit: number;
    duration: string;
  };
  isCancelled: boolean = false;
  nextBillingDate: Date | null = null;
  lastPaymentDate: Date | null = null;
  startDate: Date;
  expireDate: Date;
  metaData: {
    customerDetails: Record<string, any>;
    beneficiaryDetails: Record<string, any>;
  };
  service: Partial<IOffering>;
  amount : number;
  description : string;
  customerCompany: string | null = null;
  constructor(
    subscription: ISubscription & { service: IOffering },
    customer: ICustomer
  ) {
    this.id = subscription._id!.toString();
    this.serviceCode = subscription.serviceCode ?? null;
    this.ownerId = subscription.ownerId;
    this.serviceId = subscription.serviceId;
    this.isSystemService = subscription.isSystemService ?? false;
    this.billingCycle = subscription.billingCycle;
    this.isCancelled = subscription.isCancelled;
    this.nextBillingDate = subscription.nextBillingDate;
    this.lastPaymentDate = subscription.lastPaymentDate;
    this.startDate = subscription.startDate;
    this.expireDate = subscription.expireDate;
    this.metaData = subscription.metaData;
    this.service = subscription.service;
    this.amount = subscription.amount;
    this.description = subscription.description;
    this.customerCompany = customer.company;
  }
}
