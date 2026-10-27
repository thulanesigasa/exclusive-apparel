import {getCountries,getCountryCallingCode,parsePhoneNumberFromString,type CountryCode} from 'libphonenumber-js/min';
const names=new Intl.DisplayNames(['en'],{type:'region'});
export const countries=getCountries().map(iso=>({iso,name:names.of(iso)||iso,code:getCountryCallingCode(iso)})).sort((a,b)=>a.iso==='ZA'?-1:b.iso==='ZA'?1:a.name.localeCompare(b.name));
export const genders=['Female','Male','Prefer not to say'] as const;
export const ageBands=[{value:'0-12',label:'12 and under'},{value:'13-17',label:'13–17'},{value:'18-19',label:'18–19'},{value:'20-23',label:'20–23'},{value:'24+',label:'24 and over'}];
export function normalizePhone(raw:unknown,country:unknown){
 if(typeof raw!=='string'||raw.length>40||!/^[+\d\s()-]+$/.test(raw)||typeof country!=='string'||!countries.some(c=>c.iso===country))throw new Error('Select your phone country and enter a valid cellphone number.');
 const clean=raw.trim().replace(/^00/,'+');const phone=parsePhoneNumberFromString(clean,country as CountryCode);
 if(!phone?.isValid()||phone.ext||phone.country!==country)throw new Error('Check your cellphone number and selected country code.');
 return {phone:phone.number,country_iso:country,calling_code:phone.countryCallingCode};
}
export function demographicFields(data:Record<string,unknown>){
 const gender=data.gender??'',age_band=data.ageBand??'';
 if(typeof gender!=='string'||gender!==''&&!genders.includes(gender as typeof genders[number]))throw new Error('Select a valid gender option.');
 if(typeof age_band!=='string'||age_band!==''&&!ageBands.some(a=>a.value===age_band))throw new Error('Select a valid age range.');
 if(data.adultContact!==true)throw new Error('An adult must provide their own contact details to join.');
 const guardian=data.guardian===true;
 if(['0-12','13-17'].includes(age_band)&&!guardian)throw new Error('A parent or guardian must confirm joining for a child.');
 return {gender,age_band,adult_contact:true,guardian};
}
