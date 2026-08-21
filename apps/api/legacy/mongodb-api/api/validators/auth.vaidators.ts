import Joi from "joi";

export const loginSchema = Joi.object({
    email : Joi.string().email().required(),
    password : Joi.string().required()
})

  export const sendOtp = Joi.object({
    email: Joi.string().required().email(),
  });
  
  export const verifyOtp = Joi.object({
    otp: Joi.string().required().length(5),
    email: Joi.string().required().email(),
  });
  
  export const changePassword = Joi.object({
    newPassword: Joi.string().required().min(5),
  });
  