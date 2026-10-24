import * as THREE from 'three';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const $=i=>document.getElementById(i),rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.random()*a.length|0],PI=Math.PI;
const D={coins:0,keys:0,best:0,music:'discord',vol:.7,q:2,skin:0,own:[1,0,0,0],up:{mag:0,fly:0,boot:0,mult:0},boards:1,sup:0,hunt:0,god:0,fast:0,mag:0};
const S={...D,...JSON.parse(localStorage.fnaf||'{}')};
const save=()=>{localStorage.fnaf=JSON.stringify(S);hudUpd()};
function hudUpd(){if($('bn'))$('bn').textContent=S.boards;$('mc').textContent=S.coins;$('mk').textContent=S.keys;$('mb').textContent=S.best;document.querySelectorAll('.mc2').forEach(e=>e.textContent=S.coins);document.querySelectorAll('.mk2').forEach(e=>e.textContent=S.keys)}

/* ---------- SES ---------- */
const au={untitled:new Audio('assets/untitled.mp3'),discord:new Audio('assets/discord.mp3'),manifest:new Audio('assets/basrol.mp3')};
for(const k in au)au[k].loop=true;
const faah=new Audio('assets/faah.mp3');
function music(k,v=1){const n=au[k];for(const x in au)if(au[x]!==n)au[x].pause();if(!n)return;n.volume=Math.min(1,S.vol*v);if(n.paused)n.play().catch(()=>{})}
const gameMusic=()=>music(S.music==='off'?null:S.music);
let ac;function scare(){try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain(),n=ac.currentTime;o.type='sawtooth';o.frequency.setValueAtTime(900,n);o.frequency.exponentialRampToValueAtTime(60,n+.8);g.gain.setValueAtTime(Math.max(.01,S.vol),n);g.gain.exponentialRampToValueAtTime(.001,n+.9);o.connect(g).connect(ac.destination);o.start();o.stop(n+.9)}catch{}}

/* ---------- SAHNE ---------- */
const R=new THREE.WebGLRenderer({canvas:$('c'),antialias:false,powerPreference:'high-performance'});
const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(66,1,.1,150);
sc.background=new THREE.Color(0x0a0410);sc.fog=new THREE.Fog(0x0a0410,25,110);
sc.add(new THREE.HemisphereLight(0x9aa8ff,0x44223a,1.25));
const dl=new THREE.DirectionalLight(0xffd0a0,1.3);dl.position.set(-5,10,6);sc.add(dl);
const cap=()=>[.6,.85,Math.min(devicePixelRatio,1.5)][S.q];let ratio=cap();
function rs(){R.setPixelRatio(ratio);R.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
addEventListener('resize',rs);rs();

function ctex(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;return t}
const winT=ctex(64,128,(g,w,h)=>{g.fillStyle='#14101c';g.fillRect(0,0,w,h);for(let y=6;y<h;y+=14)for(let x=6;x<w;x+=14){g.fillStyle=Math.random()<.35?pick(['#ffcf66','#ff4455','#66ddff']):'#221a30';g.fillRect(x,y,8,8)}});
const floT=ctex(256,256,(g,w,h)=>{g.fillStyle='#17131d';g.fillRect(0,0,w,h);g.fillStyle='#2a2433';for(let i=0;i<8;i++)g.fillRect(0,i*32+4,w,10);g.fillStyle='#b8b8c8';for(const x of[34,48,121,135,208,222])g.fillRect(x,0,4,h)});
floT.repeat.set(1,3);
const tiles=[];for(let i=0;i<4;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(8,30).rotateX(-PI/2),new THREE.MeshLambertMaterial({map:floT}));m.position.z=15-i*30;sc.add(m);tiles.push(m)}
const gnd=new THREE.Mesh(new THREE.PlaneGeometry(200,300).rotateX(-PI/2),new THREE.MeshLambertMaterial({color:0x0d0a12}));gnd.position.set(0,-.05,-60);sc.add(gnd);
const bg=new THREE.BoxGeometry(1,1,1),bmat=[0xffffff,0xb89cff,0xff9aa8].map(c=>new THREE.MeshLambertMaterial({map:winT,color:c}));
const blds=[];for(let i=0;i<24;i++){const m=new THREE.Mesh(bg,bmat[i%3]);m.scale.set(rnd(5,9),rnd(12,34),rnd(8,12));m.position.set((i%2?1:-1)*rnd(9,14),m.scale.y/2,20-(i>>1)*12);sc.add(m);blds.push(m)}
function scroll(v,dt){const d=v*dt;for(const f of tiles){f.position.z+=d;if(f.position.z>45)f.position.z-=120}for(const b of blds){b.position.z+=d;if(b.position.z>25){b.position.z-=140;b.scale.y=rnd(12,34);b.position.y=b.scale.y/2}}}

