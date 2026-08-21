import Joi from "joi";
import { Currency } from "../../enums/service.enum";

export const createBusinessProfile = Joi.object({
    name : Joi.string(),
    email: Joi.string().email(),
})


export const updateBusiness = Joi.object({
    address : Joi.string(),
    phone : Joi.string(),
})


export const addTapKeys = Joi.object({
    key : Joi.string().required(),
})

export const setCurrency = Joi.object({
    currency : Joi.string().required().valid(...Object.keys(Currency)),
})