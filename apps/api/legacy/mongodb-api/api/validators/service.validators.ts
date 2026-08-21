// import Joi from "joi";
// import { Currency } from "../../enums/service.enum";


// export const createService = Joi.object({
//     serviceName : Joi.string().required(),
//     serviceDescription : Joi.string(),
//     serviceCost : Joi.number().precision(2).required(),
//     serviceCostCurrency : Joi.string().valid(...Object.values(Currency)),
//     serviceBillingCycle : Joi.string().required(),
//     serviceCycle : Joi.string().required(),
//     minimumTenureDuration : Joi.number().precision(0),
// })


// export const editService = Joi.object({
//     serviceName : Joi.string(),
//     serviceDescription : Joi.string(),
//     serviceCost : Joi.number().precision(2),
//     serviceCostCurrency : Joi.string().valid(...Object.values(Currency)),
//     serviceBillingCycle : Joi.string(),
//     serviceCycle : Joi.string(),
//     minimumTenureDuration : Joi.number().precision(0),
// })