/* ---------- KARAKTER + ANİMASYONLAR (Mixamo FBX) ---------- */
const pl=new THREE.Group();sc.add(pl);
const blob=new THREE.Mesh(new THREE.CircleGeometry(.6,16).rotateX(-PI/2),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.45}));blob.position.y=.02;sc.add(blob);
const bd=new THREE.Mesh(new THREE.BoxGeometry(.9,.08,2.1),new THREE.MeshLambertMaterial({color:0x00e5ff,emissive:0x00a0c0}));bd.visible=false;bd.position.y=.04;pl.add(bd);
const L=new FBXLoader(),clips={},acts={};let mixer,curA,ready=false;
const FILES={dance:['House_Dancing',1],run:['Running',1],jump:['Jump',0],flip:['Back_Flip_To_Uppercut',0],fly:['Flying',0],crash:['Wall_Crash',1]};
const ld=f=>new Promise((ok,no)=>L.load('assets/'+f+'.fbx',ok,undefined,no));
function addClip(k,obj,keepY){const c=obj.animations[0];for(const t of c.tracks)if(/Hips\.position$/.test(t.name)){const v=t.values,x=v[0],y=v[1],z=v[2];for(let i=0;i<v.length;i+=3){v[i]-=x;v[i+2]-=z;if(!keepY)v[i+1]=y}}
 clips[k]=c;if(mixer)acts[k]=mixer.clipAction(c);if(k!=='dance')obj.traverse(o=>o.geometry&&o.geometry.dispose())}
function setup(obj){const b=new THREE.Box3().setFromObject(obj);let s=1.8/(b.max.y-b.min.y);if(!isFinite(s)||s<=0)s=.01;obj.scale.multiplyScalar(s);obj.position.y=-b.min.y*s;obj.rotation.y=PI;
 obj.traverse(o=>{if(o.isMesh){o.frustumCulled=false;const f=m=>new THREE.MeshLambertMaterial({map:m.map,color:m.map?0xffffff:m.color,emissive:0x15151f});o.material=Array.isArray(o.material)?o.material.map(f):f(o.material)}});
 pl.add(obj);mixer=new THREE.AnimationMixer(obj)}
async function loadAll(){let n=0;const up=()=>{const p=Math.round(++n/7*100);$('bar').style.width=p+'%';$('pct').textContent=p+'%'};const loadCup=()=>new Promise(ok=>new GLTFLoader().load('assets/chica.glb',g=>{cup=g.scene;cup.updateMatrixWorld(true);const b=new THREE.Box3();cup.traverse(o=>{if(o.isSkinnedMesh){o.skeleton.update();o.computeBoundingBox();const w=o.boundingBox.clone().applyMatrix4(o.matrixWorld);if(w.max.y>-1000)b.union(w);else o.visible=false}});let s=3.6/(b.max.y-b.min.y);if(!isFinite(s)||s<=0)s=1;cup.scale.multiplyScalar(s);cup.position.y=-b.min.y*s;cup.traverse(o=>{if(o.isMesh){o.frustumCulled=false;(Array.isArray(o.material)?o.material:[o.material]).forEach(q=>q.emissive&&q.emissive.setHex(0x20101a))}});setSkin();up();ok()},undefined,()=>{up();ok()}));
 const base=await ld('House_Dancing');setup(base);addClip('dance',base,1);up();play('dance');
 await Promise.all([...Object.entries(FILES).filter(([k])=>k!=='dance').map(async([k,[f,y]])=>{addClip(k,await ld(f),y);up()}),loadCup()]);ready=true}
function play(n,o={}){const a=acts[n];if(!a)return;a.reset();a.setLoop(o.once?THREE.LoopOnce:THREE.LoopRepeat,Infinity);a.clampWhenFinished=!!o.once;a.timeScale=o.ts||1;a.fadeIn(.15).play();if(curA&&curA!==a)curA.fadeOut(.15);curA=a}

