import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {productSoldOut} from '@/lib/availability.mjs';
import {money} from '@/lib/catalog';
import type {StoreProduct} from '@/lib/store-types';
export function ProductCard({product:p,priority=false}:{product:StoreProduct;priority?:boolean}){return <article className="product-card"><Link href={`/product/${p.id}/`} className="product-image">{productSoldOut(p)?<span className="badge stock-badge">Out of stock</span>:p.badge&&<span className="badge">{p.badge}</span>}<img src={p.image} alt={`${p.name}${p.confirmed?'':' — sample illustration'}`} width="500" height="550" loading={priority?'eager':'lazy'} decoding="async"/><span className="quick-view">View product <ArrowUpRight size={16}/></span></Link><div className="product-info"><div><span className="eyebrow">{p.audience} / {p.category}</span><Link href={`/product/${p.id}/`}><h3>{p.name}</h3></Link></div><span>{money(p.price)}</span></div><div className="swatches"><span style={{background:p.color}}/><span style={{background:'#222'}}/><small>{p.colors.length} {p.colors.length===1?'colour':'colours'}</small></div></article>;}
