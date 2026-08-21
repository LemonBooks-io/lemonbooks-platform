import BaseController from "../../utilities/base.controller";
import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import CustomerService from "../services/customer.service";
import { GetCustomersDTO } from "../../dtos/GetCustomersDTO";

export default class CustomerController extends BaseController {
  private customerService = new CustomerService();
  constructor() {
    super();
  }

  /**
   * create a customer
   */
  createCustomer = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { id, businessId, tenantId } = res.locals.user;
      await this.customerService.createCustomer(
        req.body,
        businessId,
        id,
        tenantId
      );
      this.sendResponse<null>(res, httpStatus.OK, {
        success: true,
        message: "Account created for customer",
        data: null,
      });
    }
  );
  /**
   * create a customer
   */
  getCustomers = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { tenantId } = res.locals.user;
      const { offset, limit } = req.query;
      const content = await this.customerService.getCustomers(
        tenantId,
        isNaN(Number(offset)) ? 1 : Number(offset),
        isNaN(Number(limit)) ? 20 : Number(limit)
      );
      this.sendResponse<{ customers: GetCustomersDTO[]; totalCount: number }>(
        res,
        httpStatus.OK,
        {
          success: true,
          message: "Customer data fetched",
          data: content,
        }
      );
    }
  );

  /**
   *  get customers service subscriptions
   */
  getCustomerSubscriptions = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { offset, limit } = req.query;
      const { customerId } = req.params;
      const { tenantId } = res.locals.user;
      const content = await this.customerService.getCustomerSubscriptions(
        customerId as string,
        isNaN(Number(offset)) ? 1 : Number(offset),
        isNaN(Number(limit)) ? 20 : Number(limit),
        tenantId
      );

      this.sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Customer subscriptions fetched",
        data: content,
      });
    }
  );

  /**
   * create multiple categories from csv (bulk upload)
   */
  uploadCustomerFromCsv = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { tenantId, id, businessId } = res.locals.user;
      const content = await this.customerService.uploadCustomerFromCsv(
        req.file!,
        tenantId,
        id,
        businessId
      );
      this.sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Bulk operation finished",
        data: content,
      });
    }
  );

  /**
   * Get customer by ID
   */

  getCustomerById = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { tenantId } = res.locals.user;
      const { customerId } = req.params;
      const content = await this.customerService.getCustomerById(
        customerId as string,
        tenantId
      );
      this.sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Fetched customer",
        data: content,
      });
    }
  );

  /**
   * Get customer statements
   */

  getCustomerStatements = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { tenantId, id } = res.locals.user;
      // const {customerId} = req.params;
      const { ...filters } = req.query;
      const content = await this.customerService.getCustomerStatements(
        id as string,
        tenantId,
        filters
      );
      this.sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Account statement fetched",
        data: content,
      });
    }
  );

  /**
   * Edit customer details
   */
  editCustomer = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { tenantId, id } = res.locals.user;
      const updateData = req.body;
      const content = await this.customerService.editCustomer(
        id,
        tenantId,
        updateData
      );
      this.sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Customer updated successfully",
        data: content,
      });
    }
  );

  adminEditCustomer = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { tenantId } = res.locals.user;
      const { customerId } = req.params;
      const updateData = req.body;
      const content = await this.customerService.editCustomer(
        customerId as string,
        tenantId,
        updateData
      );
      this.sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Customer updated successfully",
        data: content,
      });
    }
  );

  /**
   * Cancel a subscription
   */
  cancelSubscription = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { tenantId } = res.locals.user;
      const { subscriptionId } = req.params;

      await this.customerService.cancelSubscription(
        subscriptionId as string,
        tenantId
      );

      this.sendResponse<null>(res, httpStatus.OK, {
        success: true,
        message: "Subscription cancelled successfully",
        data: null,
      });
    }
  );
}
