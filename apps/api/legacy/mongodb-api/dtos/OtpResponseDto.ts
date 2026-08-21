import { IAdmin } from "../interfaces/admin.interface";

export class SendOtpDto{
    email: string;
   
  
    constructor(user: IAdmin) {
      this.email = user.email;
     
    }
}