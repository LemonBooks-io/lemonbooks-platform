export enum InvoiceStatus {
  PENDING = "PENDING",
  DELIVERED = "DELIVERED", // for estimates
  REJECTED = "REJECTED", // for estimates
  APPROVED = "APPROVED", // for estimates
  UNPAID = "UNPAID",
  PAID = "PAID",
  REQUIRE_APPROVAL = "REQUIRE_APPROVAL", // change to REQUIRE_PAYMENT_APPROVAL
  DECLINED = "DECLINED",
  VOID = "VOID",
}