/* ---------- FNAF CANAVARLARI ---------- */
const SK=[{c:0xe85aa0,n:'Cupcake',glb:1},{c:0x6a35b0,n:'Bonnie'},{c:0xd9c21a,n:'Chica'},{c:0xb23a1c,n:'Foxy'}];
let mon,eyes=[],cup;
function mkMon(i){const k=SK[i],g=new THREE.Group();if(k.glb&&cup){g.add(cup);g.userData.e=[];return g}const m=new THREE.MeshLambertMaterial({color:k.c,emissive:0x110800});eyes=[];
 const add=(geo,x,y,z,mat=m)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);g.add(o);return o};
 add(new THREE.CapsuleGeometry(.9,1.4,4,10),0,1.6,0);add(new THREE.SphereGeometry(.85,14,10),0,3.3,0);
 for(const s of[-1,1]){const e=add(new THREE.SphereGeometry(.32,8,6),s*.7,4,0);if(i===1){e.scale.y=3;e.position.y=4.6}
  eyes.push(add(new THREE.SphereGeometry(.17,8,6),s*.33,3.45,.72,new THREE.MeshBasicMaterial({color:0xff1111})));
  const a=add(new THREE.CapsuleGeometry(.22,1.2,3,6),s*1.15,1.7,.2);a.rotation.x=-.9}
 add(new THREE.BoxGeometry(.9,.22,.2),0,2.95,.8,new THREE.MeshBasicMaterial({color:0xeeeeee}));
 if(i===0)add(new THREE.CylinderGeometry(.4,.5,.5,10),0,4.25,0,new THREE.MeshLambertMaterial({color:0x111111}));
 if(i===2)add(new THREE.ConeGeometry(.2,.5,6).rotateX(PI/2),0,3.2,1,new THREE.MeshLambertMaterial({color:0xff8800}));
 g.userData.e=eyes;return g}
function setSkin(){if(mon)sc.remove(mon);mon=mkMon(S.skin);sc.add(mon);mon.visible=false}

/* ---------- OYUN DURUMU ---------- */
const LANES=[-2.4,0,2.4];
let st='boot',t=0,lane=1,y=0,vy=0,grounded=true,slideT=0,sp=0,score=0,cRun=0,kRun=0,mgap=11,inv=0,slowT=0,stumble=0,shake=0,it=0,dist=0,acc=0,gap=20,js=0,newRec=false,tapT=-1,pf=0;
const pw={mag:0,fly:0,boot:0,board:0},obs=[],cns=[],itm=[];
const sh=(...ids)=>['boot','menu','shop','set','cheat','hud','over','pause'].forEach(i=>$(i).classList.toggle('on',ids.includes(i)));
function banner(x){const b=$('ban');b.textContent=x;b.style.opacity=1;clearTimeout(banner.t);banner.t=setTimeout(()=>b.style.opacity=0,1700)}
function clear(){for(const a of[obs,cns,itm]){for(const o of a)sc.remove(o.m||o);a.length=0}}

/* ---------- ENGEL ÜRETİMİ ---------- */
const GC={},geo=(k,f)=>GC[k]||(GC[k]=f()),mt=(c,e=0)=>new THREE.MeshLambertMaterial({color:c,emissive:e});
const M={low:mt(0xd21f2b,0x300000),ylw:mt(0xffd400,0x332800),wall:mt(0x55505e,0x0a0a10),pil:mt(0x777788)};
function add(type,l,z){const g=new THREE.Group();let hl=.5,top=0;
 const box=(w,h,d,x,yy,zz,m)=>{const o=new THREE.Mesh(geo(w+'_'+h+'_'+d,()=>new THREE.BoxGeometry(w,h,d)),m);o.position.set(x,yy,zz);g.add(o)};
 if(type==='low'){box(2.1,.8,.5,0,.4,0,M.low);box(2.12,.15,.52,0,.78,0,M.ylw)}
 else if(type==='high'){box(.25,1.3,.5,-1,.65,0,M.pil);box(.25,1.3,.5,1,.65,0,M.pil);box(2.3,.7,.7,0,1.65,0,M.low);box(2.32,.12,.72,0,1.35,0,M.ylw)}
 else if(type==='wall'){box(2.2,3.2,1.2,0,1.6,0,M.wall);box(2.22,.25,1.22,0,2.6,0,M.low);hl=.6}
 else{const len=pick([10,12,14]);hl=len/2;top=1.7;box(2.2,1.7,len,0,.85,0,mt(pick([0x2a4a6a,0x6a2a2a,0x2a5a3a]),0x080810));box(2.24,.45,len-1,0,1.1,0,mt(0x88ccff,0x225577));box(.5,.3,.1,-.6,.5,hl,mt(0xffffcc,0xffffaa));box(.5,.3,.1,.6,.5,hl,mt(0xffffcc,0xffffaa))}
 g.position.set(LANES[l],0,z);sc.add(g);obs.push({m:g,type,l,hl,top});
 if(type==='train')for(let i=-hl+1;i<hl;i+=2.2)Math.random()<.5&&coin(LANES[l],top+.9,z+i)}
