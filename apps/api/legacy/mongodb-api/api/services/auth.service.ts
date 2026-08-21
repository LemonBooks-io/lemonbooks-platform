import httpStatus from "http-status";
import {
  AuthTokenResponse,
  LoginResponseDto,
  LoginType,
  VerifyOtpDtoWithCred,
} from "../../dtos/loginResponseDto";
import EmailService from "../../email/emailer";
import { IDevice } from "../../interfaces/admin.interface";
import ApiError from "../../utilities/error.base";
import SecurityHelperService from "../../helpers/security";
import { TokenType } from "../../enums/token.enum";
import { EmailType } from "../../enums/mail.enum";
import { IOtpRepository } from "../../interfaces/token.interface";
import OtpRepository from "../../repositories/otp.repository";
import { SendOtpDto } from "../../dtos/OtpResponseDto";
import { IUserRepository } from "../../interfaces/user.interface";
import UserRepository from "../../repositories/user.repository";
import CustomerRepository from "../../repositories/customer.repository";
import { CustomerLoginResponseDto } from "../../dtos/CustomerLoginResponseDTO";
import {
  IBusiness,
  IBusinessRepository,
} from "../../interfaces/business.interface";
import config from "config";
import BusinessRepository from "../../repositories/business.repository";
export default class AuthService {
  private userRepository: IUserRepository;
  private emailService = new EmailService();
  private otpRepository: IOtpRepository;
  private businessRepository: IBusinessRepository;
  constructor() {
    this.userRepository = new UserRepository();
    this.otpRepository = new OtpRepository();
    this.businessRepository = new BusinessRepository();
  }

  async loginAccount(
    email: string,
    password: string,
    tenantId: string,
    device: IDevice
  ): Promise<LoginResponseDto> {
    const user = await this.userRepository.findOne(
      {
        email: { $regex: new RegExp(`^${email}$`, "i") },
        tenantId: { $regex: new RegExp(`^${tenantId}$`, "i") },
      },
      "businessId"
    );

    // check if account exists
    if (!user)
      throw new ApiError(httpStatus.NOT_FOUND, "Account does not exist");

    // check password
    const isValidPassword = await SecurityHelperService.ComparePassword(
      password,
      user.password
    );
    if (!isValidPassword) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    // Gather business information from user data
    const business = (user as any).businessId;
    const businessId = business._id as string;
    const businessTapKey = business.tapEncryptedKeys;
    const decryptedKeys = businessTapKey.key
      ? SecurityHelperService.aesDecrypt(businessTapKey.key, businessTapKey.iv)
      : null;

    const maskedTapKey = SecurityHelperService.maskApiKey(decryptedKeys);

    let businessInformation: Partial<IBusiness | any> = {
      businessId,
      name: business.name,
      logoUrl: business.logoUrl ?? null,
      tapEncryptedKeys: maskedTapKey,
      currency: business.currency ?? null,
      enableTapPayment: business.enableTapPayment,
      address: business.address ?? null,
    };

    // check if login is on the previously used device
    if (
      user.userAgent === device.userAgent &&
      user.rememberDeviceExpiration > new Date()
    ) {
      // if user device is same, create a new token and log in
      const token = await SecurityHelperService.GenerateToken({
        id: user._id!.toString(),
        // accountType : admin.accountType,
        businessId: businessId,
        role: user.role,
        tenantId: tenantId,
        permissions: user.permissionSet,
        accountType: user.accountType,
        type: TokenType.AUTH,
        businessConfig: {
          currency: business.currency,
          enableTapPayment: business.enableTapPayment,
          // tapEncryptedKeys: businessTapKey.key,
        },
      });

      return new LoginResponseDto(
        LoginType.LOGIN_SUCCESS,
        user,
        token,
        businessInformation
      );
    } else {
      // generate otp for mfa validation
      const otp = SecurityHelperService.generateOtp();

      await this.otpRepository.create({
        userId: user._id!.toString(),
        token: otp,
      });

      // send otp to user email
      this.emailService.SendEMailToUser(
        {
          to: user.email,
          bodyParts: {
            otp: otp,
          },
        },
        EmailType.VerifyEmail
      );

      const token = await SecurityHelperService.GenerateToken(
        {
          id: user._id!.toString(),
          // accountType : admin.accountType,
          businessId: businessId,
          role: user.role,
          permissions: user.permissionSet,
          tenantId: tenantId,
          accountType: user.accountType,
          type: TokenType.TEMPORARY,
          businessConfig: {
            currency: business.currency,
            enableTapPayment: business.enableTapPayment,
            // tapEncryptedKeys: businessTapKey.key,
          },
        },
        TokenType.TEMPORARY
      );

      return new LoginResponseDto(
        LoginType.MFA_REQUIRED,
        user,
        token,
        businessInformation
      );
    }
  }

