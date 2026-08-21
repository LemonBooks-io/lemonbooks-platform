export default class CustomerStatementDTO {
//   public statementData: object;
//   public receivable: number;
//   // host business
//   public businessName: string;
//   public businessAddress: string;
//   public businessId: string;
//   public customerName: string;
//   public customerId: string;

  constructor(
    public statementData: object[],
    public receivable: number,
    public dueBalanceBeforeStartDate : number,
    public totalInvoicedAmount : number,
    public totalPaymentsReceived : number,
    public businessName: string,
    public businessAddress: string,
    public businessId: string,
    public customerName: string,
    public customerId: string
  ) {
    // this.statementData = statementData;
    // this.receivable = receivable;
    // this.businessName = businessName;
    // this.businessAddress = businessAddress;
    // this.businessId = businessId;
    // this.customerName = customerName;
    // this.customerId = customerId;
  }
}
