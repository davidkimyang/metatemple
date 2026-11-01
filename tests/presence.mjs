import assert from 'node:assert/strict';
const base=process.env.TEMPLE_TEST_URL || 'http://127.0.0.1:3010';
async function visitor(){const res=await fetch(base+'/api/temple');assert.equal(res.status,200);const cookie=res.headers.get('set-cookie').split(';')[0],data=await res.json();assert.notEqual(data.id,cookie.split('=')[1]);assert.equal(data.rooms.length,7);assert(data.rooms.every(r=>r.capacity===100));return {cookie,id:data.id};}
async function post(v,body,origin=base){const r=await fetch(base+'/api/temple',{method:'POST',headers:{cookie:v.cookie,origin,'content-type':'application/json'},body:JSON.stringify(body)});const text=await r.text();let data;try{data=JSON.parse(text);}catch{data={error:text};}return {status:r.status,data};}
const a=await visitor(),b=await visitor();assert.notEqual(a.id,b.id);
const state={room:'maru-06',x:1,z:18,yaw:0,action:'idle'};
try{
 assert.equal((await post(a,state)).status,200);
 const joined=await post(b,{...state,x:2,action:'beads'});assert.equal(joined.status,200);assert(joined.data.visitors.some(v=>v.id===a.id));assert(joined.data.count>=2);
 assert.equal((await post(a,state,'https://unrelated.example')).status,403);
 assert.equal((await post(a,{...state,x:999})).status,400);
 assert.equal((await post(a,{...state,action:'invalid'})).status,400);
 // A hall transfer must not be throttled by the previous presence heartbeat.
 const moved=await post(b,{...state,room:'maru-07'});assert.equal(moved.status,200);assert(!moved.data.visitors.some(v=>v.id===a.id));
 assert.equal((await post(b,{leave:true})).status,200);
 await new Promise(r=>setTimeout(r,450));
 const alone=await post(a,state);assert(!alone.data.visitors.some(v=>v.id===b.id));
 console.log('PASS: anonymous identity, shared positions/rituals, room isolation, validation, origin protection, leave cleanup');
} finally {await post(a,{leave:true});await post(b,{leave:true});}
