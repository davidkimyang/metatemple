import { env } from "cloudflare:workers";
import { ROOMS, validRoom, ROOM_CAPACITY } from "@/lib/rooms";
import { ADMIT_SQL, CUSHION_SQL } from "@/lib/admission";
import { cleanSpeech, SPEECH_DURATION, SPEECH_INTERVAL } from "@/lib/speech";
import { cleanNickname } from "@/public/temple/profile-name.js";
const actions=["idle","walk","bow","beads","greet","sit","dance"];
const json=(data:unknown,status=200,cookie?:string)=>Response.json(data,{status,headers:{"Cache-Control":"no-store",...(cookie?{"Set-Cookie":cookie}:{})}});
const identity=(request:Request)=>request.headers.get("cookie")?.match(/(?:^|;\s*)temple_visitor=([a-f0-9-]{36})(?:;|$)/)?.[1]||null;
async function publicId(token:string){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(token));return Array.from(new Uint8Array(b)).map(n=>n.toString(16).padStart(2,"0")).join("").slice(0,32);}
export async function GET(request:Request){
 const token=identity(request)||crypto.randomUUID(),id=await publicId(token),db=env.DB;
 if(!db)return json({error:"Presence temporarily unavailable"},503);
 const now=Date.now(),counts=await db.prepare("SELECT room,COUNT(*) AS count FROM visitors WHERE updated>? GROUP BY room").bind(now-18000).all();
 return json({id,rooms:ROOMS.map(room=>({...room,count:Number(counts.results.find(r=>r.room===room.id)?.count||0)})),time:now},200,`temple_visitor=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${new URL(request.url).protocol==="https:"?"; Secure":""}`);
}
export async function POST(request:Request){
 if(request.headers.get("origin")!==new URL(request.url).origin)return json({error:"Invalid origin"},403);
 const token=identity(request);if(!token)return json({error:"Session expired"},401);
 if(Number(request.headers.get("content-length")||0)>2048)return json({error:"Request too large"},413);
 const id=await publicId(token),db=env.DB;if(!db)return json({error:"Presence temporarily unavailable"},503);
 let body:Record<string,unknown>;try{const raw=await request.text();if(new TextEncoder().encode(raw).length>2048)return json({error:"Request too large"},413);body=JSON.parse(raw);if(!body||typeof body!=="object"||Array.isArray(body))return json({error:"Invalid request"},400);}catch{return json({error:"Invalid request"},400);}
 if(body.leave===true){await db.prepare("DELETE FROM visitors WHERE id=?").bind(id).run();return json({ok:true});}
 if(body.command!==undefined&&!["seat","stand","hello","bow","bead","say","clearSpeech","rename"].includes(String(body.command)))return json({error:"Invalid command"},400);
 const hasNickname=Object.prototype.hasOwnProperty.call(body,"nickname"),nickname=hasNickname?cleanNickname(body.nickname):null;
 if((hasNickname&&nickname===null)||(body.command==="rename"&&!hasNickname))return json({error:"Invalid nickname"},400);
 const speech=body.command==="say"?cleanSpeech(body.speech):null;
 if(body.command==="say"&&!speech)return json({error:"Invalid message"},400);
 const{room,x,z,yaw,action}=body;
 if(!validRoom(room)||!actions.includes(String(action))||![x,z,yaw].every(v=>typeof v==="number"&&Number.isFinite(v))||Math.abs(Number(x))>200||Math.abs(Number(z))>200||Math.abs(Number(yaw))>20)return json({error:"Invalid position"},400);
 const now=Date.now();
 const recent=await db.prepare("SELECT updated,speech_at,room,nickname FROM visitors WHERE id=?").bind(id).first<{updated:number;speech_at:number;room:string;nickname:string|null}>();
 if(body.command==="say"&&recent&&now-recent.speech_at<SPEECH_INTERVAL)return json({error:"rate-limit"},429);
 if(recent&&recent.room===room&&now-recent.updated<300&&!body.command)return json({error:"Too many updates"},429);
 const result=await db.batch([db.prepare("DELETE FROM visitors WHERE updated<?").bind(now-18000),db.prepare(ADMIT_SQL).bind(id,room,x,z,yaw,action,now)]);
 if(!result[1].meta.changes)return json({error:"room-full",capacity:ROOM_CAPACITY},409);
 if(hasNickname&&(!recent||now-recent.updated>18000||body.command==="rename"))await db.prepare("UPDATE visitors SET nickname=? WHERE id=?").bind(nickname||null,id).run();
 if(body.command==="seat")await db.prepare(CUSHION_SQL).bind(id,room).run();
 if(["hello","bow","bead"].includes(String(body.command)))await db.prepare("UPDATE visitors SET event=?,event_at=?,bow_at=CASE WHEN ? THEN ? ELSE bow_at END WHERE id=?").bind(body.command,now,body.command==="bow"?1:0,now,id).run();
 if(body.command==="stand")await db.prepare("UPDATE visitors SET cushion=NULL WHERE id=?").bind(id).run();
 // The conditional write enforces the cooldown even for simultaneous requests.
 if(body.command==="say"){
  const sent=await db.prepare("UPDATE visitors SET speech=?,speech_at=?,speech_until=? WHERE id=? AND room=? AND speech_at<=?").bind(speech,now,now+SPEECH_DURATION,id,room,now-SPEECH_INTERVAL).run();
  if(!sent.meta.changes)return json({error:"rate-limit"},429);
 }
 if(body.command==="clearSpeech")await db.prepare("UPDATE visitors SET speech=NULL,speech_until=0 WHERE id=?").bind(id).run();
 const list=await db.prepare("SELECT id,nickname,x,z,yaw,action,slot,cushion,joined,event,event_at,bow_at,CASE WHEN speech_until>? THEN speech ELSE NULL END AS speech,speech_until FROM visitors WHERE room=? AND updated>? ORDER BY slot LIMIT 100").bind(now,room,now-18000).all();
 const self=list.results.find(v=>v.id===id);
 return json({visitors:list.results.filter(v=>v.id!==id),count:list.results.length,self});
}
