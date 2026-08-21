import Joi from "joi";
import { Currency } from "../../enums/service.enum";

export const createInvoiceSchema = Joi.object({
    draft: Joi.boolean().required(),
    due: Joi.number().required(),
    expiry: Joi.number().required(),
    description: Joi.string().default(""),
    statement_descriptor: Joi.string().allow(""),
    note: Joi.string().default(""),
    order: Joi.object({
        amount: Joi.number(), // not useful, remove later
        currency : Joi.string(), // not useful, remove later
        items : Joi.array().items(
            Joi.object({
                amount: Joi.number(),
                quantity : Joi.number().default(1),
                itemId : Joi.string().required(),
                currency : Joi.string(),
                name : Joi.string(),
                description: Joi.string().allow(""),
                discount : Joi.number().default(0),
            })
        ),
        // currency : Joi.string().valid(...Object.keys(Currency)).default(Currency.KWD)
    }),
});


export const updateInvoiceSchema = Joi.object({
    due: Joi.number(),
    expiry: Joi.number(),
    charge: Joi.object({
        receipt: Joi.object({
            email: Joi.boolean().required().default(true),
            sms: Joi.boolean().required().default(true),
        }).required(),
    }),
    order: Joi.object({
        amount: Joi.number().required(),
        items: Joi.array().items(Joi.any()).required(),
        currency: Joi.string().required().default(Currency.KWD),
    })
});


export const convertEstimateSchema = Joi.object({
    due: Joi.number().required(),
    expiry: Joi.number().required(),
});
