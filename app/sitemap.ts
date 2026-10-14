import type {MetadataRoute} from 'next';
import {siteUrl} from '@/lib/catalog';
import {publicPages,absoluteUrl} from '@/lib/seo.mjs';
import {storeProducts} from '@/server/catalogue';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const products=await storeProducts();return [...publicPages.map(p=>({url:absoluteUrl(p.path,siteUrl)})),...products.map(p=>({url:absoluteUrl(`/product/${p.id}/`,siteUrl),...(p.updatedAt&&!Number.isNaN(Date.parse(p.updatedAt))?{lastModified:new Date(p.updatedAt)}:{})}))];}
