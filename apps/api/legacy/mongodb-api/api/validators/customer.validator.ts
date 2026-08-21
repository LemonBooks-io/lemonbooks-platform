import Joi from "joi";
export const createCustomer = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().required().email(),
    company: Joi.string(),
    city: Joi.string(),
    country: Joi.string(),
    state: Joi.string(),
    address: Joi.string(),
    phone: Joi.object({
        countryCode : Joi.string(),
        number : Joi.string(),
    }),
})


export const editCustomerSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  email: Joi.string().optional(),
  company: Joi.string().optional(),
  city: Joi.string().optional(),
  country: Joi.string().optional(),
  state: Joi.string().optional(),
  address: Joi.string().optional(),
  phone: Joi.object({
    countryCode: Joi.string().optional(),
    number: Joi.string().optional(),
  }).optional(),
  openBalance: Joi.object({
    amount: Joi.number().required(),
    description: Joi.string().default(""),
    //   order: Joi.object({
    //     items: Joi.array().items(
    //       Joi.object({
    //         amount: Joi.number(),
    //         quantity: Joi.number().default(1),
    //         name: Joi.string(),
    //         description: Joi.string().allow(""),
    //       })
    //     ),
    //   }),
    // }).optional(),
  }),
});
