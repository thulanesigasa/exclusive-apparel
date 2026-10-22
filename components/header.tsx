'use client';
import {PRELAUNCH} from '@/lib/launch';
import Link from 'next/link';
import {Search,ShoppingBag,Menu,X,ArrowUpRight,UserRound} from 'lucide-react';
import {useState,useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {useStore} from './store-provider';

export function Header(){return PRELAUNCH?<LaunchHeader/>:<StoreHeader/>;}
function StoreHeader(){
 const {items,ready,bagOpen,openBag}=useStore();
 const [open,setOpen]=useState(false);
 const path=usePathname();
 useEffect(()=>{if(!open)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(false);};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close);},[open]);
 const count=ready?items.reduce((sum,item)=>sum+item.quantity,0):0;
 return <>
  <div className="announcement">EXCLUSIVE BY NAME. EVERYDAY BY NATURE. <Link href="/shop/">Explore the collection <ArrowUpRight size={12}/></Link></div>
  <header className="header">
   <Link href="/" className="brand" aria-label="Exclusive Apparel home"><img src="/logo-small.webp" alt="Exclusive Apparel" width="100" height="80"/></Link>
   <nav id="main-navigation" aria-label="Main navigation" className={open?'nav open':'nav'}>
    <Link href="/" className={path==='/'?'active':''} aria-current={path==='/'?'page':undefined} onClick={()=>setOpen(false)}>Home</Link>
    {['All','Men','Women','Kids'].map(a=><Link className={(path==='/shop/'||path==='/shop')&&a==='All'?'active':''} key={a} href={a==='All'?'/shop/':`/collections/${a.toLowerCase()}/`} onClick={()=>setOpen(false)}>{a==='All'?'Shop all':a}</Link>)}
    <Link href="/about/" onClick={()=>setOpen(false)}>Our story</Link>
   </nav>
   <div className="header-actions">
    <Link href="/account/" aria-label="Customer account"><UserRound size={21}/></Link>
    <Link href="/shop/?search=true" aria-label="Search products"><Search size={21}/></Link>
    <button type="button" className="bag-link" aria-haspopup="dialog" aria-expanded={bagOpen} aria-label={`Open shopping bag, ${count} items`} onClick={()=>{setOpen(false);openBag();}}><ShoppingBag size={21}/><span>{count}</span></button>
    <button type="button" className="mobile-toggle" aria-controls="main-navigation" aria-label={open?'Close menu':'Open menu'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
   </div>
  </header>
 </>;
}

function LaunchHeader(){const [open,setOpen]=useState(false);const path=usePathname();useEffect(()=>{setOpen(false);},[path]);useEffect(()=>{if(!open)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(false);};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close);},[open]);return <><div className="announcement">YOUR EVERYDAY IS COMING. <Link href="/waitlist/">Join the waiting list <ArrowUpRight size={12}/></Link></div><header className="header"><Link href="/" className="brand" aria-label="Exclusive Apparel home"><img src="/logo-small.webp" alt="Exclusive Apparel" width="100" height="80"/></Link><nav id="main-navigation" aria-label="Main navigation" className={open?'nav open':'nav'}>{[['Home','/'],['The collection','/shop/'],['Men','/collections/men/'],['Women','/collections/women/'],['Kids','/collections/kids/'],['Our story','/about/']].map(([name,href])=><Link key={href} href={href} className={path===href?'active':''} aria-current={path===href?'page':undefined} onClick={()=>setOpen(false)}>{name}</Link>)}</nav><div className="header-actions"><Link className="text-link header-waitlist" href="/waitlist/" onClick={()=>setOpen(false)}>Join the list <ArrowUpRight size={18}/></Link><button type="button" className="mobile-toggle" aria-controls="main-navigation" aria-label={open?'Close menu':'Open menu'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></div></header></>;}
