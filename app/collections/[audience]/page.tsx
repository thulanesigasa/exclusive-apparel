import {CollectionPhotography} from '@/components/collection-photography';
import {ShopIntro} from '@/components/shop-intro';
import {Suspense} from 'react';
import {notFound} from 'next/navigation';
import {pageMetadata} from '@/lib/metadata';
import {storeProducts} from '@/server/catalogue';
import {Catalogue} from '@/components/catalogue';
import {ProductCard} from '@/components/product-card';
import {StructuredData} from '@/components/structured-data';
import {breadcrumbSchema} from '@/lib/seo.mjs';
const names:Record<string,string>={men:'Men',women:'Women',kids:'Kids'};
export function generateStaticParams(){return Object.keys(names).map(audience=>({audience}));}
export async function generateMetadata({params}:{params:Promise<{audience:string}>}){const {audience}=await params;if(!names[audience])return {};return pageMetadata(`/collections/${audience}/`);}
export default async function Collection({params}:{params:Promise<{audience:string}>}){const {audience}=await params;const name=names[audience];if(!name)notFound();const products=(await storeProducts()).filter(p=>p.audience===name||p.audience==='Unisex');return <><StructuredData data={breadcrumbSchema(`${name}’s apparel`,`/collections/${audience}/`)}/><section className="section shop-shell"><ShopIntro audience={name}/><CollectionPhotography audience={name as 'Men'|'Women'|'Kids'}/><Suspense fallback={<div><h2 className="sr-only">Products in this collection</h2><div className="product-grid">{products.map(p=><ProductCard product={p} key={p.id}/>)}</div></div>}><Catalogue initialAudience={name} showIntro={false}/></Suspense></section></>;}
