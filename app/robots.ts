export const dynamic = 'force-static';
import type {MetadataRoute} from 'next';
import {siteUrl} from '@/lib/catalog';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/',disallow:['/cart/','/checkout/','/admin/','/orders/','/shop/?']},sitemap:`${siteUrl}/sitemap.xml`};}
