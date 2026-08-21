import httpStatus from "http-status";
import ApiError from "../../utilities/error.base";
import { IInvoice } from "../../interfaces/invoice.interface";
import InvoiceRepository from "../../repositories/invoice.repository";
import CustomerRepository from "../../repositories/customer.repository";
import TransactionContextHandler from "../../utilities/transactionContextHandler";
import TapInvoiceCallService from "../../http/tap.client";
import { ClientSession, FilterQuery } from "mongoose";
import { GetInvoiceByIdDTO, GetInvoiceDTO } from "../../dtos/InvoiceDTO";
import { PaymentLinksDTO } from "../../dtos/PaymentLinksDTO";
import config from "config";
import OfferingRepository from "../../repositories/offering.repository";
import {
  IOffering,
  IOfferingRepository,
} from "../../interfaces/offering.interface";
import SubscriptionRepository from "../../repositories/subscription.repository";
import {
  IMetaData,
  ISubscription,
  ISubscriptionRepository,
} from "../../interfaces/subscription.interface";
import BusinessRepository from "../../repositories/business.repository";
import { IBusinessRepository } from "../../interfaces/business.interface";
import SecurityHelperService from "../../helpers/security";
import TapInvoiceDTO from "../../dtos/tapInvoiceDTO";
import { PaymentStatus } from "../../enums/payment.enum";
import ServiceBillingCalculator from "../../utilities/service";
import {
  formatRecipientDataForInvoice,
  generatePaymentUrls,
  sendInvoiceNotificationEmail,
} from "../../utilities/invoice.util";
import { InvoiceStatus } from "../../enums/invoice.enum";
export default class InvoiceService {
  // private emailService = new EmailService();
  private _transactionContextHandler = new TransactionContextHandler();
  private tapInvoiceCallService: TapInvoiceCallService =
    new TapInvoiceCallService();
  // private emailService: EmailService = new EmailService();
  private subscriptionRepository: ISubscriptionRepository;
  private businessRepository: IBusinessRepository;
  private offeringRepository: IOfferingRepository;

  constructor() {
    this.offeringRepository = new OfferingRepository();
    this.subscriptionRepository = new SubscriptionRepository();
    this.businessRepository = new BusinessRepository();
  }

  /**
   *
   * @param invoice
   * @param creatorId
   * @param businessId
   * @param tenant
   * @param recipientId
   * @returns
   */
  async CreateInvoice(
    invoice: IInvoice,
    creatorId: string, // id of user logged in
    businessId: string, // business housing the user data
    tenant: string,
    recipientId: string, // customer id
  ) {
    try {
      // console.log({invoice});
      // validate and format invoice items
      const {
        formattedItems,
        totalAmount,
        offerings,
        rawItemsWithoutDiscountDeduction,
        rawTotalAmountWithoutDiscounts,
      } = await this._validateAndFormatInvoiceItems(invoice);

      // validate business and customer
      const { business, customer } = await this._validateBusinessAndCustomer(
        businessId,
        recipientId,
        tenant,
      );

      // Step 3: Create invoice in database with transaction
      const createdInvoice = await this._createInvoiceWithTransaction(
        invoice,
        formattedItems,
        totalAmount,
        business,
        customer,
        creatorId,
        businessId,
        recipientId,
        tenant,
        offerings,
        {
          rawItemsWithoutDiscountDeduction,
          rawTotalAmountWithoutDiscounts,
        },
      );

      // Step 4: Send invoice notification email (async, non-blocking)
      sendInvoiceNotificationEmail(
        createdInvoice,
        customer,
        business,
        formattedItems,
        tenant,
        businessId,
        totalAmount,
      );
      return;
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param offset
   * @param limit
   * @param filters
   * @param tenant
   * @returns
   */
  async GetInvoicesForABusiness(
    offset: number = 1,
    limit: number = 10,
    filters: FilterQuery<IInvoice>,
    tenant: string,
  ): Promise<{ invoices: GetInvoiceDTO[]; totalCount: number }> {
    const invoiceRepository = InvoiceRepository.forBusiness(tenant);

    const invoices = await invoiceRepository.findAll(
      { ...filters, isBulk: false },
      offset,
      limit,
    );
    const dto = invoices.data.map((invoice) => {
      return new GetInvoiceDTO(invoice);
    });
    return {
      invoices: dto,
      totalCount: invoices.totalCount,
    };
  }

  /**
   *
   * @param invoiceId
   * @param tenant
   * @returns
   */
  async GetInvoiceById(
    invoiceId: string,
    tenant: string,
  ): Promise<GetInvoiceByIdDTO> {
    const invoiceRepository = InvoiceRepository.forBusiness(tenant);
    const customerRepository = CustomerRepository.forBusiness(tenant);
    const invoice = await invoiceRepository.findById(invoiceId, "businessId");

    if (!invoice)
      throw new ApiError(httpStatus.NOT_FOUND, "Invoice does not exist");

    const customer = await customerRepository.findById(invoice.recipientId);
    let customerData;
    if (customer) {
      customerData = formatRecipientDataForInvoice(customer);
    }
    return new GetInvoiceByIdDTO(invoice, customerData as any);
  }

  /**
   * Resends an existing invoice email to the customer
   * @param invoiceId - ID of the invoice to resend
   * @param tenant - Tenant identifier
   * @returns void
   */
  async ResendInvoice(invoiceId: string, tenant: string): Promise<void> {
    const invoiceRepository = InvoiceRepository.forBusiness(tenant);
    const customerRepository = CustomerRepository.forBusiness(tenant);

    // Fetch the invoice
    const invoice = await invoiceRepository.findById(invoiceId);

    if (!invoice) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invoice does not exist");
    }

    if (
      invoice.draft ||
      invoice.status === InvoiceStatus.VOID ||
      invoice.isBulk ||
      invoice.status === InvoiceStatus.PAID
    ) {
      throw new ApiError(
        httpStatus.UNPROCESSABLE_ENTITY,
        "You can only resend active unpaid invoices.",
      );
    }

    // Fetch the customer details
    const customer = await customerRepository.findById(invoice.recipientId);

    if (!customer) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Customer associated with this invoice does not exist",
      );
    }

