import { Schema } from "mongoose";
import IGenericRepository from "./generic.repository.interface";
import { TokenType } from "../enums/token.enum";
import { IBusiness } from "./business.interface";

export interface ITokenData {
    id: string;
    role : string | null;
    permissions : string[],
    accountType : string, 
    businessId : string,
    tenantId : string, // add later
    type : TokenType,
    businessConfig? : Partial<IBusiness> | undefined 
  }
  

export interface IOtp{
    _id? : Schema.Types.ObjectId,
    userId : string,
    token : string,
    expiryInSecs? : Date
}


export interface IOtpRepository extends IGenericRepository<IOtp>{
  findByOtpAndUserId(otp: string, userId : string): Promise<IOtp | null>;
}