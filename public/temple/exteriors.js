import {hallFor} from './halls.js';

// Each hall is a walkable mesh scene. Reference photographs are design references,
// never billboards in the world. Only the selected exterior occupies GPU memory.
let collision=[],themed=false;
export const isThemedExterior=()=>themed;
export function exteriorBlocked(x,z,padding=0){
 for(const c of collision){if(c.kind==='circle'&&Math.hypot(x-c.x,z-c.z)<c.r+padding)return true;
  if(c.kind==='ellipse'&&((x-c.x)/(c.rx+padding))**2+((z-c.z)/(c.rz+padding))**2<1)return true;
  if(c.kind==='box'&&Math.abs(x-c.x)<c.w/2+padding&&Math.abs(z-c.z)<c.d/2+padding)return true;}
 return false;
}
const palettes={
 2:{wood:'#513022',trim:'#aa7446',plaster:'#70684e',roof:'#293231',stone:'#777363',leaf:'#254437',sky:['#233934','#97a794','#e5d6a9'],fog:'#9aa58f',sun:'#ffdb9c',light:1.9,lantern:'#ffbd4f',glow:'#ffb544',grass:'#47513c'},
 3:{wood:'#8c2839',trim:'#d5a34d',plaster:'#e2c5ab',roof:'#304f59',stone:'#6d6981',leaf:'#b858a2',sky:['#35284d','#a96d9c','#efb4ac'],fog:'#a17e9b',sun:'#ffc6a3',light:1.4,lantern:'#ff9c3f',glow:'#ffd27a',grass:'#535a59'},
 4:{wood:'#463631',trim:'#817452',plaster:'#b9ae8b',roof:'#263345',stone:'#535f71',leaf:'#394d58',sky:['#0c1832','#294365','#7893ab'],fog:'#526b87',sun:'#b3d1ff',light:.75,lantern:'#ff5835',glow:'#ffb566',grass:'#364e51'},
 5:{wood:'#454332',trim:'#8e8259',plaster:'#727664',roof:'#354637',stone:'#626a59',leaf:'#3e593d',sky:['#475a4e','#93a28b','#d4d3aa'],fog:'#b3bba4',sun:'#fff1bf',light:1.7,lantern:'#f5cf6c',glow:'#ffdf78',grass:'#485d39'},
 6:{wood:'#533a26',trim:'#b68d47',plaster:'#b3ab8c',roof:'#3b3b30',stone:'#93917d',leaf:'#42543b',sky:['#526b67','#d3c394','#f5dfaa'],fog:'#c7bc96',sun:'#ffdda0',light:1.8,lantern:'#ffc14d',glow:'#ffbc36',grass:'#666343'},
 7:{wood:'#493c30',trim:'#8e8a61',plaster:'#c1b99e',roof:'#3c4441',stone:'#888b7b',leaf:'#456a4c',sky:['#9cb6b1','#ebc9ad','#f2d7bb'],fog:'#bac7b8',sun:'#ffe0bd',light:1.6,lantern:'#ffbd68',glow:'#ffd391',grass:'#658458'},
};
function seeded(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}

