import httpStatus from "http-status";
import {
  IBusiness,
  IBusinessRepository,
} from "../../interfaces/business.interface";
import { ITenantRepository } from "../../interfaces/tenant.interface";
import BusinessRepository from "../../repositories/business.repository";
import TenantRepository from "../../repositories/tenant.repository";
import ApiError from "../../utilities/error.base";
import TransactionContextHandler from "../../utilities/transactionContextHandler";
import { AccountType, Roles } from "../../enums/users.enum";
import { generateRandomPassword } from "../../helpers/password";
import SecurityHelperService from "../../helpers/security";
import { TokenType } from "../../enums/token.enum";
import EmailService from "../../email/emailer";
import config from "config";
import { EmailType } from "../../enums/mail.enum";
import CustomerRepository from "../../repositories/customer.repository";
// import {
//   ISubscription,
//   ISubscriptionRepository,
// } from "../../interfaces/subscription.interface";
// import SubscriptionRepository from "../../repositories/subscription.repository";
// import ServiceRepository from "../../repositories/service.repository";
// import { IServiceRepository } from "../../interfaces/service.interface";
import { IUser, IUserRepository } from "../../interfaces/user.interface";
import UserRepository from "../../repositories/user.repository";
import CloudinaryUploader from "../../storage/cloudinary";
import { Currency } from "../../enums/service.enum";
import { IOfferingRepository } from "../../interfaces/offering.interface";
import OfferingRepository from "../../repositories/offering.repository";
// import ServiceBillingCalculator from "../../utilities/service";

/**
 *
 */
export default class BusinessService {
  private tenantRepository: ITenantRepository;
  private businessRepository: IBusinessRepository;
  private userRepository: IUserRepository;
  private _transactionContextHandler = new TransactionContextHandler();
  // private subscriptionRepository: ISubscriptionRepository;
  private emailService = new EmailService();
  // private serviceRepository: IServiceRepository;
  private uploader: CloudinaryUploader;
  private offeringRepository: IOfferingRepository;

  constructor() {
    this.tenantRepository = new TenantRepository();
    this.businessRepository = new BusinessRepository();
    // this.subscriptionRepository = new SubscriptionRepository();
    // this.serviceRepository = new ServiceRepository();
    this.userRepository = new UserRepository();
    this.uploader = new CloudinaryUploader();
    this.offeringRepository = new OfferingRepository();
  }

