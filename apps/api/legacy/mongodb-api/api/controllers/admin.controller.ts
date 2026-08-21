import { Request, Response, NextFunction } from "express";
import BaseController from "../../utilities/base.controller";
import httpStatus from "http-status";
import AdminService from "../services/admin.service";
import { IAdmin } from "../../interfaces/admin.interface";
import { permissionObjects } from "../../enums/permissions";
import { AdminProfileDTO } from "../../dtos/ProfileDTO";
/**
 * @admincontroller
 */
export default class AdminController extends BaseController {
  private AdminService = new AdminService();
  constructor() {
    super();
  }

  /**
   * create admin account...
   */
  adminAccountCreationController = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { id, businessId, tenantId } = res.locals.user;
      await this.AdminService.CreateAdminAccount(
        {
          ...req.body,
          createdBy: id, //  ID of the admin creating a new admin
        } as IAdmin,
        businessId,
        tenantId
      );
      this.sendResponse<null>(res, httpStatus.CREATED, {
        success: true,
        message: "Account created, please check email for credentials",
        data: null,
      });
    }
  );

    GetPermissionsController = this.wrapAsync(
      async (__: Request, res: Response, _: NextFunction) => {
          // const permissions = allPermissions
          this.sendResponse(res, httpStatus.OK, {
          success: true,
          message: "Fetched Permissions",
          data: permissionObjects,
        });
      }
    );

    GetAdminProfile = this.wrapAsync(
        async (_req: Request, res: Response, _: NextFunction) => {
          const {id} = res.locals.user;
          const content = await this.AdminService.GetAdminProfile(id);
          this.sendResponse<AdminProfileDTO>(res, httpStatus.OK, {
            success: true,
            message: "Admin profile fetched",
            data: content,
          });
        }
      );

  //   UpdateAdminAccount = this.wrapAsync(
  //     async (req: Request, res: Response, _: NextFunction) => {
  //       const {adminId} = req.params;
  //       const admin = await this.AdminService.UpdateAdminAccount(adminId!, req.body);
  //       this.sendResponse(res, httpStatus.OK, {
  //         success: true,
  //         message:
  //           "Admin account modified",
  //         data: admin,
  //       });
  //     }
  //   );

    GetUsersForBusiness = this.wrapAsync(
        async (req: Request, res: Response, _: NextFunction) => {
          const { offset, limit } = req.query;
          const { businessId} = res.locals.user

          const admins = await this.AdminService.getUsersForBusiness(
            businessId,
            Number(offset),
            Number(limit),
          );
          this.sendResponse(res, httpStatus.OK, {
            success: true,
            message: "Users Fetched",
            data: admins,
          });
        }
      );
}
