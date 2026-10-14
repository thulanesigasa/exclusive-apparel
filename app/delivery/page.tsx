import {pageMetadata} from '@/lib/metadata';
import {SupportPage} from '@/components/support-page';
export const metadata=pageMetadata('/delivery/');
export default function Page(){return <SupportPage kind='delivery'/>;}
