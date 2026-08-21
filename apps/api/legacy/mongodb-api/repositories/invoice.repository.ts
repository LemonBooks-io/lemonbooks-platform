import  { getInvoiceModel } from "../database/models/invoice.model";
import { IInvoice } from "../interfaces/invoice.interface"
import GenericRepository from "./generic.repository"

/**
 * @InvoiceRepository
 * * A special repository that creates invoice collections and
 * * * get invoice collections for each business...
 */
export default class InvoiceRepository{
    static forBusiness(businessName: string) {
        const model = getInvoiceModel(businessName);
        return new GenericRepository<IInvoice>(model);
      }
    
    static getModelInstance (businessName: string){
      return getInvoiceModel(businessName)
    }
}