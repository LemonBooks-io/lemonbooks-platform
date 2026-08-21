import AuthenticationMiddleware from "../../middlewares/authentication.middleware";
import MulterMediaHandler from "../../middlewares/multer.middleware";
import RequestValidator from "../../middlewares/schema.middleware";
import TenancyMiddleware from "../../middlewares/tenancy.middleware";
import BaseRoute from "../../utilities/base.router";
import PaymentController from "../controllers/payment.controller";
import { uploadPaymentProof } from "../validators/payment.validators";

export default class PaymentRoutes extends BaseRoute{
    constructor(){
        super();
    }

    protected override setupRoutes(): void {
        const paymentController : PaymentController = new PaymentController();

        this.router.post(
            "/payment/callback",
            paymentController.TapPaymentWebhook,
        )

        this.router.post(
            "/payment/upload-payment-proof/:invoiceId",
            RequestValidator.validateRequestSchema(uploadPaymentProof),
            TenancyMiddleware.GetTenant,
            MulterMediaHandler.UploadSingleImageFile(), 
            paymentController.UploadPaymentProof,
        )

        this.router.get(
            "/payment/get-payment-proofs",
            AuthenticationMiddleware.AuthenticateUser(),
            paymentController.GetPaymentProofsByBusiness,
        )

        this.router.patch(
            "/payment/approve/:proofId",
            AuthenticationMiddleware.AuthenticateUser(),
            paymentController.ApprovePaymentProof,
        )

        this.router.get(
            "/payment/get-payment-proofs/:invoiceId",
            AuthenticationMiddleware.AuthenticateUser(),
            paymentController.getProofByInvoiceById,
        )
    }
}