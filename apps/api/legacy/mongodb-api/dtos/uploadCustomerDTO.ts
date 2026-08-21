import { Currency } from "../enums/service.enum";
import { AccountType } from "../enums/users.enum";
import { IBusiness } from "../interfaces/business.interface";
import { ICustomer } from "../interfaces/customer.interface";

export default class UploadCustomerDTO {
  firstName: string;
  lastName: string;
  email: string;
  createdBy: string;
  address: string;
  company: string;
  phone: object;
  password: string;
  accountType: AccountType;
  businessId: string;
  city: string;
  state: string;

  constructor(
    customer: ICustomer,
    createdBy: string,
    number: string,
    countryCode: string,
    password: string,
    businessId: string
  ) {
    this.firstName = customer.firstName;
    this.lastName = customer.lastName;
    this.email = customer.email;
    this.createdBy = createdBy;
    this.address = customer.address;
    this.city = customer.city;
    this.state = customer.state;
    this.company = customer.company;
    this.phone = {
      countryCode,
      number,
    };
    this.password = password;
    this.accountType = AccountType.Customer;
    this.businessId = businessId;
  }
}

export class CustomerOpenBalanceInvoice {
  due: number | null;
  expiry: number | null;
  description: string | null = null;
  order: {
    amount: number;
    currency: Currency;
    items: [
      {
        amount: number;
        quantity: number;
        name: string;
        description: string;
      }
    ];
  } | null = null;
  customer: {
    email: string;
    first_name: string;
    last_name: string;
    phone: {
      country_code: string;
      number: string;
    };
  };
  email: string = "";
  recipientId: string | null = null;
  businessId: string;
  private itemQuantity: number = 1;
  createdBy: string | null = null;
  constructor(
    description: string,
    amount: number,
    customer: Partial<ICustomer> | any,
    business: IBusiness,
    createdBy: string | null = null
  ) {
    this.due = Date.now() + 7 * 24 * 60 * 60 * 1000;
    this.expiry = Date.now() + 10 * 24 * 60 * 60 * 1000;
    this.description = description ?? "Open Balance";
    this.order = {
      currency: business.currency ?? Currency.KWD,
      amount: amount * this.itemQuantity,
      items: [
        {
          amount: Number(amount),
          quantity: this.itemQuantity,
          name: description,
          description: description,
        },
      ],
    };
    this.customer = {
      email: customer.email,
      first_name: customer.firstName,
      last_name: customer.lastName,
      phone: {
        country_code: customer.countryCode || customer.phone.countryCode || "", // used for both bulk upload and single creation
        number: customer.number || customer.phone.number || "", // used for both bulk upload and single creation
      },
    };
    this.email = customer.email;
    this.businessId = business._id.toString();
    this.createdBy = createdBy;
  }

  setRecipientId(id: string) {
    this.recipientId = id;
  }
}
