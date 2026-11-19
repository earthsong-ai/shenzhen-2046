// All distances below are scene metres. These curves key the motion of the two film props.
const flightKeys=spline([[8,0,0,0],[20,1033.6,50,3],[60,9000,2000,30],[75,12000,4000,38],
 [90,22000,8000,50],[120,40000,30000,65],[150,68000,75000,72],[180,95000,150000,80],[195,101000,189000,82]]);
const seaBearing=V(.94,0,.34).normalize();
function flightPose(seconds){
 const a=Math.max(0,seconds),[alt,range,tilt]=flightKeys(Math.max(8,Math.min(195,a)));
 const height=a<=20?1.75*a*a+.0417*a*a*a:alt;
 return {p:A.pad.clone().addScaledVector(seaBearing,range).add(V(0,14+height,0)),height,tilt};
}
function arrival(w){
 const left=Math.max(0,36.8-w),settle=Math.max(0,w-36.8);
 const compression=settle<.4?.55*Math.sin(Math.PI*settle/.4)*Math.exp(-settle*2):0;
 return {height:8*left*left+1.5*left,drift:12*phase(0,3.6,left),leg:phase(33.8,35,w),compression};
}
const launchRig=pivot(rigRoot,A.pad.x,0,A.pad.z),returnRig=pivot(rigRoot,A.recovery.x,0,A.recovery.z);
const standbyRig=pivot(rigRoot,8620,0,3020);
for(const deck of [launchRig,returnRig,standbyRig]){
 reveal(deck,2040,2046);
 for(const side of [-1,1]){
  blitBox(deck,side*23,12,0,40,4,84,0x748385);
  for(const z of [-32,32]){
   part(deck,'pipe',[side*32,3,z],[4.7,20,4.7],carbon);
   spar(deck,V(side*32,0,z),V(-side*32,10,z),1.05,bronze);
  }
  for(let k=-3;k<=3;k++)blitBox(deck,side*42,14.3,k*12,.65,.45,4.5,0xffc684,2.6);
 }
 if(deck===returnRig)blitBox(deck,0,12,0,9,4,84,carbon);
 halo(deck,0,14.15,0,26,porcelain,.55);
}
const mast=pivot(launchRig,0,14,-21);
for(const x of [-3,3]){
 blitBox(mast,x,30,0,1.3,60,1.4,porcelain);
 for(let j=0;j<7;j++)spar(mast,V(-3,j*8,0),V(3,(j+1)*8,0),.43,bronze);
}
const arm=pivot(mast,0,43,0);blitBox(arm,0,0,9,2.7,1.6,18,bronze);
for(const x of [-33,33])for(const z of [-32,32])spar(launchRig,V(x,14,z),V(x,88,z),.46,porcelain);
function stage(deck,booster=false){
 const body=pivot(deck),height=booster?44:67;
 part(body,'pipe',[0,height*.44,0],[4.1,height*.84,4.1],booster?0x999b91:0xe1e8e8);
 part(body,'hull',[0,height*.87,0],[4.1,height*.13,4.1],porcelain);
 part(body,'pipe',[0,4,0],[4.15,7,4.15],booster?0x494d4c:carbon);
 part(body,'pipe',[0,height*.64,0],[4.16,1.3,4.16],carbon);
 const legs=[];
 for(let j=0;j<4;j++){
  const side=pivot(body);side.rotation.y=j*tau/4;
  const leg=pivot(side,3.6,7,0);legs.push(leg);
  spar(leg,V(0,0,0),V(.28,-7,0),.46,bronze);blitBox(leg,.28,-7,0,1.7,.47,1.8,carbon);
  const fin=pivot(side,3.8,height*.81,0);fin.rotation.z=booster?0:1.4;
  for(let k=0;k<4;k++)blitBox(fin,1.4,.15,-.9+k*.6,3,.15,.12,carbon);
  for(let k=0;k<5;k++)blitBox(fin,.15+k*.65,.15,0,.11,.15,2.2,bronze);
  part(body,'pipe',[2*Math.cos(j*tau/4),.4,2*Math.sin(j*tau/4)],[.83,1.1,.83],carbon);
 }
 const tail=pivot(body);part(tail,'hull',[0,-13,0],[3.3,16,3.3],0xffa443,5.2);
 part(tail,'hull',[0,-33,0],[1.7,22,1.7],0xffd695,7.1);
 return {body,legs,tail};
}
const returning=stage(returnRig,true),departing=stage(launchRig),waitingStage=stage(standbyRig);
waitingStage.body.position.y=14;waitingStage.tail.scale.setScalar(.00001);
const glows=material(`varying vec2 st;void main(){st=uv-.5;vec4 eye=modelViewMatrix*vec4(0.,0.,0.,1.);
 eye.xy+=position.xy*vec2(length(modelMatrix[0].xyz),length(modelMatrix[1].xyz));gl_Position=projectionMatrix*eye;}`,
 `varying vec2 st;void main(){float r=length(st)*2.;gl_FragColor=vec4(4.2,2.4,.92,exp(-6.*r)*(1.-smoothstep(.65,1.,r)));}`,
 {transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
const flameCore=add(new THREE.PlaneGeometry(1,1),glows),returnGlow=add(new THREE.PlaneGeometry(1,1),glows);
const launchVapor=material(atmosphere+`
 uniform vec3 pad;uniform float mode,begin;varying vec2 st;varying float alpha,tag;
 void main(){
 tag=float(gl_InstanceID);float e=tag/159.,age=world-begin-e*(mode<.5?3.7:1.4);
 vec3 p=pad;float a=tag*2.39996,r=(5.+max(0.,age)*14.);
 if(mode<.5)p+=vec3(sin(a)*(4.+r*.65),9.+max(0.,age)*(5.+4.*sin(tag*1.3)),6.+max(0.,age)*(217.+28.*sin(tag))/(1.+.15*max(0.,age)));
 else p+=vec3(cos(a)*r+max(0.,age)*2.,14.+max(0.,age)*1.8,sin(a)*r);
 float w=(mode<.5?12.:4.)+max(0.,age)*(mode<.5?30.:4.);
 vec4 eye=viewMatrix*vec4(p,1.);eye.xy+=position.xy*vec2(w*1.55,w);
 st=uv-.5;alpha=smoothstep(0.,.08,age)*(1.-smoothstep(2.,8.,age));
 gl_Position=projectionMatrix*eye;}`,atmosphere+`
 uniform float mode;varying vec2 st;varying float alpha,tag;void main(){float n=texture2D(detail,st*.63+tag*.147+world*.016).r;
 float edge=1.-smoothstep(.15,.53,length(st)+(.5-n)*.44);
 float hot=exp(-max(0.,world-37.3-tag/159.*3.7)*1.9);
 vec3 color=mix(vec3(.21,.24,.30),vec3(1.38,1.33,1.22),smoothstep(.31,.65,n+st.y*.27));
 if(mode<.5)color=mix(color,vec3(5.9,1.44,.22)*(n+.55),hot);
 gl_FragColor=vec4(color,alpha*edge*(mode<.5?.67:.32));}`,
 {transparent:true,depthWrite:false});
for(const [mode,p,start] of [[0,A.pad,37.3],[1,A.recovery,36.05]]){
 const m=launchVapor.clone();m.uniforms={...U,mode:{value:mode},pad:{value:p},begin:{value:start}};
 const cloud=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),m,160);
 cloud.frustumCulled=false;scene.add(cloud);updates.push(()=>cloud.visible=U.world.value>=start&&U.world.value<start+14);
}
// Actual world positions determine viewing directions, even beyond the far clip plane.
function skyRibbon(old){
 const g=new THREE.PlaneGeometry(1,1,192,12),count=g.attributes.position.count;
 const xyz=new Float32Array(count*3),adjacent=new Float32Array(count*3);
 function sample(u){
  if(!old)return flightPose(8+178*u).p;
  // The earlier launch has been sheared into a thin, uneven cirrus arc.
  return V(1870+11000*u,2240+1930*u-1470*u*u+195*Math.sin(6.8*u),-4650+6400*u*u);
 }
 for(let i=0;i<count;i++){
  const u=g.attributes.uv.getX(i);
  xyz.set(sample(u).toArray(),i*3);adjacent.set(sample(u+.001).toArray(),i*3);
 }
 g.setAttribute('nextPoint',new THREE.Float32BufferAttribute(adjacent,3));
 g.setAttribute('sourcePoint',new THREE.Float32BufferAttribute(xyz,3));
 const m=material(atmosphere+`
 attribute vec3 sourcePoint,nextPoint;uniform float previous;varying vec2 st;varying float opacity,ice,altitude;
 void main(){
 float u=uv.x,e=8.+178.*u,age=world-38.-e;
 vec3 p=sourcePoint;float drift=previous>.5?world+420.:max(0.,age);
 float low=1.-smoothstep(4000.,29000.,p.y);
 p.xz+=drift*(vec2(1.3,.57)+low*vec2(2.8*sin(p.y*.00082),6.7*cos(p.y*.00077)));
 vec3 dir=p-cameraPosition;float d=length(dir),scale=min(1.,11000./d);
 vec4 eye=viewMatrix*vec4(cameraPosition+dir*scale,1.);
 vec3 delta=mat3(viewMatrix)*(nextPoint-sourcePoint);
 vec2 tangent=normalize(delta.xy+eye.xy*delta.z/max(1.,-eye.z)+vec2(.00001));
 // Reflected sunlight catches newly exhausted gas only above the Earth's shadow.
 altitude=p.y;
 ice=smoothstep(8700.,10200.,p.y)*(1.-smoothstep(18000.,21500.,p.y));
 float width=31.+75.*smoothstep(15.,73.,e)+max(0.,age)*(.76+3.4*ice);
 // Expansion depends on ambient pressure. The terminator lights the growing
 // cloud across its width, independently of where it started to expand.
 float rarefied=smoothstep(27000.,61000.,p.y);
 width+=rarefied*(560.+min(30.,max(0.,age))*(400.+155.*u));
 if(previous>.5)width=130.+255.*u+90.*sin(u*8.);
 eye.xy+=vec2(-tangent.y,tangent.x)*(uv.y-.5)*width*scale;
 st=uv;opacity=previous>.5?smoothstep(35.6,36.,clock):smoothstep(-.3,1.5,age);
 gl_Position=projectionMatrix*eye;}`,atmosphere+`
 uniform float previous;varying vec2 st;varying float opacity,ice,altitude;
 void main(){
 float n=texture2D(detail,st*vec2(3.8,.68)+world*.00029).r;
 float ripple=texture2D(detail,st*vec2(12.,1.4)-world*.00038).r;
 float v=st.y-.5+(n-.5)*.37+.044*sin(st.x*42.);
 float envelope=1.-smoothstep(.31,.50,abs(st.y-.5));
 float edge=abs(v),fold=exp(-pow((edge-.215-(n-.5)*.14)*12.,2.));
 float grain=texture2D(detail,st*vec2(22.,2.8)+vec2(world*.00019,.19)).r;
 float filaments=.26+.74*smoothstep(.31,.65,n*.48+.34*ripple+.18*grain);
 float light=smoothstep(33200.,35700.,altitude+(n-.5)*6000.-v*5300.);
 float body=exp(-v*v*23.);
 float lace=smoothstep(.22,.67,.72*n+.28*ripple);
 fold*=.32+.85*lace;
 float striation=exp(-abs(v+.06+.13*sin(st.x*25.)+.24*(ripple-.5))*24.);
 float shadowedCore=exp(-abs(v)*20.);
 vec3 warm=mix(vec3(.94,.25,.049),vec3(.94,.97,1.07),ice);
 vec3 color=mix(warm,mix(vec3(.97,1.86,3.26),vec3(2.75,1.67,1.06),smoothstep(.13,.40,edge)),light);
 float alpha=mix((.31*body+.40*shadowedCore+.15*striation)/(1.+.8*smoothstep(28000.,35000.,altitude)),
   .23*body+.71*fold+.27*striation,light)*filaments;
 if(previous>.5){color=mix(vec3(.32,.45,.63),vec3(.96,.82,.73),n);alpha=(body*.31+fold*.29)*filaments;}
 alpha*=smoothstep(0.,.035,st.x)*(1.-smoothstep(.86,1.,st.x));
 gl_FragColor=vec4(color,alpha*envelope*opacity);}`,
 {uniforms:{...U,previous:{value:old?1:0}},side:THREE.DoubleSide,transparent:true,depthWrite:false});
 const ribbon=add(g,m);ribbon.frustumCulled=false;updates.push(t=>ribbon.visible=t>35.5);
}
skyRibbon(true);skyRibbon(false);
const pinpoint=material(`varying vec2 st;void main(){st=uv-.5;vec4 eye=modelViewMatrix*vec4(0.,0.,0.,1.);
  eye.xy+=position.xy*length(modelMatrix[0].xyz);gl_Position=projectionMatrix*eye;}`,
  `varying vec2 st;void main(){float r=dot(st,st);gl_FragColor=vec4(1.32,1.42,1.58,exp(-r*19.)*(1.-smoothstep(.19,.25,r)));}`,
  {transparent:true,depthWrite:false});
