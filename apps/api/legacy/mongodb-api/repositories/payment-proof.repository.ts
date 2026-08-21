import PaymentProof from "../database/models/payment-proof.model";
import {  IPaymentProof, IPaymentProofRepository } from "../interfaces/payment.interface";
import GenericRepository from "./generic.repository";

export default class PaymentProofRepository extends GenericRepository<IPaymentProof> implements IPaymentProofRepository{
    constructor(){
        super(PaymentProof);
    }
}