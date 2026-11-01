import {residentProfiles} from '../public/temple/residents.js';
import assert from 'node:assert/strict';import * as THREE from 'three';import {mountExteriors,exteriorBlocked} from '../public/temple/exteriors.js';import {HALLS} from '../public/temple/halls.js';
const listeners=new Map();globalThis.window={addEventListener:(type,fn)=>listeners.set(type,fn),removeEventListener:type=>listeners.delete(type)};
globalThis.document={documentElement:{dataset:{}},createElement:()=>({width:0,height:0,getContext:()=>new Proxy({createLinearGradient:()=>({addColorStop(){}})}, {get:(o,key)=>key in o?o[key]:()=>{},set:(o,key,value)=>(o[key]=value,true)})})};globalThis.location={href:'https://example.test/?room=maru'};
const scene=new THREE.Scene();scene.fog=new THREE.Fog('#aac2b4',86,220);
const root=new THREE.Group();root.scale.set(2,1.5,2);scene.add(root);const shell=new THREE.Group(),interior=new THREE.Group(),garden=new THREE.Group(),preview=new THREE.Group(),outside=new THREE.Group();outside.add(new THREE.Group(),new THREE.Group(),new THREE.Group());root.add(shell,interior,garden,preview,outside);
const interiorGeometry=new THREE.BoxGeometry(),interiorMaterial=new THREE.MeshStandardMaterial(),buddha=new THREE.Mesh(interiorGeometry,interiorMaterial);interior.add(buddha);let interiorDisposed=false;interiorGeometry.addEventListener('dispose',()=>{interiorDisposed=true;});
const world={root,spaces:{shell,interior,garden,preview},walkSurfaces:new Set(),setSpace(){shell.visible=interior.visible=garden.visible=true;},update(){outside.children[0].visible=true;},dispose(){}};
const engine={space:'garden',scene,indoorAmount:0,lighting:{sky:new THREE.HemisphereLight(),ambient:new THREE.AmbientLight(),sun:new THREE.DirectionalLight()},renderer:{domElement:{dataset:{}}},applyLighting(){scene.fog.near=86;scene.fog.far=220;},stopWalking(){},wake(){},distance:3.85,pitch:0};
const system=mountExteriors(world,engine,{...THREE,TextureLoader:undefined},()=>0);assert.equal(system.number,1);assert.equal(root.children.length,5);assert(!exteriorBlocked(0,38));
for(const hall of HALLS.slice(1)){
 listeners.get('metatemple:room')({detail:{room:hall.id}});root.updateMatrixWorld(true);
 assert.equal(system.number,hall.number);assert.equal(engine.renderer.domElement.dataset.hall,String(hall.number));assert(!shell.visible);assert(!garden.visible);assert(interior.visible);assert.equal(interior.children[0],buddha);assert(!interiorDisposed);assert(system.obstacles.length>0);assert(!exteriorBlocked(0,38,.3));assert(!exteriorBlocked(0,31,.3));
 for(const npc of residentProfiles(()=>({x:0,z:0,yaw:0})).filter(v=>v.id.startsWith('resident:outdoor:')))assert(!exteriorBlocked(npc.position.x,npc.position.z,.35),`Hall ${hall.number}: resident must not overlap architecture, water or trees`);
 const exterior=root.getObjectByName(`metatemple-hall-${hall.number}-exterior`);assert(exterior);let meshes=0,triangles=0;exterior.traverse(node=>{if(!node.isMesh)return;meshes++;const a=node.geometry.attributes.position.array;assert(a.every(Number.isFinite));triangles+=(node.geometry.index?.count||node.geometry.attributes.position.count)/3;});assert(meshes<55);assert(triangles<260000);console.log(`Hall ${hall.number}: ${meshes} mesh batches, ${Math.round(triangles)} triangles`);
 // Preserve geometry, lighting and the visitor's zoom at every entrance crossing.
 const beforeLighting={background:scene.background,fog:scene.fog.color.getHex(),near:scene.fog.near,far:scene.fog.far,sun:engine.lighting.sun.color.getHex(),intensity:engine.lighting.sun.intensity};
 engine.distance=7.25;engine.pitch=-.11;
 for(const zone of ['hall','garden','hall','garden','hall']){
  world.setSpace(zone);world.update(2,.1);assert(!shell.visible);assert(interior.visible);assert(exterior.getObjectByName('exterior architecture').visible);assert.equal(engine.distance,7.25);assert.equal(engine.pitch,-.11);
  for(const amount of [.54,.56,1,0]){engine.indoorAmount=amount;engine.applyLighting();assert.equal(scene.background,beforeLighting.background);assert.equal(scene.fog.color.getHex(),beforeLighting.fog);assert.equal(scene.fog.near,beforeLighting.near);assert.equal(scene.fog.far,beforeLighting.far);assert.equal(engine.lighting.sun.color.getHex(),beforeLighting.sun);assert.equal(engine.lighting.sun.intensity,beforeLighting.intensity);}
 }
 world.setSpace('garden');engine.indoorAmount=0;engine.applyLighting();world.update(2,.1);assert(!outside.children[0].visible);
 assert.equal(root.children.filter(node=>node.name.startsWith('metatemple-hall-')).length,1,'Previous exterior must be released');
}
listeners.get('metatemple:room')({detail:{room:'maru'}});assert.equal(system.number,1);assert.equal(root.children.length,5);assert(shell.visible&&garden.visible&&outside.children[0].visible);assert(!exteriorBlocked(0,38));assert(!interiorDisposed);world.dispose();assert.equal(listeners.size,0);
console.log('PASS: six distinct mesh exteriors, original hall restored, stable themed interiors and lighting across entrance crossings, preserved zoom, unchanged altar geometry, walkable entrances, room switching, memory cleanup');
