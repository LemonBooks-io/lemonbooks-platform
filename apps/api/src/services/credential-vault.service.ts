import crypto from "node:crypto";
import { env } from "../config";
import { HttpError } from "../http";

function key() {
  if (!env.whatsapp.credentialsKey) throw new HttpError(503, "Integration credential encryption is not configured");
  const value = Buffer.from(env.whatsapp.credentialsKey, "base64");
  if (value.length !== 32) throw new HttpError(503, "INTEGRATION_CREDENTIALS_KEY must be a 32-byte base64 value");
  return value;
}

export function encryptCredentials<T extends object>(credentials: T) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(credentials), "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), ciphertext].map(value => value.toString("base64url")).join(".");
}

export function decryptCredentials<T>(encrypted: string): T {
  const [iv, tag, ciphertext] = encrypted.split(".");
  if (!iv || !tag || !ciphertext) throw new HttpError(500, "Stored integration credentials are invalid");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64url")), decipher.final()]).toString("utf8")) as T;
}
