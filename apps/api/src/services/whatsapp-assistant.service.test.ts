import assert from "node:assert/strict";
import test from "node:test";
import { parseAssistantAction } from "./whatsapp-assistant.service";

test("parses a complete invoice instruction", () => {
  assert.deepEqual(parseAssistantAction("INVOICE | Ada | 50kg rice | 3 | ₦18,000"), {
    kind: "action",
    action: { type: "invoice", customerName: "Ada", itemName: "50kg rice", quantity: 3, unitPrice: 18000 },
  });
});

test("parses supported inventory, sale, expense and payment actions", () => {
  assert.equal(parseAssistantAction("ADD ITEM | Rice | 10 | 45000 | 40000").kind, "action");
  assert.equal(parseAssistantAction("SALE | Ada | Rice | 2 | 45000 | POS").kind, "action");
  assert.equal(parseAssistantAction("EXPENSE | Generator fuel | 25000 | Utilities | Total Station").kind, "action");
  assert.equal(parseAssistantAction("PAYMENT | INV-00001 | 25000 | transfer | NIP-123").kind, "action");
});

test("does not invent missing financial details", () => {
  const result = parseAssistantAction("create an invoice for Ada");
  assert.equal(result.kind, "incomplete");
  if (result.kind === "incomplete") assert.match(result.usage, /customer \| item \| quantity \| unit price/);
});

test("rejects invalid amounts and unsupported payment methods", () => {
  assert.equal(parseAssistantAction("SALE | Ada | Rice | two | 45000 | cash").kind, "incomplete");
  assert.equal(parseAssistantAction("PAYMENT | INV-00001 | -5 | crypto").kind, "incomplete");
});
