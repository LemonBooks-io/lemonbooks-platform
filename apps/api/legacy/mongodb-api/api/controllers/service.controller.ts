// import { Request, Response, NextFunction } from "express";
// import httpStatus from "http-status";
// import ServicesService from "../services/services.service";
// import BaseController from "../../utilities/base.controller";
// import { CreateServiceDto } from "../../dtos/CreateServiceDto";

// export default class ServiceController extends BaseController {
//   private ServicesService: ServicesService;
//   constructor() {
//     super();
//     this.ServicesService = new ServicesService();
//   }

//   /**
//    *  create a new service...
//    */
//   CreateService = this.wrapAsync(
//     async (req: Request, res: Response, _: NextFunction) => {
//       const { id } = res.locals.user;
//       const content = await this.ServicesService.CreateService(req.body, id);
//       this.sendResponse<CreateServiceDto>(res, httpStatus.OK, {
//         success: true,
//         message: "Service created",
//         data: content,
//       });
//     }
//   );

//   /**
//    * Get services
//    */
//   GetAllService = this.wrapAsync(
//     async (req: Request, res: Response, _: NextFunction) => {
//       const { offset, limit } = req.query;
//       const allServices = await this.ServicesService.GetAllServices(
//         Number(offset),
//         Number(limit)
//       );
//       this.sendResponse(res, httpStatus.OK, {
//         success: true,
//         message: "",
//         data: allServices,
//       });
//     }
//   );
  
//   /**
//    * get service by id
//    */
//   GetServiceById =  this.wrapAsync(
//     async (req: Request, res: Response, _: NextFunction) => {
//       const { serviceId } = req.params;
//       const allServices = await this.ServicesService.GetServiceById(serviceId ?? "");
//       this.sendResponse(res, httpStatus.OK, {
//         success: true,
//         message: "Service Fetched",
//         data: allServices,
//       });
//     }
//   );


//   /**
//    * edit a service
//    */
//   EditService = this.wrapAsync(
//     async (req: Request, res: Response, _: NextFunction) => {
//       const { serviceId } = req.params;
//       await this.ServicesService.EditService(req.body, serviceId ?? "");
//       this.sendResponse(res, httpStatus.OK, {
//         success: true,
//         message: "Service Edited",
//         data: null,
//       });
//     }
//   );
// }
