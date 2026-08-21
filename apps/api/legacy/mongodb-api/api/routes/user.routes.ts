import BaseRoute from "../../utilities/base.router";
import AuthenticationMiddleware from "../../middlewares/authentication.middleware";
import RequestValidator from "../../middlewares/schema.middleware";
import UserController from "../controllers/user.controller";
import {
  createUserSchema,
  editProfileSchema,
  batchUserIdsSchema,
} from "../validators/user.validators";
import MulterMediaHandler from "../../middlewares/multer.middleware";

export default class UserRoutes extends BaseRoute {
  constructor() {
    super();
  }
  /**
   * @method setupRoutes
   * @description Sets up the routes for user-related operations.
   * This method defines the specific routes and their corresponding controller actions.
   */
  protected setupRoutes(): void {
    const userController = new UserController();

    this.router.post(
      "/user/create",
      AuthenticationMiddleware.AuthenticateUser(),
      RequestValidator.validateRequestSchema(createUserSchema),
      userController.userAccountCreationController
    );

    this.router.get(
      "/user/permissions",
      userController.GetPermissionsController
    );

    this.router.get(
      "/user/profile",
      AuthenticationMiddleware.AuthenticateUser(),
      userController.GetUserProfile
    );

    this.router.get(
      "/user/all",
      AuthenticationMiddleware.AuthenticateUser(),
      userController.GetUsersForBusiness
    );

    this.router.post(
      "/user/bulk",
      AuthenticationMiddleware.AuthenticateUser(),
      MulterMediaHandler.UploadCSVFile(),
      userController.createUsersFromCsv
    );

    this.router.patch(
      "/user/edit-profile",
      AuthenticationMiddleware.AuthenticateUser(),
      RequestValidator.validateRequestSchema(editProfileSchema),
      userController.editUserProfile
    );

    this.router.post(
      "/user/batch",
      // AuthenticationMiddleware.AuthenticateUser(),
      RequestValidator.validateRequestSchema(batchUserIdsSchema),
      userController.getUsersByIdsController
    );
  }
}
