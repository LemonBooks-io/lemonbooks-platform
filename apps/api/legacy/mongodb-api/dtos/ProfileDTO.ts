import { AccountType, Roles } from "../enums/users.enum";
import { IAdmin } from "../interfaces/admin.interface";
import { IBusiness } from "../interfaces/business.interface";
import { IUser } from "../interfaces/user.interface";

export class AdminProfileDTO{
    tenantId : string;
    email: string;
    name: string;
    role: Roles;
    accountType : AccountType;
    permissionSet: string[];
    businessInformation : Partial<IBusiness>
    constructor(admin : IAdmin, business : Partial<IBusiness>){
        this.email = admin.email;
        this.name = admin.name;
        this.role = admin.role;
        this.accountType = admin.accountType;
        this.permissionSet = admin.permissionSet;
        this.tenantId = admin.tenantId;
        this.businessInformation = business;
    }
}
export class UserProfileDTO{
    tenantId : string;
    email: string;
    name: string;
    role: Roles;
    accountType : AccountType;
    permissionSet: string[];
    businessInformation : Partial<IBusiness | any>
    phone? : object = {};
    constructor(user : IUser, business : Partial<IBusiness>){
        this.email = user.email;
        this.name = user.name;
        this.role = user.role;
        this.accountType = user.accountType;
        this.permissionSet = user.permissionSet;
        this.tenantId = user.tenantId;
        // this.businessInformation = business;
        this.businessInformation = {
            name : business.name,
            email : business.email,
            address : business.address,
            currency : business.currency,
            businessId : business._id
        };
        this.phone = user.phone;
    }
}