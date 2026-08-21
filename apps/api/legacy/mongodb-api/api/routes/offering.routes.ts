import AuthenticationMiddleware from "../../middlewares/authentication.middleware";
import MulterMediaHandler from "../../middlewares/multer.middleware";
import RequestValidator from "../../middlewares/schema.middleware";
import BaseRoute from "../../utilities/base.router";
import OfferingController from "../controllers/offering.controller";
import {
    batchFetchOfferings,
  createOffering,
  updateOffering,
} from "../validators/offering.validator";

export default class OfferingRoutes extends BaseRoute {
  constructor() {
    super();
  }

  protected override setupRoutes(): void {
    const offeringController: OfferingController = new OfferingController();

    this.router.post(
      "/offerings/create",
      AuthenticationMiddleware.AuthenticateUser(),
      RequestValidator.validateRequestSchema(createOffering),
      offeringController.CreateOffering
    );

    this.router.get(
      "/offerings/all",
      AuthenticationMiddleware.AuthenticateUser(),
      offeringController.GetOfferings
    );

    this.router.patch(
      "/offerings/:offeringId",
      AuthenticationMiddleware.AuthenticateUser(),
      RequestValidator.validateRequestSchema(updateOffering),
      offeringController.EditOffering
    );

    this.router.post(
      "/offerings/bulk",
      AuthenticationMiddleware.AuthenticateUser(),
      MulterMediaHandler.UploadCSVFile(),
      offeringController.createOfferingFromCsv
    );

    this.router.post(
      "/offerings/batch-fetch",
    //   AuthenticationMiddleware.AuthenticateUser(),
      RequestValidator.validateRequestSchema(batchFetchOfferings),
      offeringController.GetBatchOfferingsById
    );
  }
}
