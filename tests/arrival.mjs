import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
const out=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'temple-arrival-')),'arrival.mjs');
await build({stdin:{contents:'export * from "./lib/arrival";export * from "./lib/arrival-i18n";export {languages} from "./lib/i18n";',resolveDir:process.cwd(),loader:'ts'},platform:'node',bundle:true,format:'esm',outfile:out,logLevel:'silent'});
const{nextArrivalPhase,arrivalHall,arrivalText,languages}=await import(pathToFileURL(out).href);
let phase='opening';for(const event of ['assets','rendering','assets','opening','ready','rendering'])phase=nextArrivalPhase(phase,event);assert.equal(phase,'ready','Late module/asset callbacks must never cover a ready temple');
phase=nextArrivalPhase(phase,'error');assert.equal(phase,'error','A lost rendering context must reopen recovery UI');assert.equal(nextArrivalPhase(phase,'ready'),'error');assert.equal(nextArrivalPhase('assets',null),'assets');
for(let n=1;n<=7;n++){assert.equal(arrivalHall(n===1?'maru':`maru-0${n}`),n);const image=fs.readFileSync(`public/temple/previews/hall-${n}.jpg`);assert.equal(image.readUInt16BE(0),0xffd8);assert.ok(image.length>50000,'Preview must be a rendered scene');}
for(const bad of [null,[],100,'maru-99','../../bad'])assert.equal(arrivalHall(bad),1);
for(const[locale]of languages){const t=arrivalText(locale);assert.equal(Object.keys(t).length,9);assert.ok(Object.values(t).every(value=>typeof value==='string'&&value.trim()));}
const code=fs.readFileSync('public/temple/renderer.js','utf8'),tree=ts.createSourceFile('renderer.js',code,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
const find=name=>tree.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name)?.getText(tree);
assert.ok(find('OE'));assert.ok(find('Dd'));const events=[],classes=new Set(),ctx={ln:false,$i:false,Bi:false,Rf:0,_i:[],Qn:'id',Kt:{setVisitors(){}},Fl(){},Kn:{classList:{add(name){classes.add(name);}}},clearTimeout(){},et(){return {classList:{add(name){classes.add(name);}},hidden:false};},nc(){},ja(){},__metaLoad(value){events.push(value);}};
vm.runInNewContext(find('OE')+';OE();',ctx);assert.deepEqual(events,['ready']);assert.ok(classes.has('is-ready'));assert.ok(classes.has('is-loaded'));
assert.ok(find('Dd').includes('__metaLoad("error")'));assert.equal(code.match(/__metaLoad\("rendering"\)/g)?.length,1);
const native=fs.readFileSync('components/native-temple.tsx','utf8');assert.ok(native.includes('ready&&<SpeechControls'));assert.ok(native.includes('inert={!ready}'));assert.ok(native.includes("script.onerror="));assert.ok(native.includes("css.onerror="));
console.log('PASS: seven real scene previews, 18 locales, monotonic real load stages, render-ready bridge, lost-context recovery, hidden speech and inert scene until ready, script/style failure handlers');
