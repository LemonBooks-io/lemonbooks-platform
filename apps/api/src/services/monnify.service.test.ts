import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { env } from "../config";
import { decryptMonnifyCredentials, encryptMonnifyCredentials, validMonnifySignature } from "./monnify.service";

test("protects Monnify credentials and verifies webhook signatures",()=>{
  const previous=env.whatsapp.credentialsKey;env.whatsapp.credentialsKey=crypto.randomBytes(32).toString("base64");
  try{const credentials={apiKey:"api-key",secretKey:"secret-key",contractCode:"contract"};const encrypted=encryptMonnifyCredentials(credentials);assert.doesNotMatch(encrypted,/secret-key/);assert.deepEqual(decryptMonnifyCredentials(encrypted),credentials);const raw=Buffer.from('{"eventType":"SUCCESSFUL_TRANSACTION"}');const signature=crypto.createHmac("sha512",credentials.secretKey).update(raw).digest("hex");assert.equal(validMonnifySignature(raw,signature,credentials.secretKey),true);assert.equal(validMonnifySignature(raw,"0".repeat(128),credentials.secretKey),false);}finally{env.whatsapp.credentialsKey=previous;}
});
