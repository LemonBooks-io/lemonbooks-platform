export class BatchUserDTO {
  id : string;
  email: string;
  businessId: string;
  tenantId: string;

  constructor(user: any) {
    this.id = user._id!.toString();
    this.email = user.email;
    this.businessId = user.businessId?.toString();
    this.tenantId = user.tenantId;
  }
}
