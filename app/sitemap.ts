export const dynamic = 'force-dynamic';
import type {MetadataRoute} from 'next';
import {siteUrl} from '@/lib/catalog';
import {storeProducts} from '@/server/catalogue';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const products=await storeProducts();return ['','/shop','/about','/help','/privacy','/contact','/returns','/delivery','/terms',...products.map(p=>`/product/${p.id}`)].map(path=>({url:`${siteUrl}${path}/`,changeFrequency:'weekly' as const,priority:path===''?1:path.startsWith('/product')?0.8:0.6}));}
