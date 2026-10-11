import assert from "node:assert/strict";
import test from "node:test";
import { describeLoginDevice, normalizeDeviceLoginCode, parseDeviceLoginCommand } from "./whatsapp-device-login.service";

test("normalizes unambiguous WhatsApp device-login codes", () => {
  assert.equal(normalizeDeviceLoginCode("abcd-2345"), "ABCD2345");
  assert.equal(normalizeDeviceLoginCode("ABCI-2345"), null);
  assert.equal(normalizeDeviceLoginCode("short"), null);
});

test("parses request, approval and denial commands", () => {
  assert.deepEqual(parseDeviceLoginCommand("LOGIN ABCD-2345"), { action: "request", code: "ABCD2345" });
  assert.deepEqual(parseDeviceLoginCommand("approve abcd2345"), { action: "approve", code: "ABCD2345" });
  assert.deepEqual(parseDeviceLoginCommand("DENY ABCD-2345"), { action: "deny", code: "ABCD2345" });
  assert.equal(parseDeviceLoginCommand("LOGIN"), null);
});

test("describes the requesting browser without storing the full user agent", () => {
  assert.equal(describeLoginDevice("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126.0"), "Chrome on macOS");
  assert.equal(describeLoginDevice("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/127.0"), "Firefox on Windows");
});
