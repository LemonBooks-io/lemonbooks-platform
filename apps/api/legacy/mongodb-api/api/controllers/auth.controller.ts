import { NextFunction, Request, Response } from "express";
import BaseController from "../../utilities/base.controller";
import httpStatus from "http-status";
import AuthService from "../services/auth.service";
import {
  AuthTokenResponse,
  LoginResponseDto,
  VerifyOtpDtoWithCred,
} from "../../dtos/loginResponseDto";
import { SendOtpDto } from "../../dtos/OtpResponseDto";
import { IDevice } from "../../interfaces/admin.interface";

export default class AuthController extends BaseController {
  private authService = new AuthService();
  constructor() {
    super();
  }

  /**
   *   login
   */
  Login = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const device = (req as any).deviceInfo;
      const tenantId = (req as any).tenantId;
      const { email, password } = req.body;
      const content = await this.authService.loginAccount(
        email,
        password,
        tenantId,
        device
      );

      this.sendResponse<LoginResponseDto>(res, httpStatus.OK, {
        success: true,
        message: "Authentication successful",
        data: content,
      });
    }
  );

  /**
   * Send OTP to user's email
   */
  public sendOtp = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { email } = req.body;
      const tenantId = (req as any).tenantId;
      const content = await this.authService.sendOtp(email, tenantId);
      this.sendResponse<SendOtpDto>(res, httpStatus.OK, {
        success: true,
        message: "OTP sent successfully",
        data: content,
      });
    }
  );

  /**
   * Verify OTP and delete it
   */
  public verifyOtp = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { otp, email } = req.body;
      const { rememberDevice } = req.query;
      const tenantId = (req as any).tenantId;
      const device: IDevice = (req as any).deviceInfo;
      const content = await this.authService.verifyAndDeleteOtp(
        otp,
        email,
        tenantId,
        Boolean(rememberDevice),
        device
      );
      this.sendResponse<AuthTokenResponse | VerifyOtpDtoWithCred>(
        res,
        httpStatus.OK,
        {
          success: true,
          message: "OTP verified successfully",
          data: content,
        }
      );
    }
  );

  /**
   * Change password
   */

  public changePassword = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { newPassword } = req.body;
      const userId = res.locals.user.id;
      await this.authService.changePassword(userId, newPassword);
      this.sendResponse<null>(res, httpStatus.OK, {
        success: true,
        message: "Password changed successfully",
        data: null,
      });
    }
  );
  
  /**
   * Customer login 
   */
  public customerLogin = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { email, password } = req.body;
      const tenantId = (req as any).tenantId;
      const content = await this.authService.customerLogin(
        email,
        password,
        tenantId
      );

      this.sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Customer authentication successful",
        data: content,
      });
    }
  );

  /**
   * Customer change password
   */
  public changeCustomerPassword = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { newPassword } = req.body;
      const userId = res.locals.user.id;
      const tenantId = (req as any).tenantId;
      await this.authService.changeCustomerPassword(userId, newPassword, tenantId);
      this.sendResponse<null>(res, httpStatus.OK, {
        success: true,
        message: "Customer password changed successfully",
        data: null,
      });
    }
  );

  // reset customer password
  public resetCustomerPassword = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { email } = req.body;
      const tenantId = (req as any).tenantId;
      await this.authService.resetCustomerPassword(email, tenantId);
      this.sendResponse<null>(res, httpStatus.OK, {
        success: true,
        message: "Customer password reset initiated successfully",
        data: null,
      });
    }
  );

  // reset user password
  public resetUserPassword = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { email } = req.body;
      const tenantId = (req as any).tenantId;
      await this.authService.resetUserPassword(email, tenantId);
      this.sendResponse<null>(res, httpStatus.OK, {
        success: true,
        message: "Password reset initiated successfully",
        data: null,
      });
    }
  );


}
