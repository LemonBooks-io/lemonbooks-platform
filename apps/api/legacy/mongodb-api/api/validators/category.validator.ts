import Joi from "joi";

export const createCategory =Joi.object({
    name : Joi.string().required(),
    description : Joi.string().allow(""),
})


