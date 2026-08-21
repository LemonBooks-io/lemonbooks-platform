import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import BaseController from "../../utilities/base.controller";
import PaymentService from "../services/payment.service";
import MulterMediaHandler from "../../middlewares/multer.middleware";
import PaymentProofDTO from "../../dtos/paymentProofDTO";

/**
 *
 */
export default class PaymentController extends BaseController {
  private paymentService: PaymentService = new PaymentService();
  constructor() {
    super();
  }

  /**
   * @description This function is used to handle the payment callback from TapPayment.
   * @param req
   * @param res
   * @param _
   */
  TapPaymentWebhook = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      console.log("Payment webhook", req.body);

      await this.paymentService.processTapPaymentWebhook(req.body);

      this.sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Payment processed successfully",
        data: null,
      });
    }
  );

  /**
   * @description This function is used to upload payment proof.
   */
  UploadPaymentProof = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      // const { id, businessId } = res.locals.user;
      // obtain file meta data....
      const file = MulterMediaHandler.obtainMediaFileFromReq(req);
      const tenantId = (req as any).tenantId;
      const paymentDetails = req.body;
      const { invoiceId } = req.params;
      await this.paymentService.UploadPaymentProof(
        paymentDetails,
        file,
        invoiceId as string,
        tenantId
      );
      this.sendResponse<null>(res, httpStatus.OK, {
        success: true,
        message: "Payment proof uploaded, await confirmation",
        data: null,
      });
    }
  );

  /**
   * @description This function is used to get all payment proofs by business id.
   * @param req
   * @param res
   * @param _
   */
  GetPaymentProofsByBusiness = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { businessId } = res.locals.user;
      const { offset, limit } = req.query as any;
      const content = await this.paymentService.getPaymentProofsByBusiness(
        businessId,
        isNaN(Number(offset)) ? 1 : Number(offset),
        isNaN(Number(limit)) ? 1 : Number(limit)
      );
      this.sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Payment proofs retrieved",
        data: content,
      });
    }
  );

  /**
   * @description This function is used to approve payment proof.
   * @param req
   * @param res
   * @param _
   */
  ApprovePaymentProof = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      const { id, tenantId } = res.locals.user;
      const { proofId } = req.params;
      await this.paymentService.approvePaymentProof(
        proofId as string,
        id,
        tenantId
      );
      this.sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Payment proof approved",
        data: null,
      });
    }
  );

  getProofByInvoiceById = this.wrapAsync(
    async (req: Request, res: Response, _: NextFunction) => {
      // const { id, tenantId } = res.locals.user;
      const { invoiceId } = req.params;
      const content = await this.paymentService.getProofByInvoiceById(
        invoiceId as string
      );
      this.sendResponse<PaymentProofDTO>(res, httpStatus.OK, {
        success: true,
        message: "Proof fetched",
        data: content,
      });
    }
  );
}
