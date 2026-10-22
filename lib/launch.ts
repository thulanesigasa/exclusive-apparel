/** Build and runtime switches both default to the safe, price-free prelaunch. */
export const PRELAUNCH=process.env.NEXT_PUBLIC_STOREFRONT_MODE!=='store';
export function isPrelaunch(env:{STOREFRONT_MODE?:string}){return env.STOREFRONT_MODE!=='store';}
export type PreviewProduct={id:string;name:string;category:string;audience:string;image:string;description:string;gallery?:string[];color?:string;photography?:boolean;badge?:string|null;updatedAt?:string};
export function previewProduct(p:PreviewProduct):PreviewProduct{return {id:p.id,name:p.name,category:p.category,audience:p.audience,image:p.image,description:p.description,gallery:p.gallery,color:p.color,photography:p.photography,updatedAt:p.updatedAt};}
