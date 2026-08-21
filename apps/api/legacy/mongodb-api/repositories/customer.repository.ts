import { getCustomerModel } from "../database/models/customer.model";
import { ICustomer } from "../interfaces/customer.interface";
import GenericRepository from "./generic.repository";

/**
 * @CustomerRepository
 * * A special repository that creates customer collections and
 * * * get customer collections for each business...
 */
export default class CustomerRepository{
    static forBusiness(businessName: string) {
        const model = getCustomerModel(businessName);
        return new GenericRepository<ICustomer>(model);
      }
}