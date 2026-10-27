import {test} from 'node:test';
import assert from 'node:assert/strict';
import {unzipSync,strFromU8} from 'fflate';
import {waitlistWorkbook} from '../server/waitlist-workbook';

test('workbook contains page-specific chart data and treats signup text as text',()=>{
 const bytes=waitlistWorkbook([{name:'=1+1',country_iso:'ZA',gender:'Female',created_at:'2026-10-27T08:00:00Z'},{name:'Other',country_iso:'ZW',gender:'Female',created_at:'2026-10-27T09:00:00Z'}],50);
 const files=unzipSync(bytes),sheet=strFromU8(files['xl/worksheets/sheet2.xml']),overview=strFromU8(files['xl/worksheets/sheet1.xml']);
 assert.match(sheet,/t="inlineStr"><is><t xml:space="preserve">=1\+1/);assert.doesNotMatch(sheet,/<f>/);assert.match(sheet,/<v>51<\/v>/);assert.match(overview,/<v>2<\/v>/);
 for(let i=1;i<=3;i++)assert.ok(files[`xl/charts/chart${i}.xml`]);
});
