import assert from "node:assert/strict";
import test from "node:test";
import { martPayload, sourceQuoteSignature } from "./mart.service";

test("Mart adapter publishes only the merchant-selected item projection", () => {
 const row={id:"item-1",business_id:"merchant-1",sync_version:"4",name:"50kg rice",description:"White rice",kind:"product" as const,sku:"RICE-50",price_minor:"8500000",stock_quantity:"3.000",active:true,deleted_at:null,mart_published:true,currency:"NGN",image_urls:["https://example.test/rice.webp"],cost:"70000",customer_email:"private@example.test"};
 const payload=martPayload(row);
 assert.equal(payload.published,true);
 assert.deepEqual(payload.imageUrls,["https://example.test/rice.webp"]);
 assert.equal(payload.priceMinor,8500000);
 assert.equal(payload.availability,"IN_STOCK");
 assert.equal("cost" in payload,false);
 assert.equal("customer_email" in payload,false);
 assert.equal(martPayload({...row,stock_quantity:"0"}).availability,"OUT_OF_STOCK");
 assert.equal(martPayload({...row,stock_quantity:null}).availability,"UNKNOWN");
 assert.equal(martPayload({...row,mart_published:false}).published,false);
});


test("live quote signature binds the source connection, timestamp, and body", () => {
 const token="mart_"+"a".repeat(43);
 const first=sourceQuoteSignature(token,"connection-a","1000",'{"sourceItemId":"item-a","quantity":2}');
 assert.match(first,/^[a-f0-9]{64}$/);
 assert.notEqual(first,sourceQuoteSignature(token,"connection-b","1000",'{"sourceItemId":"item-a","quantity":2}'));
 assert.notEqual(first,sourceQuoteSignature(token,"connection-a","1001",'{"sourceItemId":"item-a","quantity":2}'));
 assert.notEqual(first,sourceQuoteSignature(token,"connection-a","1000",'{"sourceItemId":"item-a","quantity":3}'));
});
