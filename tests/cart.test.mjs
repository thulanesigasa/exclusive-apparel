import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeCart,subtotal,keyOf} from '../lib/cart.mjs';
const products=[{id:'tee',sizes:['M','L'],colors:['Black'],price:349}];
const item={productId:'tee',size:'M',color:'Black',quantity:2};
test('rejects corrupted storage and invalid variants',()=>{assert.deepEqual(normalizeCart(null,products),[]);assert.deepEqual(normalizeCart([null,{}, {...item,productId:'unknown'},{...item,size:'XXL'},{...item,quantity:-1},{...item,quantity:1.5}],products),[]);});
test('merges matching variants and caps quantity',()=>assert.deepEqual(normalizeCart([item,{...item,quantity:20}],products),[{...item,quantity:10}]));
test('keeps sizes separate and calculates catalogue prices',()=>{const rows=normalizeCart([item,{...item,size:'L',quantity:1}],products);assert.equal(rows.length,2);assert.notEqual(keyOf(rows[0]),keyOf(rows[1]));assert.equal(subtotal(rows,products),1047);});
