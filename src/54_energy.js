const headland=pivot(rigRoot,A.sun.x,0,A.sun.z);
part(headland,'hull',[0,-12,0],[342,62,232],0x728759);
const hall=pivot(headland,0,22,0),oculus=pivot(hall,0,25,0);
for(let i=0;i<64;i++){
 const a=i*tau/64,r=123,radial=pivot(hall,Math.sin(a)*r,0,Math.cos(a)*r);radial.rotation.y=a;
 blitBox(radial,0,9,0,12.8,17,43,porcelain);
 blitBox(radial,0,12,22,11.9,6,1.3,solarBlue);
 const eave=blitBox(radial,0,20,0,14.0,2.4,49,porcelain);eave.rotation.x=.11;
 blitBox(radial,5.6,10,23,1.4,18,2.5,bronze);
}
part(hall,'hull',[0,4,0],[25,19,25],0xa1c1be);
halo(hall,0,22,0,99,bronze,.23);
const clerestory=halo(oculus,0,7,0,116,0xffe2a0,5.7);
clerestory.quaternion.setFromUnitVectors(V(0,0,1),V(-.23,1,.38).normalize());
for(let i=0;i<69;i++){
 const a=i*2.39996,r=166+(i%6)*12;
 part(headland,'ball',[Math.cos(a)*r,18+(i%3),Math.sin(a)*r*.77],[6,5,6],i%2?moss:0x52794e);
}
updates.push(t=>{
 const progress=phase(2028,2038,Y);hall.scale.set(1,Math.max(.001,progress),1);hall.position.y=-6+54*progress;
 const lit=phase(T.IGNITE,T.IGNITE+.045,t)*phase(2036,2039,Y);
 oculus.scale.setScalar(Math.max(.0001,lit));
});
const gridPoints=[A.sun.clone().add(V(0,24,0)),V(1110,30,-941),V(553,27,-642),V(143,35,-384),V(71,9,-382),V(-231,7,-309)];
const gridMat=material(`varying vec3 wp;void main(){wp=position;gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);}`,atmosphere+`
 uniform float overlay;varying vec3 wp;void main(){float wave=exp(-abs(length(wp.xz-vec2(1700.,-1400.))-sweep)*.0045);
 gl_FragColor=vec4(vec3(2.5,1.36,.40),max(wave,max(overlay*.46,night*.67)));}`,{transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
function powerLine(points,r){
 const m=add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),48,r,5,false),gridMat);
 updates.push(()=>m.visible=U.sweep.value>=0||U.overlay.value>.001||U.night.value>.29&&Y>2039);
}
powerLine(gridPoints,2.45);
powerLine([A.sun.clone().add(V(-55,38,24)),V(1080,22,-825),V(680,21,-132),
 V(435,22,9),V(186,21,10),V(72,16,-52),V(71,9,-382)],1.7);
for(const lot of villageLots.filter((_,i)=>i%9===0))powerLine([V(71,9,-382),V(-32,12,lot.z),V(lot.x,lot.h+5,lot.z)],.29);
const rail=pivot();reveal(rail,2039,2045.1);
function railAt(x){return V(x,40,railCoastZ(x));}
for(let x=15;x<2790;x+=43){
 const a=railAt(x),b=railAt(x+43);spar(rail,a,b,2.26,porcelain);
 spar(rail,a.clone().add(V(0,1.46,0)),b.clone().add(V(0,1.46,0)),.55,bronze);
 spar(rail,V(x,1,a.z),a,1.65,porcelain);
 blitBox(rail,x,38.5,a.z,6.4,1.55,6.4,porcelain);
}
const express=[];
for(let i=0;i<8;i++){
 const c=pivot(rail);part(c,'ball',[0,0,0],[2.8,2.7,11.2],porcelain);
 part(c,'ball',[0,.86,0],[2.90,1.44,9.7],0x234954);
 blitBox(c,0,-.59,0,5.7,.36,18,0xffc976,2.3);
 blitBox(c,0,1,0,5.45,.58,17.8,0xcceaf1,1.05);express.push(c);
}
updates.push(t=>express.forEach((c,i)=>{
 const x=30+((U.motion.value*150/Math.hypot(1,.82)-430-i*24.6/Math.hypot(1,.82)+2688*1000)%2688),p=railAt(x),q=railAt(x+2);
 c.position.copy(p);c.position.y+=5.1;c.scale.set(1.25,1.24,1.095);c.rotation.y=Math.atan2(q.x-p.x,q.z-p.z);
}));
const bridges=[];
function bridge(a,b,later){
 const line=pivot(),v=b.clone().sub(a),length=v.length();line.position.copy(a);line.rotation.y=Math.atan2(v.x,v.z);
 blitBox(line,0,19,length/2,14,2.2,length,0xadada1);
 for(const s of [-1,1])blitBox(line,s*6.9,20.7,length/2,.7,.60,length,bronze,.38);
 for(let i=0;i<=15;i++){
  const z=length*i/15,h=i%5===2?90:18;
  blitBox(line,0,h/2,z,4.1,h,6.2,porcelain);
  if(h>20)for(const side of [-1,1])for(let k=1;k<5;k++)spar(line,V(0,h-k*4,z),V(0,20,z+side*k*22),.55,porcelain);
 }
 if(later)reveal(line,2039,2045);
 bridges.push(line);
}
bridge(V(-1500,0,300),V(-3700,0,1850),false);bridge(V(-1500,0,352),V(-3700,0,1940),true);

