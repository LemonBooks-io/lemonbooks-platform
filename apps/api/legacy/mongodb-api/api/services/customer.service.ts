import httpStatus from "http-status";
import {
  ICustomer,
  ICustomerRepository,
} from "../../interfaces/customer.interface";
import CustomerRepository from "../../repositories/customer.repository";
import ApiError from "../../utilities/error.base";
import { AccountType } from "../../enums/users.enum";
import {
  GetCustomerByIdDTO,
  GetCustomersDTO,
} from "../../dtos/GetCustomersDTO";
import { generateRandomPassword } from "../../helpers/password";
import SubscriptionRepository from "../../repositories/subscription.repository";
import {
  ISubscription,
  ISubscriptionRepository,
} from "../../interfaces/subscription.interface";
import CsvUploadHelper from "../../helpers/csv.parser";
import UploadCustomerDTO, {
  CustomerOpenBalanceInvoice,
} from "../../dtos/uploadCustomerDTO";
import SecurityHelperService from "../../helpers/security";
import InvoiceRepository from "../../repositories/invoice.repository";
import { addMoney } from "../../utilities/payment.util";
import { IBusinessRepository } from "../../interfaces/business.interface";
import BusinessRepository from "../../repositories/business.repository";
import { IPaymentRepository } from "../../interfaces/payment.interface";
import PaymentRepository from "../../repositories/payments.repository";
import { FilterQuery } from "mongoose";
import CustomerStatementDTO from "../../dtos/CustomerStatementDTO";
import OfferingRepository from "../../repositories/offering.repository";
import {
  IOffering,
  IOfferingRepository,
} from "../../interfaces/offering.interface";
import GetCustomerSubscriptions from "../../dtos/GetCustomerSubscriptionsDTO";
import { IInvoice } from "../../interfaces/invoice.interface";
import config from "config";
import { InvoiceStatus } from "../../enums/invoice.enum";
import { EmailType } from "../../enums/mail.enum";
import EmailService from "../../email/emailer";
import { TokenType } from "../../enums/token.enum";
export default class CustomerService {
  private subscriptionRepository: ISubscriptionRepository;
  private businessRepository: IBusinessRepository;
  private paymentRepository: IPaymentRepository;
  private offeringRepository: IOfferingRepository;
  private emailService = new EmailService();
  constructor() {
    this.subscriptionRepository = new SubscriptionRepository();
    this.businessRepository = new BusinessRepository();
    this.paymentRepository = new PaymentRepository();
    this.offeringRepository = new OfferingRepository();
  }

