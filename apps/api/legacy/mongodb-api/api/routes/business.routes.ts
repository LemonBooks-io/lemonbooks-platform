import BaseRoute from "../../utilities/base.router";
import AuthenticationMiddleware from "../../middlewares/authentication.middleware";
import BusinessController from "../controllers/business.controller";
import RequestValidator from "../../middlewares/schema.middleware";
import { addTapKeys, createBusinessProfile, setCurrency, updateBusiness } from "../validators/business.validators";
import MulterMediaHandler from "../../middlewares/multer.middleware";


export default class BusinessRoutes extends BaseRoute {

  constructor() {
    super();
  }
  /**
   * @method setupRoutes
   * @description Sets up the routes for user-related operations.
   * This method defines the specific routes and their corresponding controller actions.
   */
  protected setupRoutes(): void {
    const businessController = new BusinessController();


    this.router.post(
      "/business/create-and-add-service",
      RequestValidator.validateRequestSchema(createBusinessProfile),
      AuthenticationMiddleware.AuthenticateUser(),
      businessController.createBusinessProfile,
    );


    this.router.put(
      "/business/logo-upload",
      AuthenticationMiddleware.AuthenticateUser(),
      MulterMediaHandler.UploadSingleImageFile(), 
      businessController.uploadBusinessLogo
    )


    this.router.patch(
      "/business/edit",
      RequestValidator.validateRequestSchema(updateBusiness),
      AuthenticationMiddleware.AuthenticateUser(),
      businessController.editBusinessProfile,
    )

    this.router.put(
      "/business/add-tap-key",
      RequestValidator.validateRequestSchema(addTapKeys),
      AuthenticationMiddleware.AuthenticateUser(),
      businessController.addTapPaymentKeys,
    )
    
    this.router.put(
      "/business/set-default-currency",
      RequestValidator.validateRequestSchema(setCurrency),
      AuthenticationMiddleware.AuthenticateUser(),
      businessController.addBusinessDefaultCurrency,
    )

    this.router.post(
      "/business/enable-tap-payment",
      AuthenticationMiddleware.AuthenticateUser(),
      businessController.enableAndDisableTapPayment,
    )

  }
}
