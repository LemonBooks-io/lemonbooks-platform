import nodemailer, { Transporter } from "nodemailer";
import ejs from "ejs";
import path from "path";
import config from "config";
import { IMailOptions } from "../interfaces/mail.interface";
import { EmailType } from "../enums/mail.enum";


class EmailService {
  private transporter: Transporter;
  private mailOptions: IMailOptions;
  private verificationTemplatePath = path.join(
    __dirname,
    "templates",
    "verify.template.ejs"
  );
  private credentialsTemplatePath = path.join(
    __dirname,
    "templates",
    "credentials.template.ejs"
  );
  private resetTemplatePath = path.join(
    __dirname,
    "templates",
    "resetPassword.template.ejs"
  );
  private invoiceTemplatePath = path.join(
    __dirname,
    "templates",
    "invoice.template.ejs"
  );

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.get("MAIL_HOST"),
      port: config.get("MAIL_PORT"),
      auth: {
        user: config.get("MAIL_USER"),
        pass: config.get("MAIL_PASS"),
      },
      tls: { rejectUnauthorized: false },
    });

    this.mailOptions = {
      from: config.get("MAIL_FROM") as string,
    };
  }

  private async sendToMail(options: IMailOptions) {
    try {
      const sendMailOptions: IMailOptions = {
        ...this.mailOptions,
        ...options,
      };
      await this.transporter.sendMail(sendMailOptions);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async SendEMailToUser(
    optionsPart: Partial<IMailOptions>,
    type: EmailType
     = EmailType.VerifyEmail
  ) {
    //optionsPart = subject and to
    //html should be decided based on the type of email
    let html;
    switch (type) {
      case EmailType.VerifyEmail:
        html = await ejs.renderFile(this.verificationTemplatePath, {
          body: optionsPart.bodyParts,
        });
        break;

      case EmailType.ResetEmail:
        html = await ejs.renderFile(this.resetTemplatePath, {
          body: optionsPart.bodyParts,
        });
        break;

      case EmailType.CredentialsEmail:
        html = await ejs.renderFile(this.credentialsTemplatePath, {
          body: optionsPart.bodyParts,
        });
        break;
      
      case EmailType.InvoiceEmail:
        html = await ejs.renderFile(this.invoiceTemplatePath, {
          body: optionsPart.bodyParts,
        });
        break;

      default:
        html = await ejs.renderFile(this.credentialsTemplatePath, {
          body: optionsPart.bodyParts,
        });
    }

    if(!html){
        throw new Error("Invalid Email Template Path")
    }
    
    const emailSendingOptions: Partial<IMailOptions> = {
      ...optionsPart,
      subject: optionsPart.subject!,
      html: html,
    };
    try{
      await this.sendToMail(emailSendingOptions as IMailOptions);
    }catch(error){
      console.log("Error sending email: ",error);
    }
  }
}

export default EmailService;
