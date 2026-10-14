'use client';
import {createContext,useContext,useEffect,useState,useCallback,useMemo} from 'react';
import dynamic from 'next/dynamic';
import {products as initialProducts} from '@/lib/catalog';
import {normalizeCart,keyOf,MAX_QUANTITY,type CartItem} from '@/lib/cart.mjs';
import {defaultSettings,type StoreProduct,type StoreSettings} from '@/lib/store-types';
const BagDrawer=dynamic(()=>import('./bag-drawer').then(module=>module.BagDrawer),{ssr:false});
const Context=createContext<{items:CartItem[];ready:boolean;add:(i:CartItem)=>void;update:(key:string,n:number)=>void;clear:()=>void;message:string;bagOpen:boolean;openBag:()=>void;closeBag:()=>void;products:StoreProduct[];settings:StoreSettings;live:boolean;refresh:()=>Promise<void>}>({items:[],ready:false,add:()=>{},update:()=>{},clear:()=>{},message:'',bagOpen:false,openBag:()=>{},closeBag:()=>{},products:initialProducts,settings:defaultSettings,live:false,refresh:async()=>{}});
export function StoreProvider({children}:{children:React.ReactNode}){
 const [items,setItems]=useState<CartItem[]>([]),[ready,setReady]=useState(false),[message,setMessage]=useState('');
 const [products,setProducts]=useState<StoreProduct[]>(initialProducts),[settings,setSettings]=useState(defaultSettings),[live,setLive]=useState(false);
 const [bagOpen,setBagOpen]=useState(false);
 const openBag=useCallback(()=>setBagOpen(true),[]),closeBag=useCallback(()=>setBagOpen(false),[]),clear=useCallback(()=>setItems([]),[]);
 const refresh=useCallback(async()=>{const results:any[]=await Promise.allSettled([fetch('/api/catalogue?limit=100').then(r=>r.ok?r.json():null),fetch('/api/settings').then(r=>r.ok?r.json():null)]);if(results[0].status==='fulfilled'&&results[0].value?.products){const next=results[0].value.products;setProducts(next);setItems(old=>normalizeCart(old,next));}if(results[1].status==='fulfilled'&&results[1].value?.settings){setSettings(results[1].value.settings);setLive(results[1].value.readiness.live);}},[]);
 useEffect(()=>{let active=true;void(async()=>{let saved:unknown=[];try{saved=JSON.parse(localStorage.getItem('exclusive-cart-v1')||'[]');}catch{}try{const response=await fetch('/api/catalogue?limit=100');const data:any=response.ok?await response.json():null;const catalogue:StoreProduct[]=data?.products||initialProducts;if(active){setProducts(catalogue);setItems(normalizeCart(saved,catalogue));}}catch{if(active)setItems(normalizeCart(saved,initialProducts));}finally{if(active)setReady(true);}void refresh();})();return()=>{active=false;};},[refresh]);
 useEffect(()=>{if(ready)try{localStorage.setItem('exclusive-cart-v1',JSON.stringify(items));}catch{}},[items,ready]);
 useEffect(()=>{if(!message)return;const t=setTimeout(()=>setMessage(''),3000);return()=>clearTimeout(t);},[message]);
 const add=useCallback((item:CartItem)=>{setItems(old=>normalizeCart([...old,item],products));setMessage('Added to your bag');},[products]);
 const update=useCallback((key:string,n:number)=>setItems(old=>old.flatMap(i=>keyOf(i)!==key?[i]:n<=0?[]:[{...i,quantity:Math.min(MAX_QUANTITY,Math.floor(n))}])),[]);
 const value=useMemo(()=>({items,ready,add,update,clear,message,bagOpen,openBag,closeBag,products,settings,live,refresh}),[items,ready,add,update,clear,message,bagOpen,openBag,closeBag,products,settings,live,refresh]);
 return <Context.Provider value={value}>{children}{bagOpen&&<BagDrawer/>}<div className={`toast ${message?'visible':''}`} role="status" aria-live="polite">{message}</div></Context.Provider>;
}
export const useStore=()=>useContext(Context);
