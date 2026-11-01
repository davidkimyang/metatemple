import assert from 'node:assert/strict';
import {cleanNickname} from '../public/temple/profile-name.js';
const base=process.env.TEMPLE_TEST_URL||'http://127.0.0.1:3010';
assert.equal(cleanNickname('  마음  😀  '),'마음 😀');assert.equal(cleanNickname('e\u0301'),'é');assert.equal(cleanNickname('😀'.repeat(21)),null);assert.equal(cleanNickname(null),null);assert.equal(cleanNickname(' \n '),'');
async function visitor(){const r=await fetch(base+'/api/temple');assert.equal(r.status,200);return {cookie:r.headers.get('set-cookie').split(';')[0],id:(await r.json()).id};}
async function post(v,payload,origin=base){const r=await fetch(base+'/api/temple',{method:'POST',headers:{cookie:v.cookie,origin,'content-type':'application/json'},body:JSON.stringify(payload)});const raw=await r.text();let data;try{data=JSON.parse(raw);}catch{data={error:raw};}return {status:r.status,data};}
const a=await visitor(),b=await visitor(),state={room:'maru-06',x:0,z:38,yaw:0,action:'walk'};
try{
 let r=await post(a,{...state,nickname:'  마음 😀  '});assert.equal(r.status,200);assert.equal(r.data.self.nickname,'마음 😀');
 r=await post(b,{...state,command:'hello'});assert.equal(r.data.visitors.find(v=>v.id===a.id).nickname,'마음 😀');
 r=await post(a,{...state,command:'hello',nickname:''});assert.equal(r.data.self.nickname,'마음 😀','Stale tabs must not overwrite a name on heartbeat');
 r=await post(a,{...state,command:'rename',nickname:'😀'.repeat(20)});assert.equal(r.status,200);assert.equal(r.data.self.nickname,'😀'.repeat(20));
 assert.equal((await post(a,{...state,command:'rename',nickname:'😀'.repeat(21)})).status,400);
 assert.equal((await post(a,{...state,command:'rename',nickname:null})).status,400);
 assert.equal((await post(a,{...state,command:'rename',nickname:'abc'},'https://unrelated.example')).status,403);
 r=await post(a,{...state,command:'rename',nickname:'<b>산사</b>'});assert.equal(r.data.self.nickname,'<b>산사</b>');
 r=await post(b,{...state,command:'rename',id:a.id,nickname:'Other visitor'});assert.equal(r.data.self.id,b.id);assert.equal(r.data.visitors.find(v=>v.id===a.id).nickname,'<b>산사</b>','A visitor can change only their own name');
 r=await post(a,{...state,room:'maru-07'});assert.equal(r.status,200);assert.equal(r.data.self.nickname,'<b>산사</b>');
 await post(a,{leave:true});r=await post(a,{...state,nickname:'새 이름'});assert.equal(r.data.self.nickname,'새 이름','Stored browser preference can restore a new admission');
 r=await post(a,{...state,command:'rename',nickname:''});assert.equal(r.data.self.nickname,null);
 r=await post(b,{...state,command:'hello'});assert.equal(r.data.visitors.find(v=>v.id===a.id).nickname,null);
 console.log('PASS: shared rename, Unicode limit, normalization, literal markup, origin and identity protection, stale-tab protection, hall transfer, readmission and automatic-name reset');
}finally{await Promise.all([a,b].map(v=>post(v,{leave:true})));}
