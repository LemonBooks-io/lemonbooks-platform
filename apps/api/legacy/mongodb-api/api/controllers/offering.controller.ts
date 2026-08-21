import { NextFunction, Request, Response } from "express";
import BaseController from "../../utilities/base.controller";
import OfferingService from "../services/offering.service";
import { OfferingDTO } from "../../dtos/offeringDTO";
import httpStatus from "http-status";

export default class OfferingController extends BaseController {
  private offeringService: OfferingService = new OfferingService();

  constructor() {
    super();
  }

  CreateOffering = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { type } = req.query;
      const { businessId, id, businessConfig } = res.locals.user;
      const content = await this.offeringService.CreateOffering(
        req.body,
        type as "PRODUCT" | "SERVICE",
        businessId,
        id,
        businessConfig
      );
      this.sendResponse<OfferingDTO>(res, httpStatus.CREATED, {
        success: true,
        message: "Offering created",
        data: content,
      });
    }
  );

  GetOfferings = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { offset, limit, ...filters } = req.query;
      const { businessId } = res.locals.user;
      const content = await this.offeringService.GetOfferings(
        isNaN(Number(offset)) ? 1 : Number(offset),
        isNaN(Number(limit)) ? 1 : Number(limit),
        { ...filters, businessId }
      );
      this.sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Offerings fetched",
        data: content,
      });
    }
  );

  EditOffering = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { offeringId } = req.params;
      const content = await this.offeringService.EditOffering(
        String(offeringId),
        req.body
      );
      this.sendResponse<OfferingDTO>(res, httpStatus.OK, {
        success: true,
        message: "Offering updated",
        data: content,
      });
    }
  );

  /**
   * create multiple users from csv (bulk upload)
   */
  createOfferingFromCsv = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { id, businessId } = res.locals.user;
      const content = await this.offeringService.createOfferingFromCsv(
        req.file!,
        businessId,
        id
      );
      this.sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Bulk operation finished",
        data: content,
      });
    }
  );

  /**
   * Batch fetch offerings by array of IDs, returns all fields for each offering
   * Expects { offeringIds: string[] } in req.body
   */
  GetBatchOfferingsById = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { offeringIds } = req.body;
      const offerings = await this.offeringService.GetBatchOfferingsById(
        offeringIds
      );
      this.sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Batch offerings fetched",
        data: offerings,
      });
    }
  );
}
