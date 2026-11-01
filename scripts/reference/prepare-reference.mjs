import fs from 'node:fs';
import ts from 'typescript';
const raw=fs.readFileSync('reference/vendor/sansa-game.js','utf8');
const ast=ts.createSourceFile('renderer.js',raw,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),edits=[];
for(const n of ast.statements){
 if(ts.isImportDeclaration(n))edits.push([n.getStart(ast),n.end,'const sg=(loader)=>loader();\nimport {MetaPresence} from "./presence.js";\nimport {syncSpeechLabel,activeSpeech} from "./speech.js";\nimport {mountExteriors,exteriorBlocked,isThemedExterior} from "./exteriors.js";\nimport {decorateHallChoice} from "./halls.js";\nimport {residentProfiles,residentObstacles,stepResident,RESIDENT_CUSHIONS} from "./residents.js";']);
 if(ts.isFunctionDeclaration(n)&&['rb','hb','vr','_E'].includes(n.name?.text))edits.push([n.getStart(ast),n.end,`function ${n.name.text}(){}`]);
 if(ts.isClassDeclaration(n)&&n.name?.text==='bE')edits.push([n.getStart(ast),n.end,'']);
 if(ts.isVariableStatement(n))for(const declaration of n.declarationList.declarations)if(declaration.name.getText(ast)==='SE'&&declaration.initializer)edits.push([declaration.initializer.getStart(ast),declaration.initializer.end,'Object.freeze([])']);
}
let code=raw;for(const[start,end,replacement]of edits.sort((a,b)=>b[0]-a[0]))code=code.slice(0,start)+replacement+code.slice(end);
code=code.replace('new bE(ig,ol,{url:A0})','new MetaPresence(ig,ol)');
code=code.replace(/function mr\(s\)\{[\s\S]*?return s0.origin\+e\}/,'function mr(s){if(!nS.has(s))throw new Error(`Unknown asset: ${s}`);return s}');
code=code.replace('const M0="https://xvwhzwnrrrnebdlgleqg.supabase.co".trim(),S0="sb_publishable_2tmb3Q6HBK8-OlLHOSdtmw_U8uhghzn".trim(),A0="wss://sansa-realtime.wlsdnjs0529.workers.dev/presence".trim(),LE=!!(!A0&&M0&&S0)','const M0="",S0="",A0="",LE=false');
code=code.replace(/<div class="support-options">[\s\S]*?<\/div>\n  <p class="support-note">[\s\S]*?<\/p>/,'<div class="support-options"><p>metatemple.net</p><a id="support-link" href="/credits" target="_blank" rel="noopener">Credits &amp; source information</a><a id="support-coffee" hidden></a></div>');
code=code.replace(/const vE="[^"\n]+",yE="[^"\n]+",xE="[^"\n]+";/,'');
code=code.replaceAll('localStorage.getItem("sansa:"','localStorage.getItem("metatemple:"').replaceAll('localStorage.setItem("sansa:"','localStorage.setItem("metatemple:"');
// First-view status comes from real asset and rendering lifecycle events.
for(const [original,replacement] of [
 ['r.dataset.sceneAssetsMs=i(),this.sanctuary=p','__metaLoad("rendering"),r.dataset.sceneAssetsMs=i(),this.sanctuary=p'],
 ['nc(!0),ja())}try{Kt=new','nc(!0),ja(),__metaLoad("ready"))}try{Kt=new'],
 ['function Dd(s){if(ln||$i)return;$i=!0','function Dd(s){if(ln||$i)return;__metaLoad("error");$i=!0'],
]){if(code.split(original).length!==2)throw new Error('Reference loading hook changed: '+original);code=code.replace(original,replacement);}
// The rice bowl opens the localized, payment-disabled React offering panel.
const offeringHook='It(et("game-support"),"click",()=>{ih("support-dialog"),vr("support_open")});';
if(code.split(offeringHook).length!==2)throw new Error('Reference offering hook changed');
code=code.replace(offeringHook,'It(et("game-support"),"click",()=>{window.dispatchEvent(new Event("metatemple:offering"))});');
// Keep both painted 3D plaques branded consistently in every locale.
const plaques = [
 ['s.sign(["산사"]', 's.sign(["metatemple"]'],
 ["l.font='600 158px \"AppleMyungjo\", \"Batang\", serif',l.fillText(\"堂緣淸\",512,117,850),l.font=\"400 34px sans-serif\",l.fillText(\"청연당\",512,219)", 'l.font="600 118px sans-serif",l.fillText("metatemple",512,128,850)'],
];
for (const [original, branded] of plaques) {
 if (code.split(original).length !== 2) throw new Error('Reference plaque changed: ' + original);
 code = code.replace(original, branded);
}
// Speech shares the original name-label projection and occlusion, with no chat log.
const speechHooks = [
 ['this.layer.setAttribute("aria-hidden","true"),', ''],
 ['o.element.firstElementChild.hidden=!r)}}reveal', 'o.element.firstElementChild.hidden=!r);syncSpeechLabel(o,i,r)}}reveal'],
 ['if(!d.self&&h!==this.revealedId)continue;', 'if(!d.self&&h!==this.revealedId&&!activeSpeech(d))continue;'],
 ['if(!i.self&&i.id!==t)continue;', 'if(!i.self&&i.id!==t&&!i.speaking)continue;'],
 ['const r=i.self?28:24;', 'const r=(i.self?28:24)+(i.speaking?100:0);'],
 ['&&i.y>o.y-(o.self?28:24)-6&&i.y-r<o.y+6', '&&i.y>o.y-(o.self?28:24)-(o.speaking?100:0)-6&&i.y-r<o.y+6'],
 ['o.push({id:h,self:d.self,distance:m,width:d.width,', 'o.push({id:h,self:d.self,speaking:activeSpeech(d),distance:m,width:activeSpeech(d)?Math.max(d.width,224):d.width,'],
 ['window.addEventListener("keydown",this.keyDown,g)', 'window.addEventListener("metatemple:typing",this.stopWalking,g),window.addEventListener("keydown",this.keyDown,g)'],
 ['blocked(){return this.paused||!!document.querySelector("dialog[open]")}', 'blocked(){return this.paused||!!document.querySelector("dialog[open], [data-meta-composer]:focus-within")}'],
];
for(const [original,replacement] of speechHooks){
 if(code.split(original).length!==2)throw new Error('Reference speech hook changed: '+original);
 code=code.replace(original,replacement);
}
// Seven separately built exteriors, sharing the untouched original interior.
const exteriorHooks=[
 ['const Ad="auto",Td=100,', 'const Ad="auto",Td=7,'],
 ['function dg(s,e,t=0){', 'function dg(s,e,t=0){if(exteriorBlocked(s,e,t))return!0;if(isThemedExterior())return!1;'],
 ['this.sanctuary=p,p.setSpace?.(this.space),this.sceneRaycast=new WT(p.root)', 'this.sanctuary=p,p.__exteriors=mountExteriors(p,this,{Group:Rt,Mesh:Qe,MeshStandardMaterial:Un,MeshBasicMaterial:oi,BoxGeometry:As,PlaneGeometry:an,BufferGeometry:Mt,Float32BufferAttribute:nt,CylinderGeometry:yi,SphereGeometry:zs,TorusGeometry:Po,CircleGeometry:xa,Vector3:L,CanvasTexture:Ho,TextureLoader:ql,PointLight:rf,Points:fr,PointsMaterial:yo,SRGBColorSpace:Yt,DoubleSide:qt,EquirectangularReflectionMapping:Ml},on),p.setSpace?.(this.space),this.sceneRaycast=new WT(p.root)'],
 ['p.append(m,v),e.append(p)', 'p.append(m,v),decorateHallChoice(p,b.number),e.append(p)'],
 ['m.setAttribute("aria-current",String(y)),m.setAttribute("aria-label",', 'decorateHallChoice(m,p.number),m.setAttribute("aria-current",String(y)),m.setAttribute("aria-label",'],
];
for(const [original,replacement] of exteriorHooks){
 if(code.split(original).length!==2)throw new Error('Reference exterior hook changed: '+original);
 code=code.replace(original,replacement);
}
// Display names are visitor-authored text and must not be localized as UI.
for(const [original,replacement] of [
 ['l.className="visitor-label-name",a.append', 'l.className="visitor-label-name",l.setAttribute("translate","no"),a.append'],
 ['a.textContent=i.name,r.append(o,a)', 'a.setAttribute("translate","no"),a.textContent=i.name,r.append(o,a)'],
]){if(code.split(original).length!==2)throw new Error('Reference name hook changed: '+original);code=code.replace(original,replacement);}
// Ambient residents use the same animated novice model, without affecting attendance.
for(const [original,replacement] of [
 ['g0=Object.freeze([12,15,17,18])','g0=RESIDENT_CUSHIONS'],
 ['function x0(s){return[...s,...SE]}','function x0(s){return[...s,...residentProfiles(fs,s)]}'],
 ['const h=a.id.startsWith("resident:"),d=h?Vs({resident:!0}):JS();','const h=a.id.startsWith("resident:"),d=JS();'],
 ['if(b.resident||!b.visible)continue;this.updateRemoteGesture(b,l);','if(!b.visible)continue;if(b.resident)stepResident(b,l,g);this.updateRemoteGesture(b,l);'],
 ['return[...t.values()]}function el','return[...t.values(),...residentObstacles(s)]}function el'],
 ['n=t?[t,..._i.filter(i=>i.id!==Qn)]:_i','n=t?[t,..._i.filter(i=>i.id!==Qn&&!i.id.startsWith("resident:"))]:_i.filter(i=>!i.id.startsWith("resident:"))'],
]){if(code.split(original).length!==2)throw new Error('Reference resident hook changed: '+original);code=code.replace(original,replacement);}
// Translate every runtime text/label write synchronously. A delayed DOM observer
// must never race the room directory, playback status or action labels.
const displayAttributes=new Set(['aria-label','title','alt','placeholder']);
const writeTree=ts.createSourceFile('renderer.js',code,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
let textWrites=0,attributeWrites=0;
const transformed=ts.transform(writeTree,[context=>root=>{
 const visit=node=>{
  const n=ts.visitEachChild(node,visit,context);
  if(ts.isBinaryExpression(n)&&n.operatorToken.kind===ts.SyntaxKind.EqualsToken&&ts.isPropertyAccessExpression(n.left)&&n.left.name.text==='textContent'){
   textWrites++;return ts.factory.createCallExpression(ts.factory.createIdentifier('__metaText'),undefined,[n.left.expression,n.right]);
  }
  if(ts.isCallExpression(n)&&ts.isPropertyAccessExpression(n.expression)&&n.expression.name.text==='setAttribute'&&n.arguments[0]&&ts.isStringLiteral(n.arguments[0])&&displayAttributes.has(n.arguments[0].text)){
   attributeWrites++;return ts.factory.createCallExpression(ts.factory.createIdentifier('__metaAttr'),undefined,[n.expression.expression,...n.arguments]);
  }
  return n;
 };
 return ts.visitNode(root,visit);
}]);
code=ts.createPrinter({newLine:ts.NewLineKind.LineFeed}).printFile(transformed.transformed[0]);transformed.dispose();
if(textWrites!==40||attributeWrites!==18)throw new Error(`Reference display writers changed: ${textWrites}/${attributeWrites}`);
const writerBridge=`function __metaLoad(phase){window.dispatchEvent(new CustomEvent("metatemple:load",{detail:phase}));}
function __metaText(target,value){const config=window.metatempleConfig;if(config?.setText)return config.setText(target,value);target.textContent=value;return value;}
function __metaAttr(target,name,value){const config=window.metatempleConfig;if(config?.setAttribute)return config.setAttribute(target,name,value);return target.setAttribute(name,value);}
`;
code=writerBridge+code;
code='/* Reference runtime adapted with reuse permission confirmed by the project owner. Three.js and asset notices: /credits. */\n'+code;
code+='\nwindow.__metatempleDispose=BE;window.__metatempleScene=()=>Kt;\n';
fs.writeFileSync('public/temple/renderer.js',code);
fs.writeFileSync('public/temple/game.css',fs.readFileSync('reference/vendor/sansa-game.css','utf8').replace(/@font-face\{[^}]*\}/g,''));
console.log('Prepared the permitted reference runtime with local assets and isolated metatemple presence.');
