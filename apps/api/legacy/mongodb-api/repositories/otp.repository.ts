import GenericRepository from "./generic.repository";
import { IOtp, IOtpRepository } from "../interfaces/token.interface";
import OTP from "../database/models/otp.model";
import { Model } from "mongoose";


export default class OtpRepository extends GenericRepository<IOtp> implements IOtpRepository{
    private Otp : Model<IOtp>;
    constructor(){
        super(OTP);
        this.Otp = OTP;
    }
    public async findByOtpAndUserId(otp: string, userId : string): Promise<IOtp | null> {
        return await this.Otp.findOne({ token: otp,userId : userId });
    }
}