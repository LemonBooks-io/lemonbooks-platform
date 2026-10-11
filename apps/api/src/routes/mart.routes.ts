import { Router } from "express";
import { photoPrefix, photoReferences, readItemPhoto, verifyItemPhotos } from "../services/item-media.service";
import { validMartItem as validItem } from "../services/mart-inventory";
import { createHash, randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { asyncRoute, HttpError } from "../http";
import { query, transaction } from "../database/pool";
import { connectMart, inventoryPhotoContext, martStatus, projectPhotoUrls, queueAllPublished, readOynkPhoto, signedMartWorkspace, sourceQuote } from "../services/mart.service";
import { sendCustomerAccessCode } from "../services/email.service";

export const martRouter=Router();
const manager=(role:string)=>{if(!['owner','admin'].includes(role))throw new HttpError(403,'Only a business owner or admin can manage Mart.');};
martRouter.get('/photos/:id',asyncRoute(async(req,res)=>{const content=await readOynkPhoto(req.auth!.businessId,String(req.params.id));res.setHeader('Cache-Control','private,no-store');res.type('image/webp').send(content);}));
martRouter.get('/status',asyncRoute(async(req,res)=>res.json({success:true,data:await martStatus(req.auth!.businessId)})));
martRouter.post('/sync',asyncRoute(async(req,res)=>{manager(req.auth!.role);const status=await martStatus(req.auth!.businessId);if(!status.connected)throw new HttpError(409,'Connect Oynk Mart first.');await queueAllPublished(req.auth!.businessId);res.json({success:true,data:await martStatus(req.auth!.businessId)});}));
martRouter.patch('/items/:id/publication',asyncRoute(async(req,res)=>{manager(req.auth!.role);if(typeof req.body.published!=='boolean')throw new HttpError(400,'Choose whether to publish this item.');const status=await martStatus(req.auth!.businessId);if(!status.connected)throw new HttpError(409,'Connect Oynk Mart first.');const [item]=await query<{id:string;mart_published:boolean}>(`UPDATE items SET mart_published=$3,sync_version=sync_version+1,updated_at=now() WHERE id=$1 AND business_id=$2 AND deleted_at IS NULL RETURNING id,mart_published`,[req.params.id,req.auth!.businessId,req.body.published]);if(!item)throw new HttpError(404,'Item not found.');res.json({success:true,data:item});}));

export const martSourceQuoteRouter=Router();
martSourceQuoteRouter.post('/',asyncRoute(async(req,res)=>{
 const connectionId=String(req.header('x-mart-connection-id')??'');
 const timestamp=String(req.header('x-mart-timestamp')??'');
 const signature=String(req.header('x-mart-signature')??'');
 const sourceItemId=String(req.body?.sourceItemId??'');
 const quantity=Number(req.body?.quantity);
 if(!/^[0-9a-f-]{36}$/i.test(connectionId)||!/^[0-9a-f-]{36}$/i.test(sourceItemId)||!Number.isSafeInteger(quantity)||quantity<1||quantity>1000)throw new HttpError(400,'Invalid source quote request.');
 res.setHeader('Cache-Control','no-store');res.json(await sourceQuote({connectionId,timestamp,signature,body:req.rawBody?.toString('utf8')??'',sourceItemId,quantity}));
}));

export const martSourceInventoryRouter=Router();
async function sourceBusiness(req:import('express').Request,path:string){
 return signedMartWorkspace({connectionId:String(req.header('x-mart-connection-id')??''),timestamp:String(req.header('x-mart-timestamp')??''),signature:String(req.header('x-mart-signature')??''),method:req.method,path,body:req.rawBody?.toString('utf8')??''});
}
async function inventoryMutation(req:import('express').Request,path:string,action:(client:import('pg').PoolClient,businessId:string)=>Promise<unknown>){
 const businessId=await sourceBusiness(req,path);const requestId=String(req.header('x-mart-request-id')??'');if(!/^[0-9a-f-]{36}$/i.test(requestId))throw new HttpError(400,'A unique request ID is required.');
 const hash=createHash('sha256').update(`${req.method}\n${path}\n${req.rawBody?.toString('utf8')??''}`).digest('hex');
 return transaction(async client=>{
  const claim=await client.query(`INSERT INTO mart_inventory_requests(business_id,request_id,payload_hash,response) VALUES($1,$2,$3,'{}') ON CONFLICT DO NOTHING RETURNING request_id`,[businessId,requestId,hash]);
  if(!claim.rows[0]){const prior=await client.query(`SELECT payload_hash,response FROM mart_inventory_requests WHERE business_id=$1 AND request_id=$2`,[businessId,requestId]);if(prior.rows[0]?.payload_hash!==hash)throw new HttpError(409,'This request ID was used for another change.');return prior.rows[0].response;}
  const result=await action(client,businessId);await client.query(`UPDATE mart_inventory_requests SET response=$3 WHERE business_id=$1 AND request_id=$2`,[businessId,requestId,result]);return result;
 });
}
martSourceInventoryRouter.get('/photos/:id',asyncRoute(async(req,res)=>{
 const id=String(req.params.id),businessId=await sourceBusiness(req,`/photos/${id}`);
 const photo=await readItemPhoto(businessId,id);res.setHeader('Cache-Control','private,no-store');res.type('image/webp').send(photo.content);
}));
martSourceInventoryRouter.get('/items',asyncRoute(async(req,res)=>{
 const businessId=await sourceBusiness(req,'/items');res.setHeader('Cache-Control','no-store');
 const items=await query<Record<string,unknown>&{imageUrls:string[]}>(`SELECT i.id,i.name,i.description,i.kind,i.sku,i.price,i.stock_quantity AS "stockQuantity",i.mart_published AS published,i.active,i.sync_version AS revision,i.image_urls AS "imageUrls",b.currency FROM items i JOIN businesses b ON b.id=i.business_id WHERE i.business_id=$1 AND i.deleted_at IS NULL ORDER BY i.updated_at DESC LIMIT 500`,[businessId]);
 const context=items.some(item=>item.imageUrls.some(url=>url.startsWith(photoPrefix)))?await inventoryPhotoContext(businessId):undefined;
 res.json({items:items.map(item=>({...item,imageUrls:projectPhotoUrls(item.imageUrls,context)}))});
}));
martSourceInventoryRouter.post('/items',asyncRoute(async(req,res)=>{const item=validItem(req.body);if(item.imageUrls!==null)item.imageUrls=photoReferences(item.imageUrls,String(req.header('x-mart-connection-id')));const result=await inventoryMutation(req,'/items',async(client,businessId)=>{await verifyItemPhotos(businessId,item.imageUrls);const row=await client.query(`INSERT INTO items(business_id,name,description,kind,sku,price,stock_quantity,mart_published,image_urls) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb) RETURNING id`,[businessId,item.name,item.description,item.kind,item.sku,item.price,item.stock,item.published,JSON.stringify(item.imageUrls??[])]);return{itemId:row.rows[0].id};});res.status(201).json(result);}));
martSourceInventoryRouter.patch('/items/:id',asyncRoute(async(req,res)=>{const id=String(req.params.id);if(!/^[0-9a-f-]{36}$/i.test(id))throw new HttpError(400,'Invalid item.');const item=validItem(req.body);if(item.imageUrls!==null)item.imageUrls=photoReferences(item.imageUrls,String(req.header('x-mart-connection-id')));const revision=Number(req.body.revision);if(!Number.isSafeInteger(revision)||revision<1)throw new HttpError(400,'Refresh this item before editing.');const result=await inventoryMutation(req,`/items/${id}`,async(client,businessId)=>{await verifyItemPhotos(businessId,item.imageUrls);const row=await client.query(`UPDATE items SET name=$3,description=$4,kind=$5,sku=$6,price=$7,stock_quantity=$8,mart_published=$9,image_urls=COALESCE($11::jsonb,image_urls),sync_version=sync_version+1,updated_at=now() WHERE id=$1 AND business_id=$2 AND sync_version=$10 AND deleted_at IS NULL RETURNING id`,[id,businessId,item.name,item.description,item.kind,item.sku,item.price,item.stock,item.published,revision,item.imageUrls===null?null:JSON.stringify(item.imageUrls)]);if(!row.rows[0])throw new HttpError(409,'This item changed in LemonBooks. Refresh before saving.');return{itemId:id};});res.json(result);}));
martSourceInventoryRouter.post('/items/bulk',asyncRoute(async(req,res)=>{const raw=req.body.rows;if(!Array.isArray(raw)||raw.length<1||raw.length>500)throw new HttpError(400,'Upload between 1 and 500 items.');const items=raw.map((row:Record<string,unknown>)=>{const item=validItem(row);if(item.imageUrls!==null)item.imageUrls=photoReferences(item.imageUrls,String(req.header('x-mart-connection-id')));return item;});const result=await inventoryMutation(req,'/items/bulk',async(client,businessId)=>{for(const item of items)await verifyItemPhotos(businessId,item.imageUrls);for(const item of items)await client.query(`INSERT INTO items(business_id,name,description,kind,sku,price,stock_quantity,mart_published,image_urls) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)`,[businessId,item.name,item.description,item.kind,item.sku,item.price,item.stock,item.published,JSON.stringify(item.imageUrls??[])]);return{created:items.length};});res.status(201).json(result);}));
martSourceInventoryRouter.post('/sales',asyncRoute(async(req,res)=>{const itemId=String(req.body.itemId??'');const quantity=Number(req.body.quantity);if(!/^[0-9a-f-]{36}$/i.test(itemId)||!Number.isSafeInteger(quantity)||quantity<1||quantity>1000)throw new HttpError(400,'Invalid sale.');const result=await inventoryMutation(req,'/sales',async(client,businessId)=>{const row=await client.query(`UPDATE items SET stock_quantity=stock_quantity-$3,sync_version=sync_version+1,updated_at=now() WHERE id=$1 AND business_id=$2 AND kind='product' AND active AND deleted_at IS NULL AND stock_quantity>=$3 RETURNING id,stock_quantity`,[itemId,businessId,quantity]);if(!row.rows[0])throw new HttpError(409,'Stock is insufficient. Review this paid order.');return{itemId,stockQuantity:row.rows[0].stock_quantity};});res.json(result);}));

// A one-time connection approval. These routes never issue a LemonBooks login session.
export const martConnectRouter=Router();
martConnectRouter.post('/start',asyncRoute(async(req,res)=>{
 const email=String(req.body.email??'').trim().toLowerCase();const slug=String(req.body.tenantSlug??'').trim().toLowerCase();
 if(!/^\S+@\S+\.\S+$/.test(email)||slug.length>120)throw new HttpError(400,'Enter your LemonBooks email.');
 const key=createHash('sha256').update(`${email}|${req.ip??'unknown'}`).digest('hex');
 const [limit]=await query<{attempts:number}>(`INSERT INTO mart_connect_auth_limits(key_hash,attempts) VALUES($1,1) ON CONFLICT(key_hash) DO UPDATE SET attempts=CASE WHEN mart_connect_auth_limits.window_started_at<now()-interval '15 minutes' THEN 1 ELSE mart_connect_auth_limits.attempts+1 END,window_started_at=CASE WHEN mart_connect_auth_limits.window_started_at<now()-interval '15 minutes' THEN now() ELSE mart_connect_auth_limits.window_started_at END RETURNING attempts`,[key]);
 if((limit?.attempts??11)>10)throw new HttpError(429,'Too many attempts. Please try again later.');
 const rows=await query<{user_id:string;email:string;name:string;role:string;business_id:string;business_name:string}>(`SELECT u.id user_id,u.email,u.name,m.role,b.id business_id,b.name business_name FROM users u JOIN memberships m ON m.user_id=u.id JOIN businesses b ON b.id=m.business_id WHERE lower(u.email)=$1 AND m.role IN ('owner','admin') AND ($2::text='' OR b.tenant_slug=$2) ORDER BY m.created_at LIMIT 2`,[email,slug]);
 if(!rows[0])throw new HttpError(404,'We could not find an owner or admin account for that email.');
 if(rows.length>1)throw new HttpError(409,'Enter your LemonBooks workspace name to continue.','WORKSPACE_REQUIRED');
 const person=rows[0];const [recent]=await query<{id:string}>(`SELECT id FROM mart_approval_codes WHERE business_id=$1 AND user_id=$2 AND created_at>now()-interval '60 seconds' LIMIT 1`,[person.business_id,person.user_id]);
 if(recent)throw new HttpError(429,'Please wait a minute before requesting another code.');
 const code=String(randomInt(0,1_000_000)).padStart(6,'0');const hash=await bcrypt.hash(code,10);
 const [challenge]=await query<{id:string}>(`INSERT INTO mart_approval_codes(business_id,user_id,code_hash,expires_at) VALUES($1,$2,$3,now()+interval '10 minutes') RETURNING id`,[person.business_id,person.user_id,hash]);if(!challenge)throw new HttpError(503,'Could not prepare the approval code.');
 try{await sendCustomerAccessCode({email:person.email,name:person.name,businessName:person.business_name,otp:code,purpose:'mart_connect'});}catch(error){await query(`DELETE FROM mart_approval_codes WHERE id=$1`,[challenge.id]);throw error;}
 res.json({success:true,data:{challengeId:challenge.id,emailHint:person.email.replace(/^(.{1,2}).*(@.*)$/,'$1•••$2'),businessName:person.business_name}});
}));
martConnectRouter.post('/verify',asyncRoute(async(req,res)=>{
 const id=String(req.body.challengeId??'');const code=String(req.body.code??'');if(!/^[0-9a-f-]{36}$/i.test(id)||!/^\d{6}$/.test(code))throw new HttpError(400,'Enter the six-digit code.');
 const [challenge]=await query<{code_hash:string;attempts:number;business_id:string}>(`UPDATE mart_approval_codes SET attempts=attempts+1 WHERE id=$1 AND consumed_at IS NULL AND verified_at IS NULL AND expires_at>now() AND attempts<5 RETURNING code_hash,attempts,business_id`,[id]);
 if(!challenge)throw new HttpError(400,'This code has expired. Start again.');
 if(!await bcrypt.compare(code,challenge.code_hash))throw new HttpError(400,'That code was not correct. Try again.');
 const updated=await query<{business_id:string}>(`UPDATE mart_approval_codes SET verified_at=now() WHERE id=$1 AND verified_at IS NULL AND consumed_at IS NULL RETURNING business_id`,[id]);if(!updated[0])throw new HttpError(409,'This code has already been used.');
 res.json({success:true,data:{businessId:updated[0].business_id}});
}));
martConnectRouter.post('/finish',asyncRoute(async(req,res)=>{
 const id=String(req.body.challengeId??'');const connectionId=String(req.body.connectionId??'');const token=String(req.body.token??'');if(!/^[0-9a-f-]{36}$/i.test(id)||!/^[0-9a-f-]{36}$/i.test(connectionId)||!/^mart_[A-Za-z0-9_-]{43}$/.test(token))throw new HttpError(400,'Invalid connection request.');
 const used=await query<{business_id:string}>(`UPDATE mart_approval_codes SET consumed_at=now() WHERE id=$1 AND verified_at IS NOT NULL AND consumed_at IS NULL AND expires_at>now() RETURNING business_id`,[id]);if(!used[0])throw new HttpError(409,'This approval has expired or was already used.');
 await connectMart(used[0].business_id,connectionId,token);
 res.json({success:true,data:{connected:true}});
}));
