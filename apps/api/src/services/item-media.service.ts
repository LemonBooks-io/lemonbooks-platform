import { createHash, randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { pool, query } from '../database/pool';
import { HttpError } from '../http';

export const photoPrefix='/api/v3/resources/item-images/';
export const maxPhotoBytes=5*1024*1024;
export async function normalizeItemPhoto(input:Buffer,type:string){
 const formats:Record<string,string>={'image/jpeg':'jpeg','image/png':'png','image/webp':'webp'};
 if(!formats[type]||!input.length||input.length>maxPhotoBytes)throw new HttpError(400,'Choose a JPG, PNG or WebP photo up to 5 MB.');
 try{
  const image=sharp(input,{limitInputPixels:40_000_000,failOn:'warning'}),metadata=await image.metadata();
  if(metadata.format!==formats[type]||(metadata.pages??1)!==1)throw new Error('Invalid image');
  const content=await image.rotate().resize(1600,1600,{fit:'inside',withoutEnlargement:true}).webp({quality:82}).toBuffer();
  if(content.length>2*1024*1024)throw new Error('Photo too large');
  return{content,hash:createHash('sha256').update(content).digest('hex')};
 }catch{throw new HttpError(400,'This photo could not be opened. Choose another JPG, PNG or WebP image.');}
}
export async function saveItemPhoto(businessId:string,input:Buffer,type:string){
 const {content,hash}=await normalizeItemPhoto(input,type),client=await pool.connect();
 try{
  await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`item-media:${businessId}`]);
  const existing=await client.query('SELECT id FROM item_media WHERE business_id=$1 AND content_hash=$2',[businessId,hash]);
  if(existing.rows[0]){await client.query('COMMIT');return{id:existing.rows[0].id,url:`${photoPrefix}${existing.rows[0].id}`};}
  const usage=await client.query(`SELECT COALESCE(SUM(octet_length(content)),0)::bigint bytes,COUNT(*) FILTER(WHERE created_at>now()-interval '1 hour')::integer recent FROM item_media WHERE business_id=$1`,[businessId]);
  if(Number(usage.rows[0].bytes)+content.length>200*1024*1024||usage.rows[0].recent>=60)throw new HttpError(429,'Photo upload limit reached. Try again later or contact support.');
  const id=randomUUID();await client.query('INSERT INTO item_media(id,business_id,content_hash,content) VALUES($1,$2,$3,$4)',[id,businessId,hash,content]);await client.query('COMMIT');return{id,url:`${photoPrefix}${id}`};
 }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}
export async function readItemPhoto(businessId:string,id:string){
 if(!/^[0-9a-f-]{36}$/i.test(id))throw new HttpError(404,'Photo not found.');
 const [photo]=await query<{content:Buffer;content_hash:string}>('SELECT content,content_hash FROM item_media WHERE id=$1 AND business_id=$2',[id,businessId]);
 if(!photo)throw new HttpError(404,'Photo not found.');return photo;
}
export function publicationChoice(value:unknown,fallback=true){
 if(value===undefined||value===null||value==='')return fallback;
 if(typeof value==='boolean')return value;
 if(typeof value==='string'){const choice=value.trim().toLowerCase();if(['true','yes','1'].includes(choice))return true;if(['false','no','0'].includes(choice))return false;}
 throw new HttpError(400,'Set publish_to_mart to true or false.');
}
export function photoReferences(value:unknown,connectionId?:string){
 if(value===undefined)return null;
 const urls=Array.isArray(value)?value:typeof value==='string'?value.split(';').map(url=>url.trim()).filter(Boolean):null;
 if(!urls||urls.length>5)throw new HttpError(400,'Add up to five item photos.');
 return urls.map((url:unknown)=>{
  if(typeof url!=='string'||url.length>2048)throw new HttpError(400,'Choose valid item photos.');
  if(new RegExp(`^${photoPrefix}[0-9a-f-]{36}$`,'i').test(url))return url;
  try{const parsed=new URL(url);if(parsed.protocol!=='https:')throw new Error();
   const source=parsed.pathname.match(/^\/api\/mart\/source-photos\/([0-9a-f-]{36})\/([0-9a-f-]{36})$/i);
   if(source){if(source[1]!==connectionId)throw new Error();return `${photoPrefix}${source[2]}`;}return url;
  }catch{throw new HttpError(400,'Use secure image URLs or photos uploaded to this business.');}
 });
}
export async function verifyItemPhotos(businessId:string,urls:string[]|null){
 const ids=(urls??[]).filter(url=>url.startsWith(photoPrefix)).map(url=>url.slice(photoPrefix.length));
 if(!ids.length)return;
 const owned=await query<{id:string}>('SELECT id FROM item_media WHERE business_id=$1 AND id=ANY($2::uuid[])',[businessId,ids]);
 if(new Set(owned.map(row=>row.id)).size!==new Set(ids).size)throw new HttpError(403,'Choose photos uploaded by this business.');
}
