// Run against a PRIVATE JSON export; never commit contact records or credentials.
import {readFileSync} from 'node:fs';
import {parsePhoneNumberFromString} from 'libphonenumber-js/min';
const file=process.argv[2],url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!file||!url||!key)throw new Error('Provide export JSON path and server-only SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY environment variables.');
if(new URL(url).protocol!=='https:')throw new Error('Supabase URL must use HTTPS.');
const raw=JSON.parse(readFileSync(file,'utf8'));const input=Array.isArray(raw)&&raw[0]?.results?raw.flatMap(p=>p.results):raw.results||raw;
if(!Array.isArray(input))throw new Error('Expected D1 JSON query results.');
const rows=[],invalid=[];
for(let i=0;i<input.length;i++){
 const row=input[i],phone=parsePhoneNumberFromString(String(row.phone||'').replace(/^00/,'+'));
 if(!phone?.isValid()||!phone.country||!row.email||!row.name||!row.surname||!row.consent_version||!row.created_at){invalid.push(i+1);continue;}
 rows.push({...row,email:String(row.email).trim().toLowerCase(),phone:phone.number,country_iso:phone.country,calling_code:phone.countryCallingCode});
}
// Abort before importing anything rather than silently losing old records.
if(invalid.length)throw new Error(`Review export row numbers ${invalid.join(', ')}: incomplete contact details or invalid phone. No records imported.`);
let total=0;
for(let i=0;i<rows.length;i+=100){const response=await fetch(new URL('/rest/v1/rpc/ea_waitlist_service',url),{method:'POST',headers:{apikey:key,...(key.startsWith('eyJ')?{Authorization:`Bearer ${key}`}:{}) ,'Content-Type':'application/json'},body:JSON.stringify({action:'import_legacy',data:{rows:rows.slice(i,i+100)}}),signal:AbortSignal.timeout(20000)});if(!response.ok)throw new Error('Import failed. Previously completed batches are safe to rerun.');total+=(await response.json()).imported;}
console.log(`Imported ${total} entries without generating emails. Existing emails were preserved. Keep the D1 source backup until verified.`);
