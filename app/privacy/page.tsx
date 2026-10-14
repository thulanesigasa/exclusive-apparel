import {pageMetadata} from '@/lib/metadata';
import {SupportPage} from '@/components/support-page';
export const metadata=pageMetadata('/privacy/');
export default function Page(){return <SupportPage kind='privacy'/>;}
