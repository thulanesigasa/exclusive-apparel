import {waitlistRpc,hasWaitlistStore} from './waitlist-store';
import {normalizePhone,demographicFields,countries,genders,ageBands} from '../lib/waitlist-demographics';
import {waitingListConfirmation,sendWaitlistEmails,formsubmitNotification,type WaitlistEmailEnv} from './waitlist-email';
import {createHash,createHmac,randomBytes,timingSafeEqual} from 'node:crypto';
import {boundedBody} from './request-body';
import products from '../lib/products.json';
import {waitlistWorkbook} from './waitlist-workbook';
export type WaitlistEnv=WaitlistEmailEnv & {WAITLIST_ADMIN_SECRET?:string};
const COOKIE='__Host-exclusive-waitlist-admin';
export const CONSENT_VERSION='launch-notifications-v3';
class Failure extends Error{constructor(public status:number,message:string){super(message);}}
const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Vary':'Cookie'}});
const hash=(value:string)=>createHash('sha256').update(value).digest('hex');
function secret(env:WaitlistEnv){const value=env.WAITLIST_ADMIN_SECRET;if(!value||value.length<32)throw new Failure(503,'Waiting-list management has not been configured.');return value;}
function cookieValue(request:Request){return (request.headers.get('Cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(COOKIE+'='))?.slice(COOKIE.length+1)||'';}
function authorized(request:Request,env:WaitlistEnv){const key=secret(env),parts=cookieValue(request).split('.');if(parts.length!==2||!/^\d{13}-[a-f0-9]{32}$/.test(parts[0])||!/^[a-f0-9]{64}$/.test(parts[1]))return false;const expected=createHmac('sha256',key).update(parts[0]).digest('hex');return timingSafeEqual(Buffer.from(expected),Buffer.from(parts[1]))&&Number(parts[0].split('-')[0])>Date.now();}
function session(response:Response,value:string,age:number){response.headers.set('Set-Cookie',`${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`);return response;}
async function jsonBody(request:Request){if(!request.headers.get('Content-Type')?.startsWith('application/json'))throw new Failure(415,'Send JSON form data.');let bytes:Uint8Array;try{bytes=await boundedBody(request,16384);}catch{throw new Failure(413,'The form is too large.');}let data:any;try{data=JSON.parse(new TextDecoder().decode(bytes));}catch{throw new Failure(400,'Invalid form data.');}if(!data||typeof data!=='object'||Array.isArray(data))throw new Failure(400,'Complete the form.');return data;}
async function limit(env:WaitlistEnv,key:string,max:number,windowMs:number){const bucket=Math.floor(Date.now()/windowMs);const result=await waitlistRpc(env,'rate',{key:`waitlist:${key}:${bucket}`,max,expires:new Date(Date.now()+windowMs).toISOString()});if(!result.allowed)throw new Failure(429,'Too many attempts. Please try again later.');}
function pagination(url:URL){const integer=(name:string,fallback:number,max:number)=>{const value=Number(url.searchParams.get(name)??fallback);if(!Number.isSafeInteger(value)||value<0)throw new Failure(400,'Invalid page.');return Math.min(max,value);};return {limit:Math.max(1,integer('limit',50,100)),offset:integer('offset',0,1000000)};}
const csvCell=(value:unknown)=>{let text=String(value??'');if(/^[\s]*[=+\-@]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';};
export async function waitlist(request:Request,env:WaitlistEnv,background?:(task:Promise<unknown>)=>void):Promise<Response|null>{const url=new URL(request.url),path=url.pathname.replace(/\/$/,'');if(path!=='/api/waitlist'&&!path.startsWith('/api/waitlist/admin'))return null;try{
 if(request.method!=='GET'&&request.headers.get('Origin')!==url.origin)throw new Failure(403,'Invalid request origin.');
 if(!hasWaitlistStore(env))throw new Failure(503,'The waiting list is temporarily unavailable. Please try again later.');const ip=hash(request.headers.get('cf-connecting-ip')||'unavailable');
 if(path==='/api/waitlist'&&request.method==='POST'){
  await limit(env,'signup-ip:'+ip,10,10*60*1000);const data=await jsonBody(request);
  const accepted=()=>reply({accepted:true,message:'Thank you. If this email is not already on the list, it has now been added. No order or payment has been created.'},202);
  if(typeof data.website==='string'&&data.website.trim())return accepted();
  if(typeof data.email!=='string'||data.email.length>254||/[\x00-\x1f\x7f]/.test(data.email)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))throw new Failure(400,'Enter a valid email address.');const email=data.email.trim().toLowerCase();
  if(data.consent!==true)throw new Failure(400,'Please agree to receive launch notifications.');
  const name=typeof data.name==='string'?data.name.trim():'';if(!name||name.length>100||/[\x00-\x1f\x7f]/.test(name))throw new Failure(400,'Enter a name of up to 100 characters.');
  const surname=typeof data.surname==='string'?data.surname.trim():'';if(!surname||surname.length>100||/[\x00-\x1f\x7f]/.test(surname))throw new Failure(400,'Enter your surname (up to 100 characters).');
  let phoneFields,demographics;try{phoneFields=normalizePhone(data.phone,data.country);demographics=demographicFields(data);}catch(error){throw new Failure(400,(error as Error).message);}
  const interest=data.interest??'Everyone';if(!['Everyone','Men','Women','Kids'].includes(interest))throw new Failure(400,'Choose a valid collection.');
  const productId=data.productId??'';if(typeof productId!=='string'||productId&&!products.some(p=>p.id===productId))throw new Failure(400,'Choose an item from the collection.');
  await limit(env,'signup-email:'+hash(email),3,60*60*1000);
  const person={name,surname,phone:phoneFields.phone,email,interest,productId};
  const saved=await waitlistRpc(env,'signup',{email,name,surname,...phoneFields,...demographics,interest,product_id:productId,consent_version:CONSENT_VERSION,confirmation:waitingListConfirmation(person,env.WAITLIST_SITE_URL),notification:formsubmitNotification(person)});
  if(!saved.accepted)return reply({error:'This email address or phone number is already on the waiting list. Contact us if you need to update your details.'},409);
  if(background)background(sendWaitlistEmails(env));return accepted();
 }
 if(path==='/api/waitlist/admin/session'&&request.method==='POST'){
  await limit(env,'admin-login:'+ip,5,15*60*1000);const data=await jsonBody(request),expected=secret(env);if(typeof data.password!=='string'||data.password.length>1024||!timingSafeEqual(Buffer.from(hash(data.password)),Buffer.from(hash(expected))))throw new Failure(401,'Incorrect management password.');
  const payload=`${Date.now()+60*60*1000}-${randomBytes(16).toString('hex')}`,signature=createHmac('sha256',expected).update(payload).digest('hex');return session(reply({authorized:true}),payload+'.'+signature,3600);
 }
 if(path==='/api/waitlist/admin/session'&&request.method==='DELETE')return session(reply({authorized:false}),'',0);
 if(!authorized(request,env))throw new Failure(401,'Sign in to manage the waiting list.');
 if(path==='/api/waitlist/admin/emails/retry'&&request.method==='POST'){await sendWaitlistEmails(env);return reply({processed:true,configured:Boolean(env.RESEND_API_KEY)});}
 if(path==='/api/waitlist/admin/messages'&&request.method==='GET'){if(!env.DB)return reply({messages:[],unavailable:true});const rows=await env.DB.prepare('SELECT id,name,email,kind,message,created_at FROM support_requests ORDER BY created_at DESC LIMIT 100').all();return reply({messages:rows.results});}
 if(path==='/api/waitlist/admin/session'&&request.method==='GET')return reply({authorized:true});
 if((path==='/api/waitlist/admin'||path==='/api/waitlist/admin/export')&&request.method==='GET'){
  const {limit,offset}=pagination(url),country=url.searchParams.get('country')||'',gender=url.searchParams.get('gender')||'',age=url.searchParams.get('age')||'';
  if(country&&!countries.some(c=>c.iso===country)||gender&&!genders.includes(gender as any)||age&&!ageBands.some(a=>a.value===age))throw new Failure(400,'Invalid demographic filter.');
  const data=await waitlistRpc(env,'list',{limit,offset,country,gender,age});
  if(path.endsWith('/export')){if(url.searchParams.get('format')==='xlsx'){const bytes=waitlistWorkbook(data.signups,offset);return new Response(bytes as unknown as BodyInit,{headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':'attachment; filename="exclusive-apparel-waitlist-page.xlsx"','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}const fields=['number','name','surname','phone','country_iso','calling_code','email','gender','age_band','email_status','notification_status','interest','product_id','created_at','consent_version'];const csv=[fields.map(csvCell).join(','),...data.signups.map((row:any,index:number)=>fields.map(field=>csvCell(field==='number'?offset+index+1:row[field])).join(','))].join('\r\n');return new Response('\ufeff'+csv,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="exclusive-apparel-waitlist-page.csv"','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}
  return reply({...data,emailConfigured:Boolean(env.RESEND_API_KEY),formsubmitConfigured:env.FORMSUBMIT_ENABLED==='true'});
 }
 if(/^\/api\/waitlist\/admin\/[a-f0-9-]{36}$/.test(path)&&request.method==='DELETE'){await waitlistRpc(env,'remove',{id:path.split('/').pop()});return reply({removed:true});}
 throw new Failure(405,'This waiting-list action is not available.');
 }catch(error){if(error instanceof Failure){const response=reply({error:error.message},error.status);if(error.status===429)response.headers.set('Retry-After','900');return response;}console.error('Waiting-list request failed');return reply({error:'The waiting list is temporarily unavailable. Please try again later.'},503);}}
