import BaseRoute from "../../utilities/base.router";
import AuthenticationMiddleware from "../../middlewares/authentication.middleware";
import RequestValidator from "../../middlewares/schema.middleware";
import AuthController from "../controllers/auth.controller";
import {
  changePassword,
  loginSchema,
  sendOtp,
  verifyOtp,
} from "../validators/auth.vaidators";
import TenancyMiddleware from "../../middlewares/tenancy.middleware";

export default class AuthRoutes extends BaseRoute {
  constructor() {
    super();
  }
  /**
   * @method setupRoutes
   * @description Sets up the routes for auth-related operations.
   * This method defines the specific routes and their corresponding controller actions.
   */
  protected setupRoutes(): void {
    const authController = new AuthController();

    this.router.post(
      "/auth/login",
      TenancyMiddleware.GetTenant,
      AuthenticationMiddleware.GetDeviceInfo,
      RequestValidator.validateRequestSchema(loginSchema),
      authController.Login
    );

    this.router.post(
      "/auth/send-otp",
      TenancyMiddleware.GetTenant,
      RequestValidator.validateRequestSchema(sendOtp),
      authController.sendOtp
    );

    this.router.post(
      "/auth/verify-otp",
      TenancyMiddleware.GetTenant,
      AuthenticationMiddleware.GetDeviceInfo,
      RequestValidator.validateRequestSchema(verifyOtp),
      authController.verifyOtp
    );

    this.router.patch(
      "/auth/change-password",
      AuthenticationMiddleware.allowTemporary.AuthenticateUser,
      RequestValidator.validateRequestSchema(changePassword),
      authController.changePassword
    );

    this.router.post(
      "/auth/customer/login",
      TenancyMiddleware.GetTenant,
      RequestValidator.validateRequestSchema(loginSchema),
      authController.customerLogin
    );
    
    this.router.patch(
      "/auth/customer/change-password",
      TenancyMiddleware.GetTenant,
      RequestValidator.validateRequestSchema(changePassword),
      AuthenticationMiddleware.allowTemporary.AuthenticateUser,
      authController.changeCustomerPassword
    );

    this.router.post(
      "/auth/customer/reset-password",
      TenancyMiddleware.GetTenant,
      RequestValidator.validateRequestSchema(sendOtp),
      authController.resetCustomerPassword
    );

    this.router.post(
      "/auth/reset-password",
      TenancyMiddleware.GetTenant,
      RequestValidator.validateRequestSchema(sendOtp),
      authController.resetUserPassword
    );
  }
}