  /**
   *
   * @param email
   * send otp to user email, using the user email
   * @returns
   */
  public async sendOtp(email: string, tenant: string): Promise<SendOtpDto> {
    const user = await this.userRepository.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
      tenantId: { $regex: new RegExp(`^${tenant}$`, "i") },
    });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    const otp = SecurityHelperService.generateOtp();

    await this.otpRepository.create({
      userId: user._id!.toString(),
      token: otp,
    });
    // send otp to user email
    this.emailService.SendEMailToUser(
      {
        to: user.email,
        subject: "Verification code",
        bodyParts: {
          otp: otp,
        },
      },
      EmailType.VerifyEmail
    );
    return new SendOtpDto(user);
  }

  /**
   * * Verify otp and delete it from the database
   * @param otp
   * @param userId
   * @returns
   */
  public async verifyAndDeleteOtp(
    otp: string,
    email: string,
    tenant: string,
    rememberDevice: boolean,
    device: IDevice,
    returnCred: boolean = true
  ): Promise<AuthTokenResponse | VerifyOtpDtoWithCred> {
    const user = await this.userRepository.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
      tenantId: { $regex: new RegExp(`^${tenant}$`, "i") },
    });

    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

    const findOtp = await this.otpRepository.findByOtpAndUserId(
      otp,
      user._id!.toString()
    );
    if (!findOtp) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invalid or Expired Token..");
    }

    this.otpRepository.delete(findOtp._id!.toString());

    // save browser information, if rememberDevice is set to true
    if (rememberDevice) {
      await this.userRepository.update(
        { email: { $regex: new RegExp(`^${email}$`, "i") } },
        {
          rememberDeviceExpiration: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ), // remember device for 30 days
          ipAddress: device.ipAddress as string,
          userAgent: device.userAgent as string,
        }
      );
    }

    // send a temporary token for verifying otp
    const token = await SecurityHelperService.GenerateToken(
      {
        id: user._id!.toString(),
        businessId: user.businessId!.toString(),
        role: user.role,
        permissions: user.permissionSet,
        accountType: user.accountType,
        type: TokenType.AUTH,
        tenantId: tenant,
      },
      TokenType.AUTH
    );

    return returnCred
      ? new VerifyOtpDtoWithCred(token, user)
      : new AuthTokenResponse(token.token, token.expiresIn, token.type);
  }

  /**
   *
   * @param userId
   * @param newPassword
   * @returns
   */
  public async changePassword(
    userId: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    // check if password is same as old password
    const comparePassword = await SecurityHelperService.ComparePassword(
      newPassword,
      user.password
    );
    if (comparePassword)
      throw new ApiError(
        httpStatus.CONFLICT,
        "New password cannot be the same as the old password"
      );

    // hash new password and update db....
    const hashedPassword = await SecurityHelperService.HashPassword(
      newPassword
    );
    await this.userRepository.update(
      { _id: user._id },
      { password: hashedPassword, hasSetPassword: true }
    );
    return;
  }
  // -----------------------------------
  //       customers auth
  // -----------------------------------
  /**
   *
   * @param email
   * @param password
   * @param tenantId
   * @returns
   */
  public async customerLogin(
    email: string,
    password: string,
    tenantId: string
  ): Promise<CustomerLoginResponseDto> {
    const customerRepository = CustomerRepository.forBusiness(tenantId);

    const customer = await customerRepository.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    // check if account exists
    if (!customer) {
      throw new ApiError(httpStatus.NOT_FOUND, "Account does not exist");
    }
    // check password
    const isValidPassword = await SecurityHelperService.ComparePassword(
      password,
      customer.password
    );
    if (!isValidPassword) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    const business = await this.businessRepository.findById(
      customer.businessId!
    );

    if(!business) throw new ApiError(httpStatus.NOT_FOUND, "Associated business not found" )
    //
    const token = await SecurityHelperService.GenerateToken({
      id: customer._id!.toString(),
      businessId: customer.businessId!.toString(),
      role: "",
      tenantId: tenantId,
      permissions: [],
      accountType: customer.accountType,
      type: TokenType.AUTH,
    });

    return new CustomerLoginResponseDto(
      LoginType.LOGIN_SUCCESS,
      customer,
      token,
      tenantId,
      {
        businessId: business._id!.toString(),
        name: business.name,
        logoUrl: business.logoUrl ?? null,
        currency: business.currency ?? null,
        enableTapPayment: business.enableTapPayment,
        address: business.address,
      }
    );
  }

  /**
   *
   * @param customerId
   * @param newPassword
   * @param tenantId
   * @returns
   */
  public async changeCustomerPassword(
    customerId: string,
    newPassword: string,
    tenantId: string
  ): Promise<void> {
    const customerRepository = CustomerRepository.forBusiness(tenantId);

    const customer = await customerRepository.findById(customerId);
    if (!customer) {
      throw new ApiError(httpStatus.NOT_FOUND, "Customer not found");
    }
    // check if password is same as old password
    const comparePassword = await SecurityHelperService.ComparePassword(
      newPassword,
      customer.password
    );

    if (comparePassword)
      throw new ApiError(
        httpStatus.CONFLICT,
        "New password cannot be the same as the old password"
      );

    // hash new password and update db....
    const hashedPassword = await SecurityHelperService.HashPassword(
      newPassword
    );

    await customerRepository.update(
      { _id: customer._id },
      { password: hashedPassword }
    );
    return;
  }

  public async resetCustomerPassword(
    email: string,
    tenantId: string
  ): Promise<void> {
    const customerRepository = CustomerRepository.forBusiness(tenantId);

    const customer = await customerRepository.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    if (!customer) {
      throw new ApiError(httpStatus.NOT_FOUND, "Customer not found");
    }

    const temporaryToken = await SecurityHelperService.GenerateToken(
      {
        id: customer._id!.toString(),
        businessId: customer.businessId!.toString(),
        role: "",
        tenantId: tenantId,
        permissions: [],
        accountType: customer.accountType,
        type: TokenType.TEMPORARY,
      },
      TokenType.TEMPORARY
    );

    const resetLink = `https://${tenantId}.${config.get(
      "CLIENT_URL"
    )}/client/changePassword?token=${temporaryToken.token}`;

    // send reset password email
    this.emailService.SendEMailToUser(
      {
        to: customer.email,
        subject: "Reset your password",
        bodyParts: {
          name: customer.firstName,
          resetPasswordUrl: resetLink,
        },
      },
      EmailType.ResetEmail
    );
    return;
  }

  public async resetUserPassword(
    email: string,
    tenantId: string
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
      tenantId: tenantId,
    });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    const temporaryToken = await SecurityHelperService.GenerateToken(
      {
        id: user._id!.toString(),
        businessId: user.businessId!.toString(),
        role: user.role,
        tenantId: tenantId,
        permissions: user.permissionSet,
        accountType: user.accountType,
        type: TokenType.TEMPORARY,
      },
      TokenType.TEMPORARY
    );

    const resetLink = `https://${tenantId}.${config.get(
      "CLIENT_URL"
    )}/changePassword?token=${temporaryToken.token}`;

    // send reset password email
    this.emailService.SendEMailToUser(
      {
        to: user.email,
        subject: "Reset your password",
        bodyParts: {
          name: user.name,
          resetPasswordUrl: resetLink,
        },
      },
      EmailType.ResetEmail
    );
    return;
  }
}
