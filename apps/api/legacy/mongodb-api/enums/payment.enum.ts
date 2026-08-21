export enum PaymentStatus{
    // PAID = 'PAID',
    PENDING = 'PENDING',
    DELIVERED = 'DELIVERED', // for estimates
    REJECTED = 'REJECTED', // for estimates
    APPROVED = 'APPROVED', // for estimates
    UNPAID = 'UNPAID',
    PAID = 'PAID',
    REQUIRE_APPROVAL = 'REQUIRE_APPROVAL', // change to REQUIRE_PAYMENT_APPROVAL
    DECLINED = 'DECLINED'
}


export enum PaymentMethod{
    TAP_PAYMENT = "TAP_PAYMENT",
    CASH = "CASH",
    BANK_TRANSFER = "BANK_TRANSFER",
    CHEQUE = "CHEQUE",
    UNSELECTED = "UNSELECTED",
    OTHERS = "OTHERS",
    LINK = "LINK"
}

export enum PaymentProofStatus{
    APPROVED = 'APPROVED',
    DECLINED = 'DECLINED',
    PENDING  = 'PENDING'
}