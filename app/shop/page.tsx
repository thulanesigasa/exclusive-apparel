import {Suspense} from 'react';
import {Catalogue} from '@/components/catalogue';
import {ProductCard} from '@/components/product-card';
import {storeProducts} from '@/server/catalogue';
export const metadata={title:'Shop apparel for men, women & kids',description:'Explore caps, T-shirts, track pants, sweatpants and beanies from Exclusive Apparel.',alternates:{canonical:'/shop/'}};
export default async function Shop(){const products=await storeProducts();return <Suspense fallback={<section className="section" aria-busy="true"><p className="eyebrow">THE EVERYDAY COLLECTION</p><h1>Your next everyday favourite.</h1><p>Loading search and filters…</p><div className="product-grid">{products.map(p=><ProductCard product={p} key={p.id}/>)}</div></section>}><Catalogue/></Suspense>;}