  /**
   *
   * @param customer
   * @param businessId
   * @param creatorId
   * @param tenant
   * @returns
   */
  public async createCustomer(
    customer: ICustomer & {
      openBalance?: { amount: number; description?: string };
    },
    businessId: string,
    creatorId: string,
    tenant: string,
  ): Promise<void> {
    const customerRepository = CustomerRepository.forBusiness(tenant);
    const { openBalance, ...customerData } = customer;
    // check if customer already exists..
    const existingCustomer = await customerRepository.findOne({
      email: customerData.email,
      businessId,
    });

    if (existingCustomer) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "Customer already exists with this email address.",
      );
    }

    const password = generateRandomPassword();
    const hp = await SecurityHelperService.HashPassword(password);
    //
    const newCustomer = await customerRepository.create({
      ...customerData,
      businessId,
      password: hp,
      createdBy: creatorId,
      accountType: AccountType.Customer,
    });

    if (openBalance && openBalance.amount > 0) {
      await this._createOpenBalanceInvoice(
        openBalance,
        businessId,
        newCustomer,
        creatorId,
        tenant,
      );
    }

    return;
  }

  /**
   *
   * @param tenant
   * @param offset
   * @param limit
   * @returns
   */
  public async getCustomers(
    tenant: string,
    offset: number,
    limit: number,
  ): Promise<{ customers: GetCustomersDTO[]; totalCount: number }> {
    const customerRepository = CustomerRepository.forBusiness(tenant);
    const invoiceRepository = InvoiceRepository.forBusiness(tenant);

    const customers = await customerRepository.findAll({}, offset, limit);
    const customerIds = customers.data.map((customer) => customer._id);

    // get all customer unpaid invoices
    const invoices = await invoiceRepository.find({
      recipientId: { $in: customerIds },
      status: InvoiceStatus.UNPAID,
      isBulk: false,
    });

    //
    // Map through all customers and calculate their total unpaid receivables
    const customerData: any[] = customers.data.map((customer) => {
      // Initialize receivables for current customer
      let receivables = 0;

      // Filter invoices to get only those belonging to current customer
      const customerInvoices = invoices.filter(
        (invoice) => invoice.recipientId === customer._id.toString(),
      );

      // If customer has unpaid invoices, calculate total receivables
      if (customerInvoices.length > 0) {
        // Sum up all invoice amounts using reduce
        receivables = customerInvoices.reduce((acc, invoice) => {
          return acc + invoice.order.amount;
        }, 0);
      }

      // Return customer data with added receivables field
      return {
        ...(customer as any)._doc, // Spread original customer document
        receivables, // Add calculated receivables
      };
    });

    const dtoList = customerData.map((customers) => {
      return new GetCustomersDTO(customers, customers.receivables);
    });

    return {
      customers: dtoList,
      totalCount: customers.totalCount,
    };
  }

  // /**
  //  *
  //  * @param customerId
  //  * @param offset
  //  * @param limit
  //  * @returns
  //  */
  // public async getCustomerSubscriptions(
  //   customerId: string,
  //   offset: number,
  //   limit: number
  // ) {
  //   const subscriptions =
  //     await this.subscriptionRepository.getCustomerSubscriptionsWithServiceDetail(
  //       customerId,
  //       offset,
  //       limit
  //     );
  //   return subscriptions;
  // }
  /**
   *
   * @param customerId
   * @param offset
   * @param limit
   * @returns
   */
  public async getCustomerSubscriptions(
    customerId: string,
    offset: number,
    limit: number,
    tenantId: string,
  ) {
    const customerRepository = CustomerRepository.forBusiness(tenantId);
    const [customer, { data, totalCount }] = await Promise.all([
      customerRepository.findById(customerId),
      this.subscriptionRepository.findAll(
        {
          ownerId: customerId,
        },
        offset,
        limit,
      ),
    ]);

    if (!customer)
      throw new ApiError(httpStatus.NOT_FOUND, "Customer not found");
    // const { data, totalCount } = await this.subscriptionRepository.findAll({
    //   ownerId : customerId
    // }, offset, limit);

    // Fetch offerings related to the subscriptions
    let offerings: IOffering[] = [];
    if (data.length > 0) {
      offerings = await this.offeringRepository.find({
        _id: { $in: data.map((sub: ISubscription) => sub.serviceId) },
      });
    }

    // Map offerings to their relevant subscriptions
    const subscriptionsWithOfferings = data.map((sub: ISubscription) => {
      const offering = offerings.find(
        (off) => off._id!.toString() === sub.serviceId,
      );
      return {
        ...(sub as any)._doc,
        service: offering,
        // Use amount and description from subscription model
        amount: sub.amount,
        description: sub.description,
      };
    });

    return {
      data: subscriptionsWithOfferings.map(
        (sub) => new GetCustomerSubscriptions(sub, customer),
      ),
      totalCount,
    };
  }

  /**
   *
   * @param csvFile
   * @param tenant
   * @returns
   */
  async uploadCustomerFromCsv(
    csvFile: Express.Multer.File,
    tenant: string,
    userId: string,
    businessId: string,
  ): Promise<{ failedRecords: object[]; failedCount: number }> {
    const business = await this.businessRepository.findById(businessId);
    if (!business) {
      throw new ApiError(httpStatus.NOT_FOUND, "Business not found");
    }
    const customerRepository = CustomerRepository.forBusiness(tenant);

    const expectedHeaders = [
      "lastName",
      "firstName",
      "email",
      "address",
      "company",
      "countryCode",
      "number",
      "city",
      "state",
      "amount",
      "description", // description for the opening balance invoice
    ];
    //validates csv headers
    const data = await CsvUploadHelper.csvParserHelper(
      csvFile,
      expectedHeaders,
    );
    const customers = (data as any).map((customer: any) => {
      const password = SecurityHelperService.generateRandomPassword();
      return new UploadCustomerDTO(
        customer,
        userId,
        customer.number,
        customer.countryCode,
        password,
        businessId,
      );
    });

    // create open balance invoices for customers that have invoice items
    const openBalanceInvoices = (data as any).map((openBalanceItems: any) => {
      if (openBalanceItems.amount) {
        return new CustomerOpenBalanceInvoice(
          openBalanceItems.description,
          openBalanceItems.amount,
          {
            email: openBalanceItems.email,
            firstName: openBalanceItems.firstName,
            lastName: openBalanceItems.lastName,
            countryCode: openBalanceItems.countryCode,
            number: openBalanceItems.number,
          },
          business,
        );
      }
      return null;
    });
    // console.log("openBalanceInvoices ", openBalanceInvoices);
    let openBalanceInvoiceForCreation: any = [];
    const result = await customerRepository.bulkCreate(customers as any);

    //map successfully created documents to their respective open balance invoices
    result.successfulRecords.forEach((customer: ICustomer) => {
      const customerOpenBalance = openBalanceInvoices.find(
        (invoice: any) => invoice?.customer.email === customer.email,
      );
      if (customerOpenBalance) {
        customerOpenBalance.setRecipientId(customer._id.toString());
        openBalanceInvoiceForCreation.push(customerOpenBalance);
      }
    });

    const invoiceRepository = InvoiceRepository.forBusiness(tenant);
    // create open balance invoices for customers that have invoice items
    if (openBalanceInvoiceForCreation.length > 0) {
      await invoiceRepository.bulkCreate(openBalanceInvoiceForCreation);
    }

    return result;
  }

  /**
   *
   * @param customerId
   * @param tenantId
   * @returns
   */
  async getCustomerById(
    customerId: string,
    tenantId: string,
  ): Promise<GetCustomerByIdDTO> {
    const customerRepository = CustomerRepository.forBusiness(tenantId);
    const invoiceRepository = InvoiceRepository.forBusiness(tenantId);

    const customer = await customerRepository.findById(customerId);

    if (!customer) {
      throw new ApiError(httpStatus.NOT_FOUND, "Customer not found");
    }

    const customerBusinesses = await this.businessRepository.find({
      customerId: customer._id,
    });

    // get all customer unpaid invoices
    const invoices = await invoiceRepository.find({
      recipientId: customer._id,
      status: InvoiceStatus.UNPAID,
      isBulk: false,
    });
    let receivables;
    if (invoices.length > 0) {
      // Sum up all invoice amounts using reduce
      receivables = invoices.reduce((acc, invoice) => {
        return acc + invoice.order.amount;
      }, 0);
    }

    return new GetCustomerByIdDTO(customer, customerBusinesses, receivables);
  }

  /**
   * Calculate invoice amount with discounts applied
   * @param invoice - The invoice object
   * @returns The calculated amount after discounts
   */
  private _calculateInvoiceAmount(invoice: IInvoice): number {
    if (!invoice.order?.items || invoice.order.items.length === 0) {
      return invoice.order.amount;
    }

    return invoice.order.items.reduce((total, item: any) => {
      const quantity = parseFloat(item.quantity || "1");
      const itemAmount = item.amount || 0;
      const discount = parseFloat(item.discount || "0");

      // Calculate: (amount - discount) * quantity
      const itemTotal = (itemAmount - discount) * quantity;
      return total + itemTotal;
    }, 0);
  }

  /**
   *
   * @param customerId
   * @param tenantId
   */
  async getCustomerStatements(
    customerId: string,
    tenantId: string,
    filter: any,
  ): Promise<CustomerStatementDTO> {
    const customerRepository = CustomerRepository.forBusiness(tenantId);
    const invoiceRepository = InvoiceRepository.forBusiness(tenantId);

    const customer = await customerRepository.findById(customerId);

    if (!customer) {
      throw new ApiError(httpStatus.NOT_FOUND, "Customer not found...");
    }
    const business = await this.businessRepository.findById(
      customer.businessId!,
    );
    if (!business) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Customer profile not related to a business",
      );
    }

    const { startDate, endDate, ...dataFilters } = filter;

    let filterQuery: FilterQuery<any> = {
      ...filter,
    };

    if (filter && filter.startDate) {
      const endOfDay = new Date(startDate);
      endOfDay.setHours(23, 59, 59, 999); // Set to end of day

      filterQuery = {
        ...dataFilters,
        createdAt: {
          $gte: new Date(endDate), // oldest date
          $lte: endOfDay, // newest date
        },
      };
    }

    // const invoices = await invoiceRepository.find({
    //   recipientId: customer._id.toString(),
    //   isBulk: false, // exclude bulk invoices
    //   ...filterQuery,
    // });
    // =================================================================================
    // fetch invoices for statement range and also due balance before start date
    // =================================================================================
    const [invoices, dueInvoicesBeforeStartDate] = await Promise.all([
      await invoiceRepository.find({
        recipientId: customer._id.toString(),
        isBulk: false, // exclude bulk invoices
        draft: false,
        ...filterQuery,
      }),

      await invoiceRepository.find({
        recipientId: customer._id.toString(),
        isBulk: false, // exclude bulk invoices
        status: {
          $in: [InvoiceStatus.UNPAID, InvoiceStatus.REQUIRE_APPROVAL],
        },
        createdAt: { $lt: new Date(startDate) },
        draft: false,
      }),
    ]);

    const receivables = addMoney(
      ...invoices
        .filter(
          (invoice) =>
            invoice.status === InvoiceStatus.UNPAID ||
            invoice.status === InvoiceStatus.REQUIRE_APPROVAL,
        )
        .map((invoice) => this._calculateInvoiceAmount(invoice)),
    );

    const dueBalanceBeforeStartDate = addMoney(
      ...dueInvoicesBeforeStartDate.map((invoice) =>
        this._calculateInvoiceAmount(invoice),
      ),
    );
    // ================================================================================

    const payments = await this.paymentRepository.find({
      ownerId: customer._id,
      ...filterQuery,
    });

    const invoiceLean = invoices.map((invoice) => ({
      invoiceNumber: invoice.invoiceNumber,
      date: invoice.createdAt,
      type: "invoice",
      description: invoice.description,
      balance: invoice.balanceBefore ? invoice.balanceBefore : 0,
      amount: this._calculateInvoiceAmount(invoice),
    }));

    const paymentLean = payments.map((payment) => ({
      paymentId: payment._id,
      date: payment.createdAt,
      type: "payment",
      description: `Payment for invoice - ${payment.invoiceNumber}`,
      balance: payment.receivableBalance ? payment.receivableBalance : 0,
      amount: payment.amount,
    }));

    let statementData = [invoiceLean, paymentLean].flat();
    const totalInvoicedAmount = addMoney(
      ...invoices.map((invoice) => this._calculateInvoiceAmount(invoice)),
    );
    const totalPaymentsReceived = addMoney(
      ...payments.map((payment) => payment.amount),
    );

    const sortedStatementData = statementData.sort(
      (a: any, b: any) => b.date - a.date,
    ); // sort by descending data
    return new CustomerStatementDTO(
      sortedStatementData,
      receivables,
      dueBalanceBeforeStartDate,
      totalInvoicedAmount,
      totalPaymentsReceived,
      business.name,
      business.address ? business.address : "",
      business._id.toString(),
      customer.firstName ?? customer.company,
      customer._id.toString(),
    );
  }

  /**
   * Edit customer details
   * @param customerId
   * @param tenantId
   * @param updateData
   */
  async editCustomer(
    customerId: string,
    tenantId: string,
    updateData: Partial<ICustomer>,
  ): Promise<any> {
    const customerRepository = CustomerRepository.forBusiness(tenantId);
    const customer = await customerRepository.findById(customerId);
    if (!customer) {
      throw new ApiError(httpStatus.NOT_FOUND, "Customer not found");
    }

    let hp;
    let password;
    if (updateData.email) {
      const emailExists = await this._checkEmailExistence(
        updateData.email,
        customerId,
        customerRepository,
      );
      if (emailExists) {
        throw new ApiError(httpStatus.CONFLICT, "Email already in use.");
      }
      password = generateRandomPassword();
      console.log("Generated password ", password);
      hp = await SecurityHelperService.HashPassword(password);
      updateData.password = hp;
    }

    const updatedCustomer = await customerRepository.update(
      { _id: customerId },
      updateData,
    );
    if (!updatedCustomer) {
      throw new ApiError(httpStatus.NOT_FOUND, "Customer not found");
    }

    // if email was edited send email to the new email address with login details
    if (updatedCustomer.email && updatedCustomer.email !== customer.email) {
      //
      const temporaryToken = await SecurityHelperService.GenerateToken(
        {
          id: updatedCustomer._id!.toString(),
          businessId: updatedCustomer._id.toString(),
          role: AccountType.Customer,
          permissions: [],
          tenantId: tenantId,
          accountType: updatedCustomer.accountType,
          type: TokenType.TEMPORARY,
        },
        TokenType.TEMPORARY,
        86000,
      );
      const changePasswordUrl = `https://${
        tenantId === "administrator" ? "www" : tenantId
      }.${config.get("CLIENT_URL")}/client/changePassword?id=${updatedCustomer._id}&token=${temporaryToken.token}`;

      const business = await this.businessRepository.findById(
        updatedCustomer.businessId!,
      );

      this.emailService.SendEMailToUser(
        {
          to: updatedCustomer.email,
          subject: `Account creation`,
          bodyParts: {
            businessName: business?.name ?? tenantId,
            name: updateData.firstName,
            email: updatedCustomer.email,
            // password: password,
            _id: updateData._id,
            changePasswordUrl,
          },
        },
        EmailType.CredentialsEmail,
      );
    }

    return updatedCustomer;
  }

  private async _checkEmailExistence(
    email: string,
    customerId: string,
    customerRepository: ICustomerRepository,
  ) {
    // check if email is being updated to an existing customer's email
    const existingCustomerWithEmail = await customerRepository.findOne({
      email: new RegExp(`^${email}$`, "i"),
      _id: { $ne: customerId },
    });

    //
    if (existingCustomerWithEmail) return true;
    return false;
  }
  /**
   * Creates an open balance invoice for a customer
   * @param openBalanceInvoice - The invoice data
   * @param businessId - The business ID
   * @param customer - The customer object
   * @param creatorId - The creator ID
   * @param tenant - The tenant identifier
   * @returns Promise<IInvoice>
   */
  private async _createOpenBalanceInvoice(
    openBalance: { amount: number; description?: string },
    businessId: string,
    customer: any,
    creatorId: string,
    tenant: string,
  ): Promise<IInvoice> {
    const business = await this.businessRepository.findById(businessId);
    if (!business) {
      throw new ApiError(httpStatus.NOT_FOUND, "Business not found.");
    }

    const invoicePayload: any = new CustomerOpenBalanceInvoice(
      openBalance?.description ?? "",
      openBalance.amount,
      customer,
      business,
      creatorId,
    );
    invoicePayload.setRecipientId(customer._id.toString());

    const invoiceRepository = InvoiceRepository.forBusiness(tenant);
    const invoice = await invoiceRepository.create(invoicePayload);

    const customPaymentUrl = `https://${
      tenant === "administrator" ? "www" : tenant
    }.${config.get("CLIENT_URL")}/custom-payment?invoiceId=${invoice._id}`; //Temporary fix to custom url when creating open balance.
    invoiceRepository.update(
      { _id: invoice._id },
      {
        customInvoiceUrl: customPaymentUrl,
      },
    );
    return invoice;
  }

  /**
   * Cancel a customer subscription
   * @param subscriptionId - The subscription ID to cancel
   * @param tenantId - The tenant ID
   * @returns Promise<void>
   */
  public async cancelSubscription(
    subscriptionId: string,
    tenantId: string,
  ): Promise<void> {
    // Verify subscription exists
    const subscription =
      await this.subscriptionRepository.findById(subscriptionId);
    if (!subscription) {
      throw new ApiError(httpStatus.NOT_FOUND, "Subscription not found");
    }

    // Check if already cancelled
    if (subscription.isCancelled) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Subscription is already cancelled",
      );
    }

    // Verify tenant matches
    if (subscription.metaData.customerDetails.tenantId !== tenantId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Unauthorized to cancel this subscription",
      );
    }

    // Cancel the subscription
    const cancelledSubscription = await this.subscriptionRepository.update(
      { _id: subscriptionId },
      { isCancelled: true },
    );
    if (!cancelledSubscription) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to cancel subscription",
      );
    }
    return;
  }
}
