const district=pivot();
const villageGeom=new FacadeGeometry(),villageLots=[];
for(let row=-2;row<8;row++)for(let col=0;col<12;col++){
 const z=-399+row*25+(cityRandom()-.5)*3,x=canalX(z)-35-(11-col)*25+(cityRandom()-.5)*3;
 const w=8.7+cityRandom()*1.9,d=8.7+cityRandom()*1.95,h=19.5+Math.floor(cityRandom()*4)*3.15;
 villageLots.push({x,z,w,d,h});solid(villageGeom,x,3,z,w,d,h,GLASS);
 const roof=pivot(district,x,h+3,z);
 blitBox(roof,0,.18,0,w*2+.8,.75,d*2+.8,0xaca697);
 blitBox(roof,-w*.55,1.5,-d*.49,4,2.7,3.8,0xbdb8a2);
 const upgrade=pivot(roof);reveal(upgrade,2027+cityRandom()*12,2045);
 for(let j=0;j<3;j++){
  const pv=blitBox(upgrade,-2+j*2.18,.94,2.7,2,.22,7.3,0x345768);pv.rotation.x=Math.PI/9;
 }
 blitBox(upgrade,-w*.57,.83,1.5,3.1,1,8,moss);
 for(let j=0;j<3;j++)blitBox(upgrade,-w*.57,1.4,-1+j*2.2,2.5,.4,1.5,0x75945c);
 blitBox(upgrade,w*.57,.73,-d*.35,2.5,.55,2.5,carbon);
 halo(upgrade,w*.57,1.07,-d*.35,.94,0xffc98a,.65);
 for(const s of [-1,1])blitBox(upgrade,w*.57+s*1.19,1.04,-d*.35,.32,.26,1.23,porcelain);
 blitBox(upgrade,w*.65,-2.2,d+.82,3.2,1.45,2.5,bronze);
 for(let j=0;j<3;j++)blitBox(roof,w*.85,-5-j*6.3,d+.64,2.5,1,1.3,0xaca79a);
}
const villageM=material(`varying vec3 wp,n;varying vec2 panel;void main(){wp=position;n=normal;panel=uv;
 gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);}`,atmosphere+penumbra+`
 varying vec3 wp,n;varying vec2 panel;
 void main(){vec2 grid=panel/vec2(3.1,3.17),cell=floor(grid);vec2 st=fract(grid);
 float window=smoothstep(.14,.21,st.x)*(1.-smoothstep(.73,.81,st.x))*smoothstep(.23,.30,st.y)*(1.-smoothstep(.81,.88,st.y));
 float grain=texture2D(detail,(wp.xz+wp.y*.31)*.07).r;
 float batch=cellHash(floor((wp.xz+vec2(363.,461.))/25.));
 vec3 concrete=mix(vec3(.38,.30,.231),vec3(.67,.65,.56),batch)*(.80+.31*grain);
 float runoff=texture2D(detail,vec2(dot(wp.xz,vec2(.22,.21)),wp.y*.014)).r;
 concrete*=.84+.16*smoothstep(.27,.66,runoff);
 concrete*=1.-.17*exp(-abs(fract(grid.y)-.16)*11.)*smoothstep(.15,.82,runoff);
 float dwelling=cellHash(vec2(floor(cell.x/2.),cell.y)+batch);
 float occupancy=step(.14,cellHash(vec2(cell.y,floor(batch*53.))))*step(.17,dwelling);
 vec3 c=mix(concrete,vec3(.083,.14,.153),window)*((.44+.17*max(n.y,0.))*(1.-.81*night)+sunTint*daylight()*max(dot(n,solar),0.)*sunlightAt(wp,n));
 c+=mix(vec3(.95,.51,.24),vec3(1.55,.96,.48),dwelling)*window*night*occupancy;
 gl_FragColor=vec4(aerial(c,wp),1.);}`,{side:THREE.DoubleSide});
