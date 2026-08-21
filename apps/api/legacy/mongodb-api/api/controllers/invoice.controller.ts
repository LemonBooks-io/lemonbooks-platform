import { Request, Response, NextFunction } from "express";
import InvoiceService from "../services/invoice.service";
import httpStatus from "http-status";
import BaseController from "../../utilities/base.controller";
import { GetInvoiceByIdDTO } from "../../dtos/InvoiceDTO";
import SubscriptionService from "../services/subscription.service";
import { InvoiceStatus } from "../../enums/invoice.enum";

export default class InvoiceController extends BaseController {
  private invoiceService: InvoiceService;
 private subscriptionService: SubscriptionService;
  constructor() {
    super();
    this.invoiceService = new InvoiceService();
    this.subscriptionService = new SubscriptionService(); 
  }

  createInvoice = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const invoice = req.body;
      const { id, businessId, tenantId } = res.locals.user;
      const { recipientId } = req.query;
      const createdInvoice = await this.invoiceService.CreateInvoice(
        invoice,
        id,
        businessId,
        tenantId,
        recipientId as string
      );
      this.sendResponse(res, httpStatus.CREATED, {
        success: true,
        message: "Invoice created",
        data: createdInvoice,
      });
    }
  );

  getInvoicesForABusiness = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { offset, limit, ...filters } = req.query;
      const { tenantId } = res.locals.user;
      const invoices = await this.invoiceService.GetInvoicesForABusiness(
        isNaN(Number(offset)) ? 1 : Number(offset),
        isNaN(Number(limit)) ? 10 : Number(limit),
        filters,
        tenantId
      );
      this.sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Invoices fetched",
        data: invoices,
      });
    }
  );

  getInvoiceById = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { invoiceId } = req.params;
      const tenantId = (req as any).tenantId;
      const content = await this.invoiceService.GetInvoiceById(
        invoiceId as string,
        tenantId
      );
      this.sendResponse<GetInvoiceByIdDTO>(res, httpStatus.OK, {
        success: true,
        message: "Invoice fetched",
        data: content,
      });
    }
  );

  resendInvoice = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { invoiceId } = req.params;
      const { tenantId } = res.locals.user;

      await this.invoiceService.ResendInvoice(invoiceId as string, tenantId);

      this.sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Invoice resent successfully",
        data: null,
      });
    }
  );

  CreateBulkInvoice = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { invoiceIds } = req.body;
      const { tenantId, businessId } = res.locals.user;
      const updatedInvoice = await this.invoiceService.CreateBulkInvoice(
        invoiceIds,
        tenantId,
        businessId
      );
      this.sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Invoices marked as bulk",
        data: updatedInvoice,
      });
    }
  );

  getPaymentLinks = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { tenantId, id, businessId } = res.locals.user;
      const { invoiceIds } = req.body;
      const content =
        await this.invoiceService.getAndCreatePaymentLinksForInvoice(
          invoiceIds,
          id,
          tenantId,
          businessId
        );
      this.sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Payment links created successfully",
        data: content,
      });
    }
  );

  markInvoiceViewStatusAsRead = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { invoiceId } = req.params;
      const { tenantId } = res.locals.user;
      await this.invoiceService.updateInvoiceById(
        invoiceId as string,
        tenantId,
        { view_status: "READ" }
      );
      this.sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Invoice marked as read",
        data: null,
      });
    }
  );

  approveEstimate = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { invoiceId } = req.params;
      const { tenantId } = res.locals.user;
      await this.invoiceService.updateInvoiceById(
        invoiceId as string,
        tenantId,
        { status: InvoiceStatus.APPROVED }
      );
      this.sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Invoice approved",
        data: null,
      });
    }
  );

  voidInvoice = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { invoiceId } = req.params;
      const { tenantId } = res.locals.user;
      const invoice = await this.invoiceService.voidInvoice(
        invoiceId as string,
        tenantId,
      );
      this.sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Invoice voided",
        data: invoice,
      });
    }
  );

  convertEstimateToInvoice = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { invoiceId } = req.params;
      const { due, expiry } = req.body;
      const { tenantId, businessId } = res.locals.user;

      const result = await this.invoiceService.convertEstimateToInvoice(
        invoiceId as string,
        tenantId,
        businessId,
        due,
        expiry
      );

      this.sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Estimate converted to invoice successfully",
        data: result,
      });
    }
  );

  createInvoiceFromRecurringSubscription = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { subscriptionId, recipientId, invoiceData, tenantId, businessId,nextBillingDate } =
        req.body;

      console.log({ subscriptionId, recipientId, invoiceData, tenantId, businessId });
      await this.invoiceService.CreateInvoice(
        invoiceData,
        recipientId,
        businessId,
        tenantId,
        recipientId
      );

      await this.subscriptionService.updateSubscriptionNextBillingDate(
        subscriptionId,
        nextBillingDate
      );
      this.sendResponse(res, httpStatus.CREATED, {
        success: true,
        message: "Invoice created from recurring invoice successfully",
        data: null,
      });
    }
  );
}
