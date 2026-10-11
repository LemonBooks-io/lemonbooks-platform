import assert from 'node:assert/strict';
import { createHash, createHmac, randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import test from 'node:test';

const listen=(server:Server)=>new Promise<number>(resolve=>server.listen(0,'127.0.0.1',()=>resolve((server.address() as {port:number}).port)));
const close=(server:Server)=>new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));

test('signed inventory create/edit/bulk preserves five photos and publication through the sync worker',{skip:!process.env.MART_TEST_DATABASE_URL},async()=>{
 const url=new URL(process.env.MART_TEST_DATABASE_URL!);
 if(url.hostname!=='127.0.0.1'||url.port!=='5433'||url.pathname!=='/oynk_dashboard')throw new Error('Use only the loopback development database.');
 const schema=`lemon_mart_test_${randomUUID().replaceAll('-','')}`;
 url.searchParams.set('options',`-c search_path=${schema}`);process.env.DATABASE_URL=url.toString();
 process.env.INTEGRATION_CREDENTIALS_KEY=Buffer.alloc(32,1).toString('base64');
 const {default:express}=await import('express');
 let currentConnectionId='';
 const captured:Array<{items:Array<{imageUrls:string[];published:boolean}>}>=[];
 const receiver=express();receiver.use(express.json());receiver.get('/api/mart/connector/status',(req,res)=>res.json({id:currentConnectionId,mediaBaseUrl:'https://api.example.test'}));receiver.post('/api/mart/connector/ingest',(req,res)=>{captured.push(req.body);res.json({applied:1});});
 const ingress=new (await import('node:http')).Server(receiver);const port=await listen(ingress);
 process.env.OYNK_MART_API_URL=`http://127.0.0.1:${port}`;
 const {pool}=await import('../database/pool');const {migrate}=await import('../database/migrate');
 const {encryptCredentials}=await import('./credential-vault.service');
 const {martSourceInventoryRouter}=await import('../routes/mart.routes');
 const {syncMartBatch}=await import('./mart.service');const {errorHandler}=await import('../http');
 const {resourcesRouter}=await import('../routes/resources.routes');const {authenticate,createSessionToken}=await import('../middleware/auth');const {default:sharp}=await import('sharp');
 const app=express();app.use(express.json({verify(req,_res,body){(req as import('express').Request).rawBody=Buffer.from(body);}}));app.use('/resources',authenticate,resourcesRouter);app.use('/inventory',martSourceInventoryRouter);app.use(errorHandler);
 const server=new (await import('node:http')).Server(app);const sourcePort=await listen(server);
 try{
  await pool.query(`CREATE SCHEMA ${schema}`);await migrate();
  const businessId=randomUUID(),connectionId=randomUUID(),token='mart_'+ 'a'.repeat(43);
  await pool.query(`INSERT INTO businesses(id,tenant_slug,name,email,currency) VALUES($1,$2,'Test catalog','test@example.invalid','NGN')`,[businessId,businessId]);
  await pool.query(`INSERT INTO mart_connections(business_id,oynk_connection_id,encrypted_token) VALUES($1,$2,$3)`,[businessId,connectionId,encryptCredentials({token})]);
  currentConnectionId=connectionId;
  const userId=randomUUID();await pool.query("INSERT INTO users(id,email,name) VALUES($1,$2,'Catalog owner')",[userId,`${userId}@example.invalid`]);await pool.query("INSERT INTO memberships(user_id,business_id,role) VALUES($1,$2,'owner')",[userId,businessId]);
  const tokenNative=createSessionToken({sub:userId,businessId,tenantSlug:businessId,role:'owner'});
  const key=createHash('sha256').update(`oynk-mart-connector:v1:${token}`).digest('hex');
  async function call(method:string,path:string,input?:unknown,requestId=randomUUID()){
   const body=input===undefined?'':JSON.stringify(input),timestamp=String(Date.now());
   const signature=createHmac('sha256',key).update(`mart-source-admin:v1\n${method}\n${path}\n${connectionId}\n${timestamp}\n${body}`).digest('hex');
   const response=await fetch(`http://127.0.0.1:${sourcePort}/inventory${path}`,{method,headers:{'content-type':'application/json','x-mart-connection-id':connectionId,'x-mart-timestamp':timestamp,'x-mart-signature':signature,'x-mart-request-id':requestId},body:body||undefined});
   return {status:response.status,body:await response.json() as any};
  }
  const imageUrls=Array.from({length:5},(_,i)=>`https://images.example.test/${i}.webp`);
  const item={name:'Photo item',price:1200,stockQuantity:5,imageUrls};
  const requestId=randomUUID(),created=await call('POST','/items',item,requestId);assert.equal(created.status,201);
  assert.deepEqual((await call('POST','/items',item,requestId)).body,created.body);
  const listed=await call('GET','/items');assert.deepEqual(listed.body.items[0].imageUrls,imageUrls);assert.equal(listed.body.items[0].published,true);
  await syncMartBatch();assert.deepEqual(captured[0]!.items[0]!.imageUrls,imageUrls);assert.equal(captured[0]!.items[0]!.published,true);
  const current=listed.body.items[0];
  assert.equal((await call('PATCH',`/items/${created.body.itemId}`,{...item,imageUrls:imageUrls.slice(1),published:false,revision:Number(current.revision)})).status,200);
  await syncMartBatch();assert.deepEqual(captured[1]!.items[0]!.imageUrls,imageUrls.slice(1));assert.equal(captured[1]!.items[0]!.published,false);
  assert.equal((await call('PATCH',`/items/${created.body.itemId}`,{...item,revision:Number(current.revision)})).status,409);
  assert.equal((await call('POST','/items',{...item,imageUrls:[...imageUrls,imageUrls[0]]})).status,400);
  assert.equal((await call('POST','/items/bulk',{rows:[{...item,name:'Private CSV item',published:false},{...item,name:'Public CSV item',imageUrls:[]}]})).body.created,2);
  await syncMartBatch();
  const final=await call('GET','/items');assert.equal(final.body.items.find((row:any)=>row.name==='Private CSV item').published,false);assert.equal(final.body.items.find((row:any)=>row.name==='Public CSV item').published,true);
  assert.equal((await pool.query('SELECT count(*)::integer count FROM mart_sync_queue')).rows[0].count,0);
  async function native(path:string,body:unknown,method='POST'){
   const response=await fetch(`http://127.0.0.1:${sourcePort}/resources${path}`,{method,headers:{Authorization:`Bearer ${tokenNative}`,'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:response.status,body:await response.json() as any};
  }
  const nativePhotos:string[]=[];
  for(let i=0;i<5;i++){
   const photo=await sharp({create:{width:32,height:32,channels:3,background:{r:20+i*20,g:100,b:50}}}).png().toBuffer();
   const response=await fetch(`http://127.0.0.1:${sourcePort}/resources/item-images`,{method:'POST',headers:{Authorization:`Bearer ${tokenNative}`,'Content-Type':'image/png'},body:photo});
   assert.equal(response.status,201);nativePhotos.push((await response.json() as any).data.url);
  }
  const nativeCreated=await native('/items',{name:'LemonBooks photo item',price:550,stockQuantity:10,imageUrls:nativePhotos});assert.equal(nativeCreated.status,201);assert.equal(nativeCreated.body.data.mart_published,true);
  const nativeId=nativeCreated.body.data.id;
  await syncMartBatch();const synced=captured.at(-1)!.items[0]!;assert.equal(synced.imageUrls.length,5);assert.equal(synced.published,true);assert.ok(synced.imageUrls.every(url=>url.startsWith(`https://api.example.test/api/mart/source-photos/${connectionId}/`)));
  const nativeSource=(await call('GET','/items')).body.items.find((row:any)=>row.id===nativeId);assert.deepEqual(nativeSource.imageUrls,synced.imageUrls);
  const nativeRead=await fetch(`http://127.0.0.1:${sourcePort}${nativePhotos[0]!.replace('/api/v3/resources','/resources')}`,{headers:{Authorization:`Bearer ${tokenNative}`}});assert.equal(nativeRead.status,200);assert.equal(nativeRead.headers.get('content-type'),'image/webp');
  // Editing from Oynk keeps the source photo IDs; it must not point back to itself.
  assert.equal((await call('PATCH',`/items/${nativeId}`,{name:'LemonBooks photo item',price:550,stockQuantity:10,imageUrls:synced.imageUrls,revision:Number(nativeSource.revision),published:false})).status,200);
  assert.deepEqual((await pool.query('SELECT image_urls FROM items WHERE id=$1',[nativeId])).rows[0].image_urls,nativePhotos);
  await syncMartBatch();assert.equal(captured.at(-1)!.items[0]!.published,false);
  assert.equal((await native('/items/bulk',{rows:[{name:'Private native CSV',price:'1500',publish_to_mart:'false'},{name:'Public native CSV',price:'1500'}]})).body.data.length,2);
  assert.equal((await pool.query("SELECT mart_published FROM items WHERE name='Private native CSV'")).rows[0].mart_published,false);
  assert.equal((await pool.query("SELECT mart_published FROM items WHERE name='Public native CSV'")).rows[0].mart_published,true);
  assert.equal((await native('/items',{name:'Too many photos',price:50,imageUrls:[...nativePhotos,nativePhotos[0]]})).status,400);
  assert.equal((await fetch(`http://127.0.0.1:${sourcePort}/resources/item-images`,{method:'POST',headers:{'Content-Type':'image/png'},body:Buffer.from('bad')})).status,401);

 }finally{await close(server);await close(ingress);await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);await pool.end();}
});
