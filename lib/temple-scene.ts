import * as T from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {MeshoptDecoder} from "three/addons/libs/meshopt_decoder.module.js";
import {clone as cloneRig} from "three/addons/utils/SkeletonUtils.js";

export type Ritual = "idle"|"walk"|"bow"|"beads"|"greet"|"sit";
export type Visitor = {id:string;x:number;z:number;yaw:number;action:Ritual};
export type SceneCallbacks = { ready:()=>void; update:(p:{x:number;z:number;yaw:number;action:Ritual;travel:boolean})=>void; bell:()=>void; error:()=>void; seat?:()=>Promise<number|null>; release?:()=>void };
type Monk = {root:T.Group; upper:T.Group; armL:T.Group;armR:T.Group;legL:T.Mesh;legR:T.Mesh;beads:T.Group;state:Ritual;phase:number;target:T.Vector3;targetYaw:number; model?:T.Object3D; bones?:Map<string,{node:T.Object3D;rest:T.Quaternion}>};
export const destinations = {temple:{x:0,z:20},pond:{x:-11.5,z:53},lantern:{x:17,z:55},bell:{x:18,z:36}};
const col = {stone:0xb8b29e,wood:0x503e31,red:0x864a38,jade:0x426a5b,roof:0x444d49,gold:0xd8b66b,leaf:0x647b55};
export function createTemple(host:HTMLElement,callbacks:SceneCallbacks) {
 let dead=false, raf=0, mode:Ritual="idle",travel=false,arrival:Ritual="idle",arrivalCamera:number|null=null,greetUntil=0,night=false,reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
 const scene=new T.Scene(); scene.background=new T.Color(0xd8dbca);scene.fog=new T.Fog(0xd8dbca,100,240);
 const essential:Promise<unknown>[]=[],loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
 const monkAsset=loader.loadAsync("/assets/monk.glb");
 const remoteAsset=loader.loadAsync("/assets/monk-remote-lod.glb");
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:"default",alpha:false});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
 renderer.domElement.setAttribute("aria-label","Interactive 3D Korean temple garden");renderer.domElement.tabIndex=0;host.appendChild(renderer.domElement);
 const camera=new T.PerspectiveCamera(49,1,.1,250);
 const hemi=new T.HemisphereLight(0xf4efdc,0x535a44,.85);scene.add(hemi);
 const sun=new T.DirectionalLight(0xffedd1,2.6);sun.position.set(-24,40,28);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-38;sun.shadow.camera.right=38;sun.shadow.camera.top=38;sun.shadow.camera.bottom=-38;sun.shadow.normalBias=.05;sun.shadow.bias=-.0002;scene.add(sun);
 const warm=new T.SpotLight(0xffe8bd,1600,60,.65,.85,2);warm.position.set(-5,13,-3);warm.target.position.set(0,7,-21);scene.add(warm,warm.target);
 const mats=new Map<string,T.MeshStandardMaterial>();
 const mat=(color:number,roughness=.85,metalness=0)=>{const key=`${color}-${roughness}-${metalness}`;if(!mats.has(key))mats.set(key,new T.MeshStandardMaterial({color,roughness,metalness}));return mats.get(key)!;};
 const texLoader=new T.TextureLoader();
 const loadedTextures:T.Texture[]=[];
 function surface(name:string,repeatX=1,repeatY=1,tint=0xffffff){
  const get=(channel:string)=>{const t=texLoader.load(`/assets/materials/${name}/${channel}.jpg`);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(repeatX,repeatY);t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());if(channel==="color")t.colorSpace=T.SRGBColorSpace;loadedTextures.push(t);return t;};
  return new T.MeshStandardMaterial({color:tint,map:get("color"),normalMap:get("normal"),roughnessMap:get("roughness"),normalScale:new T.Vector2(.22,.22),roughness:.88});
 }
 const wood=surface("wood",1,2,0xe2c3a7),red=wood,jade=surface("wood",2,1,0x35483b),stone=surface("stone",1,1),roofMat=surface("roof",8,4,0x777c77),gold=mat(col.gold,.34,.7),plaster=surface("plaster",4,2,0xd7d1ba);
 const panorama=texLoader.load("/assets/environment/woodland.jpg",t=>{t.colorSpace=T.SRGBColorSpace;t.mapping=T.EquirectangularReflectionMapping;scene.background=t;scene.backgroundBlurriness=.02;});loadedTextures.push(panorama);
 let seed=89;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
 function mesh(g:T.BufferGeometry,m:T.Material,parent:T.Object3D=scene,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function box(w:number,h:number,d:number,m:T.Material,parent:T.Object3D=scene,x=0,y=0,z=0){return mesh(new T.BoxGeometry(w,h,d),m,parent,x,y,z);}
 function sphere(r:number,m:T.Material,parent:T.Object3D,x=0,y=0,z=0,sx=1,sy=1,sz=1){const o=mesh(new T.SphereGeometry(r,20,14),m,parent,x,y,z);o.scale.set(sx,sy,sz);return o;}
 function cylinder(rt:number,rb:number,h:number,m:T.Material,parent:T.Object3D=scene,x=0,y=0,z=0,segments=16){return mesh(new T.CylinderGeometry(rt,rb,h,segments),m,parent,x,y,z);}
 function texture(kind:"stone"|"grass"|"wood") {
  const c=document.createElement("canvas");c.width=c.height=256;const ctx=c.getContext("2d")!;
  ctx.fillStyle=kind==="grass"?"#7f8869":kind==="wood"?"#67533e":"#b9b5a4";ctx.fillRect(0,0,256,256);
  for(let i=0;i<8500;i++){const v=Math.floor(rand()*85);ctx.fillStyle=kind==="grass"?`rgba(${70+v},${78+v},${48+v},.16)`:`rgba(${v},${v},${v},.10)`;ctx.fillRect(rand()*256,rand()*256,kind==="wood"?1:2,kind==="wood"?80:2);}
  if(kind==="stone"){ctx.strokeStyle="#979887";ctx.lineWidth=2;ctx.strokeRect(1,1,254,254);ctx.beginPath();ctx.moveTo(50,40);ctx.lineTo(65,70);ctx.lineTo(62,95);ctx.stroke();}
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;return t;
 }
 const grassTex=texture("grass");grassTex.repeat.set(32,32);const ground=mesh(new T.PlaneGeometry(240,240),surface("ground",45,45,0xc0b99e));ground.rotation.x=-Math.PI/2;
 const stoneTex=texture("stone");const paving=surface("stone",1,1,0xd5d0bc);
 const tiles=new T.InstancedMesh(new T.BoxGeometry(1.96,.12,1.96),paving,500);const dummy=new T.Object3D();let ti=0;
 for(let x=-5;x<=5;x++)for(let z=0;z<=42;z++){if(ti>=500)break;dummy.position.set(x*2,.015,z*2+5);dummy.rotation.set(0,(rand()-.5)*.012,0);dummy.updateMatrix();tiles.setMatrixAt(ti++,dummy.matrix);}tiles.count=ti;tiles.receiveShadow=true;scene.add(tiles);
 // The same public pine scan and woodland panorama form the surrounding landscape.
 essential.push(loader.loadAsync("/assets/models/pine.glb").then(g=>{
  if(dead)return;const variants=g.scene.children;
  for(let i=0;i<50;i++){const a=rand()*Math.PI*2,r=54+rand()*35,tree=variants[i%variants.length].clone(true);tree.position.set(Math.cos(a)*r,0,Math.sin(a)*r+24);const size=new T.Box3().setFromObject(tree).getSize(new T.Vector3());tree.scale.multiplyScalar((5+rand()*7)/Math.max(size.y,.01));tree.rotation.y=rand()*Math.PI*2;tree.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=false;o.receiveShadow=true;}});scene.add(tree);}
 }));
 // Stone retaining wall, platform, stairs and timber hall.
 const hall=new T.Group();hall.position.set(0,0,0);hall.scale.set(2,2,3.8);scene.add(hall);
 box(25,1.1,17,stone,hall,0,.55,0);box(25.7,.18,17.6,mat(0xc8c0a8),hall,0,1.12,0);
 for(let i=0;i<4;i++)box(10,.24,1.2,stone,hall,0,.12+i*.24,10.3-i*.9);
 const floorTex=texture("wood");box(23.8,.12,16.1,surface("wood",20,22,0xbca38f),hall,0,1.27,0);
 box(24,6,.25,plaster,hall,0,4.25,-7.8);
 box(24,.24,.38,wood,hall,0,1.7,-7.55);
 for(const side of[-1,1]){
  box(.22,1.05,16,plaster,hall,12*side,1.85,0);
  for(let j=0;j<4;j++){const z=-6+j*4;
   for(let k=0;k<=8;k++)box(.15,3.8,.065,wood,hall,12*side,4.25,z-1.8+k*.45);
   for(let k=0;k<=5;k++)box(.17,.065,3.8,wood,hall,12*side,2.35+k*.74,z);
  }
 }
 for(const x of[-11,-6,6,11])for(const z of[-6,6.4]){cylinder(.36,.44,6.4,red,hall,x,4.4,z);cylinder(.56,.62,.35,stone,hall,x,1.45,z);box(1.2,.26,1.2,jade,hall,x,7.1,z);box(1.65,.22,.85,red,hall,x,7.4,z);}
 for(const z of[-6.5,6.5]){box(25,.5,.55,jade,hall,0,7,z);box(25,.14,.65,mat(0xb1945c),hall,0,6.7,z);}
 for(let i=-11;i<=11;i+=1.4){box(.18,.35,15.2,red,hall,i,7.35,0);box(.35,.2,1.9,jade,hall,i,7.1,7);}
 function roof(parent:T.Object3D,w:number,d:number,y:number){
  for(const side of[-1,1]){
   const verts:number[]=[],uvs:number[]=[],indices:number[]=[];const steps=14;
   for(let ix=0;ix<=steps;ix++)for(let iz=0;iz<=steps;iz++){const u=ix/steps,v=iz/steps;const x=(u-.5)*w,z=v*d/2*side;const height=y+3.4*(1-v)**1.65+.65*Math.pow(Math.abs(x)/(w/2),7)+.45*v**8;verts.push(x,height,z);uvs.push(u*8,v*4);if(ix<steps&&iz<steps){const a=ix*(steps+1)+iz;indices.push(a,a+1,a+steps+1,a+1,a+steps+2,a+steps+1);}}
   const g=new T.BufferGeometry();g.setAttribute("position",new T.Float32BufferAttribute(verts,3));g.setAttribute("uv",new T.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();const m=roofMat.clone();m.side=T.DoubleSide;mesh(g,m,parent);
   const rails=new T.InstancedMesh(new T.CylinderGeometry(.11,.11,d/2+.2,6),mat(0x64706a),Math.ceil(w/.5));let n=0;
   for(let x=-w/2;x<w/2;x+=.5){const points=[];for(let j=0;j<=14;j++){const v=j/14;points.push(new T.Vector3(x,y+3.4*(1-v)**1.65+.65*Math.pow(Math.abs(x)/(w/2),7)+.45*v**8+.055,v*d/2*side));}const curve=new T.CatmullRomCurve3(points);const tile=mesh(new T.TubeGeometry(curve,14,.065,4,false),mat(0x606b65),parent);tile.castShadow=false;n++;}rails.dispose();
  }
  const ridge=cylinder(.22,.22,w+.5,mat(0x727a6c),parent,0,y+3.55,0);ridge.rotation.z=Math.PI/2;
  for(const s of[-1,1]){sphere(.34,roofMat,parent,s*(w/2-.2),y+4,0,.7,1.4,.7);}
 }
 roof(hall,29,21,7.65);
 for(let x=-11.4;x<=11.4;x+=.85){box(.16,.19,16.8,wood,hall,x,7.58,0);}
 for(const z of[-6.8,-3.4,0,3.4,6.8])box(24,.3,.35,wood,hall,0,7.3,z);
 for(const x of[-8,-3,3,8]){cylinder(.20,.20,.65,new T.MeshStandardMaterial({color:0xffffe7,emissive:0xffffd5,emissiveIntensity:.65}),hall,x,6.7,2.5,16);cylinder(.23,.23,.06,wood,hall,x,6.35,2.5);cylinder(.23,.23,.06,wood,hall,x,7.05,2.5);cylinder(.018,.018,.5,wood,hall,x,7.3,2.5);}

 // National Museum of Korea: Goryeo seated Buddha, KOGL Type 1 (attribution in /credits).
 const muralTexture=texLoader.load("/assets/altar-devotion.jpg");muralTexture.colorSpace=T.SRGBColorSpace;muralTexture.anisotropy=8;loadedTextures.push(muralTexture);
 box(12.3,6.3,.16,wood,hall,0,4.55,-7.5);
 mesh(new T.PlaneGeometry(12,6),new T.MeshStandardMaterial({map:muralTexture,roughness:.97}),hall,0,4.55,-7.39);
 const altarWood=surface("wood",3,1,0x493429);box(8.2,.62,2.25,altarWood,hall,0,1.64,-5.75);box(8.5,.16,2.5,wood,hall,0,2.03,-5.75);
 for(const x of[-3.1,-1.05,1.05,3.1]){box(1.8,.4,.06,wood,hall,x,1.68,-4.6);box(1.58,.25,.035,altarWood,hall,x,1.68,-4.55);}
 essential.push(loader.loadAsync("/assets/models/buddha.glb").then(g=>{
  if(dead)return;const object=g.scene,bounds=new T.Box3().setFromObject(object),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());const scale=3.2/size.y;
  object.scale.multiplyScalar(scale);object.scale.z*=2/3.8;object.position.set(-center.x*scale,2.12-bounds.min.y*scale,-5.65-center.z*scale);
  object.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=true;o.receiveShadow=true;const ms=Array.isArray(o.material)?o.material:[o.material];for(const m of ms)if(m instanceof T.MeshStandardMaterial){m.roughness=.65;m.metalness=.15;}}});hall.add(object);
 }));
 for(const x of[-3.25,3.25]){cylinder(.13,.25,.65,mat(0x789889,.5),hall,x,2.45,-5.3);for(let i=0;i<5;i++){const a=i/5*Math.PI*2;const stem=cylinder(.015,.015,.55,mat(0x63794c),hall,x+Math.sin(a)*.14,2.9,-5.3+Math.cos(a)*.12);sphere(.09,mat(0xebe4cb),hall,x+Math.sin(a)*.14,3.18,-5.3+Math.cos(a)*.12,.8,1.25,.8);}}
 cylinder(.25,.31,.13,gold,hall,0,2.18,-4.8);for(let i=-1;i<=1;i++)cylinder(.008,.008,.45,wood,hall,i*.07,2.47,-4.8);
 box(.55,1.2,.5,wood,hall,0,1.95,-3.75);box(.85,.12,.66,wood,hall,0,2.6,-3.75);
 // A plaque uses original bilingual lettering, with no borrowed textures.
 function plaque(text:string){const c=document.createElement("canvas");c.width=1024;c.height=256;const cx=c.getContext("2d")!;cx.fillStyle="#304e43";cx.fillRect(0,0,1024,256);cx.strokeStyle="#c3ad73";cx.lineWidth=8;cx.strokeRect(12,12,1000,232);cx.fillStyle="#e0ca94";cx.textAlign="center";cx.font="72px Georgia";cx.fillText(text,512,124);cx.font="23px sans-serif";cx.fillText("metatemple",512,191);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return new T.MeshStandardMaterial({map:t,roughness:1});}
 box(5.7,1.43,.15,plaque("淸 緣 堂"),hall,0,8,8.2);
 // One hundred cushions arranged as in the reference hall.
 const cushionPositions=Array.from({length:100},(_,i)=>({x:((i%10)<5?(i%10)-5:(i%10)-4)*3.6,z:-12.6+Math.floor(i/10)*4.2}));
 const cushionMaterial=surface("cloth",1,1,0x77816b);
 for(const p of cushionPositions){const pad=box(1.65,.10,1.15,cushionMaterial,scene,p.x,2.78,p.z);pad.rotation.y=(rand()-.5)*.04;}
 const yard=new T.Group();yard.position.z=40;scene.add(yard);
 // Stone lanterns with soft emissive paper; warm by day, luminous at night.
 const emissive=new T.MeshStandardMaterial({color:0xffefcd,emissive:0xffc56e,emissiveIntensity:.45,roughness:.7});
 const lamps:T.Mesh[]=[];
 function lantern(x:number,z:number,small=false){const g=new T.Group();g.position.set(x,0,z);yard.add(g);const h=small?1.25:1.8;cylinder(.45,.6,.2,stone,g,0,.1,0);cylinder(.13,.2,h-.2,wood,g,0,h/2,0);box(.85,.12,.85,wood,g,0,h,0);const paper=box(.59,.72,.59,emissive,g,0,h+.4,0);lamps.push(paper);for(const x of[-.34,.34])for(const z of[-.34,.34])box(.07,.85,.07,wood,g,x,h+.4,z);const cap=mesh(new T.ConeGeometry(.7,.24,4),roofMat,g,0,h+.95,0);cap.rotation.y=Math.PI/4;}
 for(let z=1;z<=32;z+=7){lantern(-6.7,z,true);lantern(6.7,z,true);}
 const path=new T.CatmullRomCurve3([new T.Vector3(7,.02,25),new T.Vector3(17,.02,22),new T.Vector3(22,.02,13),new T.Vector3(19,.02,4),new T.Vector3(12,.02,0)]);
 for(let i=0;i<42;i++){const p=path.getPoint(i/41);const s=cylinder(.9,1,.1,stone,yard,p.x,.025,p.z,7);s.rotation.y=rand()*4;}
 for(let i=0;i<9;i++){const p=path.getPoint(i/8);lantern(p.x+2.4,p.z);}
 const ropePoints=[];for(let i=0;i<40;i++){const p=path.getPoint(i/39);p.y=5-Math.sin(i/39*Math.PI*4)*.35;ropePoints.push(p);}
 mesh(new T.TubeGeometry(new T.CatmullRomCurve3(ropePoints),60,.025,4,false),wood,yard);
 for(let i=0;i<18;i++){const p=path.getPoint((i+.5)/18);const y=4.3-Math.sin((i+.5)/18*Math.PI*4)*.35;const lamp=sphere(.31,i%3?emissive:mat(0xcf9d87),yard,p.x,y,p.z,1,1.2,1);lamps.push(lamp);cylinder(.16,.16,.08,wood,yard,p.x,y+.38,p.z);}
 // Lotus pond: irregular shore stones, floating pads, flowers and animated rings.
 const waterMat=new T.MeshStandardMaterial({color:0x739690,roughness:.24,metalness:.3,transparent:true,opacity:.84});
 const pond=cylinder(6.8,6.8,.1,waterMat,yard,-20,.04,13,64);pond.scale.z=.76;
 const ripples:T.Mesh[]=[];
 for(let i=0;i<38;i++){const a=i/38*Math.PI*2;const r=6.8+rand()*.4;const rock=sphere(.6,stone,yard,-20+Math.cos(a)*r,.1,13+Math.sin(a)*r*.76,1.2,.65,1);rock.rotation.y=rand()*3;}
 for(let i=0;i<22;i++){const x=-20+(rand()-.5)*9,z=13+(rand()-.5)*6;const pad=cylinder(.45,.45,.025,mat(0x4c795c),yard,x,.13,z,18);pad.rotation.y=rand()*6;if(i%3===0){for(let j=0;j<7;j++){const a=j/7*Math.PI*2;const petal=sphere(.18,mat(0xe2bdb0),yard,x+Math.cos(a)*.12,.26,z+Math.sin(a)*.12,.6,1.6,.5);petal.rotation.z=Math.sin(a)*.8;petal.rotation.x=Math.cos(a)*.8;}sphere(.08,gold,yard,x,.32,z);}
  if(i%5===0){const ring=mesh(new T.RingGeometry(.7,.73,48),new T.MeshBasicMaterial({color:0xe4edda,transparent:true,opacity:.3,side:T.DoubleSide}),yard,x,.11,z);ring.rotation.x=-Math.PI/2;ripples.push(ring);}}
 // Bell pavilion, audible when visited.
 const pavilion=new T.Group();pavilion.position.set(20,0,-6);yard.add(pavilion);box(6,.3,5,stone,pavilion,0,.15,0);
 for(const x of[-2.3,2.3])for(const z of[-1.8,1.8])cylinder(.2,.25,4.6,red,pavilion,x,2.5,z);
 box(5.6,.3,4.6,jade,pavilion,0,4.7,0);roof(pavilion,7.2,6.8,4.9);const bell=cylinder(.9,1.25,1.9,mat(0x657565,.38,.65),pavilion,0,2.8,0,24);cylinder(1.28,1.3,.16,gold,pavilion,0,1.8,0,32);cylinder(.08,.08,.8,wood,pavilion,0,4.1,0);
 // Low perimeter walls and raked rock gardens.
 for(const s of[-1,1]){box(.7,1.2,34,stone,yard,s*30,.6,8);box(1,.15,34,roofMat,yard,s*30,1.25,8);}
 for(let i=0;i<44;i++){const a=rand()*6.28,r=25+rand()*4;const rock=sphere(.4+rand()*.55,mat(0x8f9482),yard,Math.cos(a)*r,.2,Math.sin(a)*r,1.2,1,1);rock.rotation.set(rand(),rand(),0);}
 // Floating motes: subtle presence without relying on image assets.
 const moteGeo=new T.BufferGeometry();const coords=new Float32Array(100*3);for(let i=0;i<100;i++){coords[i*3]=(rand()-.5)*60;coords[i*3+1]=1+rand()*10;coords[i*3+2]=(rand()-.5)*65;}moteGeo.setAttribute("position",new T.BufferAttribute(coords,3));const motes=new T.Points(moteGeo,new T.PointsMaterial({color:0xfff5ce,size:.055,transparent:true,opacity:.65}));scene.add(motes);
 const shadowTexture=(()=>{const c=document.createElement("canvas");c.width=c.height=64;const cx=c.getContext("2d")!;const g=cx.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,"rgba(20,26,15,.38)");g.addColorStop(1,"rgba(20,26,15,0)");cx.fillStyle=g;cx.fillRect(0,0,64,64);return new T.CanvasTexture(c);})();
 function monk(self=false):Monk {
  const root=new T.Group(),upper=new T.Group();root.add(upper);scene.add(root);upper.position.y=.28;
  const skin=mat(0xd9b98e),robe=mat(self?0xe8e7d9:0xd4d7c9),sash=mat(self?0xd8bc79:0xb9ad8e);
  const body=cylinder(.29,.49,.81,robe,upper,0,.56,0,18);body.scale.z=.8;
  sphere(.43,skin,upper,0,1.31,0,1,1.04,1);for(const s of[-1,1])sphere(.09,skin,upper,s*.42,1.28,0,.6,1,.8);
  const panel=box(.27,.63,.055,sash,upper,.08,.59,.335);panel.rotation.z=-.25;const back=box(.27,.65,.05,sash,upper,-.08,.6,-.33);back.rotation.z=.25;
  const arms=[-1,1].map(s=>{const a=new T.Group();a.position.set(s*.33,.88,0);upper.add(a);const sleeve=cylinder(.14,.17,.48,robe,a,0,-.18,0);sphere(.105,skin,a,0,-.43,.015);a.rotation.z=s*.16;return a;});
  const legs=[-1,1].map(s=>{const l=cylinder(.13,.14,.31,robe,root,s*.17,.2,0);sphere(.13,mat(0x646759),root,s*.17,.075,.08,1,.55,1.6);return l;});
  const beads=new T.Group();upper.add(beads);beads.position.set(0,.62,.48);for(let i=0;i<15;i++){const a=i/15*Math.PI*2;sphere(.035,mat(0x6b4631),beads,Math.sin(a)*.18,Math.cos(a)*.18,0);}beads.visible=false;
  const shade=mesh(new T.PlaneGeometry(1.6,1.6),new T.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false}),root,0,.025,0);shade.rotation.x=-Math.PI/2;shade.castShadow=false;
  const actor:Monk={root,upper,armL:arms[0],armR:arms[1],legL:legs[0],legR:legs[1],beads,state:"idle",phase:rand()*6.28,target:new T.Vector3(),targetYaw:0};
  const loaded=(self?monkAsset:remoteAsset).then(g=>{if(dead)return;const model=cloneRig(g.scene),bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3());const scale=1.65/size.y;model.scale.multiplyScalar(scale);model.position.y=-bounds.min.y*scale;model.rotation.y=Math.PI;model.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=self;o.receiveShadow=true;}});upper.visible=false;legs.forEach(l=>l.visible=false);for(const c of root.children)if(c instanceof T.Mesh&&c!==shade)c.visible=false;root.add(model);actor.model=model;actor.bones=new Map();model.traverse(o=>{if(o instanceof T.Bone)actor.bones!.set(o.name,{node:o,rest:o.quaternion.clone()});});});if(self)essential.push(loaded);else void loaded.catch(()=>{});
  return actor;
 }
 const self=monk(true);self.root.position.set(0,0,42);self.root.rotation.y=Math.PI;
 const residents=[12,15,17,18].map(index=>{const actor=monk();const p=cushionPositions[index];actor.root.position.set(p.x,2.7,p.z);actor.root.rotation.y=Math.PI;return actor;});
 const remotes=new Map<string,Monk>();const targetMarker=mesh(new T.RingGeometry(.37,.43,40),new T.MeshBasicMaterial({color:0xf1ddb1,transparent:true,opacity:.85,side:T.DoubleSide}),scene);targetMarker.rotation.x=-Math.PI/2;targetMarker.visible=false;
 const trailGeo=new T.BufferGeometry();const trail=new T.Line(trailGeo,new T.LineDashedMaterial({color:0xe0d0a6,dashSize:.28,gapSize:.2,transparent:true,opacity:.6}));scene.add(trail);trail.visible=false;
 let destination=new T.Vector3(0,0,42),waypoints:T.Vector3[]=[],cameraYaw=0,cameraPitch=.4,distance=10.5,pointer:{x:number;y:number;id:number;dragged:boolean}|null=null;
 let tick=0,lastNotify=0,lastBell=0;const keys=new Set<string>();const ray=new T.Raycaster(),plane=new T.Plane(new T.Vector3(0,1,0),0),v2=new T.Vector2();
 function floor(x:number,z:number){if(Math.abs(x)<25&&z<=32&&z> -32)return 2.7;if(Math.abs(x)<10&&z<40&&z>32)return(40-z)/8*2.7;return 0;}
 function allowed(x:number,z:number){if(x< -45||x>45||z< -31||z>90)return false;if(((x+20)/7.4)**2+((z-53)/5.9)**2<1)return false;if(z<32&&z>-32&&Math.abs(x)>23.4&&Math.abs(x)<25)return false;return true;}
 function go(x:number,z:number,ritual:Ritual="idle"){
  if(ritual!=="bow")callbacks.release?.();
  x=T.MathUtils.clamp(x,-44,44);z=T.MathUtils.clamp(z,-30,89);if(!allowed(x,z))return;
  destination.set(x,0,z);waypoints=[];arrivalCamera=null;
  const pos=self.root.position;
  if((z<32&&pos.z>34)||(z>34&&pos.z<32)){waypoints.push(new T.Vector3(0,0,39.8),new T.Vector3(0,0,31.5));if(pos.z<32)waypoints.reverse();}
  // Route long crossings to the open courtyard rather than through the pond.
  if(pos.x< -13&&z>45&&z<63&&x> -12)waypoints.unshift(new T.Vector3(-11,0,pos.z>53?63:43));
  waypoints.push(destination.clone());mode="walk";arrival=ritual;travel=true;targetMarker.visible=true;targetMarker.position.set(x,floor(x,z)+.04,z);trail.visible=true;
  const points=[pos.clone().add(new T.Vector3(0,.09,0)),...waypoints.map(p=>new T.Vector3(p.x,floor(p.x,p.z)+.09,p.z))];trail.geometry.dispose();trail.geometry=new T.BufferGeometry().setFromPoints(points);trail.computeLineDistances();notify();
 }
 const clickDown=(e:PointerEvent)=>{if(e.button!==0)return;pointer={x:e.clientX,y:e.clientY,id:e.pointerId,dragged:false};renderer.domElement.setPointerCapture(e.pointerId);};
 const clickMove=(e:PointerEvent)=>{if(!pointer||e.pointerId!==pointer.id)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;if(Math.hypot(dx,dy)>3)pointer.dragged=true;if(pointer.dragged){cameraYaw-=dx*.006;cameraPitch=T.MathUtils.clamp(cameraPitch+dy*.003,.12,.95);pointer.x=e.clientX;pointer.y=e.clientY;}};
 const clickUp=(e:PointerEvent)=>{if(!pointer)return;const dragged=pointer.dragged;pointer=null;if(dragged)return;const b=renderer.domElement.getBoundingClientRect();v2.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(v2,camera);const point=new T.Vector3();if(ray.ray.intersectPlane(plane,point))go(point.x,point.z);};
 const scroll=(e:WheelEvent)=>{e.preventDefault();distance=T.MathUtils.clamp(distance+e.deltaY*.008,5.2,19);};
 const keydown=(e:KeyboardEvent)=>{if((e.target as HTMLElement).closest("input,select,textarea,[role=dialog],button"))return;const k=e.key.toLowerCase();if(["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright"," ","1","2","3","e"].includes(k)){e.preventDefault();keys.add(k);if(k==="1"||k==="e"||k===" ")ritual("bow");if(k==="2")ritual("beads");if(k==="3")ritual("greet");}};
 const keyup=(e:KeyboardEvent)=>keys.delete(e.key.toLowerCase());const blur=()=>{keys.clear();pointer=null;};
 renderer.domElement.addEventListener("pointerdown",clickDown);renderer.domElement.addEventListener("pointermove",clickMove);renderer.domElement.addEventListener("pointerup",clickUp);renderer.domElement.addEventListener("pointercancel",blur);renderer.domElement.addEventListener("wheel",scroll,{passive:false});window.addEventListener("keydown",keydown);window.addEventListener("keyup",keyup);window.addEventListener("blur",blur);
 function ritual(value:Ritual){
  if(value!=="bow")callbacks.release?.();
  if(value==="greet"){mode="greet";travel=false;greetUntil=performance.now()+2400;waypoints=[];targetMarker.visible=trail.visible=false;callbacks.bell();}
  else if(mode===value||travel){mode="idle";travel=false;waypoints=[];targetMarker.visible=trail.visible=false;callbacks.release?.();}
  else if(value==="bow"){void(callbacks.seat?.()??Promise.resolve(84)).then(index=>{if(index===null)return;const p=cushionPositions[index];go(p.x,p.z,"bow");});}
  else {mode=value;travel=false;waypoints=[];targetMarker.visible=trail.visible=false;}
  notify();
 }
 function notify(){callbacks.update({x:self.root.position.x,z:self.root.position.z,yaw:self.root.rotation.y,action:mode,travel});lastNotify=performance.now();}
 function pose(m:Monk,state:Ritual,t:number,moving=false){
  if(m.model&&m.bones){
   for(const b of m.bones.values())b.node.quaternion.copy(b.rest);
   const turn=(name:string,x:number,z=0)=>{const b=m.bones!.get(name);if(b)b.node.quaternion.multiply(new T.Quaternion().setFromEuler(new T.Euler(x,0,z)));};
   const bow=state==="bow"?(reduced?.6:(1-Math.cos(t*1.15))*.5):0;
   turn("spine",bow*1.0);turn("chest",bow*.35);turn("neck",bow*.22);if(state==="bow"||state==="sit"){turn("thigh.L",1.05);turn("thigh.R",1.05);turn("shin.L",-1.5);turn("shin.R",-1.5);const hips=m.bones.get("hips");if(hips)hips.node.position.y=.48;}else{const hips=m.bones.get("hips");if(hips)hips.node.position.y=.7;}
   const step=moving&&!reduced?Math.sin(t*8)*.22:0;turn("thigh.L",step);turn("thigh.R",-step);
   if(state==="greet"||state==="beads"){turn("upper_arm.L",-.65,-.45);turn("upper_arm.R",-.65,.45);turn("forearm.L",-.7);turn("forearm.R",-.7);}else{turn("upper_arm.L",step*.5);turn("upper_arm.R",-step*.5);}
   m.model.position.y=state==="sit"||state==="bow"?-.2*bow:0;m.root.scale.y=state==="sit"?.8:1;return;
  }
  const bow=state==="bow"?(reduced?.42:(1-Math.cos(t*1.3))*.5):0;const praying=state==="greet"||state==="beads";
  m.upper.rotation.x=bow*1.2;m.upper.position.y=.28-bow*.2;m.root.scale.y=state==="sit"?.75:1;
  m.armL.rotation.set(praying?-1.1:bow*.5,0,praying?-.56:-.12);m.armR.rotation.set(praying?-1.1:bow*.5,0,praying?.56:.12);
  const step=moving&&!reduced?Math.sin(t*9)*.35:0;m.legL.rotation.x=step;m.legR.rotation.x=-step;if(moving){m.armL.rotation.x=step*.7;m.armR.rotation.x=-step*.7;}
  m.beads.visible=state==="beads";m.beads.rotation.z=t*.4;
 }
 function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}const observer=new ResizeObserver(resize);observer.observe(host);resize();
 camera.position.set(0,4.6,27);camera.lookAt(0,2.1,10);
 const clock=new T.Clock();let previous=0;
 function animate(now:number){if(dead)return;raf=requestAnimationFrame(animate);if(document.hidden){previous=now;return;}const dt=Math.min((now-previous)/1000,.05);previous=now;tick+=dt;
  let moving=false;const dx=(keys.has("d")||keys.has("arrowright")?1:0)-(keys.has("a")||keys.has("arrowleft")?1:0),dz=(keys.has("s")||keys.has("arrowdown")?1:0)-(keys.has("w")||keys.has("arrowup")?1:0);
  if(dx||dz){if(mode==="bow"||mode==="beads")callbacks.release?.();waypoints=[];travel=false;targetMarker.visible=trail.visible=false;const move=new T.Vector3(dx,0,dz).normalize().applyAxisAngle(new T.Vector3(0,1,0),cameraYaw);const pos=self.root.position;const nx=pos.x+move.x*dt*4.8,nz=pos.z+move.z*dt*4.8;if(allowed(nx,nz)){pos.x=nx;pos.z=nz;self.root.rotation.y=Math.atan2(move.x,move.z);moving=true;mode="walk";}}
  else if(waypoints.length){const p=waypoints[0],delta=p.clone().sub(self.root.position);delta.y=0;if(delta.length()<.16){waypoints.shift();if(!waypoints.length){travel=false;mode=arrival;targetMarker.visible=trail.visible=false;if(arrival==="bow")self.root.rotation.y=Math.PI;if(arrivalCamera!==null){cameraYaw=arrivalCamera;arrivalCamera=null;}notify();}}
   else{delta.normalize();const nx=self.root.position.x+delta.x*dt*4.3,nz=self.root.position.z+delta.z*dt*4.3;if(allowed(nx,nz)){self.root.position.x=nx;self.root.position.z=nz;self.root.rotation.y=Math.atan2(delta.x,delta.z);moving=true;}else{travel=false;waypoints=[];mode="idle";targetMarker.visible=trail.visible=false;notify();}}}
  else if(mode==="walk")mode="idle";
  if(mode==="greet"&&now>greetUntil){mode="idle";notify();}
  self.root.position.y=floor(self.root.position.x,self.root.position.z);pose(self,mode,tick,moving);
  const pos=self.root.position;const cp=new T.Vector3(pos.x+Math.sin(cameraYaw)*distance,2.1+pos.y+Math.sin(cameraPitch)*distance*.4,pos.z+Math.cos(cameraYaw)*distance);camera.position.lerp(cp,1-Math.exp(-dt*5));camera.lookAt(pos.x-Math.sin(cameraYaw)*2,pos.y+1.9,pos.z-Math.cos(cameraYaw)*2);
  if(!reduced){for(const [i,ring]of ripples.entries()){const scale=1+((tick*.22+i*.3)%1)*1.4;ring.scale.setScalar(scale);(ring.material as T.MeshBasicMaterial).opacity=.3*(1-(scale-1)/1.4);}motes.position.y=Math.sin(tick*.15)*.3;}
  for(const m of residents)pose(m,"bow",tick+m.phase,false);
  for(const m of remotes.values()){const delta=m.target.clone().sub(m.root.position);m.root.position.lerp(m.target,1-Math.exp(-dt*3));m.root.position.y=floor(m.root.position.x,m.root.position.z);const diff=Math.atan2(Math.sin(m.targetYaw-m.root.rotation.y),Math.cos(m.targetYaw-m.root.rotation.y));m.root.rotation.y+=diff*Math.min(1,dt*5);pose(m,m.state,tick+m.phase,delta.length()>.2);}
  if(Math.hypot(pos.x-20,pos.z-34)<3.5&&now-lastBell>20000){callbacks.bell();lastBell=now;}
  if(now-lastNotify>250)notify();renderer.render(scene,camera);
 }
 try{renderer.render(scene,camera);Promise.all(essential).then(()=>{if(!dead)callbacks.ready();}).catch(e=>{console.error("Model loading failed",e);callbacks.error();});raf=requestAnimationFrame(animate);}catch{callbacks.error();}
 return {
  ritual,go,
  visit:(place:keyof typeof destinations)=>{const p=destinations[place];go(p.x,p.z,place==="temple"?"bow":place==="pond"?"sit":"idle");arrivalCamera=place==="pond"?Math.PI/2:0;},
  state:()=>({x:self.root.position.x,z:self.root.position.z,yaw:self.root.rotation.y,action:mode}),
  reset:()=>{self.root.position.set(0,0,42);mode="idle";travel=false;waypoints=[];cameraYaw=0;notify();},
  visitors:(list:Visitor[])=>{const ids=new Set(list.map(p=>p.id));for(const[id,m]of remotes)if(!ids.has(id)){scene.remove(m.root);remotes.delete(id);}for(const p of list){let m=remotes.get(p.id);if(!m){m=monk();m.root.position.set(p.x,floor(p.x,p.z),p.z);remotes.set(p.id,m);}m.target.set(p.x,floor(p.x,p.z),p.z);m.targetYaw=p.yaw;m.state=p.action;}},
  night:(value:boolean)=>{night=value;scene.background=new T.Color(night?0x1e303b:0xd8dbca);scene.fog=new T.Fog(night?0x1e303b:0xd8dbca,100,240);hemi.intensity=night?.8:2;sun.intensity=night?.45:3.1;sun.color.set(night?0x9dbbd4:0xffedd1);emissive.emissiveIntensity=night?2:.45;renderer.toneMappingExposure=night?1:1.15;},
  quality:(low:boolean)=>{renderer.setPixelRatio(low?Math.min(devicePixelRatio,1):Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=!low;resize();},
  reduced:(value:boolean)=>{reduced=value;},
  pause:(paused:boolean)=>{renderer.domElement.style.visibility=paused?"hidden":"visible";if(paused){keys.clear();waypoints=[];mode="idle";travel=false;}},
  dispose:()=>{dead=true;cancelAnimationFrame(raf);observer.disconnect();renderer.domElement.removeEventListener("pointerdown",clickDown);renderer.domElement.removeEventListener("pointermove",clickMove);renderer.domElement.removeEventListener("pointerup",clickUp);renderer.domElement.removeEventListener("wheel",scroll);window.removeEventListener("keydown",keydown);window.removeEventListener("keyup",keyup);window.removeEventListener("blur",blur);scene.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Points||o instanceof T.Line){o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];for(const m of ms)m.dispose();}});grassTex.dispose();stoneTex.dispose();floorTex.dispose();shadowTexture.dispose();loadedTextures.forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove();}
 };
}
export type TempleScene = ReturnType<typeof createTemple>;
