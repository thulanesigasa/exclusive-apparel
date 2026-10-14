import data from './products.json';
export const products = data;
export type Product = typeof products[number];
export const money = (value: number) => new Intl.NumberFormat('en-ZA', {style:'currency',currency:'ZAR',maximumFractionDigits:0}).format(value);
export const categories = ['T-shirts','Caps','Track pants','Sweatpants','Beanies'];
const configuredUrl=new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://exclusive-apparel-store.zippybasil1024.chatgpt.site');
configuredUrl.protocol='https:';
export const siteUrl=configuredUrl.origin;
