import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { photoPrefix } from "./item-media.service";
import { env } from "../config";
import { pool, query } from "../database/pool";
import { HttpError } from "../http";
import { decryptCredentials, encryptCredentials } from "./credential-vault.service";

type Connection={business_id:string;oynk_connection_id:string;encrypted_token:string;status:string;media_base_url?:string|null};
type ItemRow={id:string;business_id:string;sync_version:string;name:string;description:string|null;kind:'product'|'service';sku:string|null;price_minor:string;stock_quantity:string|null;active:boolean;deleted_at:Date|null;mart_published:boolean;currency:string|null;image_urls?:string[]};
function baseUrl(){const value=env.oynkMartApiUrl;if(!value)throw new HttpError(503,"Oynk Mart integration is not configured");const url=new URL(value);if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname)))throw new HttpError(503,"Oynk Mart requires a secure API URL");return value;}
export function credential(connection:Connection){return decryptCredentials<{token:string}>(connection.encrypted_token).token;}
export async function verifyMartConnection(id:string,token:string,businessId:string){
 const response=await fetch(`${baseUrl()}/api/mart/connector/status`,{headers:{'x-mart-connector-token':token},signal:AbortSignal.timeout(8000)});
 if(!response.ok)throw new HttpError(409,"Oynk Mart could not verify this connection. Check the ID and token.");
 const status=await response.json() as {id?:string;sourceSystem?:string;sourceTenantId?:string};
 if(status.id!==id||status.sourceSystem!=='lemonbooks'||status.sourceTenantId!==businessId)throw new HttpError(409,"This Oynk Mart connection belongs to a different LemonBooks workspace.");
}
export async function connectMart(businessId:string,id:string,token:string){
 await verifyMartConnection(id,token,businessId);
 const encrypted=encryptCredentials({token});
 const client=await pool.connect();try{await client.query('BEGIN');
  await client.query(`INSERT INTO mart_connections(business_id,oynk_connection_id,encrypted_token,status,last_error) VALUES($1,$2,$3,'active',NULL)
   ON CONFLICT(business_id) DO UPDATE SET oynk_connection_id=EXCLUDED.oynk_connection_id,encrypted_token=EXCLUDED.encrypted_token,status='active',last_error=NULL,updated_at=now()`,[businessId,id,encrypted]);
  await client.query(`INSERT INTO mart_sync_queue(item_id,business_id,revision) SELECT id,business_id,sync_version FROM items WHERE business_id=$1 AND mart_published
   ON CONFLICT(item_id) DO UPDATE SET revision=EXCLUDED.revision,event_id=gen_random_uuid(),attempts=0,available_at=now(),lease_id=NULL,lease_until=NULL,last_error=NULL`,[businessId]);
  await client.query('COMMIT');
 }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
 const confirmation=await fetch(`${baseUrl()}/api/mart/connector/confirm`,{method:'POST',headers:{'x-mart-connector-token':token},signal:AbortSignal.timeout(8000)}).catch(()=>null);
 if(!confirmation?.ok)throw new HttpError(503,'Oynk could not confirm the connection. Please try again.');
}
export async function martStatus(businessId:string){
 const [connection]=await query<{oynk_connection_id:string;status:string;last_success_at:Date|null;last_error:string|null}>(`SELECT oynk_connection_id,status,last_success_at,last_error FROM mart_connections WHERE business_id=$1`,[businessId]);
 const [counts]=await query<{published:string;pending:string}>(`SELECT (SELECT count(*) FROM items WHERE business_id=$1 AND mart_published AND deleted_at IS NULL)::text published,(SELECT count(*) FROM mart_sync_queue WHERE business_id=$1)::text pending`,[businessId]);
 return{workspaceId:businessId,connected:Boolean(connection&&connection.status==='active'),connectionId:connection?.oynk_connection_id??null,lastSyncAt:connection?.last_success_at??null,lastError:connection?.last_error??null,published:Number(counts?.published??0),pending:Number(counts?.pending??0)};
}
export async function queueAllPublished(businessId:string){await pool.query(`INSERT INTO mart_sync_queue(item_id,business_id,revision) SELECT id,business_id,sync_version FROM items WHERE business_id=$1 AND mart_published
 ON CONFLICT(item_id) DO UPDATE SET revision=EXCLUDED.revision,event_id=gen_random_uuid(),attempts=0,available_at=now(),lease_id=NULL,lease_until=NULL,last_error=NULL`,[businessId]);}
