import { ServiceDuration } from "../enums/service.enum";
import IGenericRepository from "./generic.repository.interface";

export interface ISubscription {
  _id? : string
  serviceCode?: string;
  serviceId: string;
  amount : number;
  description: string;
  ownerId: string;
  isSystemService?: boolean;
  billingCycle: { unit: number; duration: ServiceDuration };
  nextBillingDate: Date | null;
  lastPaymentDate: Date | null;
  metaData: IMetaData;
  isCancelled: boolean;
  startDate: Date;
  expireDate: Date;
}

export interface IMetaData {
  customerDetails: {
    businessId: string | null; // business housing the customer
    firstName: string;
    lastName: string;
    email: string;
    /* The tenant details where the customer resides*/
    tenantId: string;
  };
  /** on behalf of a business  */
  beneficiaryDetails: {
    email : string
    name : string
    id : string
  }
}

export interface ISubscriptionRepository
  extends IGenericRepository<ISubscription> {
  getCustomerSubscriptionsWithServiceDetail(
    customerId: string,
    offset: number,
    limit: number
  ): Promise<any>;
}