const villageMesh=add(villageGeom.bake(),villageM);
blitBox(district,70,3.06,-460,36,.18,910,0x505855);
blitBox(district,99,3.18,-327,250,.16,15,0x545957);
for(const side of [-1,1]){
 const verge=pivot(district,70+side*13,3.25,-460);
 blitBox(verge,0,0,0,9,.22,908,0x87916a);updates.push(()=>verge.scale.x=Math.max(.0001,phase(2031,2044,Y)));
 for(let i=0;i<55;i++){
  const z=-16-i*16.5;if(Math.abs(z+327)<14)continue;
  const s=leafRows.length,k=trunkRows.length;treeAt(V(70+side*13.3,3.4,z),4.2+cityRandom()*1.0,i);
  for(let j=s;j<leafRows.length;j++)leafRows[j][3]=2030+i%9;
  for(let j=k;j<trunkRows.length;j++)trunkRows[j][3]=2030+i%9;
 }
}
const cars=[];
function car(parent,color){
 const c=pivot(parent);
 part(c,'ball',[0,.65,0],[1.02,.61,2.45],color);
 blitBox(c,0,1.60,.06,.89,.14,.70,carbon);
 blitBox(c,0,.71,-2.15,1.67,.17,.23,0x78fff0,2.1);
 for(const s of [-1,1])blitBox(c,s*.92,.69,0,.09,.68,1.16,solarBlue);
 part(c,'ball',[0,1.11,.05],[.81,.39,1.56],0x334653);
 for(const s of [-1,1])blitBox(c,s*.66,.70,-2.11,.52,.13,.18,0xffe0a4,1.8);
 blitBox(c,0,.65,2.25,1.31,.12,.14,0xde784c,1.3);
 return c;
}
for(let i=0;i<176;i++)cars.push(car(district,[porcelain,carbon,bronze,0x868f87,0x8c655a][i%5]));
const sharedRoutes=[];
function carPose(i,t){
 const f=era(),s=i%2?1:-1,cross=i>=128,lane=Math.floor(i/2)%2,k=Math.floor(i/4);
 const offset=(1-f)*4.5*Math.sin(i*3.7+t*.49);
 const speed=15,count=cross?12:32,step=36,span=count*step;
 // Opposing streets cross half a platoon period apart at full speed.
 const pack=Math.floor(k/3)*3*step+(k%3)*11.3;
 const stagger=cross?3.6:0;
 const scheduled=(t-stagger)*speed+1.25*Math.sin((t-stagger)*tau/7.2);
 const travel=((pack+scheduled+offset)%span+span)%span-Math.floor(span/216)*108;
 const lateral=s*(2+lane*3.8+(1-f)*(Math.floor(i/4)%2)*7.1);
 return cross?[70+s*travel,3.48,-327+lateral,-s*Math.PI/2]:
  [70+lateral,3.48,-327+s*travel,s<0?0:Math.PI];
}
updates.push(t=>cars.forEach((c,i)=>{
 const [x,y,z,a]=carPose(i,U.motion.value);c.position.set(x,y,z);c.rotation.y=a;
 c.scale.setScalar((i>=128?(x>-23&&x<221):(z> -909&&z< -8))?1:.0001);
}));
for(let i=0;i<8;i++){
 const p=car(district,i%2?porcelain:carbon);p.position.set(91,3.5,-355-i*6);
 const charger=pivot(district,93,3.2,p.position.z);
 blitBox(charger,0,1.3,0,.64,2.6,.85,porcelain);
 blitBox(charger,-.36,1.65,0,.09,.8,.53,0x9cdfbe,1.65);
 blitBox(charger,-2,-.02,0,3.65,.08,4.8,0x768e85);reveal(charger,2031,2043);
 const signal=blitBox(p,-1.02,.65,0,.08,.12,2.4,0x99dccb,1.34);
 updates.push(t=>signal.position.z=.74*Math.sin(t*1.7+i));
}
const hub=pivot(district,140,3,-380);
blitBox(hub,0,26,0,46,52,69,0x36464a);
for(let floor=0;floor<6;floor++){
 const y=5+floor*8;blitBox(hub,0,y,0,56,1.1,80,porcelain);
 for(let j=0;j<8;j++)for(const side of [-1,1]){
  const z=-31+j*9;
  blitBox(hub,side*27,y+1,z,9,.65,6.4,bronze);
  blitBox(hub,side*28,y+2.5,z,1.2,3.4,4.1,carbon);
  blitBox(hub,side*30.8,y+1.5,z,.42,.4,5.2,side<0?0x9ce8df:0xffc77a,1.5);
 }
}
const bays=pivot(hub);reveal(bays,2029,2042);
for(let j=0;j<9;j++)for(let k=0;k<6;k++){
 blitBox(bays,-26.6,8+k*7,-32+j*8,1.4,3.9,5.6,carbon);
 blitBox(bays,-27.6,6.3+k*7,-32+j*8,3.7,.4,5.8,bronze,.42);
}

for(let i=0;i<18;i++){
 const rack=car(district,i%3?carbon:porcelain);rack.position.set(86.4,3.5,-40-i*17);
 updates.push(()=>rack.scale.setScalar(Math.max(.0001,1-phase(2030,2042,Y))));
}
for(const side of [-1,1])blitBox(district,70+side*19,3.2,-460,3,.15,910,0xc4bfb0);
