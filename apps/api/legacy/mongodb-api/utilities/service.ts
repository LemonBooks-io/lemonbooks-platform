import { ServiceDuration } from "../enums/service.enum";
import { IOffering } from "../interfaces/offering.interface";
import { ISubscription } from "../interfaces/subscription.interface";

export default class ServiceBillingCalculator {
  public static convertToDay(unit: number, duration: ServiceDuration): number {
    switch (duration) {
      case ServiceDuration.DAYS:
        return unit;
      case ServiceDuration.WEEKS:
        return unit * 7;
      case ServiceDuration.MONTH:
        return unit * 30; // Approximate
      case ServiceDuration.YEAR:
        return unit * 365; // Approximate
      default:
        throw new Error(`Unsupported unit: ${unit}`);
    }
  }

  public static calculateBillingAmount(
    service: IOffering,
    subscription: ISubscription
  ): number {
    // If service doesn't have cycles defined, return full cost
    if (!service.serviceCycle || !service.billingCycle) {
      return service.cost;
    }

    // Convert both cycles to days for comparison
    const serviceDays = ServiceBillingCalculator.convertToDay(
      service.serviceCycle.unit,
      service.serviceCycle.duration
    );
    const billingDays = ServiceBillingCalculator.convertToDay(
      subscription.billingCycle!.unit,
      subscription.billingCycle!.duration
    );

    // Calculate the proportion of service cost for this billing period
    const proportion = billingDays / serviceDays;

    // Handle edge cases
    if (proportion >= 1) {
      // Billing cycle is same or longer than service cycle
      // User pays the full service cost
      return service.cost;
    } else {
      // Billing cycle is shorter than service cycle
      // User pays proportionally
      return service.cost * proportion;
    }
  }

  public static calculateNextBillingDate(
    startDate: Date,
    billingCycle: { unit: number; duration: ServiceDuration }
  ): Date {
    const nextBillingDate = new Date(startDate);

    // For monthly and yearly cycles, always start from the 1st of the month
    if (billingCycle.duration === ServiceDuration.MONTH) {
      // Add the specified number of months
      nextBillingDate.setMonth(nextBillingDate.getMonth() + billingCycle.unit);
      // Set to the 1st of the month
      nextBillingDate.setDate(1);
    } else if (billingCycle.duration === ServiceDuration.YEAR) {
      // Add the specified number of years
      nextBillingDate.setFullYear(
        nextBillingDate.getFullYear() + billingCycle.unit
      );
      // Set to the 1st of the month
      nextBillingDate.setDate(1);
    } else {
      // For daily and weekly, use the existing logic
      const daysToAdd = this.convertToDay(
        billingCycle.unit,
        billingCycle.duration
      );
      nextBillingDate.setDate(nextBillingDate.getDate() + daysToAdd);
    }

    console.log(nextBillingDate);
    return nextBillingDate;
  }
}
