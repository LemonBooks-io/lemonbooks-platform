import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config";
import { HttpError } from "../http";
import { query } from "../database/pool";

type SessionClaims = { sub: string; businessId: string; tenantSlug: string; role: string };

export function createSessionToken(claims: SessionClaims): string {
  return jwt.sign(claims, env.jwtSecret, { expiresIn: "7d", issuer: "lemonbooks-api", audience: "lemonbooks" });
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) { next(new HttpError(401, "Sign in to continue", "UNAUTHENTICATED")); return; }
  try {
    const claims = jwt.verify(token, env.jwtSecret, { issuer: "lemonbooks-api", audience: "lemonbooks" }) as SessionClaims;
    const memberships = await query<{ role: string; tenant_slug: string }>(
      `SELECT m.role,b.tenant_slug FROM memberships m JOIN businesses b ON b.id=m.business_id
       WHERE m.user_id=$1 AND m.business_id=$2`, [claims.sub, claims.businessId],
    );
    const membership = memberships[0];
    if (!membership || membership.tenant_slug !== claims.tenantSlug) throw new Error("Membership no longer exists");
    req.auth = { userId: claims.sub, businessId: claims.businessId, tenantSlug: claims.tenantSlug, role: membership.role };
    next();
  } catch {
    next(new HttpError(401, "Your session has expired. Sign in again.", "SESSION_EXPIRED"));
  }
}
