// import httpStatus from "http-status";
// import { IService, IServiceRepository } from "../../interfaces/service.interface";
// import ApiError from "../../utilities/error.base";
// import { CreateServiceDto } from "../../dtos/CreateServiceDto";
// import ServiceRepository from "../../repositories/service.repository";
// import { GetServicesDTO } from "../../dtos/ServiceDto";

// export default class ServicesService{
//     private serviceRepository : IServiceRepository;

//     constructor(){
//         this.serviceRepository = new ServiceRepository();
//     }

//     /**
//      * 
//      * @param service 
//      * @param createdBy 
//      * @returns 
//      */
//     async CreateService(service : IService, createdBy : string) : Promise<CreateServiceDto>{
//         let _service = await this.serviceRepository.findOne({
//             serviceTypeName : {$regex : new RegExp(`${service.serviceName}`, "i")},
//         });

//         if (_service) throw new ApiError(
//             httpStatus.CONFLICT,
//             "Service name already exists"
//         )

//        const createdService = await this.serviceRepository.create({
//             ...service,
//             createdBy
//         })
//         return new CreateServiceDto(createdService);
//     }

//     /**
//      * 
//      * @param offset 
//      * @param limit 
//      * @returns 
//      */
//     async GetAllServices(offset: number = 1, limit : number = 10): Promise<{ services: GetServicesDTO[], totalCount: number }>{
//         const services = await this.serviceRepository.findAll({},offset, limit)
//         const dtoList = services.data.map((service) => {
//             return new GetServicesDTO(service);
//         });
    
//         return {
//             services: dtoList,
//             totalCount: services.totalCount
//         };
//     }

//     /**
//      * 
//      * @param serviceId 
//      * @returns 
//      */
//     async GetServiceById(serviceId : string){
//         const service = await this.serviceRepository.findById(serviceId);
//         if(!service) throw new ApiError(
//             httpStatus.NOT_FOUND,
//             "Service does not exists"
//         );


//         return service;

//     }

//     /**
//      * 
//      * @param serviceData 
//      * @param serviceId 
//      */
//     async EditService(serviceData : Partial<IService>, serviceId : string){
//         await this.serviceRepository.update({_id : serviceId}, serviceData);
//     }
// }