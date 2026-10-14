import type {Metadata,Viewport} from 'next';
import {siteUrl} from '@/lib/catalog';
import {StoreProvider} from '@/components/store-provider';
import {Header} from '@/components/header';
import {Footer} from '@/components/footer';
import {shareImage} from '@/lib/metadata';
import {StructuredData} from '@/components/structured-data';
import {WebVitals} from '@/components/web-vitals';
import './globals.css';
export const metadata:Metadata={metadataBase:new URL(siteUrl),title:{default:'Exclusive Apparel | Caps, Tees & Everyday Apparel',template:'%s | Exclusive Apparel'},description:'Discover Exclusive Apparel caps, tees, track pants, sweatpants and beanies for men, women and kids.',icons:{icon:'/favicon.ico',apple:'/apple-touch-icon.png'},manifest:'/manifest.webmanifest',openGraph:{type:'website',locale:'en_ZA',siteName:'Exclusive Apparel',images:[shareImage]},twitter:{card:'summary_large_image',images:[shareImage.url]}};
export const viewport:Viewport={themeColor:'#171917',width:'device-width',initialScale:1};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en-ZA"><body><StructuredData data={{'@context':'https://schema.org','@graph':[{'@type':'Organization','@id':siteUrl+'/#organization',name:'Exclusive Apparel',url:siteUrl+'/',logo:siteUrl+'/logo.webp'},{'@type':'WebSite','@id':siteUrl+'/#website',name:'Exclusive Apparel',url:siteUrl+'/',publisher:{'@id':siteUrl+'/#organization'}}]}}/><WebVitals/><StoreProvider><a className="skip-link" href="#main">Skip to content</a><Header/><main id="main">{children}</main><Footer/></StoreProvider></body></html>;}
