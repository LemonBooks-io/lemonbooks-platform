import { Router } from "express";
import { asyncRoute } from "../http";
import * as auth from "../services/auth.service";

export const authRouter = Router();

authRouter.post("/signup", asyncRoute(async (req, res) => {
  const result = await auth.startSignup(req.body);
  res.status(201).json({ success: true, message: "Verification code sent", data: result });
}));

authRouter.post("/signup/verify", asyncRoute(async (req, res) => {
  const result = await auth.verifySignup(req.body.challengeId, req.body.otp);
  res.status(201).json({ success: true, message: "Your LemonBooks workspace is ready", data: result });
}));

authRouter.post("/login", asyncRoute(async (req, res) => {
  const result = await auth.login(req.body.email, req.body.password, req.body.tenantSlug);
  res.json({ success: true, message: "Welcome back", data: result });
}));
