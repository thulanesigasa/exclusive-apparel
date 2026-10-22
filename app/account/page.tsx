import {PRELAUNCH} from '@/lib/launch';
import {redirect} from 'next/navigation';
import {CustomerAccount} from '@/components/customer-account';
export const metadata={title:'Your account | Exclusive Apparel',description:'Create a verified customer account, sign in or reset your password. Guest checkout is always available.'};
export default function Account(){if(PRELAUNCH)redirect('/waitlist/');return <CustomerAccount/>;}