const satellites=Array.from({length:9},()=>add(new THREE.PlaneGeometry(1,1),pinpoint));
const stationStar=add(new THREE.PlaneGeometry(1,1),pinpoint);
const crossingSatellite=add(new THREE.PlaneGeometry(1,1),pinpoint);
updates.push(t=>{
 const w=U.world.value,flight=flightPose(w-38),land=arrival(w);
 const d=departing.body;d.position.copy(flight.p).sub(A.pad);
 d.quaternion.setFromUnitVectors(V(0,1,0),V(seaBearing.x*Math.sin(flight.tilt*Math.PI/180),Math.cos(flight.tilt*Math.PI/180),seaBearing.z*Math.sin(flight.tilt*Math.PI/180)));
 const burn=phase(37.3,37.94,w)*(1-phase(147,150,w-38)+phase(151,152,w-38));
 departing.tail.scale.set(Math.max(.00001,burn*(1+phase(86,125,w-38)*12)),Math.max(.00001,burn*1.65),Math.max(.00001,burn*(1+phase(86,125,w-38)*12)));
 arm.rotation.y=-1.43*phase(37.94,38.22,w);
 returning.body.position.set(land.drift,14+land.height-land.compression,0);
 returning.body.rotation.z=.043*(1-phase(34.5,36.8,w));
 for(const leg of returning.legs)leg.rotation.z=.63*land.leg;
 returning.body.scale.setScalar(t>=30?1:.00001);
 const braking=phase(30,33,w)*(1-phase(36.8,36.95,w));returning.tail.scale.set(1.1*braking+.00001,.34*braking+.00001,1.1*braking+.00001);
 returnGlow.position.copy(A.recovery).add(returning.body.position);returnGlow.scale.setScalar(41*braking);returnGlow.visible=braking>.002;
 waterUniforms.launchPosition.value.copy(flight.p);
 flameCore.position.copy(flight.p);const v=flameCore.position.clone().sub(camera.position),dist=v.length();
 flameCore.position.copy(camera.position).addScaledVector(v,Math.min(1,10000/dist));
 flameCore.scale.setScalar(burn*Math.min(1,10000/dist)*(72+2850*phase(21,141,w-38)*(1-.78*phase(143,151,w-38))));flameCore.visible=burn>.001;
 stationStar.visible=t>=36.5&&t<43.5;stationStar.position.copy(camera.position).add(V(6770,5736,4520));stationStar.scale.setScalar(20);
 crossingSatellite.position.copy(stationStar.position).add(V(70+(w-35.55)*75,34,-45));
 crossingSatellite.visible=stationStar.visible;crossingSatellite.scale.setScalar(13);
 satellites.forEach((s,i)=>{
  const phaseX=(w-212)*.0033+i*.029;
  s.position.copy(camera.position).add(V(-1780+phaseX*3580,2080+phaseX*580,-5200));
  s.visible=t>40&&phaseX<1.8;s.scale.setScalar(17*(1-phase(1.3,1.8,phaseX)));
 });
});
// Frost and drifting vent vapour remain local to the unmarked standby and launch props.
for(const [deck,active] of [[launchRig,true],[standbyRig,false]]){
 const geo=new THREE.PlaneGeometry(1,1);
 const mist=material(atmosphere+`
 uniform vec3 origin;uniform float activePad;varying vec2 st;varying float fade,seed;
 void main(){seed=float(gl_InstanceID);float age=fract(world*.21+seed*.119);
 vec3 p=origin+vec3(0.,54.,3.)+vec3(age*5.,-age*7.+seed*.06,age*14.);
 vec4 eye=viewMatrix*vec4(p,1.);eye.xy+=position.xy*(1.2+age*6.4);
 st=uv-.5;fade=sin(age*3.14159)*(1.-activePad*smoothstep(37.3,38.,world));gl_Position=projectionMatrix*eye;}`,
 atmosphere+`varying vec2 st;varying float fade,seed;void main(){
 float n=texture2D(detail,st+seed*.17).r;float a=1.-smoothstep(.14,.48,length(st)+.24*(.5-n));
 gl_FragColor=vec4(.67,.76,.81,a*fade*.17);}`,{uniforms:{...U,origin:{value:deck.position},activePad:{value:active?1:0}},transparent:true,depthWrite:false});
 const vent=new THREE.InstancedMesh(geo,mist,12);vent.frustumCulled=false;scene.add(vent);
 updates.push(t=>vent.visible=t>34&&t<40);
}
const wakeCone=part(departing.body,'hull',[0,38,0],[1,1,1],0xf1f5f3,.4);
const separated=add(new THREE.PlaneGeometry(1,1),pinpoint);
updates.push(()=>{
 const age=U.world.value-38;
 const brief=phase(69,73,age)*(1-phase(75,79,age));wakeCone.scale.set(8*brief+.001,3*brief+.001,8*brief+.001);
 separated.visible=age>=150&&age<192;
 if(separated.visible){
  const p=flightPose(age).p.sub(V((age-150)*155,(age-150)*230,0));
  const dir=p.sub(camera.position);separated.position.copy(camera.position).addScaledVector(dir,9700/dir.length());
  separated.scale.setScalar(29*(1-phase(166,192,age)));
 }
});

