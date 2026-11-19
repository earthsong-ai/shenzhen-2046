const petals=[],islands=[];
for(let row=-1;row<=1;row++)for(let col=-1;col<=1;col++){
 const idx=islands.length,base=pivot(rigRoot,-470+col*131+(row%2)*13-(col===1?(row===1?86:45):0),0,420+row*147);
 islands.push(base);reveal(base,2031+idx*1.22,2035+idx*1.22);
 part(base,'hex',[0,1,0],[60,5,60],carbon);
 part(base,'hex',[0,3.05,0],[60.3,.55,60.3],0xe9b56f,.52);
 part(base,'hex',[0,3.9,0],[59,1.35,59],porcelain);
 part(base,'hex',[0,4.78,0],[51,.58,51],moss);
 part(base,'box',[51,3.8,3],[24,1.4,8],bronze);
 for(let k=0;k<4;k++){
  const a=k*tau/4+.24,px=Math.cos(a)*27,pz=Math.sin(a)*27;
  part(base,'hex',[px,8.4,pz],[10.6,7.4,10.6],porcelain);
  part(base,'hex',[px,10.5,pz],[11.1,2.2,11.1],solarBlue);
  part(base,'hex',[px,12.25,pz],[12,1.15,12],porcelain);
  for(let face=0;face<6;face++){
   const trim=pivot(base,px,0,pz);trim.rotation.y=(face+.5)*tau/6;
   blitBox(trim,0,8.25,9.25,7.6,2.9,.15,0x486569);
   for(const post of [-3.6,0,3.6])blitBox(trim,post,8.25,9.38,.16,3.1,.24,bronze);
   blitBox(trim,0,9.9,9.58,8.2,.17,1.25,porcelain);
  }
  for(let j=0;j<2;j++){
   const tx=px*.56+j*3,tz=pz*.62-j*4;
   part(base,'pipe',[tx,7.0,tz],[.44,4,.44],bronze);
   part(base,'ball',[tx,9.6,tz],[3.3,2.6,3.4],moss);
  }
  for(let j=0;j<5;j++){
   const spoke=pivot(base,px,13,pz);spoke.rotation.y=j*tau/5;
   const petal=pivot(spoke,0,0,1.2);petals.push({petal,spoke,heading:spoke.rotation.y,lag:idx*.18+j*.035+k*.05});
   part(petal,'ball',[0,0,4.3],[2.32,.28,4.8],solarBlue);
   part(petal,'box',[0,.22,4.5],[.17,.19,8.2],bronze);
  }
 }
 halo(base,19,5.12,-25,10,bronze,.95);
}
const ferry=pivot();
part(ferry,'ball',[0,0,0],[3.5,1.5,11.4],porcelain);
part(ferry,'ball',[0,1.05,-.7],[2.9,1.1,7.5],solarBlue);
for(const s of [-1,0,1]){
 const fin=part(ferry,'box',[s*2.7,-1.5,2],[.27,3.4,3.3],carbon);fin.rotation.z=s*.22;
 part(ferry,'ball',[s*3,-3.1,2],[1.65,.19,2.1],bronze);
}

const bayFerry=pivot();part(bayFerry,'hull',[0,2.8,0],[19,2.55,5.6],porcelain);
part(bayFerry,'hull',[0,1.66,0],[19.2,.85,5.68],carbon);
part(bayFerry,'hull',[-.7,4.9,0],[12,2.15,4.75],solarBlue);
for(const side of [-1,1]){
 blitBox(bayFerry,0,4.25,side*4.55,20,.54,.57,0xfde2a3,1.45);
 part(bayFerry,'ball',[1,.33,side*3.8],[4.4,.35,3.3],bronze);
}
const shuttle=pivot(),tilts=passengerCraft(shuttle);
updates.push(t=>{
 const w=U.motion.value;const crossing=.5+.5*Math.sin((w-4)*.061);
 bayFerry.position.set(580-690*crossing,.25,535+30*crossing);
 bayFerry.rotation.y=Math.cos((w-4)*.061)>0?0:Math.PI;
 bayFerry.scale.setScalar(Math.max(.0001,phase(2034,2044,Y)));
 waterUniforms.secondWake.value.set(bayFerry.position.x,bayFerry.position.z,Math.cos((w-4)*.061));
 islands.forEach((p,i)=>{p.position.y=.085*Math.sin(t*.78+i);p.rotation.z=.0018*Math.sin(t*.67+i)});
 petals.forEach(({petal,spoke,heading,lag})=>{
  const f=phase(T.FLOAT-.86+lag*.52,T.FLOAT+1.75+lag*.49,t);
  petal.rotation.x=-1.28+(1.13+.14*U.solar.value.y)*f;
  spoke.rotation.y=heading+.31*f*Math.sin(Math.atan2(U.solar.value.x,U.solar.value.z)-heading);
 });
 const f=phase(7.5,10.5,t),dt=w-10;
 const track=((20*dt+80000)%1600)-800;
 ferry.position.set(466+track,1.65+f*1.2,489.8+.046*track);ferry.rotation.y=-1.617;
 ferry.rotation.z=.14*Math.sin(w*.16);
 ferry.scale.setScalar(Math.max(.0001,phase(2035,2044,Y)));waterUniforms.wakeBoat.value.copy(ferry.position);
 const age=Math.max(0,w-2.45),u=Math.max(0,age-12.5),pier=islands[5].position;
 const height=age<3?.5*age*age:Math.min(30,4.5+3*(age-3));
 const advance=u<27.5?u*u:756.25+55*(u-27.5);
 shuttle.position.set(pier.x+19+advance,6+height,pier.z-25);shuttle.rotation.y=-Math.PI/2;
 tilts.forEach(r=>r.rotation.x=-1.35*phase(0,7,u));shuttle.rotation.x=-.085*phase(0,4,u);
 shuttle.scale.setScalar(Math.max(.0001,phase(2038,2046,Y)));
});
