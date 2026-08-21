import express, { Express, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import { ErrorMiddleware } from "./middlewares/error.middleware";
import SwaggerService from "./docs/swagger";
import AdminRoutes from "./api/routes/admin.routes";
import AuthRoutes from "./api/routes/auth.routes";
import CustomerRoutes from "./api/routes/customer.routes";
import BusinessRoutes from "./api/routes/business.routes";
import CategoryRoutes from "./api/routes/category.routes";
import OfferingRoutes from "./api/routes/offering.routes";
import InvoiceRoutes from "./api/routes/invoice.routes";
import UserRoutes from "./api/routes/user.routes";
import PaymentRoutes from "./api/routes/payment.routes";

class App {
  private app: Express;
  private apiPrefix: string = "/api/v2";
  private adminRoutes: AdminRoutes;
  private authRoutes : AuthRoutes;
  private customerRoutes: CustomerRoutes;
  private businessRoutes: BusinessRoutes;
  private categoryRoutes: CategoryRoutes;
  private offeringRoutes: OfferingRoutes;
  private invoiceRoutes: InvoiceRoutes;
  private userRoutes: UserRoutes;
  private paymentRoutes: PaymentRoutes;

  constructor() {
    this.app = express();
    this.adminRoutes = new AdminRoutes();
    this.userRoutes = new UserRoutes();
    this.authRoutes = new AuthRoutes();
    this.customerRoutes = new CustomerRoutes();
    this.businessRoutes = new BusinessRoutes();
    this.categoryRoutes = new CategoryRoutes();
    this.offeringRoutes = new OfferingRoutes();
    this.invoiceRoutes = new InvoiceRoutes();
    this.paymentRoutes = new PaymentRoutes();

    this.SetUpOtherMiddlewares();
    this.SetUpAppRoutes();
    this.SetupErrorRoutes();
  }

  private SetUpOtherMiddlewares(): void {
    const allowedOrigins = (process.env.CLIENT_URL ?? "http://localhost:5173")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);

    this.app.disable("x-powered-by");
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors({
      credentials: true,
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error("Origin is not allowed by CORS"));
      },
    }));
    this.app.use(morgan("combined"));

    const swaggerService = new SwaggerService(this.app);
    swaggerService.init();
  }

  private SetUpAppRoutes(): void {
    this.app.get("/health", (_: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: "LemonBooks API is healthy",
        data: null,
      });
    });

    // Register admin routes
    this.app.use(`${this.apiPrefix}`, this.authRoutes.getRouter());
    this.app.use(`${this.apiPrefix}`, this.adminRoutes.getRouter());
    this.app.use(`${this.apiPrefix}`, this.userRoutes.getRouter());
    this.app.use(`${this.apiPrefix}`, this.businessRoutes.getRouter());
    this.app.use(`${this.apiPrefix}`, this.customerRoutes.getRouter());
    this.app.use(`${this.apiPrefix}`, this.categoryRoutes.getRouter());
    this.app.use(`${this.apiPrefix}`, this.offeringRoutes.getRouter());
    this.app.use(`${this.apiPrefix}`, this.invoiceRoutes.getRouter());
    this.app.use(`${this.apiPrefix}`, this.paymentRoutes.getRouter());
  }

  private SetupErrorRoutes() {
    this.app.use(ErrorMiddleware.handleNotFound);
    this.app.use(ErrorMiddleware.errorHandler);
  }

  public async start(port: number) {
    return this.app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }
}

export default App;
