import { AccountType } from "../enums/users.enum";
import { IBusiness } from "../interfaces/business.interface";
import { ICustomer } from "../interfaces/customer.interface";
import { AuthTokenResponse, LoginType } from "./loginResponseDto";

export class CustomerLoginResponseDto{
  loginType : LoginType;
  authToken : AuthTokenResponse;
  accountType : AccountType;
  id: string;
  // businessId : string;
  host_business: Partial<IBusiness>;
  tenantId : string;
  email: string;
  firstName : string;
  constructor(loginType : LoginType,customer: ICustomer, authToken : AuthTokenResponse, tenantId : string, business : Partial<IBusiness | any>){
    this.loginType = loginType
    this.accountType = customer.accountType
    this.authToken = authToken 
    this.id = customer._id!.toString()
    // this.businessId = customer.businessId!.toString()
    this.email = customer.email 
    this.accountType = customer.accountType
    this.tenantId = tenantId;
    this.firstName = customer.firstName;
    this.host_business = business
  }
}
