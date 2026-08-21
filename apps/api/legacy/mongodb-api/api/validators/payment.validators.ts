import Joi from "joi";
import { PaymentMethod } from "../../enums/payment.enum";

export const uploadPaymentProof = Joi.object({ 
    referenceId: Joi.string(),
    additionalDetails: Joi.string(),
    paymentMethod: Joi.string().valid(PaymentMethod.BANK_TRANSFER, PaymentMethod.CASH, PaymentMethod.CHEQUE, PaymentMethod.LINK, PaymentMethod.OTHERS),
    otherPaymentMethod : Joi.string(),
})