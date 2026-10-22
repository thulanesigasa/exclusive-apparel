import {PRELAUNCH} from '@/lib/launch';
import {redirect} from 'next/navigation';
import {CheckoutView} from '@/components/checkout-view';
export const metadata={title:'Guest checkout',description:'Use guest checkout to review your items, delivery method and final order total.'};
export default function Checkout(){if(PRELAUNCH)redirect('/waitlist/');return <CheckoutView/>;}
