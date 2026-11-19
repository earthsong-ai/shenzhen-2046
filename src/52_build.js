const site=pivot(rigRoot,A.grow.x,3,A.grow.z);reveal(site,2034,2043);
const rooms=pivot(site),lift=pivot(site),tip=pivot(lift),suspended=pivot(site);
function room(parent,x,y,z){
 const r=pivot(parent,x,y,z);
 blitBox(r,0,0,0,9.76,3.64,11.8,0xa6998e);
 blitBox(r,0,.18,6.04,8.5,2.6,.2,0x455456);
 blitBox(r,1.8,.03,6.19,3.4,1.85,.2,0xbfaa88,.08);
 for(const side of [-1,1]){
  blitBox(r,side*4.52,0,6.21,.24,3.28,.22,0x706962);
  blitBox(r,side*1.96,.13,6.28,.14,2.55,.13,0x8c948b);
 }
 blitBox(r,0,-1.43,6.22,9.18,.23,.70,0x777b73);
 return r;
}
for(let j=0;j<10;j++){
 const y=j*24;
 blitBox(site,0,y+12,0,53,24,44,solarBlue);
 for(let k=0;k<5;k++)blitBox(site,0,y+k*4.5+1,22.1,54,.68,.7,bronze);
 blitBox(site,0,y+24,0,58,1.6,48,porcelain);
 for(let k=0;k<6;k++)part(site,'ball',[-22+k*8.4,y+25,22],[2.7,1.6,2.1],moss);
}
const tiers=[];
for(let j=0;j<21;j++){
 const level=pivot(rooms,0,243+j*4.05,0);tiers.push(level);
 for(let k=0;k<5;k++)for(const side of [-1,1]){
  if(j===20&&k===4&&side===1)continue;
  room(level,(k-2)*10.5,0,side*15);
 }
}
blitBox(site,-1,276,0,17,95,15,0xa5a599);
blitBox(lift,0,5,0,11,14,10,carbon);blitBox(tip,0,12,19,3.9,.92,56,0xd1a260);
spar(tip,V(0,22,-8),V(0,13,44),.66,bronze);
for(let j=0;j<8;j++){
 const z=-7+j*4.5;
 for(const side of [-1,1])spar(tip,V(side*1.5,11,z),V(side*1.5,15,z+4.5),.21,bronze);
 blitBox(tip,0,15,z,3.5,.25,.25,porcelain);
 }
 blitBox(tip,0,10,-8,5.6,4.8,5.4,carbon);
 for(const side of [-1,1])spar(tip,V(0,21,0),V(side*1.5,14,27),.13,porcelain);
 room(suspended,0,0,0);
 blitBox(suspended,0,.30,6.38,8.31,2.33,.12,0x42585b,.04);
 blitBox(suspended,-2.6,.23,6.50,2.5,1.83,.10,0x566d73);
 for(const s of [-1,1])blitBox(suspended,s*4.72,0,6.44,.31,3.63,.3,bronze);
 for(let j=0;j<5;j++){
  blitBox(lift,-4+j*2,10,5.3,.40,.28,.42,0xffbd65,1.65);
  blitBox(suspended,-4+j*2,1.9,5.92,.18,.19,.62,bronze);
 }
// An offset lattice jib is readable against the sky even from the opening bay view.
const crossJib=pivot(tip,0,18,-1);
for(const z of [-1.5,1.5]){
 spar(crossJib,V(-24,0,z),V(43,0,z),.90,0xf2bb69);
 spar(crossJib,V(-24,3.7,z),V(43,3.7,z),.64,bronze);
 for(let i=0;i<11;i++)spar(crossJib,V(-24+i*6,0,z),V(-18+i*6,3.7,z),.37,porcelain);
}
spar(crossJib,V(0,13,0),V(39,3.7,0),.48,bronze);
blitBox(crossJib,-21,-1,0,7.6,4.4,5.2,carbon);
const gripper=part(site,'box',[0,300,0],[1.25,20,1.25],porcelain);
const sleeveArm=part(site,'box',[0,300,0],[1.85,10,1.85],bronze);
for(const s of [-1,1])blitBox(site,s*8,269,9,1.15,157,1.3,bronze);
const hoist=pivot(site,29,0,12);blitBox(hoist,0,0,0,4.2,5.7,5.2,0xb79567);
blitBox(site,29,153,13,.8,301,1.05,bronze);
for(const x of [-4.6,4.6])for(const z of [-5.7,5.7])part(suspended,'pipe',[x,2.0,z],[.23,.65,.23],bronze);
// A gasket and parallel actuator rods register the last few centimetres of travel.
const socket=pivot(site,21,324,21.48);
 // Seen obliquely, the side window and corner posts give the delivered room depth.
 blitBox(suspended,4.93,0,0,.17,2.85,10.9,0xd1b88b);
 for(const zz of [-3.0,2.7]){
  blitBox(suspended,5.05,.18,zz,.12,2.20,4.64,0x3b5961);
  blitBox(suspended,5.14,.48,zz+.7,.10,.76,1.76,0xe7ce9d,.26);
  blitBox(suspended,5.17,.18,zz,.11,2.20,.13,bronze);
 }
