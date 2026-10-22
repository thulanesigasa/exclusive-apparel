import {createHash,createHmac,randomBytes,timingSafeEqual} from 'node:crypto';
import {boundedBody} from './request-body';
import products from '../lib/products.json';
export type WaitlistEnv={DB?:D1Database;WAITLIST_ADMIN_SECRET?:string};
const COOKIE='__Host-exclusive-waitlist-admin';
export const CONSENT_VERSION='launch-notifications-v1';
class Failure extends Error{constructor(public status:number,message:string){super(message);}}
const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Vary':'Cookie'}});
const hash=(value:string)=>createHash('sha256').update(value).digest('hex');
function secret(env:WaitlistEnv){const value=env.WAITLIST_ADMIN_SECRET;if(!value||value.length<32)throw new Failure(503,'Waiting-list management has not been configured.');return value;}
function cookieValue(request:Request){return (request.headers.get('Cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(COOKIE+'='))?.slice(COOKIE.length+1)||'';}
function authorized(request:Request,env:WaitlistEnv){const key=secret(env),parts=cookieValue(request).split('.');if(parts.length!==2||!/^\d{13}-[a-f0-9]{32}$/.test(parts[0])||!/^[a-f0-9]{64}$/.test(parts[1]))return false;const expected=createHmac('sha256',key).update(parts[0]).digest('hex');return timingSafeEqual(Buffer.from(expected),Buffer.from(parts[1]))&&Number(parts[0].split('-')[0])>Date.now();}
function session(response:Response,value:string,age:number){response.headers.set('Set-Cookie',`${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`);return response;}
async function jsonBody(request:Request){if(!request.headers.get('Content-Type')?.startsWith('application/json'))throw new Failure(415,'Send JSON form data.');let bytes:Uint8Array;try{bytes=await boundedBody(request,16384);}catch{throw new Failure(413,'The form is too large.');}let data:any;try{data=JSON.parse(new TextDecoder().decode(bytes));}catch{throw new Failure(400,'Invalid form data.');}if(!data||typeof data!=='object'||Array.isArray(data))throw new Failure(400,'Complete the form.');return data;}
async function limit(db:D1Database,key:string,max:number,windowMs:number){const bucket=Math.floor(Date.now()/windowMs);const result=await db.prepare('INSERT INTO rate_limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(`waitlist:${key}:${bucket}`,Date.now()+windowMs).first<{count:number}>();if((result?.count||0)>max)throw new Failure(429,'Too many attempts. Please try again later.');await db.prepare('DELETE FROM rate_limits WHERE expires<?').bind(Date.now()).run();}
function pagination(url:URL){const integer=(name:string,fallback:number,max:number)=>{const value=Number(url.searchParams.get(name)??fallback);if(!Number.isSafeInteger(value)||value<0)throw new Failure(400,'Invalid page.');return Math.min(max,value);};return {limit:Math.max(1,integer('limit',50,100)),offset:integer('offset',0,1000000)};}
const csvCell=(value:unknown)=>{let text=String(value??'');if(/^[\s]*[=+\-@]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';};
export async function waitlist(request:Request,env:WaitlistEnv):Promise<Response|null>{const url=new URL(request.url),path=url.pathname.replace(/\/$/,'');if(path!=='/api/waitlist'&&!path.startsWith('/api/waitlist/admin'))return null;try{
 if(request.method!=='GET'&&request.headers.get('Origin')!==url.origin)throw new Failure(403,'Invalid request origin.');
 if(!env.DB)throw new Failure(503,'The waiting list is temporarily unavailable. Please try again later.');const db=env.DB,ip=hash(request.headers.get('cf-connecting-ip')||'unavailable');
 if(path==='/api/waitlist'&&request.method==='POST'){
  await limit(db,'signup-ip:'+ip,10,10*60*1000);const data=await jsonBody(request);
  const accepted=()=>reply({accepted:true,message:'Thank you. If this email is not already on the list, it has now been added. No order or payment has been created.'},202);
  if(typeof data.website==='string'&&data.website.trim())return accepted();
  if(typeof data.email!=='string'||data.email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))throw new Failure(400,'Enter a valid email address.');const email=data.email.trim().toLowerCase();
  if(data.consent!==true)throw new Failure(400,'Please agree to receive launch notifications.');
  const name=typeof data.name==='string'?data.name.trim():'';if(name.length>100||/[\x00-\x1f\x7f]/.test(name))throw new Failure(400,'Enter a name of up to 100 characters.');
  const interest=data.interest??'Everyone';if(!['Everyone','Men','Women','Kids'].includes(interest))throw new Failure(400,'Choose a valid collection.');
  const productId=data.productId??'';if(typeof productId!=='string'||productId&&!products.some(p=>p.id===productId))throw new Failure(400,'Choose an item from the collection.');
  await limit(db,'signup-email:'+hash(email),3,60*60*1000);
  await db.prepare('INSERT INTO waitlist_signups(id,email,name,interest,product_id,consent_version,created_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(email) DO NOTHING').bind(crypto.randomUUID(),email,name,interest,productId,CONSENT_VERSION,new Date().toISOString()).run();return accepted();
 }
 if(path==='/api/waitlist/admin/session'&&request.method==='POST'){
  await limit(db,'admin-login:'+ip,5,15*60*1000);const data=await jsonBody(request),expected=secret(env);if(typeof data.password!=='string'||data.password.length>1024||!timingSafeEqual(Buffer.from(hash(data.password)),Buffer.from(hash(expected))))throw new Failure(401,'Incorrect management password.');
  const payload=`${Date.now()+60*60*1000}-${randomBytes(16).toString('hex')}`,signature=createHmac('sha256',expected).update(payload).digest('hex');return session(reply({authorized:true}),payload+'.'+signature,3600);
 }
 if(path==='/api/waitlist/admin/session'&&request.method==='DELETE')return session(reply({authorized:false}),'',0);
 if(!authorized(request,env))throw new Failure(401,'Sign in to manage the waiting list.');
 if(path==='/api/waitlist/admin/messages'&&request.method==='GET'){const rows=await db.prepare('SELECT id,name,email,kind,message,created_at FROM support_requests ORDER BY created_at DESC LIMIT 100').all();return reply({messages:rows.results});}
 if(path==='/api/waitlist/admin/session'&&request.method==='GET')return reply({authorized:true});
 if((path==='/api/waitlist/admin'||path==='/api/waitlist/admin/export')&&request.method==='GET'){
  const {limit,offset}=pagination(url);const [rows,counts]=await Promise.all([db.prepare('SELECT id,email,name,interest,product_id,consent_version,created_at FROM waitlist_signups ORDER BY created_at DESC,id DESC LIMIT ? OFFSET ?').bind(limit,offset).all(),db.prepare('SELECT COUNT(*) AS total,COALESCE(SUM(CASE WHEN created_at>=? THEN 1 ELSE 0 END),0) AS recent FROM waitlist_signups').bind(new Date(Date.now()-7*86400000).toISOString()).first<{total:number;recent:number}>()]);
  if(path.endsWith('/export')){const fields=['email','name','interest','product_id','created_at','consent_version'];const csv=[fields.map(csvCell).join(','),...rows.results.map((row:any)=>fields.map(field=>csvCell(row[field])).join(','))].join('\r\n');return new Response('\ufeff'+csv,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="exclusive-apparel-waitlist-page.csv"','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}
  return reply({signups:rows.results,total:counts?.total||0,recent:counts?.recent||0,limit,offset});
 }
 if(/^\/api\/waitlist\/admin\/[a-f0-9-]{36}$/.test(path)&&request.method==='DELETE'){await db.prepare('DELETE FROM waitlist_signups WHERE id=?').bind(path.split('/').pop()).run();return reply({removed:true});}
 throw new Failure(405,'This waiting-list action is not available.');
 }catch(error){if(error instanceof Failure){const response=reply({error:error.message},error.status);if(error.status===429)response.headers.set('Retry-After','900');return response;}console.error('Waiting-list request failed');return reply({error:'The waiting list is temporarily unavailable. Please try again later.'},503);}}