const cg=new THREE.CylinderGeometry(.35,.35,.1,12).rotateX(PI/2),cmat=mt(0xffd400,0x664400);
function coin(x,yy,z){const m=new THREE.Mesh(cg,cmat);m.position.set(x,yy,z);sc.add(m);cns.push(m)}
const IT={mag:[new THREE.TorusGeometry(.4,.14,6,12),0xff2244],fly:[new THREE.ConeGeometry(.4,.8,5),0x44ddff],boot:[new THREE.BoxGeometry(.6,.6,.6),0x33ff77],box:[new THREE.BoxGeometry(.75,.75,.75),0xaa44ff],key:[new THREE.TorusGeometry(.28,.09,6,10),0xffee88],board:[new THREE.BoxGeometry(.5,.1,1.1),0x00e5ff]};
function item(k,l,z){const m=new THREE.Mesh(IT[k][0],mt(IT[k][1],IT[k][1]&0x333333));m.position.set(LANES[l],1.1,z);m.userData.k=k;sc.add(m);itm.push(m)}
function row(z){const f=Math.random()*3|0,jmp=Math.random()<.28;
 for(let l=0;l<3;l++){if(l===f){if(jmp)add('low',l,z);for(let i=0;i<6;i++)coin(LANES[l],.9+(jmp?Math.sin(i/5*PI)*1.9:0),z-4+i*1.6);continue}
  if(Math.random()<.22)continue;add(pick(['low','high','wall','train','train']),l,z)}
 if(Math.random()<.16)item(pick(['mag','fly','boot','box','box','key','board']),f,z-8)}

/* ---------- ODAK: OYUN AKIŞI ---------- */
function startRun(){clear();lane=1;y=0;vy=0;grounded=true;slideT=0;score=0;cRun=0;kRun=0;mgap=11;inv=0;slowT=0;stumble=0;dist=0;acc=0;gap=18;pw.mag=pw.fly=pw.boot=pw.board=0;if(S.sup)pw.mag=pw.boot=999;pl.position.set(0,0,0);pl.rotation.x=0;
 st='intro';it=0;sh();$('cine').classList.add('on');music('untitled');play('run');mon.visible=false}
function toMenu(){clear();st='menu';sh('menu');$('cine').classList.remove('on');pl.position.set(0,0,0);pl.rotation.x=0;y=0;mon.position.set(4,0,-16);mon.rotation.y=0;mon.scale.setScalar(1);mon.visible=true;play('dance');gameMusic();hudUpd()}
function beginRun(){st='run';$('cine').classList.remove('on');sh('hud');gameMusic();mon.rotation.y=PI;play('run')}
function act(a){if(st!=='run')return;if(a==='L')lane=Math.max(0,lane-1);else if(a==='R')lane=Math.min(2,lane+1);
 else if(a==='U'&&(grounded||pw.fly)&&!pw.fly&&stumble<=0){grounded=false;if(pw.boot>0){vy=21;play('flip',{once:true,ts:1.1})}else{vy=13.5;play('jump',{once:true,ts:1.5})}}
 else if(a==='D'){if(grounded)slideT=.75;else vy=-26}else if(a==='B'&&S.boards>0&&pw.board<=0){S.boards--;pw.board=20+(S.up.board|0)*6;banner('TAHTA AKTİF! 🏄');save()}}
