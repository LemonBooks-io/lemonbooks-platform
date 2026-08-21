import Category from "../database/models/categories.model";
import { ICategory, ICategoryRepository } from "../interfaces/categories.interface";
import GenericRepository from "./generic.repository";

export default class CategoryRepository extends GenericRepository<ICategory> implements ICategoryRepository {
    constructor(){
        super(Category);
    }
}