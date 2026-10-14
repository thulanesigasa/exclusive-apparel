import {env} from 'cloudflare:workers';
import {cache} from 'react';
import {defaultSettings} from '@/lib/store-types';
export const seoState=cache(async()=>{const row=env.DB?await env.DB.prepare("SELECT data FROM settings WHERE id='store'").first<{data:string}>():null;const settings=row?{...defaultSettings,...JSON.parse(row.data)}:defaultSettings;const live=!!(settings.live&&settings.policiesApproved&&settings.legalName&&settings.email&&settings.phone&&settings.address&&env.STORE_MODE==='live'&&env.PAYFAST_MERCHANT_ID&&env.PAYFAST_MERCHANT_KEY&&env.PAYFAST_PASSPHRASE&&env.RESEND_API_KEY&&env.EMAIL_FROM);return {settings,live};});
