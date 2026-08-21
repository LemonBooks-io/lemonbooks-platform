import Joi from "joi";
import { AccountType, Roles } from "../../enums/users.enum";

export const createAdminSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  role: Joi.string()
    .valid(...Object.values(Roles))
    .required(),
  accountType: Joi.string()
    .valid(...Object.values(AccountType)).default(AccountType.Business),
  permissionSet: Joi.array().items(Joi.string()),
});
