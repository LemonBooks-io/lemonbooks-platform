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

test("parses labeled fields in any order with case-insensitive shortcuts",()=>{
  assert.deepEqual(parseAssistantAction(`aI
    D: Epson low data POS ipad
    p: 12500
    N: POS Ipad
    C: 5000
    q: 20`),{
    kind:"action",
    action:{type:"inventory",itemName:"POS Ipad",quantity:20,price:12500,cost:5000,description:"Epson low data POS ipad"},
  });
  assert.deepEqual(parseAssistantAction(`ADD ITEM
Name: Cable
Price: 2500
Quantity: 4`),{
    kind:"action",
    action:{type:"inventory",itemName:"Cable",quantity:4,price:2500,cost:0,description:""},
  });
});

test("parses labeled customer and financial actions",()=>{
  assert.deepEqual(parseAssistantAction(`AC
Phone: 08012345678
N: Ada Okafor
Email: ADA@example.com`),{
    kind:"action",action:{type:"customer",name:"Ada Okafor",email:"ada@example.com",phone:"08012345678",company:"",address:""},
  });
  assert.equal(parseAssistantAction("INVOICE\nPrice: 45000\nItem: Rice\nCustomer: Ada\nQuantity: 2").kind,"action");
  assert.equal(parseAssistantAction("sAlE\nM: POS\nP: 45000\nQ: 2\nI: Rice\nC: Ada").kind,"action");
  assert.equal(parseAssistantAction("EX\nA: 25000\nD: Fuel\nC: Utilities").kind,"action");
  assert.equal(parseAssistantAction("PAY\nM: transfer\nA: 25000\nI: INV-00001").kind,"action");
});

test("rejects duplicate, unknown, or missing labeled fields",()=>{
  assert.equal(parseAssistantAction("AI\nN: Rice\nN: Beans\nQ: 2\nP: 100").kind,"incomplete");
  assert.equal(parseAssistantAction("AI\nN: Rice\nColour: white\nQ: 2\nP: 100").kind,"incomplete");
  assert.equal(parseAssistantAction("AC\nPhone: 08012345678").kind,"incomplete");
});

test("does not invent missing financial details", () => {
  const result = parseAssistantAction("create an invoice for Ada");
  assert.equal(result.kind, "incomplete");
  if (result.kind === "incomplete") assert.match(result.usage, /Customer: Ada[\s\S]*Quantity: 2/);
});

test("rejects invalid amounts and unsupported payment methods", () => {
  assert.equal(parseAssistantAction("SALE | Ada | Rice | two | 45000 | cash").kind, "incomplete");
  assert.equal(parseAssistantAction("PAYMENT | INV-00001 | -5 | crypto").kind, "incomplete");
});
