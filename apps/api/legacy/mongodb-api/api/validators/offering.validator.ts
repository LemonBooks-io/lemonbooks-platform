import Joi from "joi";
import { ServiceDuration } from "../../enums/service.enum";

export const createOffering = Joi.object({
    name: Joi.string().required(),
    cost: Joi.number().required(),
    description: Joi.string().allow("").optional(),
    categoryId : Joi.string().required(),
    serviceCycle : Joi.object({
        unit: Joi.number().default(1),
        duration :  Joi.string().valid(...Object.keys(ServiceDuration)).default(ServiceDuration.MONTH)
    }),
    billingCycle : Joi.object({
        unit: Joi.number().default(1),
        duration :  Joi.string().valid(...Object.keys(ServiceDuration)).default(ServiceDuration.MONTH)
    }),
    tenureType : Joi.string(),
    currency : Joi.string()
});

export const updateOffering = Joi.object({
    name: Joi.string(),
    cost: Joi.number(),
    description: Joi.string(),
    categoryId : Joi.string(),
});


export const batchFetchOfferings = Joi.object({
  offeringIds: Joi.array().items(Joi.string().required()).min(1).required(),
});
