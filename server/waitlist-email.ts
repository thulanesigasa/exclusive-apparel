import {waitlistRpc,hasWaitlistStore,type WaitlistStoreEnv} from './waitlist-store';
export type WaitlistEmailEnv=WaitlistStoreEnv & {DB?:D1Database;RESEND_API_KEY?:string;WAITLIST_SITE_URL?:string;FORMSUBMIT_ENABLED?:string;FORMSUBMIT_TOKEN?:string};
const FROM='Exclusive Apparel <noreply@exclusive-apparel.co.za>';
const OWNER='1exclusiveapparel@gmail.com';
import {WAITLIST_MESSAGE} from '../lib/waitlist-copy';
const escape=(value:string)=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function waitingListConfirmation(person:{name:string;surname:string;phone:string;email:string;interest:string;productId:string},site='https://exclusive-apparel.co.za'){
 const url=new URL(site);if(url.protocol!=='https:')throw new Error('Email website URL must use HTTPS');const origin=url.origin;
 const text=`Hi ${person.name},\n\nYou're on the Exclusive Apparel waiting list. Thank you for being part of what's coming.\n\nWe'll email you as soon as our apparel launches, with collection availability, prices and all the details you need. There's nothing to pay now, and joining does not reserve an item.\n\nKind regards,\nExclusive Apparel × T.s Industries\n\nTo leave the waiting list or correct your details, contact ${OWNER} or visit ${origin}/contact/.`;
 const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#f7f6f2;color:#1c211d;font-family:Arial,Helvetica,sans-serif"><div style="display:none;max-height:0;overflow:hidden">You're on the list. Your everyday is coming.</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:28px 16px"><table role="presentation" width="560" cellspacing="0" cellpadding="0" style="width:100%;max-width:560px;background:#f7f6f2"><tr><td style="padding:32px;background:#1c211d;color:#f7f6f2"><p style="font-size:12px;letter-spacing:3px;margin:0 0 20px">EXCLUSIVE APPAREL</p><h1 style="font-size:38px;line-height:1.1;margin:0">Your everyday.<br>Coming soon.</h1></td></tr><tr><td style="padding:32px;line-height:1.7;font-size:16px"><p>Hi ${escape(person.name)},</p><h2 style="font-size:26px;line-height:1.2">You're on the list.</h2><p>Thank you for joining the Exclusive Apparel waiting list. We’re excited to have you with us.</p><p>We’ll email you as soon as our apparel launches, with collection availability, prices and all the details you need.</p><p style="font-size:14px;color:#6f746d">There’s nothing to pay now. Joining the list does not reserve an item.</p><p style="margin:28px 0"><a href="${escape(origin)}/shop/" style="display:inline-block;padding:14px 24px;background:#1c211d;color:#f7f6f2;text-decoration:none">Explore the collection ↗</a></p><p>Kind regards,<br><strong>Exclusive Apparel × T.s Industries</strong></p><img src="${escape(origin)}/email-logo-transparent.png" alt="Exclusive Apparel" width="112" style="display:block;width:112px;max-width:100%;height:auto;margin-top:20px"></td></tr><tr><td style="padding:24px 32px;background:#d7deca;font-size:12px;line-height:1.6">You received this confirmation because your email was submitted to our waiting list. If this wasn’t you, or you’d like to leave, <a href="${escape(origin)}/contact/" style="color:#1c211d">contact us</a>. <a href="${escape(origin)}/privacy/" style="color:#1c211d">Privacy policy</a>.</td></tr></table></td></tr></table></body></html>`;
 return {from:FROM,to:[person.email],subject:`You're on the list, ${person.name} | Exclusive Apparel`,text,html};
}
// FormSubmit has no documented idempotency guarantee: ambiguous sends require
// review instead of blind retries. Resend retries use the same payload and key.
export async function sendWaitlistEmails(env:WaitlistEmailEnv,_signupId?:string,send:typeof fetch=fetch){
 if(!hasWaitlistStore(env))return;
 for(const provider of ['formsubmit','resend']){
  if(provider==='resend'&&!env.RESEND_API_KEY||provider==='formsubmit'&&env.FORMSUBMIT_ENABLED!=='true')continue;
  for(let i=0;i<4;i++){
   const job=await waitlistRpc(env,'claim',{provider});if(!job)break;
   let outcome='retry';
   try{
    const token=env.FORMSUBMIT_TOKEN?.trim()||OWNER;
    const url=provider==='resend'?'https://api.resend.com/emails':`https://formsubmit.co/ajax/${encodeURIComponent(token)}`;
    const response=await send(url,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',...(provider==='resend'?{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Idempotency-Key':`waitlist/${job.id}`}:{})},body:JSON.stringify(job.payload),signal:AbortSignal.timeout(8000)});
    const result=await response.json() as {id?:string;success?:boolean|string;name?:string};
    if(provider==='resend'){
     if(response.ok&&typeof result.id==='string'&&result.id)outcome='submitted';
     else if(['daily_quota_exceeded','monthly_quota_exceeded'].includes(result.name||''))outcome='quota';
     else if(response.status>=400&&response.status<500&&response.status!==429)outcome='review';
    }else outcome=response.ok&&(result.success===true||result.success==='true')?'submitted':'review';
   }catch{outcome=provider==='formsubmit'?'review':'retry';}
   await waitlistRpc(env,'finish',{id:job.id,lease:job.lease,outcome});
   if(outcome!=='submitted')break;
  }
 }
}
export function formsubmitNotification(person:{name:string;surname:string;phone:string;email:string;interest:string;productId:string}){
 return {name:person.name,surname:person.surname,email:person.email,phone:person.phone,collection:person.interest,preview_item:person.productId||'None selected',message:WAITLIST_MESSAGE,_subject:`Join Waiting List - ${person.name} ${person.surname}`,_replyto:person.email,_template:'table'};
}
