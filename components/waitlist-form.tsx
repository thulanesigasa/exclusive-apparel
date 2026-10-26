'use client';
import {useId,useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight,Check} from 'lucide-react';
import {WAITLIST_MESSAGE} from '../lib/waitlist-copy';
import {countries,genders,ageBands,normalizePhone} from '../lib/waitlist-demographics';
export function WaitlistForm({productId='',productName=''}:{productId?:string;productName?:string}){
 const id=useId(),[busy,setBusy]=useState(false),[done,setDone]=useState(false),[error,setError]=useState(''),[country,setCountry]=useState('ZA'),[phone,setPhone]=useState(''),[age,setAge]=useState('');
 let formatted='';try{if(phone)formatted=normalizePhone(phone,country).phone;}catch{}
 const minor=['0-12','13-17'].includes(age);
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy)return;const form=event.currentTarget,data=new FormData(form);setBusy(true);setError('');
  try{
   const normalized=normalizePhone(phone,country);
   const response=await fetch('/api/waitlist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:data.get('email'),name:data.get('name'),surname:data.get('surname'),phone:normalized.phone,country,gender:data.get('gender'),ageBand:age,adultContact:data.get('adultContact')==='on',guardian:data.get('guardian')==='on',interest:data.get('interest'),website:data.get('website'),consent:data.get('consent')==='on',productId}),signal:AbortSignal.timeout(20000)});
   const result:any=await response.json();if(!response.ok)throw new Error(result.error||'Please try again.');setDone(true);form.reset();
  }catch(error){setError(error instanceof Error&&error.name==='TimeoutError'?'That took too long. Please try again; your email will only be added once.':error instanceof Error?error.message:'Please try again.');}finally{setBusy(false);}
 }
 if(done)return <div className="waitlist-success" role="status" tabIndex={-1}><Check size={30}/><h3>You’re on our radar.</h3><p>Thank you. If your email wasn’t already on the list, it has now been added. New signups receive a confirmation email. When our daily allowance is reached, confirmations are queued for a following day in signup order. Your place is already saved.</p><p>Check your spam folder too. No account, order or payment has been created.</p><Link className="text-link" href="/shop/">Keep exploring ↗</Link></div>;
 return <form className="waitlist-form" onSubmit={submit} aria-describedby={error?`${id}-error`:`${id}-privacy`} aria-busy={busy}>
  {productName&&<p className="waitlist-interest">Your pick: <strong>{productName}</strong></p>}
  <p className="waitlist-privacy">Use your own adult contact details. If you’re shopping for a child, a parent or guardian should complete this form.</p>
  <div className="waitlist-fields">
   <label htmlFor={`${id}-name`}>First name<input id={`${id}-name`} name="name" required autoComplete="given-name" maxLength={100} placeholder="Your first name" disabled={busy}/></label>
   <label htmlFor={`${id}-surname`}>Surname<input id={`${id}-surname`} name="surname" required autoComplete="family-name" maxLength={100} placeholder="Your surname" disabled={busy}/></label>
   <label htmlFor={`${id}-country`}>Phone country / calling code<select id={`${id}-country`} name="country" value={country} onChange={e=>setCountry(e.target.value)} disabled={busy}>{countries.map(c=><option key={c.iso} value={c.iso}>{c.name} (+{c.code})</option>)}</select></label>
   <label htmlFor={`${id}-phone`}>Cellphone number<input id={`${id}-phone`} name="phone" type="tel" inputMode="tel" required autoComplete="tel-national" maxLength={40} value={phone} onChange={e=>setPhone(e.target.value)} placeholder={country==='ZA'?'082 123 4567':'Your cellphone number'} aria-describedby={`${id}-phone-help`} disabled={busy}/></label>
  </div>
  <p id={`${id}-phone-help`} className="waitlist-privacy" aria-live="polite">{formatted?`We’ll save: ${formatted}`:'We format your number with the selected country code and remove a local dialling zero where appropriate.'}</p>
  <label htmlFor={`${id}-email`}>Email address<input id={`${id}-email`} name="email" type="email" required autoComplete="email" maxLength={254} placeholder="you@example.com" disabled={busy}/></label>
  <fieldset className="waitlist-demographics"><legend>Who are you shopping for? <span>(optional)</span></legend><p className="waitlist-privacy">Tell us about the intended wearer so we can plan our collection. For children, use your contact details above and their age range here. No child’s name or exact birthday is needed.</p><div className="waitlist-fields">
   <label htmlFor={`${id}-gender`}>Gender<select id={`${id}-gender`} name="gender" defaultValue="" disabled={busy}><option value="">Not provided</option>{genders.map(g=><option key={g}>{g}</option>)}</select></label>
   <label htmlFor={`${id}-age`}>Age range<select id={`${id}-age`} name="ageBand" value={age} onChange={e=>setAge(e.target.value)} disabled={busy}><option value="">Not provided</option>{ageBands.map(a=><option key={a.value} value={a.value}>{a.label}</option>)}</select></label>
  </div></fieldset>
  <label htmlFor={`${id}-interest`}>What are you looking forward to?<select id={`${id}-interest`} name="interest" defaultValue="Everyone" disabled={busy}><option value="Everyone">A bit of everything</option><option value="Men">Men’s collection</option><option value="Women">Women’s collection</option><option value="Kids">Kids’ collection</option></select></label>
  <p className="waitlist-privacy"><strong>Your message</strong><br/>{WAITLIST_MESSAGE}</p>
  <div className="waitlist-honeypot" aria-hidden="true"><label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
  <label className="waitlist-consent"><input type="checkbox" name="adultContact" required disabled={busy}/><span>I am 18 or older and these are my own contact details.</span></label>
  {minor&&<label className="waitlist-consent"><input type="checkbox" name="guardian" required disabled={busy}/><span>I am the parent or guardian joining for this child.</span></label>}
  <label className="waitlist-consent"><input type="checkbox" name="consent" required disabled={busy}/><span>I agree to receive Exclusive Apparel launch and availability updates by email.</span></label>
  <p id={`${id}-privacy`} className="waitlist-privacy">We save your signup securely and send your contact request to our team using FormSubmit. Resend sends your confirmation. Optional gender and age details stay in our database for collection planning. No promotional calls or SMS. See our <Link href="/privacy/">privacy policy</Link>. Ask to leave through <Link href="/contact/">Contact us</Link>. Joining is free and doesn’t reserve an item.</p>
  {error&&<p id={`${id}-error`} className="error" role="alert">{error}</p>}<button className="button dark waitlist-submit" disabled={busy} type="submit">{busy?'Adding you…':'Join the waiting list'}<ArrowUpRight size={18}/></button>
 </form>;
}
