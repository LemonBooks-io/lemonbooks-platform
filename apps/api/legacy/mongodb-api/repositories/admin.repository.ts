import Admin from "../database/models/admin.model";
import { IAdmin, IAdminRepository } from "../interfaces/admin.interface";
import GenericRepository from "./generic.repository";

export default class AdminRepository extends GenericRepository<IAdmin> implements IAdminRepository{
    constructor(){
        super(Admin)
    }
    
}