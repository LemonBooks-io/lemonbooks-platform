export class PaymentLinksDTO {
  tapInvoiceUrl: string | null;
  customInvoiceUrl: string | null;

  constructor(data: {
    tapInvoiceUrl?: string | null;
    customInvoiceUrl?: string | null;
  }) {
    this.tapInvoiceUrl = data.tapInvoiceUrl || null;
    this.customInvoiceUrl = data.customInvoiceUrl || null;
  }
}
