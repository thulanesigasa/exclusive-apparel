import {cache} from 'react';
import {env} from 'cloudflare:workers';
import {allProducts} from './commerce';
import {products as sampleProducts} from '../lib/catalog';
import type {StoreProduct} from '../lib/store-types';
export const storeProducts=cache(async():Promise<StoreProduct[]>=>{if(!env.DB)return sampleProducts;return await allProducts(env.DB);});
