import {PRELAUNCH} from '@/lib/launch';
import {WaitlistAdmin} from '@/components/waitlist-admin';
import {AdminDashboard} from '@/components/admin-dashboard';
import {env} from 'cloudflare:workers';
import {getChatGPTUser,chatGPTSignInPath} from '../chatgpt-auth';
export const dynamic='force-dynamic';
export const metadata={title:'Store management',description:'Authorised owner access to Exclusive Apparel products, stock, orders and support.'};
export default async function Admin(){if(PRELAUNCH)return <WaitlistAdmin/>;const user=await getChatGPTUser();const owners=(env.ADMIN_EMAILS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);if(!user||!owners.includes(user.email.toLowerCase()))return <section className="section prose"><h1>Store management.</h1><p>This area is restricted to the authorised store owner. Customer accounts do not provide admin access.</p>{!user&&<a className="button dark" href={chatGPTSignInPath('/admin/')} target="_top">Owner sign in</a>}<a className="text-link" href="/">Return to the store ↗</a></section>;return <AdminDashboard/>;}