function crash(){if(inv>0||S.god)return;if(pw.board>0){pw.board=0;inv=1.3;shake=.45;banner('TAHTA KIRILDI!');return}faah.currentTime=0;faah.volume=Math.min(1,S.vol);faah.play().catch(()=>{});shake=.7;
 if(mgap<5.5)return die();mgap=3.5;slowT=2;inv=1.8;stumble=.9;play('crash',{once:true,ts:1.6})}
function die(){st='dead';js=0;music(null);scare();$('fl').style.opacity=1;play('crash',{once:true});newRec=score>S.best;if(newRec)S.best=Math.floor(score);S.coins+=0;save();setTimeout(over,2000)}
function over(){if(st!=='dead')return;$('fl').style.opacity=0;sh('over');$('ot').textContent=newRec?'YENİ REKOR!':'YAKALANDIN';$('os').textContent=Math.floor(score);$('oc').textContent=cRun;$('rev').style.display=S.keys>=3?'':'none';
 if(newRec){mon.visible=false;play('dance')}}
function prize(inRun){let r=Math.random(),mk=(tx,fn)=>{fn();banner(tx);save()};
 if(r<.3)mk('+'+(r=rnd(60,200)|0)+' 🪙',()=>S.coins+=r);else if(r<.5)mk('+2 🔑',()=>S.keys+=2);else if(r<.6)mk('+1 TAHTA 🏄',()=>S.boards++);
 else if(inRun&&r<.65)mk('MIKNATIS!',()=>pw.mag=8);else if(inRun&&r<.8)mk('UÇUŞ!',()=>{pw.fly=6;play('fly')});else if(inRun&&r<.9)mk('ZIPLAMA BOTU!',()=>pw.boot=12);
 else mk('SÜRPRİZ! FREDDY SENİ GÖRDÜ 🐻',()=>{S.coins+=100;if(inRun){scare();shake=.5;$('fl').style.opacity=.8;setTimeout(()=>$('fl').style.opacity=0,250)}})}
function pickup(k){if(k==='board'){S.boards++;banner('+1 TAHTA 🏄');save()}else if(k==='mag')pw.mag=6+S.up.mag*2.5;else if(k==='fly'){pw.fly=5+S.up.fly*1.5;play('fly')}else if(k==='boot'){pw.boot=10+S.up.boot*3;banner('ZIPLAMA BOTU!')}else if(k==='key'){S.keys++;kRun++}else prize(true)}