function buildExterior(T,number,height){
 const p=palettes[number],random=seeded(7919*number),root=new T.Group(),building=new T.Group(),garden=new T.Group();
 root.name=`metatemple-hall-${number}-exterior`;building.name='exterior architecture';garden.name='exterior landscape';root.add(building,garden);
 const resources=new Set(),materials=new Map(),batches=new Map(),geometries=new Map(),obstacles=[{kind:'box',x:34,z:29.6,w:12,d:5.2},...[23,45].flatMap(x=>[27,47].map(z=>({kind:'circle',x,z,r:.65})))],animations=[];let alive=true;
 const keep=value=>(resources.add(value),value),dummy=new T.Group();
 const material=(name,color,extra={})=>{if(!materials.has(name))materials.set(name,keep(new T.MeshStandardMaterial({name,color,roughness:.86,...extra})));return materials.get(name);};
 const wood=material('wood',p.wood),trim=material('trim',p.trim),stone=material('stone',p.stone),darkStone=material('dark stone','#414a43'),plaster=material('plaster',p.plaster),roofMat=material('tiles',p.roof,{side:T.DoubleSide}),roofRib=material('tile ridges',p.roof),gold=material('aged brass','#b49a50',{metalness:.65,roughness:.4}),grass=material('moss',p.grass),trunk=material('bark','#393b2e'),leaves=material('leaves',p.leaf),lightLeaf=material('sunlit leaves',number===3?'#ecaccf':number===4?'#667b86':'#6e8653');
 const lamp=material('lantern paper',p.lantern,{emissive:p.lantern,emissiveIntensity:number===4?.9:.65,roughness:.72}),lampRib=material('lantern ribs',number===4?'#9e3e26':'#a86a2c'),windowMat=material('rice paper','#bc9c69',{emissive:'#efad54',emissiveIntensity:number===4?.35:.15,side:T.DoubleSide});
 // Fine grain is generated once per exterior and shared across the timber batch.
 const grain=document.createElement('canvas');grain.width=128;grain.height=256;const ctx=grain.getContext('2d');ctx.fillStyle='#baa589';ctx.fillRect(0,0,128,256);for(let j=0;j<100;j++){ctx.strokeStyle=`rgba(55,35,18,${.05+random()*.15})`;ctx.lineWidth=.3+random();ctx.beginPath();let x=random()*128;ctx.moveTo(x,0);for(let y=8;y<=256;y+=8)ctx.lineTo(x+Math.sin(y*.03+j)*1.7,y);ctx.stroke();}
 const texture=keep(new T.CanvasTexture(grain));texture.colorSpace=T.SRGBColorSpace;wood.map=texture;
 function surfaceMaps(mat,category){
  if(!T.TextureLoader)return;
  for(const [file,key]of [['color','map'],['normal','normalMap'],['roughness','roughnessMap']])new T.TextureLoader().load(`/assets/materials/${category}/${file}.jpg`,map=>{if(!alive){map.dispose();return;}keep(map);if(file==='color')map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=1000;if(category==='ground')map.repeat.set(28,28);mat[key]=map;mat.needsUpdate=true;},undefined,()=>{});
 }
 surfaceMaps(wood,'wood');surfaceMaps(stone,'stone');surfaceMaps(plaster,'plaster');surfaceMaps(darkStone,'rock');
 const foliageCanvas=document.createElement('canvas');foliageCanvas.width=256;foliageCanvas.height=256;const fc=foliageCanvas.getContext('2d');
 for(let j=0;j<1800;j++){
  const a=random()*Math.PI*2,r=Math.sqrt(random())*112,x=128+Math.cos(a)*r,y=128+Math.sin(a)*r*.8;
  if(number===3){fc.fillStyle=j%3?'#eab3d2':'#fce2ee';for(let k=0;k<5;k++){const angle=k*Math.PI*2/5;fc.beginPath();fc.ellipse(x+Math.cos(angle)*2,y+Math.sin(angle)*2,1.8,1.3,angle,0,Math.PI*2);fc.fill();}fc.fillStyle='#c583a0';fc.fillRect(x-.5,y-.5,1,1);}
  else{fc.fillStyle=j%4?'#a4b280':'#e1d6a3';fc.beginPath();fc.ellipse(x,y,2+random()*3,1+random()*1.5,random()*Math.PI,0,Math.PI*2);fc.fill();}
 }
 const foliageTexture=keep(new T.CanvasTexture(foliageCanvas));foliageTexture.colorSpace=T.SRGBColorSpace;
 const foliageMat=material('foliage cards',number===3?'#ffffff':p.leaf,{map:foliageTexture,alphaTest:.45,side:T.DoubleSide,roughness:1});
 const geom=(key,make)=>{if(!geometries.has(key))geometries.set(key,keep(make()));return geometries.get(key);};
 function add(g,m,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0,group=garden){
  dummy.position.set(x,y,z);dummy.rotation.set(rx,ry,rz);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();
  const copy=g.clone();copy.applyMatrix4(dummy.matrix);const flat=copy.index?copy.toNonIndexed():copy;
  const key=group.uuid+':'+m.uuid;let batch=batches.get(key);if(!batch){batch={group,material:m,positions:[],normals:[],uvs:[]};batches.set(key,batch);}
  batch.positions.push(...flat.attributes.position.array);batch.normals.push(...flat.attributes.normal.array);if(flat.attributes.uv)batch.uvs.push(...flat.attributes.uv.array);else batch.uvs.push(...new Float32Array(flat.attributes.position.count*2));
  if(flat!==copy)flat.dispose();copy.dispose();
 }
 const boxGeom=geom('box',()=>new T.BoxGeometry(1,1,1)),sphereGeom=geom('sphere',()=>new T.SphereGeometry(1,10,7)),leafGeom=geom('leaf',()=>new T.SphereGeometry(1,7,5)),cylinderGeom=geom('cylinder',()=>new T.CylinderGeometry(1,1,1,8)),discGeom=geom('disc',()=>new T.CircleGeometry(1,64));
 const box=(x,y,z,w,h,d,m,group=garden,ry=0)=>add(boxGeom,m,x,y,z,w,h,d,0,ry,0,group);
 const ball=(x,y,z,r,m,sx=1,sy=1,sz=1,group=garden)=>add(sphereGeom,m,x,y,z,r*sx,r*sy,r*sz,0,0,0,group);
 function rod(a,b,r,m,group=garden){const direction=new T.Vector3(...b).sub(new T.Vector3(...a));dummy.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.clone().normalize());const rotation=dummy.rotation.clone();add(cylinderGeom,m,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,r,direction.length(),r,rotation.x,rotation.y,rotation.z,group);}
 function disc(x,z,rx,rz,y,m){add(discGeom,m,x,y,z,rx,rz,1,-Math.PI/2);}
 const collideCircle=(x,z,r)=>obstacles.push({kind:'circle',x,z,r});
 function ring(x,y,z,r,t,m,group=garden,vertical=false){const g=geom(`ring:${r}:${t}`,()=>new T.TorusGeometry(r,t,5,80));add(g,m,x,y,z,1,1,1,vertical?0:Math.PI/2,0,0,group);}

 function roof(cx,cz,w,d,y,rise,group=building,upturn=number===3||number===7?1.7:number===4?1.1:.7){
  const nx=40,nz=36,positions=[],uvs=[],indices=[];
  function surface(x,z){const hip=Math.max(Math.abs(z)/(d/2),Math.max(0,(Math.abs(x)-w*.32)/(w*.18)));return y+rise*Math.pow(Math.max(0,1-hip),.86)+upturn*Math.pow(Math.abs(x)/(w/2),7)*Math.pow(Math.abs(z)/(d/2),3);}
  for(let iz=0;iz<=nz;iz++)for(let ix=0;ix<=nx;ix++){const x=(ix/nx-.5)*w,z=(iz/nz-.5)*d;positions.push(cx+x,surface(x,z),cz+z);uvs.push(ix/nx,iz/nz);if(ix<nx&&iz<nz){const a=iz*(nx+1)+ix;indices.push(a,a+nx+1,a+1,a+1,a+nx+1,a+nx+2);}}
  const g=keep(new T.BufferGeometry());g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();add(g,roofMat,0,0,0,1,1,1,0,0,0,group);
  for(let ix=0;ix<=Math.floor(w/.72);ix++){const x=-w/2+ix*w/Math.floor(w/.72);for(const sign of [-1,1])for(let j=0;j<6;j++){const z0=sign*d/2*j/6,z1=sign*d/2*(j+1)/6;rod([cx+x,surface(x,z0)+.045,cz+z0],[cx+x,surface(x,z1)+.045,cz+z1],.065,roofRib,group);}}
  for(const sign of [-1,1])for(let j=0;j<32;j++){const x0=-w/2+j*w/32,x1=x0+w/32,z=sign*d/2;rod([cx+x0,surface(x0,z)-.08,cz+z],[cx+x1,surface(x1,z)-.08,cz+z],.16,trim,group);}
  rod([cx-w*.32,y+rise+.12,cz],[cx+w*.32,y+rise+.12,cz],.22,roofRib,group);
  const finial=Math.min(1,w/16);
  for(const sign of [-1,1]){const end=cx+sign*w*.32;for(let j=0;j<4;j++)rod([end+sign*j*.4*finial,y+rise+.1+j*j*.1*finial,cz],[end+sign*(j+1)*.4*finial,y+rise+.1+(j+1)**2*.1*finial,cz],.12*finial,gold,group);}
 }
 function lantern(x,y,z,r=.65,long=false,group=garden){
  ball(x,y,z,r,lamp,1,long?1.5:1,1,group);const top=y+r*(long?1.5:1);
  box(x,top+.09,z,r*.65,.16,r*.65,wood,group);box(x,y-r*(long?1.5:1)-.08,z,r*.6,.16,r*.6,wood,group);
  rod([x,top,z],[x,top+1.1,z],.035,wood,group);
  for(let j=0;j<10;j++){const a=j*Math.PI/5;let last;for(let k=1;k<=7;k++){const theta=k/8*Math.PI;const point=[x+Math.sin(theta)*Math.cos(a)*(r+.02),y+Math.cos(theta)*r*(long?1.5:1),z+Math.sin(theta)*Math.sin(a)*(r+.02)];if(last)rod(last,point,.018,lampRib,group);last=point;}}
  rod([x,y-r*(long?1.5:1)-.12,z],[x,y-r*(long?1.5:1)-.55,z],.04,lampRib,group);
 }
 function stoneLamp(x,z,scale=1){
  const y=height(x,z);box(x,y+.15*scale,z,1.25*scale,.3*scale,1.25*scale,stone);box(x,y+.85*scale,z,.42*scale,1.4*scale,.42*scale,stone);box(x,y+1.6*scale,z,1*scale,.3*scale,1*scale,stone);box(x,y+2.05*scale,z,.7*scale,.65*scale,.7*scale,lamp);
  for(const dx of [-.43,.43])for(const dz of [-.43,.43])box(x+dx*scale,y+2*scale,z+dz*scale,.12*scale,.9*scale,.12*scale,stone);
  roof(x,z,1.7*scale,1.7*scale,y+2.55*scale,.5*scale,garden,.22*scale);ball(x,y+3.1*scale,z,.15*scale,stone);collideCircle(x,z,.65*scale);
 }
 function window(x,z,y,w,h,group=building){
  box(x,y,z,w,h,.12,windowMat,group);for(const dx of [-w/2,w/2])box(x+dx,y,z+.1,.16,h+.2,.22,wood,group);
  for(let j=0;j<=Math.floor(w/.65);j++)box(x-w/2+j*w/Math.floor(w/.65),y,z+.11,.07,h,.13,wood,group);
  for(let j=0;j<3;j++)box(x,y-h/2+j*h/2,z+.12,w,.085,.14,wood,group);
 }
 function mainHall(){
  // Retain the shared altar and cushions behind the themed architecture.
  box(0,-.6,0,36.4,1.1,46,stone,building);
  for(let j=0;j<8;j++){const z=23.15+(j+.5)*6.45/8,top=-1.14*(j/8);box(0,top-.09,z,11.4,.18,6.45/8+.04,stone,building);}
  for(const x of [-16.4,-5.8,5.8,16.4]){
   add(cylinderGeom,wood,x,5.85,23.15,.48,11.7,.48,0,0,0,building);box(x,.14,23.15,1.65,.28,1.65,stone,building);
   for(let j=0;j<3;j++){box(x,10.9+j*.35,23.15,1.6+j*.6,.22,.8,trim,building);box(x,11.05+j*.35,23.15,.65,.16,1.4+j*.4,wood,building);}
  }
  for(const x of [-16.4,16.4])for(const z of [-20,-8,4,16]){add(cylinderGeom,wood,x,5.6,z,.44,11.2,.44,0,0,0,building);box(x,.1,z,1.45,.2,1.45,stone,building);}
  box(0,11.6,23.15,35,.6,.8,wood,building);box(0,10.9,23.15,34,.2,.5,trim,building);
  for(const x of [-11,11]){window(x,23.02,6.6,8.3,6.6);box(x,1.6,23.05,8.4,2.8,.24,wood,building);obstacles.push({kind:'box',x,z:23.05,w:8.3,d:.4});}
  for(const x of [-16.8,16.8])box(x,5.5,0,.3,11,45,plaster,building);
  roof(0,.6,40,50,12.2,10.5);
  if(number===6||number===7){box(0,20,-1,22,4.8,18,plaster,building);window(0,8.12,20.3,20,2.6);roof(0,-1,26,25,22.5,5);}
  const signCanvas=document.createElement('canvas');signCanvas.width=1024;signCanvas.height=256;const c=signCanvas.getContext('2d');c.fillStyle=number===3?'#5e2530':'#2c3b32';c.fillRect(0,0,1024,256);c.strokeStyle='#c4ad70';c.lineWidth=7;c.strokeRect(18,18,988,220);c.font='600 112px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#ead8a0';c.fillText('metatemple',512,128,880);
  const signTexture=keep(new T.CanvasTexture(signCanvas));signTexture.colorSpace=T.SRGBColorSpace;const signMat=keep(new T.MeshStandardMaterial({map:signTexture,roughness:.7}));box(0,10.8,23.72,6.5,1.6,.2,wood,building);add(geom('sign plane',()=>new T.PlaneGeometry(6.1,1.36)),signMat,0,10.8,23.84,1,1,1,0,0,0,building);
  for(const x of [-12,-6,6,12])lantern(x,9,24.15,number===6?.85:.64,number===2,building);
 }
 function sideHall(x,z,w=15,d=22){
  const y=-1.14;box(x,y+.5,z,w,1,d,stone);box(x,y+3.4,z,w,5.2,d,plaster);roof(x,z,w+3,d+3,y+6.4,3.3,garden);
  for(const dx of [-w/2+.45,w/2-.45])for(const dz of [-d/2+.45,d/2-.45])box(x+dx,y+3.6,z+dz,.55,6.5,.55,wood);
  for(const dx of [-w*.27,0,w*.27])window(x+dx,z+d/2+.1,y+3.5,w*.24,3,garden);
  box(x,y+6,z+d/2+.3,w+.4,.45,.5,wood);obstacles.push({kind:'box',x,z,w,d});
 }
 function tree(x,z,size=10,blossom=false){
  const y=height(x,z),r=.3+size*.035;rod([x,y,z],[x+.35,y+size*.64,z-.25],r,trunk);
  for(let j=0;j<6;j++){const a=j*2.4+random(),spread=size*(.22+random()*.2),bx=x+Math.cos(a)*spread,bz=z+Math.sin(a)*spread,by=y+size*(.58+random()*.25);rod([x,y+size*.37,z],[bx,by,bz],r*.4,trunk);
   for(let k=0;k<9;k++){const dx=(random()-.5)*size*.42,dz=(random()-.5)*size*.4,dy=(random()-.5)*size*.2;const card=geom('foliage card',()=>new T.PlaneGeometry(2,2));add(card,foliageMat,bx+dx,by+dy,bz+dz,size*.2,size*.16,1,(random()-.5)*.5,random()*6.28,0);}
  }
  for(let j=0;j<4;j++){const a=j*Math.PI/2;rod([x,y+.3,z],[x+Math.cos(a)*1.8,y+.03,z+Math.sin(a)*1.8],r*.5,trunk);}
  collideCircle(x,z,r+.1);
 }
 function rock(x,z,r=1){ball(x,height(x,z)+r*.38,z,r,darkStone,1,.7,.8);collideCircle(x,z,r*.8);}
 function hedge(x,z,s=1.5){ball(x,height(x,z)+s*.42,z,s,leaves,1,.7,1);}
 function lotus(x,z,y=.1,golden=false,size=.6){
  const petal=golden?lamp:material('lotus pink','#e7a6ba',{emissive:'#8d3a67',emissiveIntensity:.08,side:T.DoubleSide});
  const petalGeom=geom('petal',()=>new T.SphereGeometry(1,8,5));for(let j=0;j<8;j++){const a=j*Math.PI/4;add(petalGeom,petal,x+Math.sin(a)*size*.44,y+size*.5,z+Math.cos(a)*size*.44,size*.24,size*.4,size*.12,-Math.cos(a)*.65,0,Math.sin(a)*.65);}
  ball(x,y+size*.2,z,size*.23,golden?gold:material('lotus heart','#e4bf5b'));
 }
 function pond(x,z,rx=6.5,rz=6.5,withLotus=true){
  const y=height(x,z)+.035;disc(x,z,rx,rz,y,material('pond bed','#1c3734'));
  const water=material('water',number===3?'#4f526a':'#638577',{metalness:.33,roughness:.22,transparent:true,opacity:.83});disc(x,z,rx*.97,rz*.97,y+.025,water);
  for(let j=0;j<40;j++){const a=j*Math.PI/20;ball(x+Math.cos(a)*rx,y+.1,z+Math.sin(a)*rz,.48,stone,1.3,.55,.8);}
  for(let j=0;j<24;j++){const a=random()*6.28,r=Math.sqrt(random())*.8,lx=x+Math.cos(a)*rx*r,lz=z+Math.sin(a)*rz*r;disc(lx,lz,.35+random()*.3,.3+random()*.28,y+.05,material('lily pads','#598154'));if(withLotus&&j%3===0)lotus(lx,lz,y+.1,false,.55+random()*.3);}
  const rippleMat=keep(new T.MeshBasicMaterial({color:'#d8dfbc',transparent:true,opacity:.15,depthWrite:false}));
  for(let j=0;j<4;j++){const g=keep(new T.TorusGeometry(.8+j*.2,.012,3,48)),mesh=new T.Mesh(g,rippleMat);mesh.rotation.x=Math.PI/2;mesh.position.set(x+(j-1.5)*1.2,y+.07,z+(j%2)*1.3);garden.add(mesh);animations.push({kind:'ripple',mesh,phase:j});}
  obstacles.push({kind:'ellipse',x,z,rx:rx*.92,rz:rz*.92});
 }
 function rakedGarden(){const x=-28,z=36,y=height(x,z)+.02;disc(x,z,6.8,6.8,y,material('sand','#b0ab87'));for(let j=1;j<23;j++)ring(x,y+.015,z,j*.28,.024,material('sand grooves','#7b7d60'));for(const[dx,dz,r]of [[-2,1,1.2],[1.5,-1.8,.85],[2.5,1.2,.6]])rock(x+dx,z+dz,r);lotus(x,z,y+.16,true,.9);obstacles.push({kind:'circle',x,z,r:6.8});}
 function wheel(){const x=0,y=7.25,z=23.82;ring(x,y,z,2.35,.11,gold,building,true);ring(x,y,z,1.92,.045,gold,building,true);ring(x,y,z,.4,.12,gold,building,true);for(let j=0;j<8;j++){const a=j*Math.PI/4;rod([Math.sin(a)*.4,y+Math.cos(a)*.4,z],[Math.sin(a)*2.65,y+Math.cos(a)*2.65,z],.075,gold,building);}ball(x,y,z,.18,gold,1,1,.35,building);}
 function gate(){const z=44,y=height(0,z);for(const x of [-4.7,4.7]){box(x,y+2.9,z,.5,5.8,.5,wood);box(x,y+.2,z,1.05,.4,1.05,stone);}box(0,y+5.8,z,10.4,.5,.6,wood);roof(0,z,12.8,4.3,y+6,.9,garden,.6);}
 function prayerScreens(){for(const x of [-10,10]){for(const dx of [-3,3])box(x+dx,1.5,31,.3,5.1,.3,wood);roof(x,31,7.5,2.1,4.2,1.1,garden,.45);for(let j=0;j<4;j++)lantern(x-2.3+j*1.55,3.35,31.2,.4);for(let j=0;j<9;j++){const cx=x-2.65+j*.66;box(cx,1.5,31,.57,1.15,.11,material('prayer tablets','#a7835a'));box(cx,.15,31,.57,1.1,.11,wood);}}}
 function banner(x,z,white=false){const y=height(x,z);box(x,y+3.5,z,.14,7,.14,wood);box(x+.6,y+6.8,z,1.6,.1,.12,wood);const m=material(white?'white cloth':'red cloth',white?'#d0c6ae':'#ba382b',{side:T.DoubleSide});for(let j=0;j<3;j++)box(x+.35+j*.32,y+4.7,z+(j%2)*.1,.27,3.8,.025,m);}
 function ground(){
  const g=keep(new T.PlaneGeometry(144,150,64,64));g.rotateX(-Math.PI/2);g.translate(0,0,15);const position=g.attributes.position;
  for(let j=0;j<position.count;j++)position.setY(j,height(position.getX(j),position.getZ(j))-.035);g.computeVertexNormals();
  const groundMat=material('ground',p.grass);surfaceMaps(groundMat,'ground');const mesh=new T.Mesh(g,groundMat);mesh.receiveShadow=true;garden.add(mesh);
  // Flagstones follow the original walk height, including the entry slope.
  const paving=material('paving',p.stone);surfaceMaps(paving,'stone');for(let zi=0;zi<18;zi++)for(let xi=0;xi<16;xi++){const x=(xi-7.5)*2.65,z=25.5+zi*1.9;if(Math.abs(x)<5.8&&z<29.7)continue;const y=height(x,z)+.012;box(x,y-.045,z,2.58,.08,1.83,paving);}
  return new Set([groundMat,paving,stone]);
 }
 const walkMaterials=ground();mainHall();sideHall(-29,5,15,25);sideHall(29,3,15,24);
 if(number===2||number===6){
  for(const x of [-12,12])for(const z of [30,37,44,51]){stoneLamp(x,z,number===6?.82:.66);if(number===2)lotus(x+Math.sign(x)*2,z,height(x,z)+.55,true,.7);}
  if(number===6)for(const side of [-1,1]){const x=side*20;roof(x,38,5.4,31,8.2,1.6,garden,.35);for(let j=0;j<7;j++){const z=25+j*4;box(x,3,z,.28,8,.28,wood);collideCircle(x,z,.22);lantern(x,6.9,z,.8);}rod([x,7.9,24],[x,7.9,51],.15,wood);}
  else for(const x of [-21,21])for(const z of [28,42,54])tree(x,z,8+random()*3);
  pond(-28,36,6.5,6.5,number===6);
 }
 if(number===3){
  sideHall(43,-16,10,12);for(let tier=0;tier<3;tier++)roof(43,-16,15-tier*2.5,15-tier*2.5,8+tier*3.5,2.5,garden,1);
  for(const[x,z,s]of [[-14,33,11],[15,34,11],[-22,47,9],[23,48,10],[-36,27,13],[39,20,13],[-37,54,12],[37,57,12]])tree(x,z,s,true);
  pond(-28,36);for(const[x,z]of [[-9,33],[9,33],[-10,47],[10,47]])stoneLamp(x,z,.72);
  for(let j=0;j<14;j++){const x=(random()<.5?-1:1)*(17+random()*22),z=27+random()*29;rock(x,z,.45+random()*1.1);}
 }
 if(number===4){
  lantern(0,7.8,26.5,1.55,true,building);prayerScreens();banner(-18,37,true);banner(18,37);
  for(const[x,z]of [[-25,35],[23,24],[-34,52],[40,50]])tree(x,z,13+random()*3);pond(-28,36,6.5,6.5,false);
  for(const x of [-7.7,7.7])for(const z of [35,43,52])stoneLamp(x,z,.62);
 }
 if(number===5){
  wheel();rakedGarden();for(const[x,z,s]of [[-17,34,16],[18,37,16],[-36,26,18],[39,24,19],[-39,54,16],[37,57,17]])tree(x,z,s);
  for(const[x,z]of [[-10,32],[10,32],[-12,45],[12,45]])stoneLamp(x,z,.76);
  for(let j=0;j<24;j++){const x=(j%2?-1:1)*(7.5+random()*7),z=31+random()*24;lotus(x,z,height(x,z)+.3,true,.45+random()*.3);}
 }
 if(number===7){
  pond(-28,36);pond(29,16,7,9);for(const[x,z]of [[-9,32],[9,32],[-13,44],[13,44]])stoneLamp(x,z,.86);
  for(const[x,z]of [[-20,30],[-21,45],[20,35],[-35,24],[36,29],[-38,51]]){const y=height(x,z);rod([x,y,z],[x,y+3.6,z],.2,trunk);for(let j=0;j<3;j++)ball(x+(j===1?1.1:j===2?-1.1:0),y+2.7+j*.8,z,1.5,leaves,1.2,.65,1.1);collideCircle(x,z,.3);}
 }
 for(const[x,z,s]of [[-44,9,15],[-40,-21,15],[37,-22,16],[45,5,14],[-46,54,14],[45,58,14]])tree(x,z,s,number===3);
 for(const side of [-1,1])for(let j=0;j<12;j++)tree(side*(50+random()*6),-26+j*8,13+random()*5,number===3);
 for(let j=0;j<22;j++){const x=(j%2?-1:1)*(20+random()*25),z=25+random()*34;if(Math.hypot(x+28,z-36)<8)continue;hedge(x,z,1+random()*1.2);}
 // Batches keep the architectural detail affordable on mobile GPUs.
 for(const batch of batches.values()){const geometry=keep(new T.BufferGeometry());geometry.setAttribute('position',new T.Float32BufferAttribute(batch.positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(batch.normals,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(batch.uvs,2));geometry.computeBoundingSphere();const mesh=new T.Mesh(geometry,batch.material);mesh.castShadow=true;mesh.receiveShadow=true;mesh.name=batch.material.name;batch.group.add(mesh);}
 const points=[];for(let j=0;j<100;j++){points.push((random()-.5)*80,random()*13+1,random()*70-10);}const particleGeom=keep(new T.BufferGeometry());particleGeom.setAttribute('position',new T.Float32BufferAttribute(points,3));const particleMat=keep(new T.PointsMaterial({color:number===3?'#ffe2ba':number===4?'#d0e3ff':'#eee3b9',size:number===3?.075:.035,transparent:true,opacity:number===2?.25:.6,depthWrite:false}));const particles=new T.Points(particleGeom,particleMat);particles.userData.sceneRayPassthrough=true;garden.add(particles);
 for(const[x,z]of [[-10,30],[10,30]]){const light=new T.PointLight(p.glow,number===4?28:12,13,2);light.position.set(x,3,z);garden.add(light);}
 // A generated sky dome is independent of the original interior panorama.
 const skyCanvas=document.createElement('canvas');skyCanvas.width=1024;skyCanvas.height=512;const skyCtx=skyCanvas.getContext('2d'),gradient=skyCtx.createLinearGradient(0,0,0,512);gradient.addColorStop(0,p.sky[0]);gradient.addColorStop(.52,p.sky[1]);gradient.addColorStop(.8,p.sky[2]);gradient.addColorStop(1,p.fog);skyCtx.fillStyle=gradient;skyCtx.fillRect(0,0,1024,512);
 for(let j=0;j<70;j++){const x=random()*1024,y=130+random()*150;skyCtx.fillStyle=`rgba(255,242,222,${random()*.045})`;skyCtx.beginPath();skyCtx.ellipse(x,y,30+random()*100,2+random()*10,-.04,0,Math.PI*2);skyCtx.fill();}
 if(number===3||number===4){skyCtx.fillStyle='#eee2ba';skyCtx.beginPath();skyCtx.arc(680,140,number===4?9:5,0,Math.PI*2);skyCtx.fill();if(number===4)for(let j=0;j<140;j++){skyCtx.fillStyle=`rgba(230,242,255,${.2+random()*.6})`;skyCtx.fillRect(random()*1024,random()*190,1.2,1.2);}}
 const sky=keep(new T.CanvasTexture(skyCanvas));sky.colorSpace=T.SRGBColorSpace;sky.mapping=T.EquirectangularReflectionMapping;
 return {root,building,garden,obstacles,walkMaterials,sky,palette:p,update(time){particles.rotation.y=Math.sin(time*.025)*.015;for(const a of animations){a.mesh.scale.setScalar(.8+((time*.12+a.phase*.27)%1)*.75);}},dispose(){alive=false;root.removeFromParent();for(const resource of resources)resource.dispose();resources.clear();}};
}

export function mountExteriors(world,engine,T,terrain){
 let selected=null,room='',disposed=false,space=engine.space||'garden';
 const originalSetSpace=world.setSpace.bind(world),originalUpdate=world.update.bind(world),originalDispose=world.dispose.bind(world),originalApply=engine.applyLighting.bind(engine),originalCamera=engine.cameraFrame?.bind(engine);
 const initialChildren=[...world.root.children],{shell,interior,garden,preview}=world.spaces;
 const otherRoots=initialChildren.filter(g=>![shell,interior,garden,preview].includes(g));
 const fogRange=engine.scene.fog?{near:engine.scene.fog.near,far:engine.scene.fog.far}:null;
 function visibility(){
  if(!selected)return;
  // Crossing the entrance changes the activity zone, never the architecture.
  shell.visible=false;garden.visible=false;interior.visible=true;preview.visible=false;selected.building.visible=true;
  // Keep the existing moonlight pavilion and music, replacing its garden path.
  for(const root of otherRoots)if(root.children[0])root.children[0].visible=false;
 }
 function lighting(){
  if(!selected){if(fogRange&&engine.scene.fog)Object.assign(engine.scene.fog,fogRange);return;}
  const p=selected.palette,{sky,ambient,sun}=engine.lighting;
  engine.scene.background=selected.sky;engine.scene.backgroundIntensity=.9;
  if(engine.scene.fog){engine.scene.fog.color.set(p.fog);engine.scene.fog.near=numberOfRoom()===4?48:80;engine.scene.fog.far=numberOfRoom()===4?155:205;}
  sky.color.set(p.sky[1]);sky.groundColor.set(p.grass);sky.intensity=.9;ambient.color.set(p.sky[2]);ambient.intensity=.28;sun.color.set(p.sun);sun.intensity=p.light;engine.scene.environmentIntensity=.38;
 }
 const numberOfRoom=()=>hallFor(room).number;
 function choose(id){if(disposed||id===room)return;room=hallFor(id).id;const number=numberOfRoom();selected?.walkMaterials.forEach(m=>world.walkSurfaces.delete(m));selected?.dispose();selected=null;collision=[];themed=false;
  if(number>1){selected=buildExterior(T,number,(x,z)=>-1.14+terrain(x,z));selected.root.scale.set(1/world.root.scale.x,1/world.root.scale.y,1/world.root.scale.z);world.root.add(selected.root);selected.walkMaterials.forEach(m=>world.walkSurfaces.add(m));collision=selected.obstacles;themed=true;}
  originalSetSpace(space);for(const root of otherRoots)if(root.children[0])root.children[0].visible=true;visibility();
  engine.lighting.sun.shadow.needsUpdate=true;engine.applyLighting();engine.renderer.domElement.dataset.hall=String(number);engine.renderer.domElement.dataset.exterior=number===1?'original':hallFor(room).reference;
  if(number>1){engine.distance=9.2;engine.pitch=-.19;}else{engine.distance=3.85;engine.pitch=0;}
  engine.stopWalking();engine.sceneRaycast?.prepare();engine.wake();
 }
 engine.applyLighting=function(){originalApply();lighting();};
 if(originalCamera)engine.cameraFrame=function(){const frame=originalCamera();if(selected)frame.look.y+=2.4;return frame;};
 world.setSpace=function(next){space=next;originalSetSpace(next);visibility();engine.applyLighting();};
 world.update=function(...args){originalUpdate(...args);visibility();selected?.update(args[0]);};
 const onRoom=e=>choose(e.detail.room);window.addEventListener('metatemple:room',onRoom);
 const beforeDispose=()=>{disposed=true;window.removeEventListener('metatemple:room',onRoom);collision=[];themed=false;selected?.dispose();engine.applyLighting=originalApply;if(originalCamera)engine.cameraFrame=originalCamera;};
 world.dispose=function(){beforeDispose();originalDispose();};
 choose(document.documentElement.dataset.templeRoom||new URL(location.href).searchParams.get('room')||'maru');
 return {get room(){return room;},get number(){return numberOfRoom();},get obstacles(){return collision;}};
}
