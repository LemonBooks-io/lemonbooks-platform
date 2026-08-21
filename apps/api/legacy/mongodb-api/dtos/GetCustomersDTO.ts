import { IBusiness } from "../interfaces/business.interface";
import { ICustomer } from "../interfaces/customer.interface";

export class GetCustomersDTO {
  id: any;
  firstName: string;
  lastName: string;
  email: string;
  createdBy: string;
  phone: {
    countryCode: string;
    number: string;
  };
  address: string;
  company: string;
  receivables : number;

  constructor(customer: ICustomer, receivable? : number) {
    this.id = customer._id;
    this.firstName = customer.firstName;
    this.lastName = customer.lastName;
    this.email = customer.email;
    this.createdBy = customer.createdBy;
    this.phone = customer.phone;
    this.address = customer.address;
    this.company = customer.company;
    this.receivables = receivable ?? 0
  }
}


export class GetCustomerByIdDTO extends GetCustomersDTO{
  ownedBusinesses: any[]
  constructor(customer: ICustomer, ownedBusinesses : IBusiness[], receivable? : number){
    super(customer, receivable)

    this.ownedBusinesses = ownedBusinesses.map(business=>({
      name : business.name,
      email : business.email,
      address: business.address,
      currency : business.currency,
      businessId: business._id
    }))
  }
}