// Frost briefly catches the backlight as flakes fall clear of the tank wall.
const frostMat=material(atmosphere+`
 varying float alpha;void main(){
 float i=float(gl_InstanceID),a=i*2.39996,age=world-37.98-fract(i*.618)*.47;
 float h=26.+45.*fract(i*.193),r=4.1+max(age,0.)*(1.5+3.3*fract(i*.373));
 vec3 p=vec3(7000.+cos(a)*r,h-4.9*age*age,2450.+sin(a)*r+age*1.5);
 vec4 eye=viewMatrix*vec4(p,1.);eye.xy+=position.xy*(.24+.66*fract(i*.713));
 alpha=smoothstep(0.,.07,age)*(1.-smoothstep(.7,2.2,age));
 gl_Position=projectionMatrix*eye;}`,`varying float alpha;
 void main(){gl_FragColor=vec4(1.95,1.99,2.1,alpha);}`,{transparent:true,depthWrite:false});
const frostFall=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),frostMat,190);
frostFall.frustumCulled=false;scene.add(frostFall);updates.push(()=>frostFall.visible=U.world.value>37.98&&U.world.value<40.7);
const ductFire=add(new THREE.PlaneGeometry(1,1),glows);
updates.push(()=>{ductFire.position.copy(A.pad).add(V(-2,9,25));ductFire.visible=U.flash.value>.01;
 ductFire.scale.set(60*U.flash.value,17*U.flash.value,1);});
