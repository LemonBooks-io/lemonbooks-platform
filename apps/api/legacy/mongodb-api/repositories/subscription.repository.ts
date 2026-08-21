import Subscription from "../database/models/subscriptions.model";
import {
  ISubscription,
  ISubscriptionRepository,
} from "../interfaces/subscription.interface";
import GenericRepository from "./generic.repository";

export default class SubscriptionRepository
  extends GenericRepository<ISubscription>
  implements ISubscriptionRepository
{
  private subscription = Subscription;
  constructor() {
    super(Subscription);
    this.subscription = Subscription;
  }

  public async getCustomerSubscriptionsWithServiceDetail(
    customerId: string,
    offset: number,
    limit: number
  ): Promise<any> {
    const pageOffset = (offset - 1) * limit;
    const subscription = await this.subscription.aggregate([
      {
        $match: { ownerId: customerId },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: pageOffset,
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "offerings",
          let: { serviceId: "$serviceId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", { $toObjectId: "$$serviceId" }],
                },
              },
            },
          ],
          as: "service",
        },
      },
      {
        $unwind: {
          path: "$service",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          id: "$_id",
          serviceCode: 1,
          serviceId: 1,
          ownerId: 1,
          isSystemService: 1,
          startDate: 1,
          expireDate: 1,
          createdAt: 1,
          updatedAt: 1,
          service: {
            id: "$service._id",
            name: "$service.name",
            description: "$service.description",
            cost: "$service.cost",
            currency: "$service.currency",
            categoryId: "$service.categoryId",
            type: "$service.type",
            businessId: "$service.businessId",
            tenureType: "$service.tenureType",
            serviceCycle: "$service.serviceCycle",
            createdBy: "$service.createdBy",
          },
        },
      },
    ]);

    return subscription;
  }
}
