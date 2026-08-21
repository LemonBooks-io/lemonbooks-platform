import Joi from "joi";
import { Roles } from "../../enums/users.enum";

export const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  role: Joi.string()
    .valid(...Object.values(Roles))
    .required()
    .not(Roles.Super_Admin),
  phone: Joi.object({
    countryCode: Joi.string().required(),
    number: Joi.string().required(),
  }),
  accountType: Joi.string(),
  permissionSet: Joi.array().items(Joi.string()),
});

export const editProfileSchema = Joi.object({
  name: Joi.string().optional(),
  phone: Joi.object({
    countryCode: Joi.string().required(),
    number: Joi.string().required(),
  }).optional(),
});

export const batchUserIdsSchema = Joi.object({
  ids: Joi.array().items(Joi.string().required()).min(1).required(),
});
