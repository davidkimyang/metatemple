import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';import {build} from 'esbuild';import {pathToFileURL} from 'node:url';import os from 'node:os';import path from 'node:path';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'metatemple-dom-')),out=path.join(dir,'locale.mjs');
await build({stdin:{contents:'export {translateReference} from "./lib/reference-locale";export {createReferenceDomWriter} from "./lib/reference-dom";',resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:out,logLevel:'silent'});
const{translateReference,createReferenceDomWriter}=await import(pathToFileURL(out).href);
let locale='en',sequence=0;const textWrites=[],attributeWrites=[];
class Element{
 constructor(id=''){this.id=id||`mock-${sequence++}`;this.data='';this.nodes=[];this.attributes=new Map();this.listeners=new Map();this.isConnected=true;this.nodeType=1;}
 get childNodes(){return this.nodes.length?this.nodes:this.data?[{nodeType:3}]:[];}
 get firstChild(){return this.childNodes[0]||null;}
 get textContent(){return this.nodes.length?this.nodes.map(n=>n.textContent).join(''):this.data;}
 set textContent(value){this.data=String(value??'');this.nodes=[];textWrites.push({id:this.id,value:this.data});}
 append(...nodes){this.nodes.push(...nodes);}
 setAttribute(name,value){this.attributes.set(name,String(value));attributeWrites.push({id:this.id,name,value:String(value)});}
 getAttribute(name){return this.attributes.get(name)??null;}
 addEventListener(name,callback){this.listeners.set(name,callback);}
}
const writer=createReferenceDomWriter(source=>translateReference(source,locale));
const source=fs.readFileSync('public/temple/renderer.js','utf8'),tree=ts.createSourceFile('runtime.js',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
const functions=new Map();let label;
function scan(n){if(ts.isFunctionDeclaration(n)&&n.name&&['TE','__metaText','__metaAttr'].includes(n.name.text))functions.set(n.name.text,n.getText(tree));if(ts.isVariableDeclaration(n)&&n.name.getText(tree)==='ls')label=n.initializer.getText(tree);ts.forEachChild(n,scan);}scan(tree);
for(const name of ['TE','__metaText','__metaAttr'])assert(functions.has(name),name);
const elements=new Map(['room-list','room-status','room-current','room-refresh'].map(id=>[id,new Element(id)]));
const rooms=Array.from({length:7},(_,i)=>({id:i?`maru-${String(i+1).padStart(2,'0')}`:'maru',number:i+1,capacity:100}));
const context=vm.createContext({window:{metatempleConfig:writer},document:{getElementById:id=>elements.get(id),createElement:()=>new Element()},AbortController,Ra:rooms,decorateHallChoice:()=>{},console});
vm.runInContext([...functions.values()].join('\n'),context);
const setLabel=vm.runInContext(`(${label})`,context),chant=new Element('chant');
chant.data='Listen to chanting';let before=textWrites.length;
for(let i=0;i<100;i++)setLabel(chant,'염불 듣기');assert.equal(textWrites.length,before);
for(let i=0;i<100;i++)setLabel(chant,'염불 멈추기');assert.equal(chant.textContent,'Stop');assert.equal(textWrites.length,before+1);
locale='ja';writer.retranslate();assert.equal(chant.textContent,'やめる');before=textWrites.length;
for(let i=0;i<100;i++)setLabel(chant,'염불 멈추기');assert.equal(textWrites.length,before);
locale='en';writer.retranslate();
const options={directory:async()=>rooms.map(r=>({...r,count:r.number===3?1:0})),current:()=> 'maru-03',canChoose:()=>true,move:async()=>true,onMoved:()=>{}};
const controller=context.TE(options);await controller.refresh();assert.equal(elements.get('room-list').nodes.length,7);
assert.equal(elements.get('room-current').textContent,'Temple Hall 3');
before=textWrites.length;let attrs=attributeWrites.filter(a=>a.name==='aria-label').length;
for(let i=0;i<100;i++)controller.update();
assert.equal(textWrites.length,before,'100 room refreshes must not rewrite unchanged text');
assert.equal(attributeWrites.filter(a=>a.name==='aria-label').length,attrs,'Unchanged room accessibility labels must stay stable');
locale='ja';writer.retranslate();assert.equal(elements.get('room-current').textContent,'本堂 3');before=textWrites.length;
for(let i=0;i<100;i++)controller.update();assert.equal(textWrites.length,before,'Room refreshes must remain stable after changing language');
assert(textWrites.every(w=>!/[가-힣]/.test(w.value)),'No intermediate Korean text may be committed');
assert(attributeWrites.filter(w=>w.name==='aria-label').every(w=>!/[가-힣]/.test(w.value)),'No intermediate Korean accessibility label may be committed');
controller.destroy();
console.log('PASS: shipped chant writer + 7-hall directory, 200 unchanged directory refreshes, playback transitions, language switches, and no intermediate untranslated DOM writes');

const protectedName=new Element('visitor-name');protectedName.closest=selector=>selector==='[translate="no"]'?protectedName:null;
writer.setText(protectedName,'산사');assert.equal(protectedName.textContent,'산사');locale='ko';writer.retranslate();locale='en';writer.retranslate();assert.equal(protectedName.textContent,'산사','Visitor names must not be translated as interface text');
console.log('PASS: visitor names remain unchanged across language switches');
