const quay=pivot(rigRoot,1090,0,5),floods=pivot(quay);
for(let i=0;i<7;i++){
 const x=i*53;
 blitBox(quay,x,4,0,54,8,82,0x808880);
 for(const side of [-1,1]){
  const knee=V(x+side*7,66,1);
  spar(quay,V(x+side*13,8,-9),knee,1.4,bronze);spar(quay,V(x+side*13,8,21),knee,1.4,bronze);
  spar(quay,knee,V(x+side*7,76,-19),1.4,bronze);spar(quay,knee,V(x+side*7,66,54),1.2,bronze);
  spar(quay,V(x+side*7,76,-19),V(x+side*7,66,54),.47,bronze);
 }
 for(let j=0;j<12;j++)blitBox(quay,x-20+(j%4)*12,11+2*(j%2),-18-Math.floor(j/4)*9,10,6+4*(j%2),6,j%2?carbon:bronze);
 part(floods,'ball',[x,60,4],[1.2,1.2,1.2],0xffdb9d,4);
}
updates.push(()=>floods.scale.y=Math.max(.0001,1-phase(2028,2045,Y))); // recessed below the quay when retired
const shipping=[];
for(let i=0;i<3;i++){
 const s=pivot();shipping.push(s);
 part(s,'hull',[0,3,0],[12,5,54],carbon);
 blitBox(s,0,9,-29,17,10,16,porcelain);
 for(let k=0;k<3;k++){
  const mast=pivot(s,0,6,-9+k*15);
  part(mast,'ball',[0,14,0],[1.5,14,6.4],porcelain);reveal(mast,2035,2044);
  updates.push(()=>mast.rotation.y=.67-[.48,-.83,.71][i]);
 }
 for(let k=0;k<14;k++)part(s,'ball',[(k%2?1:-1)*10,6.2,-37+Math.floor(k/2)*12],[.53,.50,.53],0xffbf70,1.6);
}
updates.push(()=>shipping.forEach((s,i)=>{
 const w=U.motion.value,angle=[.48,-.83,.71][i],start=[[1080,136],[1430,-643],[1740,-781]][i];
 s.position.set(start[0]+Math.sin(angle)*3*w,0,start[1]+Math.cos(angle)*3*w);s.rotation.y=angle;
}));
const runway=pivot(rigRoot,-700,0,60);part(runway,'disc',[0,3,0],[42,6,42],porcelain);
halo(runway,0,6.3,0,28,bronze,.62);reveal(runway,2032,2043);
for(let i=0;i<36;i++){
 const craft=pivot();const rotors=passengerCraft(craft);rotors.forEach(r=>r.rotation.x=-1.23);
 updates.push(t=>{const lane=i%3,travel=(Math.floor(i/3)/12+lane*.023+U.motion.value*55/3930+100)%1;
 craft.position.set(680+3350*travel+lane*26,81+lane*36+21*travel,-320-2070*travel+lane*115);
 craft.rotation.y=-1.02;craft.rotation.z=.035*Math.sin(travel*tau);
 craft.scale.setScalar(Math.max(.0001,phase(2034,2045,Y)));});
}
// A pair of coastal corridors stays in front of the skyline in the two wide shots.
for(let i=0;i<18;i++){
 const craft=pivot(),lane=i%2,dir=lane?-1:1;
 const rotors=passengerCraft(craft);rotors.forEach(r=>r.rotation.x=-1.23);
 part(craft,'ball',[0,.5,0],[3.7,2.4,4.8],0xf2fbff,3.2);
 updates.push(t=>{
  const x=((Math.floor(i/2)*334+dir*U.motion.value*55+3010*1000)%3010)-1000;
  craft.position.set(x,106+lane*43+12*Math.sin(x*.003),-20+lane*56-45*Math.sin(x*.0027));
  craft.rotation.y=-dir*Math.PI/2;
  craft.scale.setScalar(Math.max(.0001,phase(2033,2045,Y)));
 });
}
