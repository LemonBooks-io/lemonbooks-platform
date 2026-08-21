import { AccountType, Roles } from "../enums/users.enum";
import { IUser } from "../interfaces/user.interface";

export default class UploadUserDTO{
    businessId : string;
    tenantId : string;
    email: string;
    name: string;
    password: string;
    role: Roles;
    accountType : AccountType;
    createdBy : string;

    constructor(user : IUser, password : string, businessId : string, createdBy : string, tenantId  : string, accountType : AccountType){
        this.businessId = businessId;
        this.tenantId = tenantId;
        this.email = user.email;
        this.name = user.name;
        this.password = password;
        this.role = user.role;
        this.accountType = accountType;
        this.createdBy = createdBy;
    }
}