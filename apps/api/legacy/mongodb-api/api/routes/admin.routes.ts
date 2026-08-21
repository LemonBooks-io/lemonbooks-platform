import BaseRoute from "../../utilities/base.router";
import AdminController from "../controllers/admin.controller";
import AuthenticationMiddleware from "../../middlewares/authentication.middleware";

import RequestValidator from "../../middlewares/schema.middleware";
import { createAdminSchema } from "../validators/admin.validators";

export default class AdminRoutes extends BaseRoute {

  constructor() {
    super();
  }
  /**
   * @method setupRoutes
   * @description Sets up the routes for user-related operations.
   * This method defines the specific routes and their corresponding controller actions.
   */
  protected setupRoutes(): void {
    const adminController = new AdminController()


    this.router.post(
      "/admin/create",
      AuthenticationMiddleware.AuthenticateUser(),
      RequestValidator.validateRequestSchema(createAdminSchema),
      adminController.adminAccountCreationController
    );

    this.router.get(
      "/admin/permissions",
      adminController.GetPermissionsController
    );

    this.router.get(
      "/admin/profile",
      AuthenticationMiddleware.AuthenticateUser(),
      adminController.GetAdminProfile
    );
    
    this.router.get(
      "/admin/all",
      AuthenticationMiddleware.AuthenticateUser(),
      adminController.GetUsersForBusiness
    );

  }
}