for(const x of [-5.1,5.1])blitBox(socket,x,0,0,.29,4.02,.39,carbon);
blitBox(socket,0,-1.96,0,10.4,.35,.48,carbon);
for(const x of [-4.4,4.4]){
 const yoke=pivot(suspended,x,2.35,1);
 blitBox(yoke,0,0,0,.43,.54,9.6,bronze);
 spar(yoke,V(0,0,-4.5),V(-x,4.3,0),.22,carbon);
}
// The two horizontal slides bear on the module's front corner posts.
const press=pivot(site,21,324,0),pushRods=[];
for(const x of [-4.45,4.45]){
 const barrel=part(press,'pipe',[x,3.45,33],[.63,8,.63],carbon);
 barrel.rotation.x=Math.PI/2;
 const collar=part(press,'pipe',[x,3.45,29.2],[.77,.61,.77],bronze);
 collar.rotation.x=Math.PI/2;
 spar(press,V(x,3.45,34),V(x*.63,11.4,29),.37,bronze);
 const piston=part(press,'pipe',[x,3.45,26],[.31,1,.31],porcelain);
 piston.rotation.x=Math.PI/2;
 const shoe=blitBox(press,x,2.85,22,.66,1.65,.52,bronze);
 pushRods.push({piston,shoe});
}
const confirm=pivot(site,21,324,21.9);
blitBox(confirm,0,1.89,0,10.35,.25,.32,0xafffd3,2.4);
for(const x of [-4.72,4.72])blitBox(confirm,x,0,0,.26,3.6,.26,0xafffd3,2.4);

for(let i=0;i<4;i++){blitBox(site,38,1.25,-25+i*18,11,1.6,15,carbon);room(site,38,4,-25+i*18)}
updates.push(t=>{
 const f=phase(T.BUILD,T.SLOT,t),height=300+30*f;
 tiers.forEach((node,j)=>node.scale.setScalar(Math.max(.0001,clamp((height-243-j*4.05)/3.8))));
 lift.position.y=height;tip.rotation.y=.53*(1-phase(T.BUILD+1.5,T.SLOT,t));
 const y=324;
 const left=Math.max(0,T.SLOT-t);const z=15+.3*Math.min(10,left)+.5*Math.max(0,left-10);
 suspended.position.set(21,y,z);hoist.position.y=105+49*Math.sin(U.motion.value*.028);
 lift.position.x=-12;tip.rotation.y=Math.atan2(suspended.position.x+12,z);
 gripper.position.set(21,(y+height+12)/2,z);gripper.scale.y=Math.max(.01,height+12-y);
 sleeveArm.position.set(21,height+8,z);
 // After the receiving frame confirms the seat, release and withdraw the jaws.
 const release=phase(T.SLOT+.14,T.SLOT+.72,t);
 press.scale.setScalar(phase(T.BUILD-.45,T.BUILD+.13,t)*(1-phase(T.CLOUD,T.CLOUD+.44,t)));
 press.position.y=324+3.8*release;
 for(const {piston,shoe} of pushRods){
  const contact=z+6.6+2.8*release;
  shoe.position.z=contact;piston.position.z=(29.2+contact)/2;piston.scale.y=Math.max(.08,29.2-contact);
 }
 confirm.scale.setScalar(t>=T.SLOT&&t<T.SLOT+.42?1:.0001);
});
for(const b of [...placements,...landmarkLots].filter(p=>p.birth>2026&&p.x> -2500)){
 const deck=pivot(rigRoot,b.x,0,b.z);
 blitBox(deck,0,0,0,b.width*43,.9,b.depth*35,0xa8a190);
 // Unclad storeys and a single climbing lattice crane mark the moving roofline.
 for(const sx of [-1,1])for(const sz of [-1,1]){
  const x=sx*b.width*15,z=sz*b.depth*13;
  blitBox(deck,x,8,z,1.0,16,1.0,porcelain);
  spar(deck,V(x,1,z),V(-x,15,z),.30,bronze);
 }
 for(const z of [-13,13])blitBox(deck,0,15,z*b.depth,b.width*34,1,1.3,bronze);
 // Double-height open construction bays contrast with the opaque glazing below.
 for(const level of [7,14]){
  blitBox(deck,0,level,0,b.width*37,.95,b.depth*30,0xa99878);
  for(const side of [-1,1])blitBox(deck,side*b.width*18,level+3.8,0,1.5,7.6,b.depth*29,0xc78b48);
 }
 const mast=pivot(deck,4,12,0);mast.rotation.y=.4+b.variant;
 if(b.birth<2033)mast.scale.set(1.40,1.23,1.40);
 for(const side of [-1,1])blitBox(mast,side*1.35,18,0,.66,36,.75,0xe3aa64);
 for(let j=0;j<6;j++)spar(mast,V(-1.35,j*5.5,0),V(1.35,(j+1)*5.5,0),.29,bronze);
 blitBox(mast,5,30,0,51,1.3,2.2,0xdda163);
 spar(mast,V(0,39,0),V(29,30,0),.38,bronze);
 blitBox(mast,-18,28,0,5,4.4,4,carbon);
 updates.push(()=>{const f=clamp((adoptionYear()-b.birth)/3.8);
 deck.scale.setScalar(f>.01&&f<1?1:.0001);deck.position.y=3+Math.floor(f*80)/80*b.height;});
}