function minor(value:string){const amount=Number(value);if(!Number.isSafeInteger(amount)||amount<0)throw new Error('PRICE_OUT_OF_RANGE');return amount;}
export function martPayload(item:ItemRow,mediaContext?:{connectionId:string;baseUrl:string}){const qty=item.stock_quantity;return{
 sourceItemId:item.id,revision:Number(item.sync_version),kind:item.kind==='product'?'PRODUCT' as const:'SERVICE' as const,
 sku:item.sku,title:item.name,description:item.description??'',category:null,imageUrls:projectPhotoUrls(item.image_urls??[],mediaContext),currency:item.currency??'NGN',priceMinor:minor(item.price_minor),
 quantity:qty,availability:item.kind==='service'?'IN_STOCK' as const:qty===null?'UNKNOWN' as const:Number(qty)>0?'IN_STOCK' as const:'OUT_OF_STOCK' as const,
 active:item.active&&item.deleted_at===null,published:item.mart_published,
};}
export async function syncMartBatch(limit=20){
 if(!env.oynkMartApiUrl)return 0;
 const claimed=await pool.query<{item_id:string;business_id:string;revision:string;event_id:string;lease_id:string}>(`WITH due AS (
  SELECT q.item_id FROM mart_sync_queue q JOIN mart_connections c ON c.business_id=q.business_id
  WHERE c.status='active' AND q.available_at<=now() AND (q.lease_until IS NULL OR q.lease_until<now())
  ORDER BY q.available_at,q.item_id FOR UPDATE OF q SKIP LOCKED LIMIT $1)
  UPDATE mart_sync_queue q SET lease_id=gen_random_uuid(),lease_until=now()+interval '30 seconds',updated_at=now() FROM due WHERE q.item_id=due.item_id
  RETURNING q.item_id,q.business_id,q.revision,q.event_id,q.lease_id`,[limit]);
 for(const job of claimed.rows){try{
  const [connection]=await query<Connection>(`SELECT * FROM mart_connections WHERE business_id=$1 AND status='active'`,[job.business_id]);
  const [item]=await query<ItemRow>(`SELECT i.id,i.business_id,i.sync_version,i.name,i.description,i.kind,i.sku,(i.price*100)::bigint::text price_minor,i.stock_quantity::text,i.active,i.deleted_at,i.mart_published,i.image_urls,b.currency FROM items i JOIN businesses b ON b.id=i.business_id WHERE i.id=$1 AND i.business_id=$2`,[job.item_id,job.business_id]);
  if(!connection||!item)throw new Error('CONNECTION_OR_ITEM_MISSING');
  if(Number(item.sync_version)!==Number(job.revision)){await pool.query(`UPDATE mart_sync_queue SET lease_id=NULL,lease_until=NULL,available_at=now() WHERE item_id=$1 AND lease_id=$2`,[job.item_id,job.lease_id]);continue;}
  const response=await fetch(`${baseUrl()}/api/mart/connector/ingest`,{method:'POST',headers:{'content-type':'application/json','x-mart-connector-token':credential(connection)},body:JSON.stringify({eventId:job.event_id,items:[martPayload(item,(item.image_urls??[]).some(url=>url.startsWith(photoPrefix))?await martMediaContext(connection):undefined)]}),signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw new Error(`OYNK_HTTP_${response.status}`);
  await pool.query(`DELETE FROM mart_sync_queue WHERE item_id=$1 AND revision=$2 AND lease_id=$3`,[job.item_id,job.revision,job.lease_id]);
  await pool.query(`UPDATE mart_connections SET last_success_at=now(),last_error=NULL,updated_at=now() WHERE business_id=$1`,[job.business_id]);
 }catch(error){const code=error instanceof Error?error.message.slice(0,80):'SYNC_FAILED';
  await pool.query(`UPDATE mart_sync_queue SET attempts=attempts+1,lease_id=NULL,lease_until=NULL,available_at=now()+(LEAST(300,5*power(2,LEAST(attempts,6)))::int * interval '1 second'),last_error=$3,updated_at=now() WHERE item_id=$1 AND lease_id=$2`,[job.item_id,job.lease_id,code]);
  await pool.query(`UPDATE mart_connections SET last_error=$2,updated_at=now() WHERE business_id=$1`,[job.business_id,code]);
 }}return claimed.rows.length;
}
export async function queueStaleMartItems(){
 await pool.query(`INSERT INTO mart_sync_queue(item_id,business_id,revision) SELECT i.id,i.business_id,i.sync_version FROM items i JOIN mart_connections c ON c.business_id=i.business_id WHERE c.status='active' AND i.mart_published AND (c.last_success_at IS NULL OR c.last_success_at<now()-interval '12 hours')
 ON CONFLICT(item_id) DO NOTHING`);
}
export function startMartWorker(){if(!env.oynkMartApiUrl)return;void queueStaleMartItems().catch(()=>console.error('[mart] refresh queue unavailable'));const refresh=setInterval(()=>{void queueStaleMartItems().catch(()=>console.error('[mart] refresh queue unavailable'));},6*60*60*1000);refresh.unref();let busy=false;const timer=setInterval(()=>{if(busy)return;busy=true;void syncMartBatch().catch(()=>console.error('[mart] sync batch failed')).finally(()=>{busy=false;});},5000);timer.unref();}


export function sourceQuoteSignature(token:string,connectionId:string,timestamp:string,body:string){
 const key=createHash('sha256').update(`oynk-mart-connector:v1:${token}`).digest('hex');
 return createHmac('sha256',key).update(`mart-source-quote:v1\n${connectionId}\n${timestamp}\n${body}`).digest('hex');
}
export async function signedMartWorkspace(input:{connectionId:string;timestamp:string;signature:string;method:string;path:string;body:string}){
 const time=Number(input.timestamp);
 if(!Number.isSafeInteger(time)||Math.abs(Date.now()-time)>30_000||!/^[a-f0-9]{64}$/.test(input.signature))throw new HttpError(401,'Mart request authentication failed.');
 const [connection]=await query<Connection>(`SELECT * FROM mart_connections WHERE oynk_connection_id=$1 AND status='active'`,[input.connectionId]);
 if(!connection)throw new HttpError(401,'Mart connection is inactive.');
 const key=createHash('sha256').update(`oynk-mart-connector:v1:${credential(connection)}`).digest('hex');
 const expected=createHmac('sha256',key).update(`mart-source-admin:v1\n${input.method}\n${input.path}\n${input.connectionId}\n${input.timestamp}\n${input.body}`).digest('hex');
 if(!timingSafeEqual(Buffer.from(input.signature,'hex'),Buffer.from(expected,'hex')))throw new HttpError(401,'Mart request authentication failed.');
 return connection.business_id;
}
export async function sourceQuote(input:{connectionId:string;timestamp:string;signature:string;body:string;sourceItemId:string;quantity:number}){
 const time=Number(input.timestamp);
 if(!Number.isSafeInteger(time)||Math.abs(Date.now()-time)>30_000||!/^[a-f0-9]{64}$/.test(input.signature))throw new HttpError(401,'Source quote authentication failed.','QUOTE_UNAUTHORIZED');
 const [connection]=await query<Connection & {oynk_connection_id:string}>(`SELECT * FROM mart_connections WHERE oynk_connection_id=$1 AND status='active'`,[input.connectionId]);
 if(!connection)throw new HttpError(401,'Source quote authentication failed.','QUOTE_UNAUTHORIZED');
 const expected=sourceQuoteSignature(credential(connection),input.connectionId,input.timestamp,input.body);
 if(!timingSafeEqual(Buffer.from(input.signature,'hex'),Buffer.from(expected,'hex')))throw new HttpError(401,'Source quote authentication failed.','QUOTE_UNAUTHORIZED');
 const [item]=await query<ItemRow>(`SELECT i.id,i.business_id,i.sync_version,i.name,i.description,i.kind,i.sku,(i.price*100)::bigint::text price_minor,i.stock_quantity::text,i.active,i.deleted_at,i.mart_published,i.image_urls,b.currency FROM items i JOIN businesses b ON b.id=i.business_id WHERE i.id=$1 AND i.business_id=$2`,[input.sourceItemId,connection.business_id]);
 if(!item||!item.active||item.deleted_at||!item.mart_published||item.kind!=='product'||item.stock_quantity===null||Number(item.stock_quantity)<input.quantity)throw new HttpError(409,'This item is unavailable.','SOURCE_OFFER_CHANGED');
 return{sourceItemId:item.id,revision:Number(item.sync_version),currency:item.currency??'NGN',unitPriceMinor:minor(item.price_minor),availableQuantity:item.stock_quantity,active:true,published:true};
}

export function projectPhotoUrls(urls:string[],context?:{connectionId:string;baseUrl:string}){
 return urls.map(url=>{
  if(!url.startsWith(photoPrefix))return url;
  if(!context)throw new HttpError(503,'Photo publishing is being prepared. Try again shortly.');
  return new URL(`/api/mart/source-photos/${context.connectionId}/${url.slice(photoPrefix.length)}`,context.baseUrl).toString();
 });
}
export async function martMediaContext(connection:Connection){
 let mediaBase=connection.media_base_url;
 if(!mediaBase){
  const response=await fetch(`${baseUrl()}/api/mart/connector/status`,{headers:{'x-mart-connector-token':credential(connection)},signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw new HttpError(503,'Mart photo publishing is temporarily unavailable.');
  const status=await response.json() as {id?:string;mediaBaseUrl?:string};
  if(status.id!==connection.oynk_connection_id||!status.mediaBaseUrl||new URL(status.mediaBaseUrl).protocol!=='https:')throw new HttpError(503,'Mart needs a secure public photo URL.');
  mediaBase=status.mediaBaseUrl;
  await pool.query('UPDATE mart_connections SET media_base_url=$2 WHERE business_id=$1',[connection.business_id,mediaBase]);
 }
 return{connectionId:connection.oynk_connection_id,baseUrl:mediaBase};
}
export async function inventoryPhotoContext(businessId:string){
 const [connection]=await query<Connection>("SELECT * FROM mart_connections WHERE business_id=$1 AND status='active'",[businessId]);
 if(!connection)throw new HttpError(409,'Connect Oynk Mart first.');return martMediaContext(connection);
}
export async function readOynkPhoto(businessId:string,id:string){
 if(!/^[0-9a-f-]{36}$/i.test(id))throw new HttpError(404,'Photo not found.');
 const [connection]=await query<Connection>("SELECT * FROM mart_connections WHERE business_id=$1 AND status='active'",[businessId]);
 if(!connection)throw new HttpError(404,'Photo not found.');
 const response=await fetch(`${baseUrl()}/api/mart/connector/media/${id}`,{headers:{'x-mart-connector-token':credential(connection)},signal:AbortSignal.timeout(8000)});
 if(!response.ok||response.headers.get('content-type')?.split(';')[0]!=='image/webp')throw new HttpError(404,'Photo not found.');
 const content=Buffer.from(await response.arrayBuffer());if(content.length>2*1024*1024)throw new HttpError(502,'Photo is unavailable.');return content;
}
