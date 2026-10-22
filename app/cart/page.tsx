import {PRELAUNCH} from '@/lib/launch';
import {redirect} from 'next/navigation';
import {CartView} from '@/components/cart-view';
export const metadata={title:'Your shopping bag',description:'Review the apparel variants and quantities in your Exclusive Apparel shopping bag.'};
export default function Cart(){if(PRELAUNCH)redirect('/waitlist/');return <CartView/>;}
