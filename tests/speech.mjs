import assert from 'node:assert/strict';
const base=process.env.TEMPLE_TEST_URL||'http://127.0.0.1:3010';
async function visitor(){const r=await fetch(base+'/api/temple');assert.equal(r.status,200);return {cookie:r.headers.get('set-cookie').split(';')[0],id:(await r.json()).id};}
async function post(v,data){const r=await fetch(base+'/api/temple',{method:'POST',headers:{cookie:v.cookie,origin:base,'content-type':'application/json'},body:JSON.stringify(data)});return {status:r.status,data:await r.json()};}
const state={room:'maru-06',x:0,z:38,yaw:0,action:'walk'},a=await visitor(),b=await visitor(),c=await visitor();
const refresh=v=>post(v,{...state,command:'hello'});
try{
 const plain='<img src=x onerror=alert(1)> 안녕하세요 🙏';
 let r=await post(a,{...state,command:'say',speech:plain});assert.equal(r.status,200);assert.equal(r.data.self.speech,plain);assert(r.data.self.speech_until>Date.now());
 r=await refresh(b);assert.equal(r.data.visitors.find(v=>v.id===a.id).speech,plain);
 r=await post(c,{...state,room:'maru-07'});assert(!r.data.visitors.some(v=>v.id===a.id));
 assert.equal((await post(a,{...state,command:'say',speech:'too soon'})).status,429);
 assert.equal((await post(a,{...state,command:'say',speech:'🙏'.repeat(121)})).status,400);
 assert.equal((await post(a,{...state,command:'say',speech:'  '})).status,400);
 r=await post(a,{...state,command:'clearSpeech'});assert.equal(r.data.self.speech,null);
 r=await refresh(b);assert.equal(r.data.visitors.find(v=>v.id===a.id).speech,null);
 assert.equal((await post(a,{...state,command:'say',speech:'cannot bypass by deleting'})).status,429);
 await new Promise(resolve=>setTimeout(resolve,3100));
 const concurrent=await Promise.all(['First','Second'].map(speech=>post(a,{...state,command:'say',speech})));assert.deepEqual(concurrent.map(r=>r.status).sort(),[200,429]);
 await new Promise(resolve=>setTimeout(resolve,12100));
 r=await refresh(b);assert.equal(r.data.visitors.find(v=>v.id===a.id).speech,null);
 await new Promise(resolve=>setTimeout(resolve,350));
 r=await post(a,{...state,command:'say',speech:'🙏'.repeat(120)});assert.equal(r.status,200);
 r=await post(a,{...state,room:'maru-07',command:'hello'});assert.equal(r.data.self.speech,null);
 console.log('PASS: cross-visitor delivery, hall isolation, explicit delete, expiry, Unicode 120-character limit, literal markup, atomic cooldown, room-change cleanup');
}finally{await Promise.all([a,b,c].map(v=>post(v,{leave:true})));}
