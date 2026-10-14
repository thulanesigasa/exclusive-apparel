import type {StoreProduct,SizeChart,Variant} from './store-types';
export function variantFor(product:StoreProduct,size:string,color:string):Variant|undefined;
export function availableFor(product:StoreProduct,size:string,color:string):number|null;
export function productSoldOut(product:StoreProduct):boolean;
export function validateSizeChart(chart:unknown,sizes:string[],category:string):SizeChart;
