import { ICategory } from "../interfaces/categories.interface";

export class CreateCategoryDTO{
    name : string;
    businessId : string;
    description : string;
    id : string

    constructor(category : ICategory) {
        this.name = category.name;
        this.businessId = category.businessId;
        this.description = category.description;
        this.id = category._id!
    }
}


export class UploadCategoryDTO{
    name : string;
    businessId : string;
    description : string;

    constructor(category : ICategory, businessId : string) {
        this.name = category.name;
        this.businessId = businessId;
        this.description = category.description;
    }
}