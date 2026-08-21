import BaseRoute from "../../utilities/base.router";
import AuthenticationMiddleware from "../../middlewares/authentication.middleware";
import CustomerController from "../controllers/customer.controller";
import MulterMediaHandler from "../../middlewares/multer.middleware";
import { editCustomerSchema } from "../validators/customer.validator";
import RequestValidator from "../../middlewares/schema.middleware";

export default class CustomerRoutes extends BaseRoute {
  constructor() {
    super();
  }
  /**
   * @method setupRoutes
   * @description Sets up the routes for user-related operations.
   * This method defines the specific routes and their corresponding controller actions.
   */
  protected setupRoutes(): void {
    const customerController = new CustomerController();

    this.router.post(
      "/customer/create",
      AuthenticationMiddleware.AuthenticateUser(),
      customerController.createCustomer
    );

    this.router.get(
      "/customer/all",
      AuthenticationMiddleware.AuthenticateUser(),
      customerController.getCustomers
    );

    this.router.get(
      "/customer/subscriptions/:customerId",
      AuthenticationMiddleware.AuthenticateUser(),
      customerController.getCustomerSubscriptions
    );

    this.router.post(
      "/customer/bulk",
      AuthenticationMiddleware.AuthenticateUser(),
      MulterMediaHandler.UploadCSVFile(),
      customerController.uploadCustomerFromCsv
    );

    this.router.get(
      "/customer/statement",
      AuthenticationMiddleware.AuthenticateUser(),
      customerController.getCustomerStatements
    );

    this.router.get(
      "/customer/:customerId",
      AuthenticationMiddleware.AuthenticateUser(),
      customerController.getCustomerById
    );

    this.router.patch(
      "/customer",
      AuthenticationMiddleware.AuthenticateUser(),
      RequestValidator.validateRequestSchema(editCustomerSchema),
      customerController.editCustomer
    );

    this.router.patch(
      "/customer/admin-edit/:customerId",
      AuthenticationMiddleware.AuthenticateUser(),
      RequestValidator.validateRequestSchema(editCustomerSchema),
      customerController.adminEditCustomer
    );

    this.router.patch(
      "/customer/subscription/cancel/:subscriptionId",
      AuthenticationMiddleware.AuthenticateUser(),
      customerController.cancelSubscription
    );
  }
}
