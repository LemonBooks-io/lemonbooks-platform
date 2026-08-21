import Tenant from "../database/models/tenant.model";
import { ITenant, ITenantRepository } from "../interfaces/tenant.interface";
import GenericRepository from "./generic.repository";

export default class TenantRepository extends GenericRepository<ITenant> implements ITenantRepository { 
    constructor() {     
        super(Tenant)
    }   
}