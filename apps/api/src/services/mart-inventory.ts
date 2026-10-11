import { HttpError } from "../http";

export function validMartItem(value: unknown) {
 if (!value || typeof value !== 'object' || Array.isArray(value)) throw new HttpError(400,'Check the item details.');
 const raw=value as Record<string,unknown>;
 const name=String(raw.name??'').trim(),kind=String(raw.kind??'product'),price=Number(raw.price);
 const stock=raw.stockQuantity===null||raw.stockQuantity===undefined?null:Number(raw.stockQuantity);
 if(!name||name.length>160||!['product','service'].includes(kind)||!Number.isFinite(price)||price<0||price>999999999999.99||Math.abs(Math.round(price*100)-price*100)>0.0001||stock!==null&&(!Number.isSafeInteger(stock)||stock<0||stock>99999999999))throw new HttpError(400,'Check the item name, price and stock.');
 if(raw.published!==undefined&&typeof raw.published!=='boolean')throw new HttpError(400,'Choose whether to publish this item.');
 let imageUrls:string[]|null=null;
 if(raw.imageUrls!==undefined){
  if(!Array.isArray(raw.imageUrls)||raw.imageUrls.length>5||raw.imageUrls.some(url=>typeof url!=='string'||url.length>2048||!validPhotoUrl(url)))throw new HttpError(400,'Add up to five photos using secure image URLs.');
  imageUrls=raw.imageUrls as string[];
 }
 return {name,kind,price,stock:kind==='service'?null:stock,sku:String(raw.sku??'').trim().slice(0,120)||null,description:String(raw.description??'').trim().slice(0,2000)||null,published:raw.published!==false,imageUrls};
}
function validPhotoUrl(value:string){try{return new URL(value).protocol==='https:';}catch{return false;}}
