import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { migrate } from "../database/migrate";
import { pool, query, transaction } from "../database/pool";
import { applyApprovedAllocation } from "../routes/integrations.routes";
import { processIntegrationJobs } from "../services/integration.service";

test("PostgreSQL preserves integration idempotency, tenant isolation, posting concurrency, inventory, and dead letters", { skip: process.env.RUN_DB_TESTS !== "1" }, async () => {
  await migrate(); const suffix=crypto.randomUUID(); let businessA="",businessB="",userId="";
  try {
    userId=(await query<{id:string}>("INSERT INTO users(email,name,password_hash) VALUES($1,'Integration Tester','test') RETURNING id",[`integration-${suffix}@example.test`]))[0]!.id;
    const businesses=await query<{id:string}>("INSERT INTO businesses(tenant_slug,name,email,currency,onboarding_completed) VALUES($1,'Test A',$3,'NGN',true),($2,'Test B',$3,'NGN',true) RETURNING id",[`test-a-${suffix}`,`test-b-${suffix}`,`integration-${suffix}@example.test`]);businessA=businesses[0]!.id;businessB=businesses[1]!.id;
    await query("INSERT INTO memberships(business_id,user_id,role) VALUES($1,$3,'owner'),($2,$3,'owner')",[businessA,businessB,userId]);
    const customer=(await query<{id:string}>("INSERT INTO clients(business_id,name,email) VALUES($1,'Test Customer',$2) RETURNING id",[businessA,`customer-${suffix}@example.test`]))[0]!;
    const item=(await query<{id:string}>("INSERT INTO items(business_id,name,kind,price,stock_quantity) VALUES($1,'Test Product','product',100,10) RETURNING id",[businessA]))[0]!;
    const number=`LB-${suffix.slice(0,8)}`;const invoice=(await query<{id:string}>("INSERT INTO invoices(business_id,client_id,number,status,currency,subtotal,total) VALUES($1,$2,$3,'sent','NGN',100,100) RETURNING id",[businessA,customer.id,number]))[0]!;
    await query("INSERT INTO invoice_lines(invoice_id,item_id,description,quantity,unit_price,total) VALUES($1,$2,'Test Product',1,100,100)",[invoice.id,item.id]);
    const connection=(await query<{id:string}>("INSERT INTO integration_connections(business_id,kind,provider,status,environment,external_account_id) VALUES($1,'bank','moniepoint','active','mock',$2) RETURNING id",[businessA,`test-account-${suffix}`]))[0]!;
    const account=(await query<{id:string}>("INSERT INTO bank_accounts(business_id,connection_id,provider_account_id,name,institution_name,currency) VALUES($1,$2,$3,'Test','Moniepoint','NGN') RETURNING id",[businessA,connection.id,`account-${suffix}`]))[0]!;
    const bank=(await query<{id:string}>(`INSERT INTO bank_transactions(business_id,bank_account_id,provider,provider_transaction_id,status,direction,amount,currency,description,reference,transacted_at,fingerprint) VALUES($1,$2,'moniepoint',$3,'booked','credit',100,'NGN','Test credit',$4,now(),$5) RETURNING id`,[businessA,account.id,`tx-${suffix}`,number,suffix]))[0]!;

    const insertEvent=()=>query(`INSERT INTO integration_events(business_id,connection_id,provider,environment,provider_event_id,event_type,payload_hash,raw_payload,signature_valid) VALUES($1,$2,'moniepoint','mock',$3,'transaction',$4,'{}',true) ON CONFLICT(provider,environment,provider_event_id) DO NOTHING RETURNING id`,[businessA,connection.id,`event-${suffix}`,suffix]);
    const duplicates=await Promise.all([insertEvent(),insertEvent(),insertEvent()]);assert.equal(duplicates.reduce((sum,rows)=>sum+rows.length,0),1);

    const allocate=()=>transaction(client=>applyApprovedAllocation(client,{businessId:businessA,userId,transactionId:bank.id,allocations:[{invoiceId:invoice.id,amount:100}],reason:"concurrency test"}));
    const results=await Promise.allSettled([allocate(),allocate()]);assert.equal(results.filter(row=>row.status==="fulfilled").length,1);assert.equal(results.filter(row=>row.status==="rejected").length,1);
    assert.equal(Number((await query<{count:string}>("SELECT count(*)::text AS count FROM payments WHERE business_id=$1 AND invoice_id=$2 AND deleted_at IS NULL",[businessA,invoice.id]))[0]!.count),1);
    const posted=(await query<{status:string;inventory_posted_at:string}>("SELECT status,inventory_posted_at FROM invoices WHERE id=$1",[invoice.id]))[0]!;assert.equal(posted.status,"paid");assert.ok(posted.inventory_posted_at);
    assert.equal(Number((await query<{stock_quantity:string}>("SELECT stock_quantity FROM items WHERE id=$1",[item.id]))[0]!.stock_quantity),9);
    assert.equal((await query("SELECT id FROM bank_transactions WHERE id=$1 AND business_id=$2",[bank.id,businessB])).length,0);

    const job=(await query<{id:string}>("INSERT INTO integration_jobs(business_id,event_id,job_type,payload,max_attempts) VALUES($1,NULL,'normalize_bank_event','{}',1) RETURNING id",[businessA]))[0]!;await processIntegrationJobs();
    assert.equal((await query<{state:string}>("SELECT state FROM integration_jobs WHERE id=$1",[job.id]))[0]!.state,"dead_letter");
  } finally {
    if(businessA)await query("DELETE FROM businesses WHERE id=$1",[businessA]);if(businessB)await query("DELETE FROM businesses WHERE id=$1",[businessB]);if(userId)await query("DELETE FROM users WHERE id=$1",[userId]);await pool.end();
  }
});
