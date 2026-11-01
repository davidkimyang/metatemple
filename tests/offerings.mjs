import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'metatemple-offering-')),out=path.join(dir,'offering.mjs');
await build({stdin:{contents:'export * from "./lib/server/paypal";export * from "./lib/offerings";export * from "./lib/offering-i18n";export {languages} from "./lib/i18n";',resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:out,logLevel:'silent'});
const{OFFERINGS,offeringFor,sandboxPayPal,verifiedCapture,offeringText,languages}=await import(pathToFileURL(out).href);
assert.deepEqual(OFFERINGS.map(p=>[p.id,p.value,p.currency]),[['rice-1','1.00','USD'],['rice-5','5.00','USD'],['rice-10','10.00','USD']]);
for(const input of [1,'1','rice-100','rice-1&amount=0.01',null,{id:'rice-1'},'<script>'])assert.equal(offeringFor(input),null);
for(const[locale]of languages){const t=offeringText(locale);assert.equal(Object.keys(t).length,8);for(const value of Object.values(t))assert.ok(value?.trim(),locale);}
const config={enabled:true,environment:'sandbox',clientId:'test-client',clientSecret:'test-secret'},requestId='550e8400-e29b-41d4-a716-446655440000',orderId='TESTORDER123456789',calls=[];
async function mock(url,init){calls.push({url,init});return Response.json(url.endsWith('/token')?{access_token:'test-access'}:{id:orderId,status:'CREATED'});}
for(const change of [{enabled:false},{clientSecret:''},{clientId:''},{environment:'live'}])await assert.rejects(sandboxPayPal({...config,...change},mock).create('rice-1',requestId),/NOT_CONFIGURED/);
assert.equal(calls.length,0,'Disabled or incomplete configuration must make no external requests');
const api=sandboxPayPal(config,mock);
for(const value of ['rice-0',1,null])await assert.rejects(api.create(value,requestId),/INVALID_OFFERING/);
await assert.rejects(api.create('rice-1','bad'),/REQUEST_ID/);await assert.rejects(api.capture('../bad',requestId),/ORDER/);
assert.equal(calls.length,0);
await api.create('rice-5',requestId);await api.create('rice-5',requestId);
for(const call of calls)assert.ok(call.url.startsWith('https://api-m.sandbox.paypal.com/'));
const posts=calls.filter(c=>c.url.endsWith('/orders'));assert.equal(posts.length,2);
for(const call of posts){assert.equal(call.init.headers['PayPal-Request-Id'],requestId);const body=JSON.parse(call.init.body);assert.equal(body.purchase_units[0].amount.value,'5.00');assert.equal(body.purchase_units[0].amount.currency_code,'USD');}
await assert.rejects(sandboxPayPal(config,async()=>Response.json({error:'invalid_client'},{status:401})).create('rice-1',requestId),/AUTH_FAILED/);
await assert.rejects(sandboxPayPal(config,async url=>Response.json(url.endsWith('/token')?{access_token:'test'}:{error:'declined'},{status:url.endsWith('/token')?200:422})).create('rice-1',requestId),/REQUEST_FAILED/);
const paid={id:orderId,status:'COMPLETED',purchase_units:[{payments:{captures:[{id:'CAPTURE123',status:'COMPLETED',final_capture:true,amount:{currency_code:'USD',value:'5.00'}}]}}]},expected={orderId,offeringId:'rice-5'};
assert.equal(verifiedCapture(paid,expected).captureId,'CAPTURE123');
for(const edit of [p=>p.status='APPROVED',p=>p.id='OTHERORDER123',p=>p.purchase_units.push(p.purchase_units[0]),p=>p.purchase_units[0].payments.captures[0].status='PENDING',p=>p.purchase_units[0].payments.captures[0].amount.value='1.00',p=>p.purchase_units[0].payments.captures[0].amount.currency_code='KRW',p=>p.purchase_units[0].payments.captures[0].final_capture=false,p=>p.purchase_units[0].payments.captures.push(p.purchase_units[0].payments.captures[0])]){const copy=structuredClone(paid);edit(copy);assert.equal(verifiedCapture(copy,expected),null);}
const ui=fs.readFileSync('components/offering-controls.tsx','utf8');assert.ok(ui.includes("useState<OfferingId|null>(null)"));assert.ok(ui.includes('className="meta-offering-paypal" disabled'));assert.ok(!ui.includes('paypal.com/sdk'),'No third-party checkout script before activation');
assert.ok(fs.readFileSync('public/temple/renderer.js','utf8').includes('metatemple:offering'));
console.log('PASS: 18 locales, fixed USD catalog, unselected/disabled checkout, zero requests before setup, sandbox-only adapter, stable request IDs, API failures, amount/currency/order/status verification');
