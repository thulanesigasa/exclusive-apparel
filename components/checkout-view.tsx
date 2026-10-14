'use client';
import Link from 'next/link';
import {useStore} from './store-provider';
import {products,money} from '@/lib/catalog';
import {subtotal,keyOf} from '@/lib/cart.mjs';
export function CheckoutView(){const {items,ready,openBag}=useStore();return <section className="section prose"><p className="eyebrow">ONE LAST LOOK</p><h1>Your bag, reviewed.</h1><p>This store is in development. Live checkout will open once products, stock, payments and delivery are configured.</p>{!ready?<p role="status">Loading your bag…</p>:items.length?<><div className="review-list">{items.map(i=><div key={keyOf(i)}><span>{products.find(p=>p.id===i.productId)?.name} × {i.quantity}<small>{i.size} / {i.color}</small></span><strong>{money((products.find(p=>p.id===i.productId)?.price||0)*i.quantity)}</strong></div>)}</div><h2>Sample subtotal: {money(subtotal(items,products))}</h2><p>No order has been placed and no payment details are collected.</p><button className="button dark" type="button" onClick={openBag}>Edit your bag</button></>:<><p>Your bag is empty.</p><Link className="button dark" href="/shop/">Shop the collection</Link></>}</section>;}
