import { AccountType, Roles } from "../enums/users.enum";
import { IAdmin } from "../interfaces/admin.interface";
import { IUser } from "../interfaces/user.interface";

export  class GetBusinessUsersDTO {
  id: string;
  businessId: string;
  email: string;
  name: string;
  role: Roles;
  accountType: AccountType;
  permissionSet: string[];
  createdBy: string;
  phone? : object = {};

  constructor(user: IUser) {
    this.id = user._id!.toString();
    this.businessId = user.businessId.toString();
    this.email = user.email;
    this.name = user.name;
    this.role = user.role;
    this.accountType = user.accountType;
    this.permissionSet = user.permissionSet;
    this.createdBy = user.createdBy;
    this.phone = user.phone;
  }
}
export  class GetUsersForBusinessDTO {
  id: string;
  businessId: string;
  email: string;
  name: string;
  role: Roles;
  accountType: AccountType;
  permissionSet: string[];
  createdBy: string;

  constructor(admin: IAdmin) {
    this.id = admin._id!.toString();
    this.businessId = admin.businessId.toString();
    this.email = admin.email;
    this.name = admin.name;
    this.role = admin.role;
    this.accountType = admin.accountType;
    this.permissionSet = admin.permissionSet;
    this.createdBy = admin.createdBy;
  }
}