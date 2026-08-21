import httpStatus from "http-status";
import {
  IPaymentProof,
  IPaymentProofRepository,
  IPaymentRepository,
} from "../../interfaces/payment.interface";
import PaymentProofRepository from "../../repositories/payment-proof.repository";
import CloudinaryUploader from "../../storage/cloudinary";
import ApiError from "../../utilities/error.base";
import PaymentProofDTO from "../../dtos/paymentProofDTO";
import {
  PaymentMethod,
  PaymentProofStatus,
  PaymentStatus,
} from "../../enums/payment.enum";
import InvoiceRepository from "../../repositories/invoice.repository";
import PaymentRepository from "../../repositories/payments.repository";
import TransactionContextHandler from "../../utilities/transactionContextHandler";
import { IUserRepository } from "../../interfaces/user.interface";
import UserRepository from "../../repositories/user.repository";
import {
  roundMoney,
  addMoney,
  subtractMoney,
} from "../../utilities/payment.util";
import GetPaymentProofByIdResponseDto from "../../dtos/getPaymentProofByIdDto";
import { InvoiceStatus } from "../../enums/invoice.enum";

export default class PaymentService {
  private paymentProofRepository: IPaymentProofRepository;
  private paymentRepository: IPaymentRepository;
  private uploader: CloudinaryUploader;
  private _transactionContextHandler = new TransactionContextHandler();
  private userRepository: IUserRepository;
  constructor() {
    this.paymentRepository = new PaymentRepository();
    this.paymentProofRepository = new PaymentProofRepository();
    this.uploader = new CloudinaryUploader();
    this.userRepository = new UserRepository();
  }
  /**
   *
   * @param paymentDetails
   * @param file
   * @param invoiceId
   * @param ownerId
   * @param businessId
   * @returns
   */
  async UploadPaymentProof(
    paymentDetails: IPaymentProof,
    file: any,
    invoiceId: string,
    tenantId: string,
  ): Promise<void> {
    const invoiceProof = await this.paymentProofRepository.findOne({
      invoiceId,
    });

    if (invoiceProof)
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "A payment proof exist for this invoice, to change the proof content, please use the edit option..",
      );

    const invoiceRepository = InvoiceRepository.forBusiness(tenantId);

