
import User from "../database/models/user.model";
import { IUser, IUserRepository } from "../interfaces/user.interface";
import GenericRepository from "./generic.repository";

export default class UserRepository extends GenericRepository<IUser> implements IUserRepository{
    constructor(){
        super(User)
    }
    
}