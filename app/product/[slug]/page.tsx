import {PRELAUNCH,previewProduct} from '@/lib/launch';
import {ProductPreview} from '@/components/product-preview';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {shareImage} from '@/lib/metadata';
import {StructuredData} from '@/components/structured-data';
import {productSchema,breadcrumbSchema,absoluteUrl} from '@/lib/seo.mjs';
import {seoState} from '@/server/seo';
import {siteUrl} from '@/lib/catalog';
import {storeProducts} from '@/server/catalogue';
import {ProductGallery} from '@/components/product-gallery';
import {ProductOptions} from '@/components/product-options';
import {ProductCard} from '@/components/product-card';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const products=await storeProducts();const p=products.find(p=>p.id===slug);if(!p)return {};const description=`Explore ${p.name} from Exclusive Apparel. ${p.description}`.replace(/\s+/g,' ').slice(0,160);const title=`${p.name} | ${p.category}`;return {title,description,robots:{index:true,follow:true},alternates:{canonical:absoluteUrl(`/product/${p.id}/`,siteUrl)},openGraph:{type:'website',title,description,url:absoluteUrl(`/product/${p.id}/`,siteUrl),images:[shareImage]},twitter:{card:'summary_large_image',title,description,images:[shareImage.url]}};}
export default async function Product({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const products=await storeProducts();const p=products.find(p=>p.id===slug);if(!p)notFound();const {live}=await seoState();return <><StructuredData data={productSchema(p,{origin:siteUrl,live})}/><StructuredData data={{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:siteUrl+'/'},{'@type':'ListItem',position:2,name:'Shop',item:siteUrl+'/shop/'},{'@type':'ListItem',position:3,name:p.name,item:absoluteUrl(`/product/${p.id}/`,siteUrl)}]}}/><div className="section"><nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/shop/">Shop</Link><span>/</span><span>{p.name}</span></nav><div className="product-layout"><ProductGallery product={PRELAUNCH?previewProduct(p):p}/>{PRELAUNCH?<ProductPreview product={previewProduct(p)}/>:<ProductOptions product={p}/>}</div></div><section className="section featured"><div className="section-heading"><div><p className="eyebrow">KEEP YOUR ROTATION FRESH</p><h2>Also your kind of thing.</h2></div></div><div className="product-grid">{products.filter(x=>x.id!==p.id).slice(0,4).map(x=><ProductCard key={x.id} product={x}/>)}</div></section></>;}
