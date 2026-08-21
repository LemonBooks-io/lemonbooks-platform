import httpStatus from "http-status";
import { IAdmin, IAdminRepository } from "../../interfaces/admin.interface";
import EmailService from "../../email/emailer";
import ApiError from "../../utilities/error.base";
import { EmailType } from "../../enums/mail.enum";
import SecurityHelperService from "../../helpers/security";
import { generateRandomPassword } from "../../helpers/password";
import AdminRepository from "../../repositories/admin.repository";
import { AccountType } from "../../enums/users.enum";
import { IBusinessRepository } from "../../interfaces/business.interface";
import BusinessRepository from "../../repositories/business.repository";
import { AdminProfileDTO } from "../../dtos/ProfileDTO";
import {GetUsersForBusinessDTO} from "../../dtos/GetUsersDTO";

export default class AdminService {
  private adminRepository: IAdminRepository;
  private businessRepository : IBusinessRepository;
  private emailService = new EmailService();

  constructor() {
    this.adminRepository = new AdminRepository();
    this.businessRepository = new BusinessRepository();
  }

  /**
   *
   * @param admin
   * @returns
   */
  async CreateAdminAccount(admin: IAdmin, businessId: string, tenant : string) {
    // checking if admin account exists for a particular business
    let _admin = await this.adminRepository.findOne({
      email: { $regex: new RegExp(`^${admin.email}$`, "i") },
      businessId: businessId,
    });

    if (_admin)
      throw new ApiError(
        httpStatus.CONFLICT,
        "Admin account exists with this email"
      );

    // Generate random password
    const genPassword = generateRandomPassword();

    const hp = await SecurityHelperService.HashPassword(genPassword);
    _admin = await this.adminRepository.create({
      ...admin,
      password: hp,
      businessId: businessId as any,
      accountType : tenant === "administrator" ? AccountType.System : AccountType.Business,
      tenantId : tenant
    });

    //send credentials to admin mail
    this.emailService.SendEMailToUser(
      {
        to: admin.email,
        bodyParts: {
          name: _admin.name,
          email: _admin.email,
          password: genPassword,
          _id: _admin._id,
        },
      },
      EmailType.CredentialsEmail
    );

    return;
  }

  async GetAdminProfile(userId: string): Promise<AdminProfileDTO>{
    const admin = await this.adminRepository.findById(userId) 

    if(!admin) throw new ApiError(httpStatus.NOT_FOUND, "Admin account not found.");
    const businessInfo = await this.businessRepository.findById(admin.businessId.toString());

    if(!businessInfo) throw new ApiError(httpStatus.NOT_FOUND, "Oops, The business asssociated with this admin not found")

    return new AdminProfileDTO(admin, businessInfo)
  }
  

  async getUsersForBusiness(businessId : string, offset : number, limit: number) : Promise<{users : GetUsersForBusinessDTO[], totalCount: number}>{
    const admins = await this.adminRepository.findAll({businessId}, offset, limit)

    const dto = admins.data.map((admin)=> new GetUsersForBusinessDTO(admin) )

    return {
      users : dto,
      totalCount : admins.totalCount
    }
  }
}
