export const MAX_QUANTITY = 10;
export const keyOf = item => `${item.productId}:${item.size}:${item.color}`;
export function normalizeCart(value, products) {
 if (!Array.isArray(value)) return [];
 const merged = new Map();
 for (const item of value.slice(0,100)) {
  if (!item || typeof item !== 'object') continue;
  const p = products.find(p => p.id === item.productId);
  if (!p || !p.sizes.includes(item.size) || !p.colors.includes(item.color) || !Number.isInteger(item.quantity) || item.quantity < 1) continue;
  const key=keyOf(item), previous=merged.get(key);
  merged.set(key,{productId:p.id,size:item.size,color:item.color,quantity:Math.min(MAX_QUANTITY,item.quantity+(previous?.quantity||0))});
 }
 return [...merged.values()];
}
export function subtotal(items, products) {return items.reduce((total,item)=>total+(products.find(p=>p.id===item.productId)?.price||0)*item.quantity,0);}
