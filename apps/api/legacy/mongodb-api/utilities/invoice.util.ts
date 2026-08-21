import config from "config";
import SecurityHelperService from "../helpers/security";
import { TokenType } from "../enums/token.enum";
import EmailService from "../email/emailer";
import { EmailType } from "../enums/mail.enum";
import UserRepository from "../repositories/user.repository";

/**
 * Formats customer data for invoice recipient
 */
export function formatRecipientDataForInvoice(customer: any) {
  return {
    first_name: customer.firstName,
    last_name: customer.lastName,
    email: customer.email,
    phone: {
      country_code: customer.phone.countryCode,
      number: customer.phone?.number,
    },
    address: customer.address,
    company: customer.company ?? null,
  };
}

/**
 * Generates payment URLs for the invoice
 */
export function generatePaymentUrls(tenant: string, invoiceId: string) {
  const subdomain = tenant === "administrator" ? "www" : tenant;
  const baseUrl = config.get("CLIENT_URL");

  return {
    customPaymentUrl: `https://${subdomain}.${baseUrl}/custom-payment?invoiceId=${invoiceId}`,
    clientRedirectUrl: `https://${subdomain}.${baseUrl}/tap-payment`,
  };
}

/**
 * Generates customer onboarding URL with temporary token
 * @param tenant - The tenant identifier
 * @param customerId - The customer ID
 * @param token - The temporary token
 * @param hasAccount - Whether the customer has an existing user account
 */
export function generateOnboardUrl(
  tenant: string,
  customerId: string,
  token: string,
  hasAccount: boolean = false
) {
  const subdomain = tenant === "administrator" ? "www" : tenant;
  const baseUrl = config.get("CLIENT_URL");

  // If customer has an account, direct to login page, otherwise to password setup
  if (hasAccount) {
    return `https://${subdomain}.${baseUrl}/client`;
  }

  return `https://${subdomain}.${baseUrl}/client/changePassword?id=${customerId}&token=${token}`;
}

/**
 * Sends invoice notification email to customer
 */
export async function sendInvoiceNotificationEmail(
  invoice: any,
  customer: any,
  business: any,
  formattedItems: any[],
  tenant: string,
  businessId: string,
  finalAmount?: number
): Promise<void> {
  const emailService: EmailService = new EmailService();
  const userRepository = new UserRepository();

  // Check if user account exists for this customer email
  const existingUser = await userRepository.findOne({ email: customer.email });
  const hasAccount = !!existingUser;

  const temporaryToken = await SecurityHelperService.GenerateToken(
    {
      id: customer._id!.toString(),
      role: null,
      businessId: businessId,
      permissions: [],
      tenantId: tenant,
      accountType: customer.accountType,
      type: TokenType.TEMPORARY,
    },
    TokenType.TEMPORARY,
    86000
  );

  const onboardUrl = generateOnboardUrl(
    tenant,
    customer._id,
    temporaryToken.token,
    hasAccount
  );

  await emailService.SendEMailToUser(
    {
      to: customer.email,
      subject: "Your Invoice is Ready",
      bodyParts: {
        name: customer.firstName,
        invoiceNumber: invoice.invoiceNumber,
        amount: finalAmount,
        due: new Date(invoice.due).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        type: invoice.draft ? "estimate" : "invoice",
        tapInvoiceUrl: invoice.tapInvoiceUrl,
        items: formattedItems,
        currency: business.currency,
        customPaymentUrl: invoice.customInvoiceUrl,
        onboardUrl,
      },
    },
    EmailType.InvoiceEmail
  );
}
