import { ISubscriptionRepository } from "../../interfaces/subscription.interface";
import SubscriptionRepository from "../../repositories/subscription.repository";

export default class SubscriptionService {
     private subscriptionRepository: ISubscriptionRepository;
     constructor(){
            this.subscriptionRepository = new SubscriptionRepository();
        
     }

     async updateSubscriptionNextBillingDate(
        subscriptionId: string,
        nextBillingDate: Date
      ): Promise<void> {
        await this.subscriptionRepository.update({
            _id: subscriptionId,
        }, {
          nextBillingDate: nextBillingDate,
        });
      }
}