  /**
   * * * Create a business profile, tenant data
   * @param business
   * @param _creatorId
   */
  public async createBusinessProfile(
    business: Partial<IBusiness>,
    customerId: string,
    creatorId: string,
    tenant: string,
    serviceCode?: string
  ): Promise<void> {
    // get customer db for system tenant
    const customerRepository = CustomerRepository.forBusiness(tenant);

    const customer = await customerRepository.findById(customerId);
    if (!customer) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Customer profile does not exists"
      );
    }

    //format business name for tenant creation
    const formattedTenantName = this.getConcatenatedTenantName(
      business?.name ?? customer.company
    );

    //check if a tenant has been registered with the formatted name
    const [tenantExists, businessExists] = await Promise.all([
      await this.businessRepository.findOne({
        name : { $regex: new RegExp(`^${business.name}$`, "i") }
      }),
      await this.tenantRepository.findOne({
        tenantId: formattedTenantName,
      }),
    ]);
    // const tenantExists = await this.tenantRepository.findOne({
    //   tenantId: formattedTenantName,
    // });
    if (tenantExists)
      throw new ApiError(
        httpStatus.CONFLICT,
        "A Tenant with this ID already exists"
      );

    if (businessExists)
      throw new ApiError(
        httpStatus.CONFLICT,
        "Business with that name already exists"
      );
    
      // transaction context intializer...
    await this._transactionContextHandler.begin();
    const session = this._transactionContextHandler.getSession();
    try {
      const newBusiness = await this.businessRepository.create(
        {
          customerId,
          createdBy: creatorId as any,
          name: business.name,
          email: business.email,
          phone: customer.phone,
          address: customer.address,
        } as IBusiness,
        session
      );

      //create tenant details
      const tenant = await this.tenantRepository.create(
        {
          tenantId: formattedTenantName,
          businessId: newBusiness._id!.toString(),
        },
        session
      );

      // Generate password for account........
      const password = generateRandomPassword();
      const hp = await SecurityHelperService.HashPassword(password);
      // create an user login credential
      const user = await this.userRepository.create(
        {
          email: business.email,
          accountType: AccountType.Business,
          role: Roles.Admin,
          password: hp,
          businessId: newBusiness._id,
          createdBy: creatorId,
          name: `${customer.firstName} ${customer.lastName}`,
          tenantId: tenant.tenantId,
        } as IUser,
        session
      );

      // create temporary token for password change
      const temporaryToken = await SecurityHelperService.GenerateToken(
        {
          id: user._id!.toString(),
          role: user.role,
          businessId: newBusiness._id.toString(),
          permissions: user.permissionSet,
          tenantId: tenant.tenantId,
          accountType: user.accountType,
          type: TokenType.TEMPORARY,
        },
        TokenType.TEMPORARY,
        86000
      );

      //create a service if there is service code
      if (serviceCode) {
        // const service = await this.serviceRepository.findOne({
        //   serviceCode: serviceCode,
        // });

        const _service = await this.offeringRepository.findOne({
          serviceCode: serviceCode, // change to service Id
          type: "SERVICE",
        });

        // if (!service)
        //   throw new ApiError(httpStatus.NOT_FOUND, "Invalid service code");

        if (!_service)
          throw new ApiError(httpStatus.NOT_FOUND, "Service not found");

        // await this.subscriptionRepository.create(
        //   {
        //     ownerId: newBusiness._id!.toString(),
        //     serviceCode: serviceCode,
        //     isSystemService: true,
        //     serviceId: _service._id!.toString(),
        //     billingCycle : _service.billingCycle as any,
        //     nextBillingDate : ServiceBillingCalculator.calculateNextBillingDate(
        //       new Date(Date.now()),
        //       _service.billingCycle! || {}
        //     ),
        //     metaData : {
        //       customerDetails : {
        //         email : customer.email,
        //         firstName : customer.firstName,
        //         lastName : customer.lastName,
        //         businessId : customer.businessId,
        //         tenantId : tenant.tenantId
        //       },
        //       beneficiaryDetails: {
        //         email : business.email,
        //         id : business._id!.toString(),
        //         name : business.name
        //       }
        //     },
        //     lastPaymentDate : null
        //   } as ISubscription,
        //   session
        // );
      }

      // Send admin credentials
      this.emailService.SendEMailToUser(
        {
          to: user.email,
          bodyParts: {
            name: user.name,
            email: user.email,
            password: password,
            _id: user._id,
            changePasswordUrl: `https://${tenant.tenantId}.${config.get(
              "CLIENT_URL"
            )}/changePassword?id=${user._id}&token=${temporaryToken.token}`,
          },
        },
        EmailType.CredentialsEmail
      );

      await this._transactionContextHandler.commit();
      return;
    } catch (error: any) {
      await this._transactionContextHandler.rollback();
      throw error;
    }
  }
  /**
   *
   * @param file
   * @param businessId
   * @returns
   */
  public async uploadBusinessLogo(
    file: any,
    businessId: string
  ): Promise<string> {
    const business = await this.businessRepository.findById(businessId);

    if (!business) {
      throw new ApiError(httpStatus.NOT_FOUND, "Business does not exist");
    }
    const logoUrl = await this.uploader.uploadSingleMedia(
      file.buffer,
      "business-logo",
      businessId
    );

    await this.businessRepository.update(
      { _id: business._id },
      { logoUrl: logoUrl.secure_url }
    );
    return logoUrl.secure_url;
  }

  /**
   *
   * @param businessId
   * @param data
   * @returns
   */
  public async editBusinessProfile(
    businessId: string,
    data: IBusiness
  ): Promise<void> {
    const business = await this.businessRepository.update(
      { _id: businessId },
      { ...data }
    );

    if (!business) {
      throw new ApiError(httpStatus.NOT_FOUND, "Business does not exist");
    }

    return;
  }

  /**
   *
   * @param encryptedKeys
   * @param businessId
   * @returns
   */
  public async addTapPaymentKeys(encryptedKeys: string, businessId: string) {
    const business = await this.businessRepository.findById(businessId);

    if (!business) {
      throw new ApiError(httpStatus.NOT_FOUND, "Business not found");
    }

    const decryptedRSA = await SecurityHelperService.rsaDecrypt(encryptedKeys);

    // encrypt again for storage using AES
    const encrypt = SecurityHelperService.aesEncrypt(decryptedRSA);

    await this.businessRepository.update(
      { _id: businessId },
      {
        enableTapPayment: true,
        tapEncryptedKeys: {
          key: encrypt.encrypted,
          iv: encrypt.iv,
        },
      }
    );

    const maskedTapKey = SecurityHelperService.maskApiKey(encryptedKeys);
    return {
      tapKey: maskedTapKey,
    };
  }

  /**
   *
   * @param businessId
   * @param currency
   * @returns
   */
  public async addBusinessDefaultCurrency(
    businessId: string,
    currency: Currency
  ) {
    const business = await this.businessRepository.findById(businessId);

    if (!business) {
      throw new ApiError(httpStatus.NOT_FOUND, "Business does not exist");
    }

    await this.businessRepository.update(
      { _id: business._id },
      { currency: currency }
    );
    return;
  }

  public async enableAndDisableTapPayment(businessId: string, enable: boolean) {
    const business = await this.businessRepository.findById(businessId);

    if (!business) {
      throw new ApiError(httpStatus.NOT_FOUND, "Business does not exist");
    }

    if (enable && !business.tapEncryptedKeys.key) {
      throw new ApiError(
        httpStatus.UNPROCESSABLE_ENTITY,
        "Add tap credential key to enable tap payments"
      );
    }

    await this.businessRepository.update(
      { _id: businessId },
      { enableTapPayment: enable }
    );

    return;
  }

  /**
   *
   * @param input
   * @returns
   * * * for formatting tenant name
   */
  private getConcatenatedTenantName(input: string): string {
    const words = input.trim().split(/\s+/); // Split by whitespace and remove extra spaces
    if (words.length > 1) {
      return `${words[0]}-${words[1]}`;
    }
    return input.toLowerCase(); // Return the original string if it has 1 or fewer words
  }
}
