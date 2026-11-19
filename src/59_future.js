// Village service bays. The shuttle doors, waiting passengers and cargo carts share the same stop phase.
function silhouetteAt(parent){
 const p=pivot(parent);
 part(p,'ball',[0,1.59,0],[.115,.14,.12],0x626a68);
 part(p,'ball',[0,1.04,0],[.207,.43,.16],0x485660);
 for(const s of [-1,1])blitBox(p,s*.078,.38,0,.106,.67,.13,carbon);
 return p;
}
for(let i=0;i<3;i++){
 const bay=pivot(district,85,3.4,-244-i*70),bus=pivot(bay);
 if(i===0){bay.position.set(17,3.4,-323);bay.rotation.y=Math.PI/2;}
 blitBox(bay,0,-.10,0,4.7,.15,17.5,0x70817a);reveal(bay,2030,2042);
 part(bus,'hull',[0,1.22,0],[1.35,1.10,3.16],porcelain);
 blitBox(bus,0,1.56,0,2.34,1.30,4.51,0x3d5c66);
 blitBox(bus,0,2.34,0,2.41,.22,4.85,porcelain);
 blitBox(bus,0,2.52,-.45,.91,.17,.58,carbon);
 for(const s of [-1,1]){
  blitBox(bus,s*1.20,.91,0,.13,.12,4.3,0x6af9e7,1.1);
  blitBox(bus,0,.84,s*2.93,2.15,.15,.21,0x73fff0,2.8);
  for(let k=-1;k<=1;k++)blitBox(bus,s*1.22,1.43,k*1.33,.13,1.12,.10,porcelain);
  for(const end of [-1,1])blitBox(bus,s*.73,.92,end*1.43,.62,.41,.65,bronze);
 }
 const door=blitBox(bus,1.23,1.33,-.6,.13,1.58,1.09,solarBlue);
 const riders=Array.from({length:4},()=>silhouetteAt(bay));
 updates.push(()=>{
  const cycle=((U.motion.value+7*i-4)%34+34)%34;
  const arrive=phase(0,8,cycle),leave=phase(17,32,cycle);
  bus.position.z=(1-arrive)*-38+leave*47;bus.position.x=-3.6*(1-arrive+leave);
  door.position.z=-.60+1.12*phase(8,9,cycle)*(1-phase(15,16,cycle));
  riders.forEach((p,j)=>{const f=phase(9+j,10.6+j,cycle);
   p.position.set(4.1+j*.30-f*(3.7+j*.3),0,-.63+(1-f)*(j-1.5)*.63);p.scale.setScalar(1-.999*f);});
 });
}
for(let i=0;i<9;i++){
 const cart=pivot(district);blitBox(cart,0,.52,0,.66,.60,1.3,porcelain);
 blitBox(cart,0,.87,.05,.57,.14,1.05,solarBlue);
 for(const x of [-.34,.34])for(const z of [-.46,0,.46])part(cart,'ball',[x,.21,z],[.13,.20,.20],carbon);
 updates.push(()=>{const w=U.motion.value+i*4,cycle=((w%14)+14)%14;
  cart.position.set(88+i%2*4,3.3,-247-i*17-1.5*(Math.floor(w/14)*12+Math.min(cycle,12))%48);
  cart.scale.setScalar(Math.max(.001,phase(2031,2044,Y)));});
}
for(const hero of landmarkLots.filter(b=>b.kind==='twins'||b.kind==='petals')){
 const base=pivot(rigRoot,hero.x,3,hero.z);reveal(base,hero.birth,hero.birth+4);
 for(let j=0;j<3;j++){
  const y=hero.height*[.32,.59,.83][j],span=hero.kind==='twins'?86:53;
  const z=hero.kind==='twins'?22:33,track=pivot(base,0,0,z);
  blitBox(track,-span/2,y/2,0,.46,y,.51,bronze);blitBox(track,0,y,0,span,.48,.60,bronze);
  const cabin=pivot(track);blitBox(cabin,0,0,0,2.55,3.55,2.1,solarBlue);
  blitBox(cabin,0,-1.5,0,2.8,.42,2.3,porcelain);blitBox(cabin,0,.85,1.08,2.1,.50,.12,0xffd39a,1.9);
  updates.push(()=>{const w=U.motion.value+j*29,travel=((w%(2*(y+span)/6))+2*(y+span)/6)%(2*(y+span)/6);
   const s=y+span-Math.abs(y+span-6*travel);
   cabin.position.set(-span/2+Math.max(0,s-y),Math.min(y,s),0);});
  for(let k=0;k<6;k++){const p=silhouetteAt(base);
   updates.push(()=>{const w=U.motion.value+iPhase(k,j);
    p.position.set((span*.39)*Math.sin(w*1.2/(span*.39)),y+10.9,k%2*1.2);});}
 }
}
function iPhase(i,j){return i*17+j*5}
const freightPad=pivot(rigRoot,1090,0,22);
part(freightPad,'disc',[0,10,0],[26,1,26],carbon);halo(freightPad,0,10.6,0,20,bronze,.75);
for(let i=0;i<6;i++){
 const carrier=pivot(),cargo=pivot(carrier,0,-1.75,0);wingCraft(carrier,15,true);
 blitBox(cargo,0,0,0,2.8,2.55,6.1,0xa59c82);
 for(const x of [-1.42,1.42])for(let k=0;k<6;k++)blitBox(cargo,x,0,-2.6+k,.08,2.4,.12,bronze);
 updates.push(t=>{const w=U.motion.value;
  if(i===0){carrier.position.set(1090,19+19*(1-phase(32,37,t)),22);cargo.position.y=-2.7-4*phase(34,37,t);}
  else{carrier.position.set(1050+(w*40+i*575)%3400,205+i%2*32,-515-i%3*260);carrier.rotation.y=-Math.PI/2;}
  carrier.scale.setScalar(Math.max(.001,phase(2035,2045,Y)));});
}
// The shallow-water shader sees the same bed layout through refracted light.
const dataSite=V(1040,0,-731);
const tender=pivot(rigRoot,dataSite.x-68,0,dataSite.z+14);
part(tender,'hex',[0,2,0],[12,3,10],carbon);blitBox(tender,0,5,0,8,4.6,6,porcelain);
halo(tender,0,7.6,0,3,bronze,.8);reveal(tender,2038,2045);
for(let row=0;row<10;row++)for(const col of [9,10,11]){
 const l=villageLots[row*12+col],nest=pivot(district,l.x+l.w*.57,l.h+4.35,l.z-l.d*.35);
 blitBox(nest,0,0,0,2.4,.24,2.4,carbon);
 for(const s of [-1,1]){
  blitBox(nest,s*1.15,.16,0,.21,.40,2.1,bronze).rotation.z=-s*.33;
  blitBox(nest,s*1.27,.24,0,.12,.12,1.9,0x9affc3,1.1);
 }
 const robot=pivot(nest,1.6,.3,-.60);
 spar(robot,V(0,0,0),V(-.49,.96,0),.13,bronze);spar(robot,V(-.49,.96,0),V(-1.38,.60,0),.11,porcelain);
 const lid=blitBox(nest,0,.63,0,2.2,.13,2.2,solarBlue);
 blitBox(nest,1.83,-1.7,0,.72,3.6,.76,carbon);
 part(nest,'pipe',[-6,1.15,2],[1.28,2.2,1.28],0xbec8c8);
 updates.push(()=>{const f=.5+.5*Math.cos(U.motion.value*.49+row);
  lid.position.z=2.5*f;robot.rotation.y=.72*Math.sin(U.motion.value*.84+row);});
 reveal(nest,2031+row%6,2044);
}
for(const base of islands){
 for(let j=0;j<6;j++){
  const a=tau*j/6,edge=pivot(base,Math.sin(a)*51,1.8,Math.cos(a)*51);edge.rotation.y=a;
  blitBox(edge,0,0,0,51,2.9,1.2,carbon);
  part(edge,'pipe',[20,3,0],[.57,1.5,.57],bronze);
 }
 for(let j=0;j<10;j++){const a=tau*j/10;part(base,'ball',[19+10*Math.cos(a),5.3,-25+10*Math.sin(a)],[.20,.13,.20],0xeed289,1.7);}
}
for(let row=0;row<3;row++)for(let col=0;col<2;col++){
 const a=islands[row*3+col],b=islands[row*3+col+1],dx=b.position.x-a.position.x;
 if(dx<112)continue;
 const bridge=pivot(a,dx*.5,4.7,0);blitBox(bridge,0,0,0,dx-86,.74,3.2,bronze);
 for(const s of [-1,1])part(bridge,'ball',[s*(dx-87)/2,0,0],[.71,.71,2],carbon);
}
for(const {petal} of petals)part(petal,'pipe',[0,0,.34],[.39,.88,.39],bronze).rotation.z=Math.PI/2;
for(const b of [...placements.filter(b=>b.x>-2200&&b.height>220),...landmarkLots]){
 const lights=pivot(rigRoot,b.x,3,b.z),hero=!!b.finish;
 const z=hero?(b.kind==='orchard'?65:b.kind==='parkRing'?114:38):22*b.depth;
 // A beacon fixed to the facade remains outside the opaque shell at mid-height.
 const markers=[];
 for(const h of [.53,1]){
  const base=pivot(lights,0,b.height*h+2,h<1?z:0);
  for(const side of [-1,1]){
   const lamp=part(base,'ball',[side*(hero?19:7),0,0],[1,1,1],0xff2115,8);
   markers.push(lamp);
  }
 }
 updates.push(()=>{
  const cycle=(U.motion.value+1.5)%3.4;
  const radius=.10+2.45*(1-phase(.32,1.13,Math.abs(cycle-2.3)));
  lights.scale.setScalar(Y>=b.birth+3.8&&U.night.value>.2?1:.0001);
  for(const m of markers)m.scale.set(radius,radius*.81,radius);
 });
}
for(const b of crownLots){
 const top=pivot(rigRoot,b.x,3+b.height,b.z);top.rotation.y=b.angle;
 for(const side of [-1,1]){blitBox(top,side*14,1.7,0,.27,3.4,22,0x8daeb4);blitBox(top,0,1.7,side*11,28,3.4,.27,0x829fa7);}
 reveal(top,b.birth+3.35,b.birth+3.8);
}
for(let i=0;i<7;i++){
 const x=i*53,trolley=pivot(quay,x,65,8),load=pivot(trolley);
 blitBox(trolley,0,0,0,8,2.4,6,bronze);
 blitBox(load,0,0,0,11,4.6,4.4,i%2?carbon:bronze);
 const line=part(trolley,'pipe',[0,-10,0],[.17,20,.17],carbon);
 const hauler=pivot(quay);blitBox(hauler,0,1.8,0,4.6,2,11,carbon);blitBox(hauler,0,3,0,4.2,.4,10,bronze);
 updates.push(()=>{const w=U.motion.value+i*7;
  trolley.position.z=7+25*Math.sin(w*.041);load.position.y=-28+12*Math.cos(w*.073);
  line.scale.y=-load.position.y;line.position.y=load.position.y*.5;
  hauler.position.set(x,8,-24+13*Math.sin(w*.10));});
}
for(const s of shipping){
 part(s,'ball',[-10,8,15],[.52,.52,.52],0xff3120,2.2);
 part(s,'ball',[10,8,15],[.52,.52,.52],0x40ff91,2.2);
 part(s,'ball',[0,33,0],[.49,.49,.49],0xfff5d9,1.8);
}
for(let j=0;j<5;j++)spar(quay,V(12+j*3,13,38),V(18+j*3,8,51),.35,carbon);
for(const i of [2,4,6]){
 const a=villageLots[i*12+11],z=a.z;
 blitBox(district,82.7,3.32,z,3,.14,17,0x85958b);
 halo(district,87.8,5.0,z,1.1,0xa9f1cc,1.3);
}
for(let i=0;i<112;i++)for(const x of [65.5,74.5])part(district,'disc',[x,3.35,-13-i*7.8],[.20,.04,.42],0xa2ded3,.58);
for(const side of [-1,1])for(let j=0;j<4;j++){
 const lot=landmarkLots[0],p=silhouetteAt(rigRoot);
 updates.push(()=>{p.position.set(lot.x+28*Math.sin(U.motion.value*.039+j),3+.59*520+11,lot.z+side*4);
  p.scale.setScalar(Math.max(.0001,phase(2034,2045,Y)));});
}
// The wind array sits beyond the inshore aircraft lanes.
const windFarm=pivot(rigRoot,4520,0,-1720);reveal(windFarm,2032,2045);
for(let i=0;i<22;i++){
 const x=i%6*392,z=-Math.floor(i/6)*364+(i%2)*69,base=pivot(windFarm,x,0,z);
 for(let j=0;j<3;j++){
  const a=j*tau/3,b=(j+1)*tau/3;
  part(base,'pipe',[18*Math.cos(a),2,18*Math.sin(a)],[4.5,11,4.5],carbon);
  spar(base,V(18*Math.cos(a),4,18*Math.sin(a)),V(18*Math.cos(b),4,18*Math.sin(b)),1.6,porcelain);
 }
 spar(base,V(0,3,0),V(0,149,0),2.7,porcelain);
 const bearing=pivot(base,0,149,0);bearing.rotation.y=-.53;
 const wheel=pivot(bearing,0,0,4);
 for(let k=0;k<3;k++){const blade=pivot(wheel);blade.rotation.z=k*tau/3;
  spar(blade,V(0,0,0),V(-3,62,0),3.1,porcelain);spar(blade,V(-3,62,0),V(0,122,1),1.6,porcelain);}
 updates.push(()=>wheel.rotation.z=i*.67+U.motion.value*(.65+.018*(i%4)));
}
blitBox(windFarm,820,9,60,76,12,41,carbon);
for(const x of [803,828,851])part(windFarm,'ball',[x,21,61],[9,9,9],porcelain);
spar(windFarm,V(786,15,55),V(757,32,48),1,bronze);
for(let i=1;i<villageLots.length;i+=7){
 const lot=villageLots[i],shed=pivot(district,lot.x-3,lot.h+4,lot.z-3);reveal(shed,2033+i%7,2045);
 blitBox(shed,0,1.05,0,8.8,2.1,3.3,0x85a49e);
 for(let j=0;j<5;j++){blitBox(shed,-4+j*2,1.15,0,.14,2.3,3.55,porcelain);}
 for(const z of [-1.68,1.68])for(const y of [.64,1.48]){
  blitBox(shed,0,y,z,8.5,.24,.19,moss);
  blitBox(shed,0,y+.19,z,8.5,.07,.19,0xffddb4,.55);}
}
for(let i=0;i<4;i++){
 const skiff=pivot();part(skiff,'hull',[0,.36,0],[.96,.49,2.52],porcelain);
 blitBox(skiff,0,1.21,.25,1.65,1.04,2.7,solarBlue);blitBox(skiff,0,1.85,.25,1.82,.18,3.1,porcelain);
 updates.push(()=>{const z=-115-i*72-((U.motion.value*3+1500)%480);
  skiff.position.set(canalX(z)+7,0,z);skiff.scale.setScalar(Math.max(.0001,phase(2034,2045,Y)));});
}
const terminal=pivot(rigRoot,-700,0,60);reveal(terminal,2036,2045);
blitBox(terminal,0,24,0,11,47,12,solarBlue);
for(let i=0;i<5;i++){
 const a=i*1.85,x=Math.cos(a)*13,z=Math.sin(a)*13;
 part(terminal,'disc',[x,11+i*8,z],[17,1.7,17],porcelain);
 halo(terminal,x,12+i*8,z,12,bronze,.85);
}
// Softly lit, blank glass enclosures leave room fronts legible at street level.
const landingCraft=pivot(),landingRotors=passengerCraft(landingCraft),landingPier=islands[1].position;
updates.push(()=>{
 const w=U.motion.value,remaining=Math.max(0,21-w);
 landingCraft.position.set(landingPier.x+19+Math.max(0,remaining-5)**2,
   6+Math.min(3,remaining*.5)+Math.max(0,remaining-6)*2,landingPier.z-25);
 landingCraft.rotation.y=Math.PI/2;landingCraft.rotation.x=.095*phase(0,10,remaining);
 landingRotors.forEach(r=>r.rotation.x=-1.35*phase(3,11,remaining));
 landingCraft.scale.setScalar(w>=0&&Y>2042?1:.0001);
});
const farmWorker=pivot(district);const tray=villageLots[8*12+11];
farmWorker.position.set(tray.x-6,tray.h+3.6,tray.z);reveal(farmWorker,2034,2044);
part(farmWorker,'ball',[0,1.54,0],[.17,.17,.15],porcelain);
blitBox(farmWorker,0,1.11,0,.48,.54,.27,porcelain);blitBox(farmWorker,0,1.1,-.21,.36,.43,.15,carbon);
part(farmWorker,'ball',[.14,1.25,.15],[.044,.045,.025],0xa8ffc6,1.1);
for(const s of [-1,1]){
 spar(farmWorker,V(s*.12,.83,0),V(s*.15,.12,.02),.09,carbon);
 spar(farmWorker,V(s*.24,1.25,0),V(s*.29,.85,.21),.076,solarBlue);
}
blitBox(district,tray.x-6,tray.h+3.42,tray.z-1.2,1.1,.19,1.15,carbon);
// A far-off tether and a low-brightness light performance occupy separate parts of the sky.
const tether=pivot(rigRoot,4830,0,-4210);reveal(tether,2040,2045);
part(tether,'hex',[0,3,0],[19,5,16],carbon);
const aerostat=pivot(tether);part(aerostat,'hull',[0,0,0],[56,16,18],0xf1eee0);
spar(tether,V(0,5,0),V(155,1990,-35),.48,bronze);
for(let i=1;i<8;i++)part(tether,'ball',[155*i/8,1990*i/8,-35*i/8],[.85,.85,.85],0xfad894,.86);
updates.push(()=>aerostat.position.set(155+2*Math.sin(U.motion.value*.04),1990,-35+2*Math.cos(U.motion.value*.05)));
const lightBand=new THREE.BufferGeometry(),seeds=new Float32Array(2304*3);
for(let i=0;i<2304;i++){seeds[i*3]=i%96/95;seeds[i*3+1]=Math.floor(i/96)/23;seeds[i*3+2]=(i*.61803)%1;}
lightBand.setAttribute('position',new THREE.Float32BufferAttribute(seeds,3));
const ballet=new THREE.Points(lightBand,material(atmosphere+`
 varying float intensity;void main(){float u=position.x,v=position.y-.5,a=u*6.283+world*.051;
 vec3 p=vec3(-760.+u*310.,174.+42.*sin(a)+v*23.*cos(a*1.6),-90.+31.*cos(a)+v*23.*sin(a*1.6));
 intensity=(.15+.30*position.z)*smoothstep(44.,44.7,clock)*(1.-smoothstep(47.,47.7,clock));
 gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);gl_PointSize=1.;}`,
 'varying float intensity;void main(){gl_FragColor=vec4(1.,.59,.24,intensity);}',{transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
ballet.frustumCulled=false;scene.add(ballet);updates.push(t=>ballet.visible=t>=44&&t<=47.7&&Y>=2043);
for(let i=0;i<3;i++){
 const taxi=pivot(terminal);passengerCraft(taxi);
 updates.push(()=>{const u=.5+.5*Math.sin(U.motion.value*.062+i*2.1),a=i*1.85;
  taxi.position.set(Math.cos(a)*13+69*u*u,12.8+i*8+u*24,Math.sin(a)*13+13*u*u);
  taxi.rotation.y=-1.42;taxi.rotation.z=.09*u;});
}
for(let i=0;i<3;i++){
 const z=-195-i*106,x=canalX(z)+16;blitBox(district,x,2,z,5.2,.9,11,bronze);
 for(const s of [-1,1])part(district,'pipe',[x-2,1.4,z+s*4],[.33,3.5,.33],carbon);
}
// Conveyors sit between the enclosed central core and the west-facing docking shelves.
for(let level=0;level<5;level++){
 const belt=pivot(hub,-24,10.5+level*8,0);
 blitBox(belt,0,0,0,2.1,.43,66,carbon);
 for(let i=0;i<4;i++){
  const box=blitBox(belt,0,.70,0,1.14,.92,1.62,0xbda378);
  updates.push(()=>box.position.z=((U.motion.value*2.7+i*16.5+6600)%66)-33);
 }
}
for(const b of crownLots.filter((_,i)=>i%3===0)){
 for(let i=0;i<3;i++){
  const walker=silhouetteAt(rigRoot);
  updates.push(()=>{const a=(U.motion.value*.095+i*.28),r=10;
   walker.position.set(b.x+r*Math.cos(a),b.height+4.1,b.z+r*Math.sin(a));walker.rotation.y=-a;
   walker.scale.setScalar(Math.max(.0001,phase(b.birth+3.3,b.birth+3.8,adoptionYear())));});
 }
}
