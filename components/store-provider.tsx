'use client';
import {createContext,useContext,useEffect,useState,useCallback, useMemo} from 'react';
import {products} from '@/lib/catalog';
import {normalizeCart,keyOf,MAX_QUANTITY,type CartItem} from '@/lib/cart.mjs';
const Context=createContext<{items:CartItem[];ready:boolean;add:(i:CartItem)=>void;update:(key:string,n:number)=>void;message:string}>({items:[],ready:false,add:()=>{},update:()=>{},message:''});
export function StoreProvider({children}:{children:React.ReactNode}){
 const [items,setItems]=useState<CartItem[]>([]),[ready,setReady]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>{try{setItems(normalizeCart(JSON.parse(localStorage.getItem('exclusive-cart-v1')||'[]'),products));}catch{}setReady(true);},[]);
 useEffect(()=>{if(ready)try{localStorage.setItem('exclusive-cart-v1',JSON.stringify(items));}catch{}},[items,ready]);
 useEffect(()=>{if(!message)return;const t=setTimeout(()=>setMessage(''),3000);return()=>clearTimeout(t);},[message]);
 const add=useCallback((item:CartItem)=>{setItems(old=>normalizeCart([...old,item],products));setMessage('Added to your bag');},[]);
 const update=useCallback((key:string,n:number)=>setItems(old=>old.flatMap(i=>keyOf(i)!==key?[i]:n<=0?[]:[{...i,quantity:Math.min(MAX_QUANTITY,Math.floor(n))}])),[]);
 const value=useMemo(()=>({items,ready,add,update,message}),[items,ready,add,update,message]);
 return <Context.Provider value={value}>{children}<div className={`toast ${message?'visible':''}`} role="status" aria-live="polite">{message}</div></Context.Provider>;
}
export const useStore=()=>useContext(Context);
