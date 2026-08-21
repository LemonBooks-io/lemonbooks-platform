import cors from "cors";
import express from "express";
import { env } from "./config";
import { errorHandler, HttpError } from "./http";
import { authenticate } from "./middleware/auth";
import { authRouter } from "./routes/auth.routes";
import { businessRouter } from "./routes/business.routes";
import { resourcesRouter } from "./routes/resources.routes";
import { syncRouter } from "./routes/sync.routes";
import { teamRouter } from "./routes/team.routes";
import { paystackRouter, paystackWebhook } from "./routes/paystack.routes";
import { publicRouter } from "./routes/public.routes";
import { paymentsRouter } from "./routes/payments.routes";
import { integrationsRouter } from "./routes/integrations.routes";
import { whatsappRouter } from "./routes/whatsapp.routes";
import { metaWebhookReceiver, metaWebhookVerification } from "./routes/meta-whatsapp-webhook";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(cors({ credentials: true, origin(origin, done) {
    if (!origin || env.clientUrls.includes(origin)) return done(null, true);
    return done(new HttpError(403, "This application origin is not allowed"));
  }}));
  app.use(express.json({ limit: "1mb", verify(req, _res, buffer) { (req as express.Request).rawBody = Buffer.from(buffer); } }));
  app.use(express.urlencoded({ extended: false }));

  app.get("/health", (_req, res) => res.json({ success: true, message: "LemonBooks API is healthy", data: { database: "postgresql" } }));
  app.use("/api/v3/auth", authRouter);
  app.post("/api/v3/payments/paystack/webhook", paystackWebhook);
  app.get("/api/v3/webhooks/whatsapp", metaWebhookVerification);
  app.post("/api/v3/webhooks/whatsapp", metaWebhookReceiver);
  app.use("/api/v3/public", publicRouter);
  app.use("/api/v3/payments/paystack", authenticate, paystackRouter);
  app.use("/api/v3/business", authenticate, businessRouter);
  app.use("/api/v3/resources", authenticate, resourcesRouter);
  app.use("/api/v3/sync", authenticate, syncRouter);
  app.use("/api/v3/team", authenticate, teamRouter);
  app.use("/api/v3/payment-claims", authenticate, paymentsRouter);
  app.use("/api/v3/integrations", authenticate, integrationsRouter);
  app.use("/api/v3/whatsapp", authenticate, whatsappRouter);
  app.use((_req, _res, next) => next(new HttpError(404, "Route not found")));
  app.use(errorHandler);
  return app;
}
