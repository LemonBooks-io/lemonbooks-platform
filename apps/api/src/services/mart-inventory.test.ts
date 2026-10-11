import assert from 'node:assert/strict';
import test from 'node:test';
import { validMartItem } from './mart-inventory';
const item={name:'Rice',price:1250,stockQuantity:4};
test('source item creation publishes by default and respects explicit privacy',()=>{
 assert.equal(validMartItem(item).published,true);
 assert.equal(validMartItem({...item,published:false}).published,false);
 assert.throws(()=>validMartItem({...item,published:'false'}));
});
test('source inventory keeps five ordered photos and rejects malformed URLs or excess',()=>{
 const imageUrls=Array.from({length:5},(_,i)=>`https://example.test/photo-${i}.webp`);
 assert.deepEqual(validMartItem({...item,imageUrls}).imageUrls,imageUrls);
 assert.equal(validMartItem(item).imageUrls,null);
 assert.deepEqual(validMartItem({...item,imageUrls:[]}).imageUrls,[]);
 assert.throws(()=>validMartItem({...item,imageUrls:[...imageUrls,imageUrls[0]]}));
 assert.throws(()=>validMartItem({...item,imageUrls:['http://example.test/a.jpg']}));
 assert.throws(()=>validMartItem({...item,imageUrls:['https://']}));
});
