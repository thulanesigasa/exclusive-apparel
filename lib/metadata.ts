import type {Metadata} from 'next';
import {publicPages,absoluteUrl} from './seo.mjs';
import {siteUrl} from './catalog';
export const shareImage={url:absoluteUrl('/og-image.jpg',siteUrl),width:1200,height:630,alt:'Exclusive Apparel crown branding — everyday essentials for men, women and kids',type:'image/jpeg'};
export function pageMetadata(path:string):Metadata{const page=publicPages.find(p=>p.path===path);if(!page)throw new Error(`Missing metadata for ${path}`);return {title:path==='/'||path==='/waitlist/'?{absolute:'Exclusive Apparel'}:page.title,description:page.description,alternates:{canonical:absoluteUrl(path,siteUrl)},robots:{index:true,follow:true},openGraph:{type:'website',locale:'en_ZA',siteName:'Exclusive Apparel',title:page.title,description:page.description,url:absoluteUrl(path,siteUrl),images:[shareImage]},twitter:{card:'summary_large_image',title:page.title,description:page.description,images:[shareImage.url]}};}
