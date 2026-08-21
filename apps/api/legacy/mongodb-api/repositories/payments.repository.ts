import Payment from "../database/models/payments.model";
import {  IPayment, IPaymentRepository } from "../interfaces/payment.interface";
import GenericRepository from "./generic.repository";

export default class PaymentRepository extends GenericRepository<IPayment> implements IPaymentRepository{
    constructor(){
        super(Payment);
    }
}