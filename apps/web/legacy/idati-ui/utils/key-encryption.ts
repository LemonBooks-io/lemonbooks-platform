import { CompactEncrypt, importJWK } from "jose";
import publicJwk from "./public-jwk.json";

export async function encryptKey(data) {
  const publicKey = await importJWK(publicJwk, "RSA-OAEP-256");
  const encoder = new TextEncoder();

  return await new CompactEncrypt(encoder.encode(data))
    .setProtectedHeader({ alg: "RSA-OAEP-256", enc: "A256GCM" })
    .encrypt(publicKey);
}