// Expand symmetric separation gas about the actual staging point.
const separationCloud=material(atmosphere+`
 varying vec2 st;varying float opacity;
 uniform vec3 eventPos;
 void main(){float age=world-188.,i=float(gl_InstanceID);
 vec3 p=eventPos+vec3(45.*age,130.*age,0.);
 vec3 ray=p-cameraPosition;float d=length(ray),k=10000./d;
 vec4 eye=viewMatrix*vec4(cameraPosition+ray*k,1.);
 float side=mod(i,2.)*2.-1.,layer=floor(i*.5);
 eye.xy+=k*(vec2(side*(210.+layer*67.)*age,(-37.+53.*layer)*age)+position.xy*(640.+205.*age));
 st=uv-.5;opacity=smoothstep(0.,1.,age)*(1.-smoothstep(8.,24.,age));gl_Position=projectionMatrix*eye;}`,
 atmosphere+`varying vec2 st;varying float opacity;void main(){float n=texture2D(detail,st*1.3).r;
 gl_FragColor=vec4(1.61,2.18,2.78,.55*opacity*(1.-smoothstep(.07,.51,length(st)+.32*(.5-n))));}`,
 {uniforms:{...U,eventPos:{value:flightPose(150).p}},transparent:true,depthWrite:false});
const gasPuffs=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),separationCloud,6);
gasPuffs.frustumCulled=false;scene.add(gasPuffs);updates.push(()=>gasPuffs.visible=U.world.value>=188&&U.world.value<212);
