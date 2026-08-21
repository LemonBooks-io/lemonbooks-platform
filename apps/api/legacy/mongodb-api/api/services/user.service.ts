import httpStatus from "http-status";
import EmailService from "../../email/emailer";
import ApiError from "../../utilities/error.base";
import { EmailType } from "../../enums/mail.enum";
import SecurityHelperService from "../../helpers/security";
import { generateRandomPassword } from "../../helpers/password";
import { AccountType } from "../../enums/users.enum";
import { IBusinessRepository } from "../../interfaces/business.interface";
import BusinessRepository from "../../repositories/business.repository";
import { GetBusinessUsersDTO } from "../../dtos/GetUsersDTO";
import { IUser, IUserRepository } from "../../interfaces/user.interface";
import UserRepository from "../../repositories/user.repository";
import { UserProfileDTO } from "../../dtos/ProfileDTO";
import CsvUploadHelper from "../../helpers/csv.parser";
import UploadUserDTO from "../../dtos/UserDTO";
import { BatchUserDTO } from "../../dtos/BatchUserDTO";
// import config from "config";
export default class UserService {
  private userRepository: IUserRepository;
  private businessRepository: IBusinessRepository;
  private emailService = new EmailService();

  constructor() {
    this.userRepository = new UserRepository();
    this.businessRepository = new BusinessRepository();
  }

  /**
   *
   * @param user
   * @param businessId
   * @param tenant
   * @returns
   */
  async CreateUserAccount(user: IUser, businessId: string, tenant: string) {
    // checking if user account exists for a particular business
    let [_user, business] = await Promise.all([
     await this.userRepository.findOne({
      email: { $regex: new RegExp(`^${user.email}$`, "i") },
      businessId: businessId,
    }),
     await this.businessRepository.findById(businessId)
    ])

    if (_user)
      throw new ApiError(
        httpStatus.CONFLICT,
        "User account exists with this email"
      );

    if(!business)
      throw new ApiError(
        httpStatus.CONFLICT,
        "Business not found"
      );

    // Generate random password
    const genPassword = generateRandomPassword();

    const hp = await SecurityHelperService.HashPassword(genPassword);
    _user = await this.userRepository.create({
      ...user,
      password: hp,
      businessId: businessId as any,
      accountType:
        tenant === "administrator" ? AccountType.System : AccountType.Business,
      tenantId: tenant,
    });

    
    //send credentials to user mail
    this.emailService.SendEMailToUser(
      {
        to: _user.email,
        subject : `Welcome to ${business.name} management portal`,
        bodyParts: {
          businessName : business.name ?? "",
          name: _user.name,
          email: _user.email,
          password: genPassword,
          _id: _user._id,
          // changePasswordUrl : `https://${tenant}.${config.get("CLIENT_URL")}/changePassword?id=${user._id}&token=${temporaryToken.token}`
        },
      },
      EmailType.CredentialsEmail
    );

    return;
  }

  async GetUserProfile(userId: string): Promise<UserProfileDTO> {
    const user = await this.userRepository.findById(userId);

    if (!user)
      throw new ApiError(httpStatus.NOT_FOUND, "User account not found.");
    const businessInfo = await this.businessRepository.findById(
      user.businessId.toString()
    );

    if (!businessInfo)
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Oops, The business associated with this user not found"
      );

    return new UserProfileDTO(user, businessInfo);
  }

  async getUsersForBusiness(
    businessId: string,
    offset: number,
    limit: number
  ): Promise<{ users: GetBusinessUsersDTO[]; totalCount: number }> {
    const users = await this.userRepository.findAll(
      { businessId },
      offset,
      limit
    );

    const dto = users.data.map((user: IUser) => new GetBusinessUsersDTO(user));

    return {
      users: dto,
      totalCount: users.totalCount,
    };
  }

  async createUsersFromCsv(
    csvFile: Express.Multer.File,
    businessId: string,
    userId: string, // the creator id
    tenantId: string,
    accountType: AccountType
  ): Promise<{ failedRecords: object[]; failedCount: number }> {
    const data = await CsvUploadHelper.csvParserHelper(csvFile!, []);
    const users = await Promise.all(
      (data as IUser[]).map(async (user: IUser) => {
        const password = SecurityHelperService.generateRandomPassword();
        const hashedPassword = await SecurityHelperService.HashPassword(
          password
        );
        return new UploadUserDTO(
          user,
          hashedPassword,
          businessId,
          userId,
          tenantId,
          accountType
        );
      })
    );
    const result = await this.userRepository.bulkCreate(users as any);
    return result;
  }

  async editUserProfile(userId: string, updateData: Partial<IUser>) {
    const user = await this.userRepository.findById(userId);
    if (!user)
      throw new ApiError(httpStatus.NOT_FOUND, "User account not found.");

    await this.userRepository.update({ _id: userId }, { ...updateData });
    return this.GetUserProfile(userId);
  }

  async getUsersByIds(ids: string[]): Promise<BatchUserDTO[]> {
    const users = await this.userRepository.find({ _id: { $in: ids } });
    const idNotFoundInUsers = ids.filter((id) => !users.some((user) => user._id!.toString() === id));

    console.log(idNotFoundInUsers)
    // const additionalUsersId 
    // if(idNotFoundInUsers.length > 0){
    //   const businessIds = await this.businessRepository.find({_id: { $in: idNotFoundInUsers}}, 'customerId')

    // }
    // console.log(businessIds)
    return users.map((user: IUser) => new BatchUserDTO(user));
  }
}