    const invoice = await invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new ApiError(httpStatus.CONFLICT, "Invoice not found");
    }

    // upload the image to cloud
    const imageUrl = await this.uploader.uploadSingleMedia(
      file.buffer,
      "payment-proof",
      invoiceId,
    );

    if (invoice.isBulk) {
      const invoiceProof = invoice.relatedInvoiceIds.map((invId: string) => ({
        ...paymentDetails,
        ownerId: invoice.recipientId,
        proofDocumentUrl: imageUrl.secure_url,
        businessId: invoice.businessId.toString(),
        invoiceId: invId,
      }));

      await this.paymentProofRepository.bulkCreate(invoiceProof);
      // invoice.relatedInvoiceIds.forEach(async (invId: string) => {
      //   await invoiceRepository.update(
      //     { _id: invId },
      //     {
      //       paymentMethod: paymentDetails.paymentMethod,
      //       status: PaymentStatus.REQUIRE_APPROVAL,
      //     }
      //   );
      // });

      await invoiceRepository.updateMany(
        { _id: { $in: invoice.relatedInvoiceIds } },
        {
          paymentMethod: paymentDetails.paymentMethod,
          status: InvoiceStatus.REQUIRE_APPROVAL,
        },
      );

      // delete the bulk invoice created
      invoiceRepository.delete(invoice._id!);
      return;
    }

    await this.paymentProofRepository.create({
      ...paymentDetails,
      ownerId: invoice.recipientId,
      proofDocumentUrl: imageUrl.secure_url,
      businessId: invoice.businessId.toString(),
      invoiceId,
    });

    await invoiceRepository.update(
      { _id: invoice._id },
      {
        paymentMethod: paymentDetails.paymentMethod,
        status: InvoiceStatus.REQUIRE_APPROVAL,
      },
    );
    return;
  }

  /**
   *
   * @param businessId
   * @param offset
   * @param limit
   * @returns
   */
  async getPaymentProofsByBusiness(
    businessId: string,
    offset: number,
    limit: number,
  ): Promise<{ proofs: PaymentProofDTO[]; total: number }> {
    const proofs = await this.paymentProofRepository.findAll(
      { businessId },
      offset,
      limit,
    );

    const dtos = proofs.data.map((proof) => new PaymentProofDTO(proof));
    return {
      proofs: dtos,
      total: proofs.totalCount,
    };
  }

  async getPaymentProofById(proofId: string): Promise<PaymentProofDTO> {
    const proof = await this.paymentProofRepository.findById(proofId);

    if (!proof) {
      throw new ApiError(httpStatus.NOT_FOUND, "Payment proof not found");
    }

    const approverDetails = await this.userRepository.findById(
      proof.approvedBy!,
    );
    return new GetPaymentProofByIdResponseDto(proof, {
      id: approverDetails?._id,
      email: approverDetails?.email,
      name: approverDetails?.name,
    });
  }

  /**
   *
   * @param proofId
   * @param userId
   * @param tenant
   * @returns
   */
  async approvePaymentProof(
    proofId: string,
    approverId: string,
    tenant: string,
  ): Promise<void> {
    const invoiceRepository = InvoiceRepository.forBusiness(tenant);
    await this._transactionContextHandler.begin();
    const session = this._transactionContextHandler.getSession();
    try {
      const paymentProof = await this.paymentProofRepository.update(
        { _id: proofId },
        {
          status: PaymentProofStatus.APPROVED,
          approvedAt: new Date(),
          approvedBy: approverId,
        },
        session,
      );

      if (!paymentProof) {
        throw new ApiError(httpStatus.NOT_FOUND, "Payment proof not found");
      }

      const invoice = await invoiceRepository.findById(paymentProof.invoiceId);

      if (!invoice) {
        throw new ApiError(httpStatus.NOT_FOUND, "Invoice not found");
      }

      if (invoice.status === InvoiceStatus.PAID) {
        throw new ApiError(
          httpStatus.UNPROCESSABLE_ENTITY,
          "This invoice has already been paid.",
        );
      }

      // find all customer invoices that are unpaid
      const oldInvoices = await invoiceRepository.find({
        recipientId: invoice.recipientId,
        draft: false,
        status: InvoiceStatus.UNPAID,
        isBulk: false,
      });

      const unpaidAmount = addMoney(
        ...oldInvoices.map((inv) => inv.order.amount),
      );

      await invoiceRepository.update(
        { _id: paymentProof.invoiceId },
        {
          paymentMethod: paymentProof.paymentMethod,
          status: InvoiceStatus.PAID,
        },
        session,
      );
      await this.paymentRepository.create(
        {
          invoiceId: paymentProof.invoiceId,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.order.amount,
          businessId: paymentProof.businessId,
          ownerId: invoice.recipientId,
          receivableBalance: subtractMoney(unpaidAmount, invoice.order.amount),
        },
        session,
      );

      this._transactionContextHandler.commit();
      return;
    } catch (error: any) {
      this._transactionContextHandler.rollback();
      throw error;
    }
  }

  /**
   *
   * @param invoiceId
   * @returns
   */
  async getProofByInvoiceById(invoiceId: string): Promise<PaymentProofDTO> {
    const proof = await this.paymentProofRepository.findOne({
      invoiceId: invoiceId,
    });

    if (!proof) {
      throw new ApiError(httpStatus.NOT_FOUND, "Payment proof not found");
    }

    const approverDetails = await this.userRepository.findById(
      proof.approvedBy!,
    );
    return new GetPaymentProofByIdResponseDto(proof, {
      id: approverDetails?._id,
      email: approverDetails?.email,
      name: approverDetails?.name,
    });
  }

  /**
   * @description Process Tap payment webhook
   * @param webhookPayload - The webhook payload from Tap
   */
  async processTapPaymentWebhook(webhookPayload: any): Promise<void> {
    const { metadata, status, amount, url } = webhookPayload;

    // Extract invoice number and tenant from metadata
    const { invoiceNumber, tenant } = metadata;

    if (!invoiceNumber || !tenant) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Missing invoiceNumber or tenant in webhook metadata",
      );
    }

    // Check if payment is successful
    if (status !== "PAID") {
      console.log(`Payment not successful. Status: ${status}`);
      return;
    }

    const invoiceRepository = InvoiceRepository.forBusiness(tenant);
    await this._transactionContextHandler.begin();
    const session = this._transactionContextHandler.getSession();

    try {
      // Find the invoice
      const invoice = await invoiceRepository.findOne({ invoiceNumber });

      if (!invoice) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          `Invoice not found with number: ${invoiceNumber}`,
        );
      }

      // Check if already paid
      if (invoice.status === InvoiceStatus.PAID) {
        console.log(`Invoice ${invoiceNumber} already marked as paid`);
        await this._transactionContextHandler.rollback();
        return;
      }

      // Find all unpaid invoices for receivable balance calculation
      const oldInvoices = await invoiceRepository.find({
        recipientId: invoice.recipientId,
        draft: false,
        status: PaymentStatus.UNPAID,
        isBulk: false,
      });

      const unpaidAmount = addMoney(
        ...oldInvoices.map((inv) => inv.order.amount),
      );

      // Update invoice status to paid
      await invoiceRepository.update(
        { _id: invoice._id },
        {
          paymentMethod: PaymentMethod.TAP_PAYMENT,
          status: InvoiceStatus.PAID,
          metadata: {
            blob: webhookPayload,
          },
        },
        session,
      );

      // Calculate amounts with proper decimal handling
      const paidAmount = roundMoney(amount);
      const newReceivableBalance = subtractMoney(
        unpaidAmount,
        invoice.order.amount,
      );

      // Create payment record and proof in parallel
      await Promise.all([
        this.paymentRepository.create(
          {
            invoiceId: invoice._id!,
            invoiceNumber: invoice.invoiceNumber,
            amount: paidAmount,
            businessId: invoice.businessId.toString(),
            ownerId: invoice.recipientId,
            receivableBalance: newReceivableBalance,
          },
          session,
        ),
        this.paymentProofRepository.create(
          {
            ownerId: invoice.recipientId,
            invoiceId: invoice._id!,
            proofDocumentUrl: url,
            businessId: invoice.businessId.toString(),
            status: PaymentProofStatus.APPROVED,
            paymentMethod: PaymentMethod.TAP_PAYMENT,
            approvedBy: null,
            approvedAt: new Date(),
            referenceId: webhookPayload.id,
          },
          session,
        ),
      ]);

      await this._transactionContextHandler.commit();
      console.log(
        `Successfully processed payment for invoice ${invoiceNumber}`,
      );
    } catch (error: any) {
      await this._transactionContextHandler.rollback();
      console.error("Error processing Tap webhook:", error);
      throw error;
    }
  }
}
