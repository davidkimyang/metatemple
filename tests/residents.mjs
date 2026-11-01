import assert from 'node:assert/strict';import fs from 'node:fs';import {residentProfiles,residentObstacles,stepResident,RESIDENT_CUSHIONS} from '../public/temple/residents.js';
const seat=n=>({x:n%10<5?(n%10-5)*2.4:(n%10-4)*2.4,z:-8.4+Math.floor(n/10)*2.8,yaw:0});
const profiles=residentProfiles(seat);
assert.equal(profiles.length,22);assert.equal(new Set(profiles.map(v=>v.id)).size,22);
assert.equal(profiles.filter(v=>v.pose==='kneel').length,6);
assert.equal(profiles.filter(v=>v.position.z<23.1).length,12);assert.equal(profiles.filter(v=>v.position.z>=23.1).length,10);
assert.equal(residentObstacles(profiles).length,16);assert(profiles.every(v=>v.id.startsWith('resident:')));
for(const v of profiles){assert(Math.abs(v.position.x)>2,'Keep the central aisle clear');assert(Number.isFinite(v.position.x)&&Number.isFinite(v.position.z));for(const other of profiles)if(other!==v)assert(Math.hypot(v.position.x-other.position.x,v.position.z-other.position.z)>1.06);}
const occupied=residentProfiles(seat,[{id:'real',cushion:32}]);assert.equal(occupied.length,22);assert(!occupied.some(v=>v.cushion===32));assert.equal(occupied.filter(v=>v.pose==='kneel').length,6);assert.equal(residentObstacles(occupied).length,17);
const starts=[];const remote={actor:{isBowing:false,bow(at){starts.push(at);this.isBowing=true;}}};stepResident(remote,10.4,'resident:bow:0');assert.deepEqual(starts,[10.2]);remote.actor.isBowing=false;stepResident(remote,11,'resident:bow:0');assert.equal(starts.length,1);stepResident(remote,20.6,'resident:bow:0');assert.equal(starts.length,2);
const other={actor:{isBowing:false,bow(){throw Error('Standing residents must not bow');}}};stepResident(other,10.4,'resident:outdoor:0');
const code=fs.readFileSync('public/temple/renderer.js','utf8');assert(/residentProfiles\(fs,\s*s\)/.test(code));assert(/stepResident\(b,\s*l,\s*g\)/.test(code));assert(/const h = a.id.startsWith\("resident:"\), d = JS\(\)/.test(code));assert(code.includes('!r.id.startsWith("resident:")'));assert(code.includes('!i.id.startsWith("resident:")'));
const sql=fs.readFileSync('lib/admission.ts','utf8');assert(sql.includes(`NOT IN (${RESIDENT_CUSHIONS.join(',')})`));
console.log('PASS: 12 indoor (six bowing/six standing), 10 outdoor, clear aisle and spacing, legacy seat conflict avoidance, autonomous staggered bows, real visitor count/list separation and reserved seats');
