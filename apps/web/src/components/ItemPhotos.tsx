import { useEffect, useState } from 'react';
import { AddCircle, CloseCircle, Gallery, Refresh } from 'iconsax-react';
import { api, API_URL } from '../lib/api';

export function ItemPhoto({url,token,alt='',className}:{url:string;token:string;alt?:string;className?:string}){
 const [preview,setPreview]=useState(''),[failed,setFailed]=useState(false);
 useEffect(()=>{
  let cancelled=false,blobUrl='';setPreview('');setFailed(false);
  const own=url.startsWith('/api/v3/resources/item-images/');
  let mart:RegExpMatchArray|null=null;
  if(!own){try{mart=new URL(url).pathname.match(/^\/api\/mart\/media\/([0-9a-f-]{36})$/i);}catch{setFailed(true);return;}}
  if(!own&&!mart){setPreview(url);return;}
  const path=own?url:`/api/v3/integrations/oynk-mart/photos/${mart![1]}`;
  const controller=new AbortController();
  void fetch(`${API_URL}${path}`,{headers:{Authorization:`Bearer ${token}`},signal:controller.signal}).then(async response=>{
   if(!response.ok)throw new Error('Photo unavailable');const blob=await response.blob();
   if(!cancelled){blobUrl=URL.createObjectURL(blob);setPreview(blobUrl);}
  }).catch(()=>{if(!cancelled)setFailed(true);});
  return()=>{cancelled=true;controller.abort();if(blobUrl)URL.revokeObjectURL(blobUrl);};
 },[url,token]);
 return preview&&!failed?<img src={preview} alt={alt} className={className} onError={()=>setFailed(true)}/>:<span className={`item-photo-placeholder ${className??''}`}><Gallery size={23}/></span>;
}
export function ItemPhotos({urls,token,onChange,onBusy,disabled}:{urls:string[];token:string;onChange:(urls:string[])=>void;onBusy:(busy:boolean)=>void;disabled:boolean}){
 const [pending,setPending]=useState(''),[error,setError]=useState('');
 async function add(files:File[]){
  setError('');if(urls.length+files.length>5){setError('Add up to five photos per item.');return;}
  if(files.some(file=>!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)){setError('Choose JPG, PNG or WebP photos up to 5 MB each.');return;}
  onBusy(true);const next=[...urls];
  try{for(const file of files){const preview=URL.createObjectURL(file);setPending(preview);
   try{const uploaded=await api<{id:string;url:string}>('/resources/item-images',{method:'POST',body:file,headers:{'Content-Type':file.type}},token);if(!next.includes(uploaded.url)){next.push(uploaded.url);onChange([...next]);}}
   finally{setPending('');URL.revokeObjectURL(preview);}
  }}catch(reason){setError(reason instanceof Error?reason.message:'Could not upload this photo. Try again.');}finally{onBusy(false);}
 }
 return <div className="item-photos span-2"><div className="item-photos-heading"><strong>Item photos</strong><span>{urls.length} / 5</span></div><div className="item-photos-grid">
  {urls.map((url,index)=><div className="item-photo-tile" key={url}><ItemPhoto url={url} token={token} alt={`Item photo ${index+1}`}/><button type="button" className="item-photo-remove" disabled={disabled} aria-label={`Remove photo ${index+1}`} onClick={()=>onChange(urls.filter((_,i)=>i!==index))}><CloseCircle size={21}/></button>{index===0?<span className="item-photo-cover">Cover</span>:<button type="button" disabled={disabled} className="item-photo-cover" onClick={()=>onChange([url,...urls.filter((_,i)=>i!==index)])}>Make cover</button>}</div>)}
  {pending?<div className="item-photo-tile item-photo-pending"><img src={pending} alt="Uploading photo"/><span><Refresh size={19}/>Uploading…</span></div>:null}
  {urls.length<5&&!pending?<label className="item-photo-add"><AddCircle size={24}/><span>Add photos</span><input type="file" aria-label="Add item photos" multiple accept="image/jpeg,image/png,image/webp" disabled={disabled} onChange={event=>{const files=Array.from(event.target.files??[]);event.target.value='';if(files.length)void add(files);}}/></label>:null}
 </div><small>First photo is your cover. JPG, PNG or WebP, up to 5 MB each.</small>{error?<p className="form-error" role="alert">{error}</p>:null}</div>;
}
