import Business from "../database/models/business.model";
import { IBusiness, IBusinessRepository } from "../interfaces/business.interface";
import GenericRepository from "./generic.repository";

export default class BusinessRepository extends GenericRepository<IBusiness> implements IBusinessRepository{
    constructor(){
        super(Business)
    }
}