    // Fetch the business details
    const business = await this.businessRepository.findById(
      invoice.businessId.toString(),
    );

    if (!business) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Business associated with this invoice does not exist",
      );
    }

    // Send the invoice email
    await sendInvoiceNotificationEmail(
      invoice,
      customer,
      business,
      invoice.order.items,
      tenant,
      invoice.businessId.toString(),
    );
  }

  /**
   *
   * @param invoiceIds
   * @param tenant
   * @param businessId
   * @returns
   */
  async CreateBulkInvoice(
    invoiceIds: IInvoice[],
    tenant: string,
    businessId: string,
  ) {
    const business = await this.businessRepository.findById(businessId);

    if (!business)
      throw new ApiError(httpStatus.NOT_FOUND, "Business not found");

    const invoiceRepository = InvoiceRepository.forBusiness(tenant);

    const invoices = await invoiceRepository.find({
      _id: {
        $in: invoiceIds,
      },
    });

    if (invoiceIds.length < 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invoices not found.");
    }

    // Check if any of the invoices are drafts/estimate
    if (invoices.some((invoice) => invoice.draft === true)) {
      throw new ApiError(
        httpStatus.UNPROCESSABLE_ENTITY,
        "You cannot create bulk invoices for Estimates.",
      );
    }
    // prevent creation of bulk invoices for a bulk invoice
    if (invoices.some((invoice) => invoice.isBulk === true)) {
      throw new ApiError(
        httpStatus.UNPROCESSABLE_ENTITY,
        "You cannot create bulk invoices for Bulk Invoices.",
      );
    }

    //  Do not allow creation of bulk invoices for paid invoices
    if (invoices.some((invoice) => invoice.status === InvoiceStatus.PAID)) {
      throw new ApiError(
        httpStatus.UNPROCESSABLE_ENTITY,
        "You cannot create bulk invoices for paid Invoices.",
      );
    }

    const validInvoiceIds = invoices.map((invoice) => invoice._id?.toString());

    // Calculate total amount
    const totalAmount = invoices.reduce(
      (sum, invoice) => sum + invoice.order.amount,
      0,
    );

    let allItems: any = [];
    invoices.forEach((invoice: IInvoice) => {
      allItems.push(...invoice.order.items);
    });

    const bulkInvoiceItems: Partial<IInvoice> = {
      order: {
        amount: totalAmount,
        items: allItems,
        currency: business.currency!,
      },
    };

    const invoice = await invoiceRepository.create({
      ...bulkInvoiceItems,
      draft: false,
      due: Date.now() + 1 * 24 * 60 * 60 * 1000, // due in 2 days
      expiry: Date.now() + 7 * 24 * 60 * 60 * 1000, // expires in seven days
      description: "Bulk Invoice",
      note: "This is an invoice payment for multiple invoices",
      businessId: businessId as any,
      customer: invoices[0]!.customer,
      recipientId: invoices[0]!.recipientId,
      isBulk: true,
      relatedInvoiceIds: validInvoiceIds as string[],
    } as IInvoice);
    // system's custom payment

    let customPaymentUrl = `https://${
      tenant === "administrator" ? "www" : tenant
    }.${config.get("CLIENT_URL")}/custom-payment?invoiceId=${invoice._id}`;

    let tapInvoiceUrl;
    let tapInvoiceId;
    if (business.enableTapPayment) {
      let clientRedirectUrl = `https://${
        tenant === "administrator" ? "www" : tenant
      }.${config.get("CLIENT_URL")}/invoices/${invoice._id}`;

      const tapResponse = await this._createInvoiceWithTap(
        business.tapEncryptedKeys,
        invoice,
        clientRedirectUrl,
        tenant,
      );

      tapInvoiceUrl = tapResponse.tapInvoiceUrl;
      tapInvoiceId = tapResponse.tapInvoiceId;
    }
    await invoiceRepository.update(
      { _id: invoice._id },
      {
        tapInvoiceUrl: tapInvoiceUrl ?? "",
        tapInvoiceId: tapInvoiceId ?? "",
        customInvoiceUrl: customPaymentUrl ?? "",
      },
    );

    return {
      invoiceId: invoice._id,
      tapInvoiceUrl: tapInvoiceUrl,
      customInvoiceUrl: customPaymentUrl,
    };
  }

  async getAndCreatePaymentLinksForInvoice(
    invoiceIds: string[],
    customerId: string,
    tenant: string,
    businessId: string,
  ): Promise<PaymentLinksDTO> {
    const invoiceRepository = InvoiceRepository.forBusiness(tenant);

    let paymentLinks;
    // For single invoices....
    if (invoiceIds.length === 1) {
      const [invoice, business] = await Promise.all([
        invoiceRepository.findOne({
          _id: invoiceIds[0],
          recipientId: customerId,
        }),
        this.businessRepository.findById(businessId),
      ]);

      if (!invoice)
        throw new ApiError(httpStatus.NOT_FOUND, "Invoice not found");
      if (!business)
        throw new ApiError(httpStatus.NOT_FOUND, "Business not found");

      // If business has tap enabled, create or get new tap payment link
      if (business.enableTapPayment) {
        const hasInvoiceExpired = new Date(invoice.expiry) < new Date();
        // checking if invoice has expired
        if (hasInvoiceExpired || !invoice.tapInvoiceUrl) {
          console.log("Invoice expired, creating new link");

          let clientRedirectUrl = `https://${
            tenant === "administrator" ? "www" : tenant
          }.${config.get("CLIENT_URL")}/invoices/${invoice._id}`;

          const todaysDate = new Date(Date.now());
          const dueDate = todaysDate.getTime() + 2 * 24 * 60 * 60 * 1000; // added two days due time, to allow for invoice creation

          const expireDate = new Date(
            todaysDate.setDate(todaysDate.getDate() + 7),
          ).getTime();

          const { tapInvoiceUrl, tapInvoiceId } =
            await this._createInvoiceWithTap(
              business.tapEncryptedKeys,
              {
                ...(invoice as any)._doc,
                draft: false,
                due: dueDate,
                expiry: expireDate,
              },
              clientRedirectUrl,
              tenant,
            );

          const updatedInvoice = await invoiceRepository.update(
            { _id: invoice._id },
            {
              tapInvoiceId,
              tapInvoiceUrl,
              due: dueDate,
              expiry: expireDate,
            },
          );
          paymentLinks = new PaymentLinksDTO({
            tapInvoiceUrl: updatedInvoice!.tapInvoiceUrl,
            customInvoiceUrl: updatedInvoice!.customInvoiceUrl,
          });
          return paymentLinks;
        } else {
          console.log("Invoice still valid, returning existing link");
          paymentLinks = new PaymentLinksDTO({
            tapInvoiceUrl: invoice.tapInvoiceUrl,
            customInvoiceUrl: invoice.customInvoiceUrl,
          });
          return paymentLinks;
        }
      }
      // if no tap payment enabled.
      else {
        paymentLinks = new PaymentLinksDTO({
          customInvoiceUrl: invoice.customInvoiceUrl,
          tapInvoiceUrl: null,
        });
      }
      return paymentLinks;
    }
    console.log("Creating bulk invoice");
    // For multiple invoices, create a bulk invoice, reusing the bulk invoice method
    const { customInvoiceUrl, tapInvoiceUrl } = await this.CreateBulkInvoice(
      invoiceIds as any,
      tenant,
      businessId,
    );

    return new PaymentLinksDTO({
      tapInvoiceUrl: tapInvoiceUrl || null,
      customInvoiceUrl: customInvoiceUrl || null,
    });
  }

  /**
   *
   * @param invoiceId
   * @param tenant
   * @param invoiceData
   * @returns
   */
  async updateInvoiceById(
    invoiceId: string,
    tenant: string,
    invoiceData: Partial<IInvoice>,
  ) {
    const invoiceRepository = InvoiceRepository.forBusiness(tenant);
    const updatedInvoice = await invoiceRepository.update(
      { _id: invoiceId },
      { ...invoiceData },
    );

    return updatedInvoice;
  }

  /**
   * Converts an estimate (draft invoice) to a regular invoice
   * @param invoiceId - ID of the estimate to convert
   * @param tenant - Tenant identifier
   * @param businessId - Business ID
   * @returns Converted invoice with payment links
   */
  async convertEstimateToInvoice(
    invoiceId: string,
    tenant: string,
    businessId: string,
    due: number,
    expiry: number,
  ) {
    const invoiceRepository = InvoiceRepository.forBusiness(tenant);
    const customerRepository = CustomerRepository.forBusiness(tenant);

    // Fetch the estimate
    const estimate = await invoiceRepository.findById(invoiceId);

    if (!estimate) {
      throw new ApiError(httpStatus.NOT_FOUND, "Estimate does not exist");
    }

    // Verify it's actually a draft/estimate
    if (!estimate.draft) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "This invoice is not an estimate",
      );
    }

    // Fetch business details
    const business = await this.businessRepository.findById(businessId);

    if (!business) {
      throw new ApiError(httpStatus.NOT_FOUND, "Business not found");
    }

    // Fetch customer details
    const customer = await customerRepository.findById(estimate.recipientId);

    if (!customer) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Customer associated with this estimate does not exist",
      );
    }

    // Prepare update data - spread estimate first, then override specific fields
    const updateData: Partial<IInvoice> = {
      ...(estimate as any)._doc,
      due,
      expiry,
      description: "Invoice for your order",
      draft: false,
      status: PaymentStatus.UNPAID,
    };

    // delete fields that should not be copied over
    delete updateData._id; // Remove _id to avoid conflicts
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.invoiceNumber;
    delete updateData.view_status;
    delete updateData.tapInvoiceId;
    delete updateData.tapInvoiceUrl;
    delete updateData.note;
    delete updateData.customInvoiceUrl;

    // Update the estimate to invoice
    const updatedInvoice = await invoiceRepository.create({
      ...updateData,
      note: "The following is an invoice for your order",
      description : "Invoice for your order",
    } as any);

    // Generate payment URLs
    const paymentUrls = generatePaymentUrls(tenant, updatedInvoice._id!);

    // Create Tap payment if enabled
    let tapInvoiceFields: { tapInvoiceUrl?: string; tapInvoiceId?: number } =
      {};
    if (business.enableTapPayment) {
      if (!business.tapEncryptedKeys?.key) {
        throw new ApiError(
          httpStatus.UNPROCESSABLE_ENTITY,
          "Tap payment is enabled but no tap key was set",
        );
      }

      

      const orderAmountDiscounted = updatedInvoice.order.items.reduce((total: number, item: any) => {
        const quantity = parseFloat(item.quantity || "1");
        const itemAmount = item.amount || 0;
        const discount = parseFloat(item.discount || "0");
        return total + (itemAmount - discount) * quantity;
      }, 0);

      const itemsWithDiscount = updatedInvoice.order.items.map((item: any) => {
        const discount = parseFloat(item.discount || "0");
        return {
          ...item,
          amount: item.amount - discount,
        };
      });
      console.log({ orderAmountDiscounted, itemsWithDiscount });

      const { tapInvoiceUrl, tapInvoiceId } = await this._createInvoiceWithTap(
        business.tapEncryptedKeys,
        {
          ...(updatedInvoice as any)._doc,
          due,
          expiry,
          draft: false,
          order: {
            ...updatedInvoice.order,
            amount: orderAmountDiscounted,
            items: itemsWithDiscount,

          },
        },
        paymentUrls.clientRedirectUrl,
        tenant,
      );

      tapInvoiceFields.tapInvoiceUrl = tapInvoiceUrl;
      tapInvoiceFields.tapInvoiceId = tapInvoiceId as any;
    }

    await Promise.all([
      // update the estimate record to reflect the conversion
      invoiceRepository.update(
        { _id: estimate._id },
        {
          status: InvoiceStatus.APPROVED,
        },
      ),

      // update converted invoice with payment url
      invoiceRepository.update(
        { _id: updatedInvoice._id },
        {
          customInvoiceUrl: paymentUrls.customPaymentUrl,
          tapInvoiceId: tapInvoiceFields.tapInvoiceId as any,
          tapInvoiceUrl: tapInvoiceFields.tapInvoiceUrl as any,
        },
      ),
    ]);

    // Handle service subscriptions
    const itemIds = updatedInvoice.order.items.map((item: any) => item.itemId);
    const offerings = await this.offeringRepository.findAll(
      { _id: { $in: itemIds } },
      1,
      itemIds.length,
    );

    if (offerings.data.length > 0) {
      const metaData: Partial<IMetaData> = {
        customerDetails: {
          businessId: customer.businessId,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          tenantId: tenant,
        },
      };

      await this._handleServiceSubscriptionInInvoiceData(
        offerings.data,
        null as any, // No session needed for this operation
        updatedInvoice.recipientId,
        metaData,
        updatedInvoice.order.items,
      );
    }

    // Send invoice notification email
    sendInvoiceNotificationEmail(
      updatedInvoice,
      customer,
      business,
      updatedInvoice.order.items,
      tenant,
      businessId,
    );

    return {
      invoice: updatedInvoice,
      paymentLinks: {
        tapInvoiceUrl: updatedInvoice.tapInvoiceUrl || null,
        customInvoiceUrl: paymentUrls.customPaymentUrl || null,
      },
    };
  }

  async voidInvoice(invoiceId: string, tenant: string) {
    const invoiceRepository = InvoiceRepository.forBusiness(tenant);
    // Fetch the invoice
    const invoice = await invoiceRepository.findById(invoiceId);

    if (!invoice) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invoice does not exist");
    }

    if (invoice.status === InvoiceStatus.VOID) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invoice is already voided");
    }

    // if invoice is already paid, do not allow voiding
    if (invoice.status === InvoiceStatus.PAID) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Paid invoice cannot be voided",
      );
    }

    const updatedInvoice = await invoiceRepository.update(
      { _id: invoiceId },
      {
        status: InvoiceStatus.VOID,
      },
    );
    return updatedInvoice;
  }
  /**
   * ----------------------------------------------
   *              Helpers
   * ----------------------------------------------
   */

  /**
   *
   * @param data
   * @param _session
   * @param recipientId
   * @param metaData
   * @param invoiceItems
   * @returns
   */
  private async _handleServiceSubscriptionInInvoiceData(
    data: IOffering[],
    _session: ClientSession,
    recipientId: string,
    metaData?: Partial<IMetaData>,
    invoiceItems?: any[],
  ) {
    const services = data.filter((item: IOffering) => item.type === "SERVICE");
    if (services.length > 0) {
      // Prepare subscription objects
      const subscriptionsToCreate = services.map((service: IOffering) => {
        // Find the corresponding invoice item for this service
        const invoiceItem = invoiceItems?.find(
          (item: any) => item.itemId?.toString() === service._id?.toString(),
        );

        return {
          ownerId: recipientId,
          serviceId: service._id as any,
          isSystemService: service.isSystemService,
          billingCycle: service.billingCycle,
          nextBillingDate: ServiceBillingCalculator.calculateNextBillingDate(
            new Date(Date.now()),
            service.billingCycle! || {},
          ),
          lastPaymentDate: null,
          metaData,
          description: invoiceItem?.description || "",
          amount: invoiceItem ? invoiceItem.amount * invoiceItem.quantity : 0,
        } as ISubscription;
      });
      // Use bulkCreate for efficiency
      const subscriptions = await this.subscriptionRepository.bulkCreate(
        subscriptionsToCreate,
      );
      return subscriptions;
    }
    console.log("No service subscription in the invoice handle");
    return [];
  }

  /**
   * Private helper to create a Tap invoice if Tap is enabled and keys are present.
   */
  private async _createInvoiceWithTap(
    businessKey: { key: string; iv: string },
    invoice: any,
    clientRedirectUrl: string,
    tenant: string,
  ): Promise<{ tapInvoiceUrl: string; tapInvoiceId: any }> {
    // decrypt tap keys
    const decryptTapKeys = SecurityHelperService.aesDecrypt(
      businessKey.key,
      businessKey.iv,
    );

    const tapInvoiceDto = new TapInvoiceDTO(invoice, clientRedirectUrl, tenant);

    const tapInvoice = await this.tapInvoiceCallService.createInvoice(
      tapInvoiceDto,
      decryptTapKeys,
    );

    return {
      tapInvoiceUrl: tapInvoice.url,
      tapInvoiceId: tapInvoice.id,
    };
  }

  private async _validateAndFormatInvoiceItems(invoice: IInvoice) {
    const itemIds = invoice.order.items.map((item: any) => item.itemId);
    // get all items in the order items.,,
    const dbItems = await this.offeringRepository.findAll(
      { _id: { $in: itemIds } },
      1,
      itemIds.length,
    );

    if (dbItems.totalCount != itemIds.length)
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Some items do not exists in the database",
      );

    // format the items and add the price(cost) to the items without price on creation
    const formattedItems = invoice.order.items.map((item: any) => {
      const currentItem = dbItems.data.find(
        (i: any) => i._id.toString() === item.itemId,
      );
      if (!currentItem) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          `Item ${item.itemId} not found`,
        );
      }
      const discount = item.discount ? item.discount : 0;
      return {
        quantity: item.quantity,
        amount: item.amount
          ? item.amount - discount
          : currentItem!.cost - discount,
        currency: currentItem!.currency,
        description: item.description
          ? item.description
          : currentItem!.description,
        name: currentItem!.name,
        itemId: currentItem!._id,
        discount: discount,
      };
    });

    // format items without applying discount deductions (raw items)
    const rawItemsWithoutDiscountDeduction = invoice.order.items.map(
      (item: any) => {
        const currentItem = dbItems.data.find(
          (i: any) => i._id.toString() === item.itemId,
        );
        if (!currentItem) {
          throw new ApiError(
            httpStatus.NOT_FOUND,
            `Item ${item.itemId} not found`,
          );
        }
        const discount = item.discount ? item.discount : 0;
        const itemAmount = item.amount ? item.amount : currentItem!.cost;

        return {
          quantity: item.quantity,
          amount: itemAmount, // Raw amount without discount deduction
          currency: currentItem!.currency,
          description: item.description
            ? item.description
            : currentItem!.description,
          name: currentItem!.name,
          itemId: currentItem!._id,
          discount: discount, // Discount property preserved
        };
      },
    );

    const invoiceOrderItemsAmount = formattedItems.reduce(
      (acc, item) => acc + item.amount * item.quantity,
      0,
    );

    const rawTotalAmountWithoutDiscounts =
      rawItemsWithoutDiscountDeduction.reduce(
        (acc, item) => acc + item.amount * item.quantity,
        0,
      );

    // console.log({ invoiceOrderItemsAmount });
    return {
      formattedItems,
      totalAmount: invoiceOrderItemsAmount,
      offerings: dbItems.data,
      rawItemsWithoutDiscountDeduction,
      rawTotalAmountWithoutDiscounts,
    };
  }

  /**
   * Validates that business and customer exist
   */
  private async _validateBusinessAndCustomer(
    businessId: string,
    recipientId: string,
    tenant: string,
  ) {
    const customerRepository = CustomerRepository.forBusiness(tenant);

    const [business, customer] = await Promise.all([
      this.businessRepository.findById(businessId),
      await customerRepository.findById(recipientId),
    ]);

    if (!business) {
      throw new ApiError(httpStatus.NOT_FOUND, "Business not found");
    }

    if (!customer) {
      throw new ApiError(httpStatus.NOT_FOUND, "Customer does not exist");
    }

    return { business, customer };
  }

  /**
   * Creates invoice within a database transaction
   */
  private async _createInvoiceWithTransaction(
    invoice: IInvoice,
    formattedItems: any[],
    totalAmount: number,
    business: any,
    customer: any,
    creatorId: string,
    businessId: string,
    recipientId: string,
    tenant: string,
    offerings: IOffering[],
    rawOrderItems: {
      rawItemsWithoutDiscountDeduction: any[];
      rawTotalAmountWithoutDiscounts: number;
    },
  ) {
    const invoiceRepository = InvoiceRepository.forBusiness(tenant);
    const recipientData = formatRecipientDataForInvoice(customer);
    // console.log({ recipientData });

    await this._transactionContextHandler.begin();
    const session = this._transactionContextHandler.getSession();

    const oldInvoices = await invoiceRepository.find({
      recipientId,
      draft: false,
      status: InvoiceStatus.UNPAID,
    });
    let balanceBefore = oldInvoices.reduce(
      (acc, inv) => acc + inv.order.amount,
      0,
    );
    try {
      // Create initial invoice
      const createdInvoice = await invoiceRepository.create(
        {
          ...invoice,
          createdBy: creatorId,
          businessId: businessId as any,
          customer: recipientData as any,
          balanceBefore: balanceBefore,
          order: {
            ...invoice.order,
            currency: business.currency!,
            amount: rawOrderItems.rawTotalAmountWithoutDiscounts,
            items: rawOrderItems.rawItemsWithoutDiscountDeduction,
          },
          recipientId,
        },
        session,
      );

      // Generate payment URLs
      const paymentUrls = generatePaymentUrls(tenant, createdInvoice._id!);

      // Create Tap payment if enabled
      const tapInvoiceFields = await this._processTapPayment(
        business,
        {
          ...(createdInvoice as any)._doc,
          order: {
            ...(createdInvoice as any)._doc.order,
            amount: totalAmount, // set the order amount to total amount with discounts applied
            items: formattedItems, // set the order items to formatted items with discounts applied
            currency: business.currency!,
          },
        },
        paymentUrls.clientRedirectUrl,
        tenant,
      );

      // Update invoice with payment URLs and Tap fields
      const updatedInvoice = await invoiceRepository.update(
        { _id: createdInvoice._id },
        {
          ...(createdInvoice as any)._doc,
          customInvoiceUrl: paymentUrls.customPaymentUrl,
          ...tapInvoiceFields,
        },
        session,
      );

      // Handle service subscriptions for non-draft invoices
      if (!invoice.draft) {
        await this._createServiceSubscriptions(
          offerings,
          session,
          recipientId,
          customer,
          tenant,
          formattedItems,
        );
      }

      await this._transactionContextHandler.commit();

      return {
        ...(updatedInvoice as any)._doc,
        tapInvoiceUrl:
          tapInvoiceFields.tapInvoiceUrl ?? updatedInvoice?.tapInvoiceUrl,
      };
    } catch (error) {
      await this._transactionContextHandler.rollback();
      throw error;
    }
  }

  /**
   * Processes Tap payment integration if enabled
   */
  private async _processTapPayment(
    business: any,
    invoice: any,
    clientRedirectUrl: string,
    tenant: string,
  ): Promise<{ tapInvoiceUrl?: string; tapInvoiceId?: string }> {
    if (!business.enableTapPayment) {
      return {};
    }

    if (!business.tapEncryptedKeys?.key) {
      throw new ApiError(
        httpStatus.UNPROCESSABLE_ENTITY,
        "Tap payment is enabled but no tap key was set",
      );
    }

    return await this._createInvoiceWithTap(
      business.tapEncryptedKeys,
      invoice,
      clientRedirectUrl,
      tenant,
    );
  }

  /**
   * Creates service subscriptions for service items in the invoice
   */
  private async _createServiceSubscriptions(
    offerings: IOffering[],
    session: ClientSession,
    recipientId: string,
    customer: any,
    tenant: string,
    invoiceItems?: any[],
  ) {
    const metaData: Partial<IMetaData> = {
      customerDetails: {
        businessId: customer.businessId,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        tenantId: tenant,
      },
    };

    await this._handleServiceSubscriptionInInvoiceData(
      offerings,
      session,
      recipientId,
      metaData,
      invoiceItems,
    );
  }
}
