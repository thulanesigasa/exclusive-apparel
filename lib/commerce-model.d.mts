export const transitions:Record<string,string[]>;
export function canTransition(from:string,to:string):boolean;
export function requiredText(value:unknown,label:string,max?:number):string;
export function validateCustomer(value:any,collection?:boolean):any;
export function validateItems(value:unknown):{productId:string;size:string;color:string;quantity:number}[];
export function quoteShipping(settings:any,method:string,subtotal:number,province?:string):any;
export function safeImage(value:unknown):boolean;
