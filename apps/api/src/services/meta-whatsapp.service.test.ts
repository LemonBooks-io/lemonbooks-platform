import assert from "node:assert/strict";
import test from "node:test";
import crypto from "node:crypto";
import { env } from "../config";
import { decryptMetaCredentials, encryptMetaCredentials } from "./meta-whatsapp.service";

test("merchant Meta credentials are encrypted and authenticated", () => {
  const previous = env.whatsapp.credentialsKey;
  env.whatsapp.credentialsKey = crypto.randomBytes(32).toString("base64");
  try {
    const encrypted = encryptMetaCredentials({ accessToken: "merchant-secret", tokenType: "bearer" });
    assert.ok(!encrypted.includes("merchant-secret"));
    assert.equal(decryptMetaCredentials(encrypted).accessToken, "merchant-secret");
    const tampered = `${encrypted.slice(0, -1)}${encrypted.endsWith("a") ? "b" : "a"}`;
    assert.throws(() => decryptMetaCredentials(tampered));
  } finally { env.whatsapp.credentialsKey = previous; }
});
