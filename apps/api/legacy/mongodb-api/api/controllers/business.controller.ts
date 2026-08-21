import BaseController from "../../utilities/base.controller";
import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import BusinessService from "../services/business.service";
import MulterMediaHandler from "../../middlewares/multer.middleware";

export default class BusinessController extends BaseController {
  private businessService = new BusinessService();
  constructor() {
    super();
  }

  /**
   *   createBusinessProfile
   */
  createBusinessProfile = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { id, tenantId } = res.locals.user;
      const { customerId, serviceCode } = req.query;

      await this.businessService.createBusinessProfile(
        req.body,
        customerId as string,
        id,
        tenantId,
        serviceCode as string | undefined
      );
      this.sendResponse<null>(res, httpStatus.OK, {
        success: true,
        message: "Business profile created",
        data: null,
      });
    }
  );

  /**
   *   upload business logo
   */
  uploadBusinessLogo = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { businessId } = res.locals.user;

      const uploadFile = MulterMediaHandler.obtainMediaFileFromReq(req);
      const content = await this.businessService.uploadBusinessLogo(
        uploadFile,
        businessId
      );
      this.sendResponse<string>(res, httpStatus.OK, {
        success: true,
        message: "Logo upload complete",
        data: content,
      });
    }
  );

  editBusinessProfile = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { businessId } = res.locals.user;

      await this.businessService.editBusinessProfile(businessId, req.body);
      this.sendResponse<null>(res, httpStatus.OK, {
        success: true,
        message: "Business profile updated",
        data: null,
      });
    }
  );

  addTapPaymentKeys = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { businessId } = res.locals.user;
      const { key } = req.body;
      const content = await this.businessService.addTapPaymentKeys(key, businessId);
      this.sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Tap payments configuration complete",
        data: content,
      });
    }
  );

  /**
   * add business currency
   */
  addBusinessDefaultCurrency = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { businessId } = res.locals.user;
      const { currency } = req.body;
      await this.businessService.addBusinessDefaultCurrency(
        businessId,
        currency
      );
      this.sendResponse<null>(res, httpStatus.OK, {
        success: true,
        message: "Business currency added",
        data: null,
      });
    }
  );

    /**
   * enable and disable tap payments
   */
  enableAndDisableTapPayment = this.wrapAsync(
  async (req: Request, res: Response, _: NextFunction) => {
    const { businessId } = res.locals.user;
    const enable = req.query.enable === 'true' ? true : false;
    await this.businessService.enableAndDisableTapPayment(businessId, enable);
    this.sendResponse<null>(res, httpStatus.OK, {
      success: true,
      message: `Tap payment ${enable ? 'enabled' : 'disabled'} successfully`,
      data: null
    });
  }
);
}
