// Ambient characters are scene residents, never network visitors or fake attendance.
export const RESIDENT_CUSHIONS=Object.freeze([12,15,17,18,32,37]);
const indoorStanding=Object.freeze([[-13.6,-1,.1],[13.6,2,-.1],[-13.6,10,.15],[13.6,10,-.15],[-9.6,20,0],[9.6,20,0]]);
const outdoorStanding=Object.freeze([[-8,33.5,.25],[8,33.5,-.25],[-3.5,37,.35],[3.5,37,-.35],[-10.3,40,.6],[10.3,40,-.6],[-5.8,47.5,2.2],[5.8,47.5,-2.2],[-12.6,50,.4],[12.6,50,-.4]]);
const colors=['#bdc5ad','#cbbdab','#b9c8c2','#c8bd9c'];
/** Build the same 12 indoor + 10 outdoor residents for every hall and visitor. */
export function residentProfiles(seatPosition,visitors=[]){
 const occupied=new Set(visitors.filter(v=>Number.isInteger(v.cushion)).map(v=>v.cushion));
 const name=id=>(globalThis.window?.metatempleConfig?.name?.(id)||'Temple resident')+' · NPC';
 const profile=(id,index,position,cushion=null,pose='walk')=>({id,name:name(id),seat:index,color:colors[index%colors.length],joinedAt:0,position:Object.freeze(position),cushion,pose});
 const bowing=RESIDENT_CUSHIONS.map((seat,i)=>{
  const displaced=occupied.has(seat),position=displaced?{x:i%2?13.1:-13.1,z:-9.8+Math.floor(i/2)*3.1,yaw:0}:seatPosition(seat);
  return profile(`resident:bow:${i}`,i,position,displaced?null:seat,'kneel');
 });
 const standing=indoorStanding.map(([x,z,yaw],i)=>profile(`resident:indoor-stand:${i}`,i+6,{x,z,yaw}));
 const outside=outdoorStanding.map(([x,z,yaw],i)=>profile(`resident:outdoor:${i}`,i+12,{x,z,yaw}));
 return [...bowing,...standing,...outside];
}
/** Standing residents and displaced kneeling residents also keep walking routes clear. */
export function residentObstacles(profiles){return profiles.filter(v=>v.id.startsWith('resident:')&&(v.pose!=='kneel'||v.cushion===null)).map(v=>({x:v.position.x,z:v.position.z}));}
/** Reuse the actual remote avatar's bow motion, independently of network heartbeats. */
export function stepResident(remote,now,id){
 if(!id.startsWith('resident:bow:'))return;
 const index=Number(id.split(':').at(-1)),phase=index*1.55,period=10.2,cycle=Math.floor((now+phase)/period),started=cycle*period-phase;
 if(remote.residentCycle===cycle||remote.actor.isBowing)return;
 if(now-started>=6.5){remote.residentCycle=cycle;return;}
 remote.actor.bow(started);
 if(remote.actor.isBowing){remote.residentCycle=cycle;remote.poseDirty=true;}
}
