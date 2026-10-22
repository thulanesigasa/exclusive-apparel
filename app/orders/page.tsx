import {PRELAUNCH} from '@/lib/launch';
import {redirect} from 'next/navigation';
import {Suspense} from 'react';
import {OrderStatus} from '@/components/order-status';
export const metadata={title:'Track your order',description:'View your private order status, tracking reference and size-exchange requests.'};
export default function Orders(){if(PRELAUNCH)redirect('/waitlist/');return <Suspense fallback={<p>Loading order…</p>}><OrderStatus/></Suspense>;}
