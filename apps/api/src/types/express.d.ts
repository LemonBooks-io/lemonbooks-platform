declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
      auth?: { userId: string; businessId: string; tenantSlug: string; role: string };
    }
  }
}
export {};
