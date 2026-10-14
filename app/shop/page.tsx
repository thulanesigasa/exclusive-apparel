import {pageMetadata} from '@/lib/metadata';
import {ShopIntro} from '@/components/shop-intro';
import {Suspense} from 'react';
import {Catalogue} from '@/components/catalogue';
import {ProductCard} from '@/components/product-card';
import {storeProducts} from '@/server/catalogue';
export const metadata=pageMetadata('/shop/');
export default async function Shop(){const products=await storeProducts();return <section className="section shop-shell"><ShopIntro/><Suspense fallback={<div aria-busy="true"><h2 className="sr-only">Shop the collection</h2><div className="product-grid">{products.map(p=><ProductCard product={p} key={p.id}/>)}</div></div>}><Catalogue showIntro={false}/></Suspense></section>;}
