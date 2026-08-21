import { Request, Response, NextFunction } from "express";
import BaseController from "../../utilities/base.controller";
import httpStatus from "http-status";
import { permissionObjects } from "../../enums/permissions";
import { UserProfileDTO } from "../../dtos/ProfileDTO";
import UserService from "../services/user.service";
import { IUser } from "../../interfaces/user.interface";
import { BatchUserDTO } from "../../dtos/BatchUserDTO";
/**
 * @usercontroller
 */
export default class UserController extends BaseController {
  private userService = new UserService();
  constructor() {
    super();
  }

  /**
   * create user account...
   */
  userAccountCreationController = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { id, businessId, tenantId } = res.locals.user;
      await this.userService.CreateUserAccount(
        {
          ...req.body,
          createdBy: id, //  ID of the user creating a new user
        } as IUser,
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

  /**
   *  get permissions @deprecating soon
   */
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

  /**
   * Get logged in user profile
   */
  GetUserProfile = this.wrapAsync(
    async (_req: Request, res: Response, _: NextFunction) => {
      const { id } = res.locals.user;
      const content = await this.userService.GetUserProfile(id);
      this.sendResponse<UserProfileDTO>(res, httpStatus.OK, {
        success: true,
        message: "User profile fetched",
        data: content,
      });
    }
  );

  /**
   * get users for a business
   */
  GetUsersForBusiness = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { offset, limit } = req.query;
      const { businessId } = res.locals.user;

      const content = await this.userService.getUsersForBusiness(
        businessId,
        isNaN(Number(offset)) ? 1 : Number(offset),
        isNaN(Number(limit)) ? 1 : Number(limit)
      );
      this.sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Users Fetched",
        data: content,
      });
    }
  );

  /**
   * create multiple users from csv (bulk upload)
   */
  createUsersFromCsv = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { id, businessId, tenantId, accountType } = res.locals.user;
      const content = await this.userService.createUsersFromCsv(
        req.file!,
        businessId,
        id,
        tenantId,
        accountType
      );
      this.sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Bulk operation finished",
        data: content,
      });
    }
  );

  /**
   * Edit user profile
   */
  editUserProfile = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { id } = res.locals.user;
      const content = await this.userService.editUserProfile(id, req.body);
      this.sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Profile updated successfully",
        data: content,
      });
    }
  );

  /**
   * Batch get users by array of IDs
   */
  getUsersByIdsController = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { ids } = req.body;
      const users = await this.userService.getUsersByIds(ids);
      this.sendResponse<BatchUserDTO[]>(res, httpStatus.OK, {
        success: true,
        message: "Batch users fetched successfully",
        data: users,
      });
    }
  );
}
