import assert from "node:assert/strict";
import test from "node:test";
import { platformReplyFor } from "./whatsapp-platform.service";

const base = { publicWebUrl: "https://lemonbooks.io", displayName: "Ada" };
test("platform registration uses the secure signup flow", () => assert.match(platformReplyFor({ ...base, body: "register" })!, /login\?mode=signup/));
test("platform payment response does not claim confirmation", () => assert.match(platformReplyFor({ ...base, body: "I transferred 5000" })!, /not marked as confirmed/));
test("platform record request is a reviewable draft", () => assert.match(platformReplyFor({ ...base, body: "create an invoice" })!, /draft for review/));
test("platform opt-out sends no reply", () => assert.equal(platformReplyFor({ ...base, body: "STOP" }), null));
