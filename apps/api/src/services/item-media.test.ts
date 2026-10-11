import assert from 'node:assert/strict';
import test from 'node:test';
import sharp from 'sharp';
import { normalizeItemPhoto, photoReferences, publicationChoice } from './item-media.service';
import { projectPhotoUrls } from './mart.service';
const id='a1234567-1234-1234-1234-123456789abc';
test('new inventory is published by default; explicit private CSV settings are honored',()=>{
 assert.equal(publicationChoice(undefined),true);
 for(const value of [false,'false','no','0'])assert.equal(publicationChoice(value),false);
 assert.throws(()=>publicationChoice('perhaps'));
});
test('source photos retain their identity when edited from Mart and reject other connections',()=>{
 const source=`/api/v3/resources/item-images/${id}`,context={connectionId:id,baseUrl:'https://api.example.test'};
 const urls=projectPhotoUrls([source],context);assert.deepEqual(urls,[`https://api.example.test/api/mart/source-photos/${id}/${id}`]);
 assert.deepEqual(photoReferences(urls,id),[source]);
 assert.throws(()=>photoReferences(urls,'b1234567-1234-1234-1234-123456789abc'));
 assert.throws(()=>photoReferences(Array(6).fill(source)));
 assert.throws(()=>photoReferences(['http://example.test/photo.png']));
});
test('native photos are resized, re-encoded, and stripped of image metadata',async()=>{
 const original=await sharp({create:{width:2000,height:1000,channels:3,background:'#338855'}}).jpeg().withMetadata().toBuffer();
 const result=await normalizeItemPhoto(original,'image/jpeg'),metadata=await sharp(result.content).metadata();
 assert.equal(metadata.width,1600);assert.equal(metadata.format,'webp');assert.equal(metadata.exif,undefined);
 await assert.rejects(()=>normalizeItemPhoto(Buffer.from('invalid'),'image/jpeg'));
 await assert.rejects(()=>normalizeItemPhoto(original,'image/svg+xml'));
});
