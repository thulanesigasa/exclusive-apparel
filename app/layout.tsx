import type {Metadata,Viewport} from 'next';
import {siteUrl} from '@/lib/catalog';
import {StoreProvider} from '@/components/store-provider';
import {Header} from '@/components/header';
import {Footer} from '@/components/footer';
import './globals.css';
export const metadata:Metadata={metadataBase:new URL(siteUrl),title:{default:'Exclusive Apparel | Everyday essentials. Your way.',template:'%s | Exclusive Apparel'},description:'Discover Exclusive Apparel: caps, tees, track pants, sweatpants and beanies for men, women and kids. Wear the crown your way.',icons:{icon:'/favicon.ico',apple:'/apple-touch-icon.png'},manifest:'/manifest.webmanifest',openGraph:{type:'website',locale:'en_ZA',siteName:'Exclusive Apparel',images:[{url:'/logo.webp',width:640,height:640,alt:'Exclusive Apparel crown logo'}]},twitter:{card:'summary',images:['/logo.webp']}};
export const viewport:Viewport={themeColor:'#171917',width:'device-width',initialScale:1};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en-ZA"><body><StoreProvider><a className="skip-link" href="#main">Skip to content</a><Header/><main id="main">{children}</main><Footer/></StoreProvider></body></html>;}
