'use client';
import Link from 'next/link';
import {Search,ShoppingBag,Menu,X,ArrowUpRight} from 'lucide-react';
import {useState} from 'react';
import {usePathname} from 'next/navigation';
import {useStore} from './store-provider';

export function Header(){
 const {items,ready,bagOpen,openBag}=useStore();
 const [open,setOpen]=useState(false);
 const path=usePathname();
 const count=ready?items.reduce((sum,item)=>sum+item.quantity,0):0;
 return <>
  <div className="announcement">EXCLUSIVE BY NAME. EVERYDAY BY NATURE. <Link href="/shop/">Explore the collection <ArrowUpRight size={12}/></Link></div>
  <header className="header">
   <Link href="/" className="brand" aria-label="Exclusive Apparel home"><img src="/logo.webp" alt="Exclusive Apparel" width="100" height="80"/></Link>
   <nav aria-label="Main navigation" className={open?'nav open':'nav'}>
    <Link href="/" className={path==='/'?'active':''} aria-current={path==='/'?'page':undefined} onClick={()=>setOpen(false)}>Home</Link>
    {['All','Men','Women','Kids'].map(a=><Link className={(path==='/shop/'||path==='/shop')&&a==='All'?'active':''} key={a} href={a==='All'?'/shop/':`/shop/?audience=${a}`} onClick={()=>setOpen(false)}>{a==='All'?'Shop all':a}</Link>)}
    <Link href="/about/" onClick={()=>setOpen(false)}>Our story</Link>
   </nav>
   <div className="header-actions">
    <Link href="/shop/?search=true" aria-label="Search products"><Search size={21}/></Link>
    <button type="button" className="bag-link" aria-haspopup="dialog" aria-expanded={bagOpen} aria-label={`Open shopping bag, ${count} items`} onClick={()=>{setOpen(false);openBag();}}><ShoppingBag size={21}/><span>{count}</span></button>
    <button type="button" className="mobile-toggle" aria-label={open?'Close menu':'Open menu'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
   </div>
  </header>
 </>;
}
