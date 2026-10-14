import {Suspense} from 'react';
import {OrderStatus} from '@/components/order-status';
export const metadata={title:'Track your order',robots:{index:false,follow:false}};
export default function Orders(){return <Suspense fallback={<p>Loading order…</p>}><OrderStatus/></Suspense>;}
