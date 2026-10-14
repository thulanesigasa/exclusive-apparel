import {returnsPolicy,privacyPolicy,termsPolicy,deliveryPolicy} from './policies';
import type {Product} from './catalog';
export type Variant={id:string;size:string;color:string;sku:string;stock:number};
export type SizeRow={size:string;chest?:number;waist?:number;hip?:number;inseam?:number;length?:number;headMin?:number;headMax?:number};
export type SizeChart={confirmed:boolean;rows:SizeRow[]};
export type StoreProduct=Product&{active?:boolean;updatedAt?:string;variants?:Variant[];gallery?:string[];fabric?:string;care?:string;fit?:string;measurements?:string;confirmed?:boolean;sizeChart?:SizeChart};
export type StoreSettings={businessName:string;legalName:string;email:string;phone:string;address:string;registration:string;returns:string;privacy:string;terms:string;deliveryPolicy:string;live:boolean;policiesApproved:boolean;delivery:{id:string;name:string;type:string;fee:number;freeAbove:number;estimate:string;enabled:boolean;provinces:string[]}[]};
export const defaultSettings:StoreSettings={businessName:'Exclusive Apparel',legalName:'',email:'',phone:'',address:'',registration:'',returns:returnsPolicy,privacy:privacyPolicy,terms:termsPolicy,deliveryPolicy:deliveryPolicy,live:false,policiesApproved:false,delivery:[{id:'standard',name:'Standard delivery',type:'delivery',fee:9900,freeAbove:100000,estimate:'Demo: 3–5 business days',enabled:true,provinces:[]},{id:'collection',name:'Collection',type:'collection',fee:0,freeAbove:0,estimate:'Collection location to be confirmed',enabled:false,provinces:[]}]};
