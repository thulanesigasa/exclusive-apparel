export type CartItem = { productId: string; size: string; color: string; quantity: number };
export const MAX_QUANTITY: number;
export function keyOf(item: CartItem): string;
export function normalizeCart(value: unknown, products: {id:string;sizes:string[];colors:string[]}[]): CartItem[];
export function subtotal(items:CartItem[],products:{id:string;price:number}[]):number;
