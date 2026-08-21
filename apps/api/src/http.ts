import { NextFunction, Request, Response } from "express";

export class HttpError extends Error {
  constructor(public status: number, message: string, public code = "REQUEST_FAILED") {
    super(message);
  }
}

export function asyncRoute(handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => void handler(req, res, next).catch(next);
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const known = error instanceof HttpError;
  const message = known ? error.message : "Something went wrong. Please try again.";
  if (!known) console.error(error);
  res.status(known ? error.status : 500).json({ success: false, error: message, code: known ? error.code : "INTERNAL_ERROR" });
}
