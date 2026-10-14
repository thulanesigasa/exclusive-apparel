import {jsonLd} from '@/lib/seo.mjs';
export function StructuredData({data}:{data:unknown}){return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(data)}}/>;}