for(let i=0;i<61;i++){
 const x=2770+i*31,z=-2260-340*Math.sin(i*.38),h=24+cityRandom()*119;
 blitBox(rigRoot,x,7+h/2,z,18,h,23,0x8a9a9b);
 if(i%2===0)blitBox(rigRoot,x,7+h*.82,z+12,15,.8,.8,bronze,.61);
}
// Large sea-facing windows expose the silver coil silhouettes between the mullions.
const reactor=pivot(hall);
part(reactor,'disc',[0,17,0],[42,12,42],porcelain);part(reactor,'disc',[0,65,0],[42,4,42],porcelain);
for(let i=0;i<18;i++){
 const a=tau*i/18,arch=pivot(reactor,Math.cos(a)*31,43,Math.sin(a)*31);arch.rotation.y=-a;
 const coil=part(arch,'ring',[0,0,0],[8.5,18.7,8.5],0xe1ebed,.35);
 blitBox(arch,-6,0,0,1.8,31,2.3,porcelain);
 spar(arch,V(-7,-13,0),V(-21,-18,0),1.7,bronze);
 blitBox(arch,9,0,0,1.2,43,1.8,solarBlue);
}
const works=pivot(headland);reveal(works,2030,2039);
for(let i=0;i<5;i++)part(works,'hull',[-198+i*17,46,99],[7.8,8.3,24],0xe1e8e4);
blitBox(works,-175,45,14,88,19,29,porcelain);blitBox(works,-175,56,14,92,2.5,31,solarBlue);
for(let j=0;j<3;j++)for(let k=0;k<4;k++){
 const x=41+k*21,z=113+j*16;blitBox(works,x,43,z,7,9,5.7,carbon);
 for(const s of [-1,1])part(works,'pipe',[x+s*2,49,z],[.63,5,.63],bronze);
}
blitBox(works,76,39,133,93,2.2,57,0xa6a999);
for(const s of [-1,1]){
 const x=s*175,z=s*102;
 blitBox(works,x,9,z,26,13,19,carbon);
 for(let i=-3;i<=3;i++)blitBox(works,x+i*3,10,z+s*10,.65,9,.75,porcelain);
}
let prevPylon;
// Transmission leaves the switchyard along the neck of the cape, on land.
 // Keep its hanging conductors out of the transparent railway's sightline.
for(const p of [V(1570,0,-1404),V(1220,0,-1407),V(890,0,-1402),V(610,0,-1388),V(552,0,-1180),V(510,0,-943),gridPoints[2]]){
 const root=pivot(works,p.x-A.sun.x,0,p.z-A.sun.z);
 for(const s of [-1,1]){spar(root,V(s*6,12,0),V(s*1.8,64,0),1.0,bronze);
  for(let i=0;i<5;i++)spar(root,V(-5,i*9+15,0),V(5,i*9+24,0),.54,carbon);}
 blitBox(root,0,58,0,29,1.45,2,bronze);
 if(prevPylon)for(const s of [-1,1]){
  const a=prevPylon.clone().add(V(s*12,59,0)),b=root.position.clone().add(V(s*12,59,0)),mid=a.clone().lerp(b,.5);mid.y-=12;
  spar(works,a,mid,.43,carbon);spar(works,mid,b,.43,carbon);
 }prevPylon=root.position.clone();
}
const hallScaffold=pivot(headland);
for(let i=0;i<18;i++){
 const a=i*tau/18,p=V(118*Math.cos(a),22,118*Math.sin(a)),q=V(118*Math.cos(a+tau/18),22,118*Math.sin(a+tau/18));
 spar(hallScaffold,p,p.clone().add(V(0,34,0)),1.2,bronze);
 spar(hallScaffold,p,q.clone().add(V(0,24,0)),.85,porcelain);
}
updates.push(()=>hallScaffold.scale.setScalar(Math.max(.0001,phase(2028,2032,Y)*(1-phase(2036,2039,Y)))));
