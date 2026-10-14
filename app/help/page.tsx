import {pageMetadata} from '@/lib/metadata';
import {SupportPage} from '@/components/support-page';
export const metadata=pageMetadata('/help/');
export default function Page(){return <SupportPage kind='help'/>;}