function step(dt){
 sp=Math.min(15+dist/90,38)*(S.fast?1.4:1)*(slowT>0?.6:1);const mult=1+S.up.mult*.25,wasFly=pw.fly>0;
 for(const k in pw)pw[k]=Math.max(0,pw[k]-dt);inv=Math.max(0,inv-dt);slowT=Math.max(0,slowT-dt);slideT=Math.max(0,slideT-dt);
 if(stumble>0&&(stumble-=dt)<=0)play('run');if(wasFly&&!pw.fly){inv=1.5;play('run')}
 dist+=sp*dt;acc+=sp*dt;if(acc>=gap){acc=0;gap=rnd(18,26)+sp*.25;row(-110)}
 const d=sp*dt;scroll(sp,dt);
 for(const a of[obs,cns,itm])for(let i=a.length-1;i>=0;i--){const m=a[i].m||a[i];m.position.z+=d;if(m.position.z>14){sc.remove(m);a.splice(i,1)}}
 pl.position.x+=(LANES[lane]-pl.position.x)*Math.min(1,dt*14);
 let gy=0,hit=false;
 if(!pw.fly)for(const o of obs){const p=o.m.position;if(Math.abs(p.x-pl.position.x)>1.1||Math.abs(p.z)>o.hl+.35)continue;
  if(o.type==='train'){if(y>=o.top-.4)gy=Math.max(gy,o.top);else hit=true}
  else if((o.type==='low'&&y<.75)||(o.type==='high'&&slideT<=0&&y<2)||(o.type==='wall'&&y<3.2))hit=true}
 if(pw.fly){y+=(4.5-y)*Math.min(1,dt*4);vy=0;grounded=false}
 else{vy-=38*dt;y+=vy*dt;if(y<=gy){if(!grounded&&stumble<=0)play('run');grounded=true;y=gy;vy=0}else grounded=false}
 if(hit)crash();
 pl.position.y=y+(slideT>0?.25:0);pl.rotation.x+=((slideT>0?-1.15:0)-pl.rotation.x)*Math.min(1,dt*18);blob.position.set(pl.position.x,gy+.02,0);blob.scale.setScalar(Math.max(.4,1-(y-gy)*.12));
 const magOn=pw.mag>0||S.mag;
 for(let i=cns.length-1;i>=0;i--){const c=cns[i],p=c.position;c.rotation.y+=dt*4;
  if(magOn){const v=new THREE.Vector3(pl.position.x-p.x,y+1-p.y,-p.z),dd=v.length();if(dd<10)p.add(v.setLength(Math.min(dd,26*dt)))}
  if(Math.abs(p.z)<1&&Math.abs(p.x-pl.position.x)<1&&Math.abs(p.y-(y+1))<1.3){sc.remove(c);cns.splice(i,1);cRun++;S.coins++;score+=10*mult}}
 for(let i=itm.length-1;i>=0;i--){const c=itm[i],p=c.position;c.rotation.y+=dt*3;if(Math.abs(p.z)<1.1&&Math.abs(p.x-pl.position.x)<1.1&&Math.abs(p.y-(y+1))<1.5){sc.remove(c);itm.splice(i,1);pickup(c.userData.k)}}
 score+=sp*dt*.2*mult;
 mgap=Math.min(S.hunt?4.5:11,mgap+dt*.3);mon.visible=mgap<8;mon.rotation.z=Math.sin(t*8)*.08;bd.visible=pw.board>0;if(bd.visible)bd.material.emissive.setHSL((t*.6)%1,1,.35);mon.position.set(pl.position.x*.8,Math.abs(Math.sin(t*9))*.3,mgap);mon.rotation.y=PI;mon.userData.e.forEach(e=>e.material.color.setHex(Math.sin(t*30)>.7?0xffffff:0xff1111));
 $('vig').style.opacity=mgap<6.5?(1-mgap/6.5):0;
 const tx=pl.position.x*.6,ty=3.7+y*.3;cam.position.set(cam.position.x+(tx-cam.position.x)*.2,cam.position.y+(ty-cam.position.y)*.2,6.2);cam.lookAt(pl.position.x*.4,1.6+y*.2,-8);
 const fov=62+sp*.3;if(Math.abs(fov-cam.fov)>.5){cam.fov=fov;cam.updateProjectionMatrix()}
 if(++pf%6===0){$('hs').textContent=Math.floor(score);$('hc').textContent=cRun;$('hk').textContent=kRun;$('pw').textContent=[pw.mag>0&&'🧲 '+pw.mag.toFixed(0),pw.fly>0&&'🪽 '+pw.fly.toFixed(0),pw.boot>0&&'🥾 '+pw.boot.toFixed(0),pw.board>0&&'🏄 '+pw.board.toFixed(0)].filter(Boolean).join('   ')}
}
function intro(dt){it+=dt;scroll(6,dt);pl.position.set(0,0,0);
 if(it<.8)mon.visible=false;else{mon.visible=true;mon.rotation.y=PI;const r=Math.min(1,(it-.8)/1.4);let z=8;if(it>2.2)z=it<3.4?8-(it-2.2)*3.5:3.8+(it-3.4)*4.5;mon.position.set(0,-5+r*5,Math.min(z,11));
  mon.userData.e.forEach(e=>e.material.color.setHex(Math.sin(t*40)>0?0xffffff:0xff1111))}
 if(it>2.2&&it<2.3){shake=.9;$('ban').style.opacity=1;$('ban').textContent='CUPCAKE SENİ GÖRDÜ!';$('fl').style.opacity=.7}if(it>2.5&&it<2.6)$('fl').style.opacity=0;if(it>3.5&&it<3.6){$('ban').textContent='KOŞ!';shake=.5}mon.scale.setScalar(1+Math.sin(it*9)*.04);
 const k=Math.min(1,Math.max(0,(it-2.4)/2.2)),e=k*k*(3-2*k);cam.position.set(.6*(1-e),1.3+2.4*e,-3.6+9.8*e);cam.lookAt(0,1.2+.4*e,-8*e);
 if(it>=5){$('ban').style.opacity=0;mgap=11;beginRun()}}

