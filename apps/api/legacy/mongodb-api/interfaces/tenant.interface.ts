import IGenericRepository from "./generic.repository.interface";

export interface ITenant{
    tenantId: string;
    businessId : string;
}


export interface ITenantRepository extends IGenericRepository<ITenant>{
}