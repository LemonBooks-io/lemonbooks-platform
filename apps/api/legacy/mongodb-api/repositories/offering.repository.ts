import Offering from "../database/models/offering.model";
import { IOffering, IOfferingRepository } from "../interfaces/offering.interface";
import GenericRepository from "./generic.repository";

export default class OfferingRepository
  extends GenericRepository<IOffering>
  implements IOfferingRepository
{
  constructor() {
    super(Offering);
  }
}