/* ---------- ARAYÜZ ---------- */
const pause=()=>{if(st==='run'){st='pause';save();sh('hud','pause');au[S.music]&&au[S.music].pause()}};
$('ps').onclick=pause;$('bb').onclick=()=>act('B');$('resume').onclick=()=>{st='run';sh('hud');gameMusic()};$('pmenu').onclick=toMenu;
$('play').onclick=startRun;$('retry').onclick=startRun;$('omenu').onclick=toMenu;
$('rev').onclick=()=>{if(S.keys<3)return;S.keys-=3;save();for(let i=obs.length-1;i>=0;i--)if(obs[i].m.position.z>-45){sc.remove(obs[i].m);obs.splice(i,1)}st='run';inv=3;mgap=11;pl.rotation.x=0;play('run');sh('hud');gameMusic();mon.visible=false;$('fl').style.opacity=0};
$('bshop').onclick=()=>{shop();sh('shop')};$('bset').onclick=()=>{settings();sh('set')};
document.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>{save();sh('menu')});
function btn(p,txt,fn,cls=''){const b=document.createElement('button');b.className='b s '+cls;b.innerHTML=txt;b.onclick=fn;p.appendChild(b);return b}
const UP=[['mag','Mıknatıs süresi'],['fly','Uçuş süresi'],['boot','Zıplama botu'],['mult','Skor çarpanı'],['board','Tahta süresi']];
function shop(){const g=$('sg');g.innerHTML='';hudUpd();
 for(const[k,n]of UP){const l=S.up[k]|0,c=150*(l+1)*(l+1);btn(g,`${n}<br>Sv. ${l}/5<br>${l<5?c+' 🪙':'MAX'}`,()=>{if(l<5&&S.coins>=c){S.coins-=c;S.up[k]=l+1;save();shop()}})}
 SK.forEach((k,i)=>btn(g,`${k.n}<br>${S.own[i]?(S.skin===i?'SEÇİLİ':'SEÇ'):'600 🪙'}`,()=>{if(!S.own[i]){if(S.coins<600)return;S.coins-=600;S.own[i]=1}S.skin=i;save();setSkin();shop()},S.skin===i?'on':''));
 btn(g,'Hover tahta 🏄<br>300 🪙<br>sende: '+S.boards,()=>{if(S.coins>=300){S.coins-=300;S.boards++;save();shop()}});
 btn(g,'Gizemli kutu<br>3 🔑',()=>{if(S.keys>=3){S.keys-=3;save();prize(false);shop()}},'r')}
function settings(){const m=$('sm'),q=$('sq');m.innerHTML=q.innerHTML='';
 [['discord','Discord Remix'],['manifest','Başrol Sensin'],['off','Kapalı']].forEach(([k,n])=>btn(m,n,()=>{S.music=k;save();gameMusic();settings()},S.music===k?'on':''));
 ['Düşük','Orta','Yüksek'].forEach((n,i)=>btn(q,n,()=>{S.q=i;ratio=cap();rs();save();settings()},S.q===i?'on':''));
 $('sv').value=S.vol;$('sv').oninput=e=>{S.vol=+e.target.value;for(const k in au)au[k].volume=S.vol;save()}}
function cheat(){const g=$('cg');g.innerHTML='';
 btn(g,'+9999 🪙',()=>{S.coins+=9999;save()});btn(g,'+99 🔑',()=>{S.keys+=99;save()});
 btn(g,'Ölümsüz: '+(S.god?'AÇIK':'kapalı'),()=>{S.god^=1;save();cheat()});btn(g,'Hız x1.4: '+(S.fast?'AÇIK':'kapalı'),()=>{S.fast^=1;save();cheat()});
 btn(g,'Hep mıknatıs: '+(S.mag?'AÇIK':'kapalı'),()=>{S.mag^=1;save();cheat()});
 btn(g,'Her şeyi aç',()=>{S.own=[1,1,1,1];for(const k in S.up)S.up[k]=5;save();cheat()});btn(g,'+10 tahta 🏄',()=>{S.boards+=10;save()});btn(g,'Süper mod: '+(S.sup?'AÇIK':'kapalı'),()=>{S.sup^=1;save();cheat()});btn(g,'Zor mod (canavar hep yakın): '+(S.hunt?'AÇIK':'kapalı'),()=>{S.hunt^=1;save();cheat()});btn(g,'Sıfırla',()=>{localStorage.removeItem('fnaf');location.reload()},'r');sh('cheat')}
