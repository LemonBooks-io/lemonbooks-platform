import { TokenType } from "../enums/token.enum";
import { AccountType, Roles } from "../enums/users.enum";
import { IBusiness } from "../interfaces/business.interface";
import { IUser } from "../interfaces/user.interface";

export class LoginResponseDto {
  loginType: LoginType;
  authToken: AuthTokenResponse;
  accountType: AccountType;
  role: Roles;
  id: string;
  business: any | Partial<IBusiness>;
  businessId: string;
  tenantId: string;
  email: string;
  hasSetPassword: boolean;
  name: string;
  constructor(loginType: LoginType, user: IUser, authToken: AuthTokenResponse, business : Partial<IBusiness>) {
    this.loginType = loginType;
    this.accountType = user.accountType;
    this.authToken = authToken;
    this.role = user.role;
    this.id = user._id!.toString();
    this.businessId = (user as any).businessId._id;
    this.business = business
    this.email = user.email;
    this.role = user.role;
    this.accountType = user.accountType;
    this.tenantId = user.tenantId;
    this.hasSetPassword = user.hasSetPassword;
    this.name = user.name;
  }
}

export enum LoginType {
  MFA_REQUIRED = "MFA_REQUIRED",
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
}

export class AuthTokenResponse {
  constructor(
    public token: string,
    public expiresIn: number,
    public type: TokenType
  ) {
    this.token = token;
    this.expiresIn = expiresIn;
    this.type = type;
  }
}

export class VerifyOtpDtoWithCred {
  authToken: AuthTokenResponse;
  id: string;
  businessId: string;
  tenantId: string;
  email: string;
  hasSetPassword: boolean;
  role: Roles;
  accountType: AccountType;
  permissionSet: string[] = [];
  loginType: LoginType;

  constructor(token: AuthTokenResponse, user: IUser) {
    this.authToken = token;
    this.id = user._id!.toString();
    this.businessId = user.businessId!.toString();
    this.email = user.email;
    this.role = user.role;
    this.accountType = user.accountType;
    this.tenantId = user.tenantId;
    this.hasSetPassword = user.hasSetPassword;
    this.permissionSet = user.permissionSet;
    this.loginType = LoginType.LOGIN_SUCCESS;
  }
}
