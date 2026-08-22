import crypto from "node:crypto";
import { HttpError } from "../http";
import { decryptCredentials, encryptCredentials } from "./credential-vault.service";

export type MonnifyEnvironment = "sandbox" | "production";
export type MonnifyCredentials = { apiKey:string; secretKey:string; contractCode:string };
type Envelope<T> = { requestSuccessful:boolean; responseMessage:string; responseCode:string; responseBody:T };

const baseUrl = (environment:MonnifyEnvironment) => environment === "production" ? "https://api.monnify.com" : "https://sandbox.monnify.com";
export const encryptMonnifyCredentials = (value:MonnifyCredentials) => encryptCredentials(value);
export const decryptMonnifyCredentials = (value:string) => decryptCredentials<MonnifyCredentials>(value);

async function payload<T>(response:Response) {
  const body = await response.json().catch(() => ({})) as Partial<Envelope<T>>;
  if (!response.ok || body.requestSuccessful === false) throw new HttpError(502, body.responseMessage || "Monnify could not process this request", "MONNIFY_ERROR");
  return body.responseBody as T;
}

export async function authenticateMonnify(credentials:MonnifyCredentials, environment:MonnifyEnvironment) {
  const authorization = Buffer.from(`${credentials.apiKey}:${credentials.secretKey}`).toString("base64");
  const response = await fetch(`${baseUrl(environment)}/api/v1/auth/login`, { method:"POST", headers:{ Authorization:`Basic ${authorization}` } });
  return payload<{accessToken:string;expiresIn:number}>(response);
}

export async function monnifyRequest<T>(credentials:MonnifyCredentials, environment:MonnifyEnvironment, path:string, init:RequestInit={}) {
  const auth = await authenticateMonnify(credentials, environment);
  const response = await fetch(`${baseUrl(environment)}${path}`, { ...init, headers:{ Authorization:`Bearer ${auth.accessToken}`, "Content-Type":"application/json", ...init.headers } });
  return payload<T>(response);
}

export function validMonnifySignature(rawBody:Buffer, signature:string, secretKey:string) {
  const expected = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
  return signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
