export const dynamic = 'force-static';
import type {MetadataRoute} from 'next';
import {products,siteUrl} from '@/lib/catalog';
export default function sitemap():MetadataRoute.Sitemap{return ['','/shop','/about','/help','/privacy',...products.map(p=>`/product/${p.id}`)].map(path=>({url:`${siteUrl}${path}/`,changeFrequency:'weekly' as const,priority:path===''?1:path.startsWith('/product')?0.8:0.6}));}