let lt=0,lc=0;const logoTap=()=>{const n=performance.now();lc=n-lt<600?lc+1:1;lt=n;if(lc>=7){lc=0;cheat()}};$('logo').onclick=logoTap;$('logo0').onclick=logoTap;

/* ---------- KONTROLLER ---------- */
const KM={ArrowLeft:'L',KeyA:'L',ArrowRight:'R',KeyD:'R',ArrowUp:'U',KeyW:'U',Space:'U',ArrowDown:'D',KeyS:'D',KeyB:'B'};
addEventListener('keydown',e=>{if(e.code==='F2'&&st==='menu')cheat();if(e.code==='Escape'||e.code==='KeyP'){st==='pause'?$('resume').onclick():pause()}const a=KM[e.code];if(a){e.preventDefault();act(a)}});
let sx=null,sy=0;addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
addEventListener('touchmove',e=>{if(sx===null)return;const dx=e.touches[0].clientX-sx,dy=e.touches[0].clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))<28)return;act(Math.abs(dx)>Math.abs(dy)?(dx>0?'R':'L'):(dy<0?'U':'D'));sx=null},{passive:true});
addEventListener('touchend',()=>sx=null);
document.addEventListener('visibilitychange',()=>document.hidden&&pause());

/* ---------- DÖNGÜ ---------- */
$('tap').onclick=()=>{$('tap').style.display='none';$('logo0').textContent='YÜKLENİYOR…';tapT=t;music('untitled');$('cine').classList.add('on')};
const TIPS=['Hover tahtayı B tuşuyla ya da 🏄 düğmesiyle çalıştır: bir çarpmayı yutar.','Trenlerin üstüne zıplayıp koşabilirsin.','Canavar yaklaşınca ekran kızarır.','Kutulardan sürpriz çıkar. Bazen Cupcake de.','Mıknatıs ve zıplama botu marketten uzar.','Gizli menü: logoya 7 kez hızlı dokun.'];$('tip').textContent=pick(TIPS);setInterval(()=>$('tip').textContent=pick(TIPS),2600);
setSkin();hudUpd();loadAll().catch(e=>{$('logo0').textContent='HATA: '+e.message});
const clock=new THREE.Clock();let fa=16,fc=0;
function loop(){requestAnimationFrame(loop);const raw=clock.getDelta(),dt=Math.min(raw,.05);
 fa=fa*.95+raw*1000*.05;if(++fc%90===0){if(fa>24&&ratio>.55){ratio-=.1;rs()}else if(fa<13&&ratio<cap()){ratio=Math.min(cap(),ratio+.05);rs()}}
 if(st!=='pause')t+=dt;
 if(mixer&&st!=='pause')mixer.update(dt);
 if(st==='boot'){scroll(3,dt);const a=t*.35;cam.position.set(Math.sin(a)*1.6,1.5,4.6);cam.lookAt(0,1.1,0);if(ready){mon.visible=true;mon.position.set(3,0,-16);mon.userData.e.forEach(e=>e.material.color.setHex(Math.sin(t*25)>.8?0xffffff:0xff1111))}
  if(ready&&tapT>=0&&t-tapT>6){$('cine').classList.remove('on');toMenu()}}
 else if(st==='menu'){scroll(3,dt);cam.position.set(Math.sin(t*.4)*1.2,1.5,4.2);cam.lookAt(0,1.1,0);mon.userData.e.forEach(e=>e.material.color.setHex(Math.sin(t*20)>.85?0xffffff:0xff1111))}
 else if(st==='intro')intro(dt);
 else if(st==='run')step(dt);
 else if(st==='dead'){js+=dt;scroll(0,dt);
  if(newRec&&js>2){cam.position.set(0,1.5,-4);cam.lookAt(0,1.1,0)}
  else{const k=Math.min(1,js/.5);mon.visible=true;mon.rotation.y=0;mon.scale.setScalar(1+k*.5);mon.position.set(cam.position.x,cam.position.y-3.6,cam.position.z-(7-6.2*k));shake=.9}}
 if(shake>0){cam.position.x+=rnd(-1,1)*shake*.4;cam.position.y+=rnd(-1,1)*shake*.4;shake=Math.max(0,shake-dt*1.5)}
 R.render(sc,cam)}
loop();
