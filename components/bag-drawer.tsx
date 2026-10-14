'use client';
import {useEffect,useRef} from 'react';
import Link from 'next/link';
import {ArrowUpRight,Minus,Plus,ShoppingBag,X} from 'lucide-react';
import {products,money} from '@/lib/catalog';
import {keyOf,subtotal,MAX_QUANTITY} from '@/lib/cart.mjs';
import {useStore} from './store-provider';

export function BagDrawer(){
 const {items,update,ready,closeBag}=useStore();
 const dialogRef=useRef<HTMLDialogElement>(null);
 const closeRef=useRef<HTMLButtonElement>(null);
 const count=items.reduce((sum,item)=>sum+item.quantity,0);
 useEffect(()=>{
  const dialog=dialogRef.current;
  if(!dialog)return;
  const previousOverflow=document.body.style.overflow;
  const previousFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
  dialog.showModal();
  closeRef.current?.focus();
  document.body.style.overflow='hidden';
  return()=>{dialog.close();document.body.style.overflow=previousOverflow;if(previousFocus?.isConnected)previousFocus.focus();};
 },[]);
 return <dialog ref={dialogRef} className="bag-drawer" aria-labelledby="bag-title" aria-describedby="bag-notice" onCancel={event=>{event.preventDefault();closeBag();}} onClick={event=>{
  if(event.target!==event.currentTarget)return;
  const bounds=event.currentTarget.getBoundingClientRect();
  if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)closeBag();
 }}>
  <div className="bag-panel">
   <div className="bag-heading"><div><p className="eyebrow">YOUR EVERYDAY ROTATION</p><h2 id="bag-title">Your bag <span>({ready?count:0})</span></h2></div><button ref={closeRef} type="button" className="bag-close" aria-label="Close shopping bag" onClick={closeBag}><X size={22}/></button></div>
   <div className="bag-items" aria-busy={!ready}>
    {!ready?<p role="status">Loading your bag…</p>:items.length?items.map(item=>{
     const p=products.find(product=>product.id===item.productId)!;
     const key=keyOf(item);
     return <article className="cart-item drawer-item" key={key}>
      <Link href={`/product/${p.id}/`} onClick={closeBag}><img src={p.image} width="90" height="99" alt={p.name}/></Link>
      <div><Link href={`/product/${p.id}/`} onClick={closeBag}><h3>{p.name}</h3></Link><p>{item.color} / {item.size}</p><div className="quantity"><button type="button" aria-label={`Decrease ${p.name} quantity`} onClick={()=>update(key,item.quantity-1)}><Minus size={14}/></button><span aria-live="polite">{item.quantity}</span><button type="button" disabled={item.quantity>=MAX_QUANTITY} aria-label={`Increase ${p.name} quantity`} onClick={()=>update(key,item.quantity+1)}><Plus size={14}/></button></div></div>
      <div className="cart-item-end"><strong>{money(p.price*item.quantity)}</strong><button type="button" aria-label={`Remove ${p.name}`} onClick={()=>update(key,0)}><X size={18}/></button></div>
     </article>;
    }):<div className="empty bag-empty"><ShoppingBag size={38}/><h3>Your everyday starts here.</h3><p>Your bag is waiting for its first essential.</p><button type="button" className="button dark" onClick={closeBag}>Continue shopping <ArrowUpRight size={18}/></button></div>}
   </div>
   <div className="bag-summary">
    {ready&&items.length>0&&<><div className="bag-subtotal"><span>Subtotal</span><strong>{money(subtotal(items,products))}</strong></div><p className="bag-delivery">Delivery to be confirmed.</p><Link href="/checkout/" className="button dark bag-checkout" onClick={closeBag}>Checkout <ArrowUpRight size={18}/></Link><button type="button" className="bag-continue" onClick={closeBag}>Continue shopping</button></>}
    <p className="sample-note" id="bag-notice">Development preview · Sample prices. Live orders and payments are not yet available.</p>
   </div>
  </div>
 </dialog>;
}
