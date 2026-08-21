import AuthenticationMiddleware from "../../middlewares/authentication.middleware";
import RequestValidator from "../../middlewares/schema.middleware";
import TenancyMiddleware from "../../middlewares/tenancy.middleware";
import BaseRoute from "../../utilities/base.router";
import InvoiceController from "../controllers/invoice.controller";
import { convertEstimateSchema, createInvoiceSchema } from "../validators/invoice.validator";

export default class InvoiceRoutes extends BaseRoute {
  constructor() {
    super();
  }

  protected override setupRoutes(): void {
    const invoiceController: InvoiceController = new InvoiceController();

    this.router.post(
      "/invoices/create",
      RequestValidator.validateRequestSchema(createInvoiceSchema),
      AuthenticationMiddleware.AuthenticateUser(),
      invoiceController.createInvoice
    );

    this.router.get(
      "/invoices/all",
      AuthenticationMiddleware.AuthenticateUser(),
      invoiceController.getInvoicesForABusiness
    );

    this.router.post(
      "/invoices/bulk",
      AuthenticationMiddleware.AuthenticateUser(),
      invoiceController.CreateBulkInvoice
    );

    this.router.get(
      "/invoices/:invoiceId",
      TenancyMiddleware.GetTenant,
      invoiceController.getInvoiceById
    );

    this.router.post(
      "/invoices/:invoiceId/resend",
      AuthenticationMiddleware.AuthenticateUser(),
      invoiceController.resendInvoice
    );

    this.router.post(
      "/invoices/payment-links",
      AuthenticationMiddleware.AuthenticateUser(),
      invoiceController.getPaymentLinks
    );

    this.router.post(
      "/invoices/mark-as-read/:invoiceId",
      AuthenticationMiddleware.AuthenticateUser(),
      invoiceController.markInvoiceViewStatusAsRead
    );

    this.router.post(
      "/invoices/approve-estimate/:invoiceId",
      AuthenticationMiddleware.AuthenticateUser(),
      invoiceController.approveEstimate
    );

    this.router.post(
      "/invoices/void-invoice/:invoiceId",
      AuthenticationMiddleware.AuthenticateUser(),
      invoiceController.voidInvoice
    );

    this.router.post(
      "/invoices/convert-estimate/:invoiceId",
      AuthenticationMiddleware.AuthenticateUser(),
      RequestValidator.validateRequestSchema(convertEstimateSchema),
      invoiceController.convertEstimateToInvoice
    );

    // for subscription billing system
    this.router.post(
      "/invoices/system/generate",
      invoiceController.createInvoiceFromRecurringSubscription
    );
  }
}
