import {DatabaseSync} from 'node:sqlite';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const db=new DatabaseSync(':memory:');
db.exec('CREATE TABLE visitors(id TEXT PRIMARY KEY,room TEXT NOT NULL,x REAL,z REAL,yaw REAL,action TEXT,updated INTEGER,slot INTEGER,cushion INTEGER,joined INTEGER,event TEXT,event_at INTEGER DEFAULT 0,bow_at INTEGER DEFAULT 0,speech TEXT,speech_at INTEGER DEFAULT 0,speech_until INTEGER DEFAULT 0); CREATE UNIQUE INDEX room_slot ON visitors(room,slot); CREATE UNIQUE INDEX room_cushion ON visitors(room,cushion);');
const code=fs.readFileSync('lib/admission.ts','utf8'),admission=code.match(/ADMIT_SQL=`([\s\S]+?)`;/)[1],cushion=code.match(/CUSHION_SQL=`([\s\S]+?)`;/)[1];
const join=db.prepare(admission),seat=db.prepare(cushion),now=Date.now();
for(let i=0;i<100;i++)assert.equal(join.run('visitor-'+i,'maru',0,18,0,'idle',now).changes,1);
assert.equal(db.prepare("SELECT COUNT(*) AS n FROM visitors WHERE room='maru'").get().n,100);
assert.equal(join.run('visitor-101','maru',0,18,0,'idle',now).changes,0,'101st admission must be rejected');
assert.equal(join.run('visitor-0','maru',2,20,0,'walk',now).changes,1,'existing visitor must retain their place in a full room');
for(let i=0;i<100;i++)seat.run('visitor-'+i,'maru');
assert.equal(db.prepare("SELECT COUNT(DISTINCT cushion) AS n FROM visitors WHERE room='maru'").get().n,94);
assert.equal(join.run('visitor-101','maru-07',0,18,0,'idle',now).changes,1,'other halls stay available');
assert.equal(join.run('visitor-101','maru',0,18,0,'idle',now).changes,0,'a denied room transfer must preserve the previous room');
assert.equal(db.prepare("SELECT room FROM visitors WHERE id='visitor-101'").get().room,'maru-07');
db.prepare("DELETE FROM visitors WHERE id='visitor-99'").run();
assert.equal(join.run('visitor-101','maru',0,18,0,'idle',now).changes,1,'a freed place must become available');
assert.equal(db.prepare("SELECT COUNT(DISTINCT slot) AS n FROM visitors WHERE room='maru'").get().n,100);
console.log('PASS: 100-person admission, 101st rejection, full-room heartbeat, atomic transfer, unique slots, 94 reservable cushions + six resident places');

// Admission quotas are independent for all seven published halls.
db.prepare('DELETE FROM visitors').run();
for(let hall=1;hall<=7;hall++){
 const room=hall===1?'maru':`maru-${String(hall).padStart(2,'0')}`;
 for(let slot=0;slot<100;slot++)assert.equal(join.run(`hall-${hall}-visitor-${slot}`,room,0,38,0,'idle',now).changes,1);
 assert.equal(join.run(`hall-${hall}-overflow`,room,0,38,0,'idle',now).changes,0);
 assert.equal(db.prepare('SELECT COUNT(*) AS n FROM visitors WHERE room=?').get(room).n,100);
}
assert.equal(db.prepare('SELECT COUNT(*) AS n FROM visitors').get().n,700);
console.log('PASS: seven independent halls, 700 total admissions, seven rejected 101st visitors');
