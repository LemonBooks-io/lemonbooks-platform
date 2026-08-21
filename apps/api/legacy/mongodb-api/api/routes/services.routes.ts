// import AuthenticationMiddleware from "../../middlewares/authentication.middleware";
// import RequestValidator from "../../middlewares/schema.middleware";
// import BaseRoute from "../../utilities/base.router";
// import ServiceController from "../controllers/service.controller";
// import { createService, editService } from "../validators/service.validators";


// /**
//  * @ServiceRoutes
//  */
// export default class ServiceRoutes extends BaseRoute{
//     constructor(){
//         super();
//     }

//     protected override setupRoutes(): void {
//         const serviceController : ServiceController = new ServiceController();

//         this.router.post(
//             "/services/create",
//             RequestValidator.validateRequestSchema(createService),
//             AuthenticationMiddleware.AuthenticateUser(),
//             // PermissionValidation.PermissionMiddleware([Permissions.CREATE_SERVICE]),
//             serviceController.CreateService,
//         )

//         //
//         this.router.get(
//             "/services/all",            
//             serviceController.GetAllService,
//         )

//         //
//          //
//          this.router.patch(
//             "/services/edit/:serviceId",
//             RequestValidator.validateRequestSchema(editService),
//             AuthenticationMiddleware.AuthenticateUser(),
//             serviceController.EditService
//         )

//         //
//         this.router.get(
//             "/services/getService/:serviceId",
//             AuthenticationMiddleware.AuthenticateUser(),
//             serviceController.GetServiceById
//         )
//     }
// }