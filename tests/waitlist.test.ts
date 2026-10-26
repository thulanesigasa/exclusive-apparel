import {test,before,after,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {waitlist} from '../server/waitlist';
import {waitingListConfirmation,sendWaitlistEmails,formsubmitNotification} from '../server/waitlist-email';
import {normalizePhone,demographicFields} from '../lib/waitlist-demographics';
import {prelaunchResponse} from '../server/prelaunch';
const db=new PGlite();const originalFetch=globalThis.fetch;
const env={SUPABASE_URL:'https://database.example.test',SUPABASE_SERVICE_ROLE_KEY:'sb_secret_test',WAITLIST_ADMIN_SECRET:'private-management-secret-over-thirty-two-characters',WAITLIST_SITE_URL:'https://exclusive-apparel.co.za'};
const signup=(email='buyer@example.test')=>({email,name:'Buyer',surname:'Example',phone:'082 123 4567',country:'ZA',gender:'Female',ageBand:'20-23',adultContact:true,guardian:false,interest:'Women',productId:'boxy-tee',consent:true,website:''});
async function rpc(action:string,data:Record<string,unknown>={}){return (await db.query<{result:any}>('select public.ea_waitlist_service($1,$2::jsonb) result',[action,JSON.stringify(data)])).rows[0].result;}
async function sql(query:string,args:any[]=[]){return (await db.query<any>(query,args)).rows;}
before(async()=>{
 await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
 await db.exec(readFileSync('supabase/migrations/20261026162545_waitlist_demographics_and_delivery.sql','utf8'));
 globalThis.fetch=(async(input:RequestInfo|URL,init?:RequestInit)=>{
  const url=String(input);assert.equal(url,'https://database.example.test/rest/v1/rpc/ea_waitlist_service');assert.equal(new Headers(init?.headers).get('apikey'),env.SUPABASE_SERVICE_ROLE_KEY);
  const {action,data}=JSON.parse(init!.body as string);try{return Response.json(await rpc(action,data));}catch{return Response.json({error:'database failure'},{status:500});}
 }) as typeof fetch;
});
after(async()=>{globalThis.fetch=originalFetch;await db.close();});
beforeEach(async()=>{await db.exec("reset role;truncate public.ea_waitlist_signups,public.ea_waitlist_jobs,public.ea_waitlist_budget,public.ea_waitlist_limits restart identity cascade;update public.ea_waitlist_control set paused_until='-infinity',next_request_at='-infinity';set role service_role;");});
async function call(path='/api/waitlist',method='POST',data:any=signup(),headers:Record<string,string>={},config=env){const response=(await waitlist(new Request('https://store.test'+path,{method,headers:{Origin:'https://store.test','Content-Type':'application/json','cf-connecting-ip':'192.0.2.1',...headers},...(method==='GET'?{}:{body:JSON.stringify(data)})}),config))!;return {response,data:response.headers.get('Content-Type')?.includes('application/json')?await response.clone().json() as any:await response.clone().text()};}
async function login(){const result=await call('/api/waitlist/admin/session','POST',{password:env.WAITLIST_ADMIN_SECRET});assert.equal(result.response.status,200);return result.response.headers.get('Set-Cookie')!.split(';')[0];}
async function enqueue(index:number,changes:Record<string,unknown>={}){const person={name:'Buyer',surname:`Person ${index}`,email:`person${index}@example.test`,phone:'+27821234567',interest:'Everyone',productId:''};await rpc('signup',{...person,...normalizePhone(person.phone,'ZA'),gender:'Female',age_band:'24+',adult_contact:true,guardian:false,product_id:'',consent_version:'launch-notifications-v3',confirmation:waitingListConfirmation(person),notification:formsubmitNotification(person),...changes});}
async function unlock(){await db.exec("update public.ea_waitlist_control set next_request_at='-infinity'");}

test('normalizes domestic/international phones and rejects mismatched country and invalid input',()=>{
 for(const phone of ['0821234567','+27 82 123 4567','0027821234567'])assert.equal(normalizePhone(phone,'ZA').phone,'+27821234567');
 assert.equal(normalizePhone('0772123456','ZW').phone,'+263772123456');assert.equal(normalizePhone('020 7946 0018','GB').phone,'+442079460018');
 assert.throws(()=>normalizePhone('+263772123456','ZA'));assert.throws(()=>normalizePhone('123','ZA'));assert.throws(()=>normalizePhone('<script>','ZA'));assert.throws(()=>normalizePhone('0821234567','XX'));
});
test('age groups do not overlap; optional demographics and guardian confirmations are validated',()=>{
 assert.deepEqual(demographicFields({adultContact:true}),{gender:'',age_band:'',adult_contact:true,guardian:false});
 assert.throws(()=>demographicFields({adultContact:true,ageBand:'13-17'}));assert.throws(()=>demographicFields({adultContact:false}));assert.throws(()=>demographicFields({adultContact:true,ageBand:'18-20'}));assert.throws(()=>demographicFields({adultContact:true,gender:'injected'}));
 assert.equal(demographicFields({adultContact:true,ageBand:'0-12',guardian:true}).guardian,true);
});
test('signup atomically saves normalized data and two distinct providers without revealing duplicates',async()=>{
 const first=await call(undefined,undefined,signup('Buyer@Example.Test'));const duplicate=await call(undefined,undefined,{...signup(),name:'Overwrite'});assert.equal(first.response.status,202);assert.deepEqual(first.data,duplicate.data);
 const [row]=await sql('select * from public.ea_waitlist_signups');assert.equal(row.email,'buyer@example.test');assert.equal(row.name,'Buyer');assert.equal(row.phone,'+27821234567');assert.equal(row.country_iso,'ZA');assert.equal(row.gender,'Female');assert.equal(row.age_band,'20-23');assert.equal(row.consent_version,'launch-notifications-v3');
 const jobs=await sql('select provider,payload from public.ea_waitlist_jobs order by provider');assert.equal(jobs.length,2);assert.equal(jobs[0].payload._subject,'Join Waiting List - Buyer Example');assert.deepEqual(jobs[1].payload.to,['buyer@example.test']);assert.ok(!('gender' in jobs[0].payload));assert.ok(!JSON.stringify(first.data).includes(row.email));
});
test('public form validates consent, guardian, email, body size, country, product, content type and origin',async()=>{
 for(const change of [{consent:false},{adultContact:false},{ageBand:'0-12'},{email:'x@@a.test'},{country:'XX'},{productId:'heavyweight-tee'},{surname:'x\r\nBcc:attack'},{phone:'abc'}])assert.equal((await call(undefined,undefined,{...signup(),...change})).response.status,400);
 assert.equal((await call(undefined,undefined,signup(),{Origin:'https://attacker.test'})).response.status,403);
 assert.equal((await call(undefined,undefined,signup(),{'Content-Type':'text/plain'})).response.status,415);
 assert.equal((await call(undefined,undefined,{...signup(),name:'x'.repeat(17000)},{'cf-connecting-ip':'192.0.2.2'})).response.status,413);
 assert.equal((await call(undefined,undefined,{...signup(),website:'spam.test'},{'cf-connecting-ip':'192.0.2.3'})).response.status,202);
 assert.equal((await sql('select count(*) n from public.ea_waitlist_signups'))[0].n,0);
 assert.equal((await call(undefined,undefined,signup(),{}, {...env,SUPABASE_SERVICE_ROLE_KEY:''})).response.status,503);
});
test('persistent rate limits use hashed identifiers and duplicate submissions cannot overwrite data',async()=>{
 await Promise.all([call(),call()]);assert.equal((await sql('select count(*) n from public.ea_waitlist_signups'))[0].n,1);
 await call();assert.equal((await call()).response.status,429);
 for(let i=0;i<6;i++)await call(undefined,undefined,signup(`other${i}@example.test`));assert.equal((await call(undefined,undefined,signup('extra@example.test'))).response.status,429);
 const keys=JSON.stringify(await sql('select key from public.ea_waitlist_limits'));assert.ok(!keys.includes('@'));assert.ok(!keys.includes('192.0.2.1'));
});
test('management rejects forged headers, wrong passwords, tampered sessions and rotated secrets',async()=>{
 assert.equal((await call('/api/waitlist/admin','GET',undefined,{'oai-authenticated-user-email':'owner@test'})).response.status,401);
 assert.equal((await call('/api/waitlist/admin/session','POST',{password:'wrong'})).response.status,401);
 const response=await call('/api/waitlist/admin/session','POST',{password:env.WAITLIST_ADMIN_SECRET});const full=response.response.headers.get('Set-Cookie')!;assert.match(full,/HttpOnly; Secure; SameSite=Strict/);const Cookie=full.split(';')[0];
 assert.equal((await call('/api/waitlist/admin','GET',undefined,{Cookie})).response.status,200);assert.equal((await call('/api/waitlist/admin','GET',undefined,{Cookie:Cookie+'x'})).response.status,401);
 assert.equal((await call('/api/waitlist/admin','GET',undefined,{Cookie},{...env,WAITLIST_ADMIN_SECRET:'other-secret-over-thirty-two-characters'})).response.status,401);
 assert.match((await call('/api/waitlist/admin/session','DELETE',{})).response.headers.get('Set-Cookie')!,/Max-Age=0/);
});
test('filtered statistics span all pages and CSV includes demographics without exposing job payloads',async()=>{
 await enqueue(1);await enqueue(2,{country_iso:'ZW',calling_code:'263',phone:'+263772123456',gender:'Male',age_band:'18-19'});await enqueue(3,{name:'=SUM(1,1)'});
 const Cookie=await login();const result=await call('/api/waitlist/admin?country=ZA&limit=1','GET',undefined,{Cookie});assert.equal(result.data.total,2);assert.equal(result.data.allTotal,3);assert.equal(result.data.signups.length,1);assert.equal(result.data.genders[0].count,2);assert.equal(result.data.signups[0].payload,undefined);assert.equal(result.data.signups[0].number,3);
 const filtered=await call('/api/waitlist/admin?country=ZW&gender=Male&age=18-19','GET',undefined,{Cookie});assert.equal(filtered.data.total,1);assert.equal(filtered.data.countries[0].label,'ZW');
 const csv=await call('/api/waitlist/admin/export?country=ZA','GET',undefined,{Cookie});assert.ok(csv.data.includes('"country_iso"'));assert.ok(csv.data.includes('"\'=SUM(1,1)"'));assert.ok(!csv.data.includes('person2@example.test'));assert.equal(csv.response.headers.get('Cache-Control'),'private, no-store');
 assert.equal((await call('/api/waitlist/admin?country=INVALID','GET',undefined,{Cookie})).response.status,400);
});
test('signup deletion cascades queued provider messages without refunding reserved allowance',async()=>{
 await enqueue(1);const job=await rpc('claim',{provider:'resend'});const Cookie=await login();await call(`/api/waitlist/admin/${job.signup_id}`,'DELETE',{}, {Cookie});assert.equal((await sql('select count(*) n from public.ea_waitlist_jobs'))[0].n,0);assert.equal((await sql('select reserved from public.ea_waitlist_budget'))[0].reserved,1);
});
test('Postgres grants and RLS block anon/authenticated access to contact records and privileged RPC',async()=>{
 await enqueue(1);
 for(const role of ['anon','authenticated']){
  await db.exec(`reset role;set role ${role}`);
  await assert.rejects(sql('select * from public.ea_waitlist_signups'),/permission denied/);await assert.rejects(rpc('list'),/permission denied/);
 }
 await db.exec('reset role;set role service_role');
 const tables=await sql("select relrowsecurity,relforcerowsecurity from pg_class where relname like 'ea_waitlist_%' and relkind='r'");assert.equal(tables.length,5);assert.ok(tables.every(r=>r.relrowsecurity&&r.relforcerowsecurity));
});
test('transaction rolls back the signup if either queued payload is missing',async()=>{
 await assert.rejects(rpc('signup',{email:'broken@example.test',name:'B',surname:'E',phone:'+27821234567',country_iso:'ZA',calling_code:'27',gender:'',age_band:'',adult_contact:true,guardian:false,interest:'Everyone',product_id:'',consent_version:'v3',confirmation:{}}));assert.equal((await sql('select count(*) n from public.ea_waitlist_signups'))[0].n,0);
});
test('100 confirmations fit the daily quota, overflow waits untouched and resumes next day',async()=>{
 for(let i=0;i<102;i++)await enqueue(i);
 for(let i=0;i<100;i++){await unlock();const job=await rpc('claim',{provider:'resend'});assert.ok(job);await rpc('finish',{id:job.id,lease:job.lease,outcome:'submitted'});}
 await unlock();assert.equal(await rpc('claim',{provider:'resend'}),null);assert.equal((await sql('select reserved from public.ea_waitlist_budget'))[0].reserved,100);
 assert.equal((await sql("select count(*) n from public.ea_waitlist_jobs where provider='resend' and first_attempt is null"))[0].n,2);
 await db.exec("update public.ea_waitlist_budget set day='2000-01-01'");assert.ok(await rpc('claim',{provider:'resend'}));
 await unlock();assert.ok(await rpc('claim',{provider:'formsubmit'}));assert.equal((await sql("select reserved from public.ea_waitlist_budget where day=(now() at time zone 'UTC')::date"))[0].reserved,1);
});
test('competing claims are paced and preserve FIFO and leases prevent stale acknowledgements',async()=>{
 await enqueue(1);await enqueue(2);const jobs=await Promise.all([rpc('claim',{provider:'resend'}),rpc('claim',{provider:'resend'})]);assert.equal(jobs.filter(Boolean).length,1);const job=jobs.find(Boolean);assert.equal(job.payload.to[0],'person1@example.test');
 assert.equal((await rpc('finish',{id:job.id,lease:crypto.randomUUID(),outcome:'submitted'})).updated,false);
});
test('FormSubmit sends the team request; Resend sends one branded customer message',async()=>{
 await enqueue(1);const requests:{url:string;body:any;headers:Headers}[]=[];
 await sendWaitlistEmails({...env,RESEND_API_KEY:'test-resend',FORMSUBMIT_ENABLED:'true'},undefined,(async(url:any,init:RequestInit)=>{requests.push({url:String(url),body:JSON.parse(init.body as string),headers:new Headers(init.headers)});return Response.json(String(url).includes('formsubmit.co')?{success:'true'}:{id:'confirmation-id'});}) as typeof fetch);
 assert.equal(requests.length,2);assert.equal(requests[0].url,'https://formsubmit.co/ajax/1exclusiveapparel%40gmail.com');assert.equal(requests[0].body._subject,'Join Waiting List - Buyer Person 1');assert.equal(requests[0].headers.has('Authorization'),false);
 assert.equal(requests[1].url,'https://api.resend.com/emails');assert.deepEqual(requests[1].body.to,['person1@example.test']);assert.equal(requests[1].body.from,'Exclusive Apparel <noreply@exclusive-apparel.co.za>');assert.ok(requests[1].body.html.includes('/email-logo.png'));assert.ok(requests[1].body.html.includes('Exclusive Apparel × T.s Industries'));assert.ok(requests[1].headers.has('Idempotency-Key'));
 assert.equal((await sql('select reserved from public.ea_waitlist_budget'))[0].reserved,1);
});
test('ambiguous FormSubmit delivery is not blindly retried; Resend retries retain key and payload',async()=>{
 await enqueue(1);const requests:{url:string;body:any;key:string|null}[]=[];
 const send=(async(url:any,init:RequestInit)=>{requests.push({url:String(url),body:init.body,key:new Headers(init.headers).get('Idempotency-Key')});throw new Error('unknown transport outcome');}) as typeof fetch;
 await sendWaitlistEmails({...env,RESEND_API_KEY:'test',FORMSUBMIT_ENABLED:'true'},undefined,send);
 assert.equal((await sql("select status from public.ea_waitlist_jobs where provider='formsubmit'"))[0].status,'review');
 await unlock();await db.exec("update public.ea_waitlist_jobs set next_attempt=now() where provider='resend'");await sendWaitlistEmails({...env,RESEND_API_KEY:'test',FORMSUBMIT_ENABLED:'true'},undefined,send);
 assert.equal(requests.filter(r=>r.url.includes('formsubmit')).length,1);assert.equal(requests[1].body,requests[2].body);assert.equal(requests[1].key,requests[2].key);
 await unlock();await db.exec("update public.ea_waitlist_jobs set first_attempt=now()-interval '24 hours',next_attempt=now() where provider='resend'");assert.equal(await rpc('claim',{provider:'resend'}),null);assert.equal((await sql("select status from public.ea_waitlist_jobs where provider='resend'"))[0].status,'review');
});
test('provider quota failures pause confirmations without marking an untouched signup as delivered',async()=>{
 await enqueue(1);await sendWaitlistEmails({...env,RESEND_API_KEY:'test'},undefined,(async()=>Response.json({name:'daily_quota_exceeded'},{status:429})) as typeof fetch);
 const [row]=await sql("select * from public.ea_waitlist_jobs where provider='resend'");assert.equal(row.status,'pending');assert.equal(row.first_attempt,null);assert.equal(await rpc('claim',{provider:'resend'}),null);
});
test('template escapes customer input and prelaunch continues blocking sales',()=>{
 const person={name:'<img src=x>',surname:'E',phone:'+27821234567',email:'buyer@example.test',interest:'Everyone',productId:''};assert.ok(waitingListConfirmation(person).html!.includes('&lt;img src=x&gt;'));
 for(const path of ['/api/checkout','/api/admin/products','/api/orders'])assert.equal(prelaunchResponse(new Request('https://store.test'+path),{})!.status,409);
});
test('legacy import preserves earlier consent without inventing demographics or resending emails',async()=>{
 const old={email:'old@example.test',name:'Old',surname:'Subscriber',phone:'+263772123456',country_iso:'ZW',calling_code:'263',interest:'Everyone',product_id:'',consent_version:'launch-notifications-v2',created_at:'2026-10-01T12:00:00Z'};
 assert.equal((await rpc('import_legacy',{rows:[old]})).imported,1);assert.equal((await rpc('import_legacy',{rows:[old]})).imported,0);assert.equal((await sql('select count(*) n from public.ea_waitlist_jobs'))[0].n,0);
 const data=await rpc('list');assert.equal(data.signups[0].legacy,true);assert.equal(data.signups[0].adult_contact,false);assert.equal(data.signups[0].gender,'');assert.equal(data.signups[0].email_status,'legacy');assert.equal(data.signups[0].consent_version,'launch-notifications-v2');
});
