// Server-only sandbox adapter. Not imported by a browser component or an HTTP
// handler yet. Connecting credentials alone does NOT enable public payments.
import {offeringFor,type OfferingId} from '../offerings';
export interface SandboxConfig {enabled:boolean;clientId:string;clientSecret:string;environment:'sandbox'}
type Json = Record<string,any>;
export function sandboxPayPal(config:SandboxConfig,request:typeof fetch=fetch){
 const base='https://api-m.sandbox.paypal.com';
 function configured(){if(config.environment!=='sandbox'||config.enabled!==true||!config.clientId||!config.clientSecret)throw new Error('PAYPAL_NOT_CONFIGURED');}
 async function token(){configured();const r=await request(base+'/v1/oauth2/token',{method:'POST',headers:{Authorization:'Basic '+btoa(config.clientId+':'+config.clientSecret),'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials',signal:AbortSignal.timeout(15000)});const data=await r.json() as Json;if(!r.ok||typeof data.access_token!=='string')throw new Error('PAYPAL_AUTH_FAILED');return data.access_token as string;}
 async function post(path:string,body:Json,requestId:string){
  // Caller must persist one stable UUID per operation BEFORE calling PayPal.
  if(!/^[a-f0-9-]{36}$/i.test(requestId))throw new Error('INVALID_REQUEST_ID');
  const access=await token(),r=await request(base+path,{method:'POST',headers:{Authorization:'Bearer '+access,'Content-Type':'application/json','PayPal-Request-Id':requestId,Prefer:'return=representation'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});const data=await r.json() as Json;if(!r.ok)throw new Error('PAYPAL_REQUEST_FAILED');return data;
 }
 return {
  async create(id:OfferingId,requestId:string){const product=offeringFor(id);if(!product)throw new Error('INVALID_OFFERING');const order=await post('/v2/checkout/orders',{intent:'CAPTURE',purchase_units:[{description:'Virtual rice offering — metatemple operations',amount:{currency_code:product.currency,value:product.value}}]},requestId);if(typeof order.id!=='string'||!/^[A-Z0-9]{10,32}$/.test(order.id))throw new Error('INVALID_PAYPAL_ORDER');return {id:order.id};},
  async capture(orderId:string,requestId:string){if(!/^[A-Z0-9]{10,32}$/.test(orderId))throw new Error('INVALID_PAYPAL_ORDER');return post('/v2/checkout/orders/'+orderId+'/capture',{},requestId);},
 };
}
// This verifies one successful full capture. Pending/partial/declined captures
// are never presented as paid. Expected IDs/prices come from a durable ledger,
// NOT from the browser. A caller must also verify ownership before capture.
export function verifiedCapture(order:Json,expected:{orderId:string;offeringId:OfferingId}){
 const product=offeringFor(expected.offeringId),units=order?.purchase_units;
 if(!product||order.id!==expected.orderId||order.status!=='COMPLETED'||!Array.isArray(units)||units.length!==1)return null;
 const captures=units[0]?.payments?.captures;
 if(!Array.isArray(captures)||captures.length!==1)return null;
 const capture=captures[0];
 if(!capture||typeof capture.id!=='string'||!capture.id||capture.status!=='COMPLETED'||capture.final_capture!==true||capture.amount?.currency_code!=='USD'||capture.amount?.value!==product.value)return null;
 return {orderId:order.id as string,captureId:capture.id as string,offeringId:product.id,value:product.value,currency:product.currency};
}
