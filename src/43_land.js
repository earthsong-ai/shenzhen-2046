const canalX=z=>8*Math.sin(z/105)-180*phase(430,1250,-z);
// The mainland narrows to a neck at the east cape; all parcels obey the same coast.
function eastBank(z){
 return 655+65*Math.cos(z/184)+495*Math.exp(-((z+15)**2)/26000)
       +1030*Math.exp(-((z+1400)**2)/12300);
}
const banks=new FacadeGeometry();
for(const side of [-1,1]){
 for(let z=-1850;z<0;z+=25){
  const edge=zz=>canalX(zz)+side*(20+.004*zz);
  const a=V(edge(z),3,z),b=V(edge(z+25),3,z+25),c=V(side>0?eastBank(z+25):-2500,3,z+25),d=V(side>0?eastBank(z):-2500,3,z);
  banks.quad(...(side>0?[a,b,c,d]:[d,c,b,a]),PLANTER);
  if(side>0)banks.quad(c,d,d.clone().setY(-1),c.clone().setY(-1),STONE);
  banks.quad(a.clone().setY(-1),b.clone().setY(-1),b,a,STONE);
  for(let k=0;k<3;k++){
   const offset=side*(2+k*3.5),aa=V(a.x+offset,3.08+k*.03,z),bb=V(b.x+offset,aa.y,z+25);
   banks.quad(aa,bb,bb.clone().add(V(side*2,0,0)),aa.clone().add(V(side*2,0,0)),k===1?PLANTER:STONE);
  }
 }
}
const landMat=material(`attribute vec2 finish;varying vec3 wp;varying float kind;
 void main(){wp=position;kind=finish.x;gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);}`,
 atmosphere+penumbra+`uniform sampler2D lots;uniform float year;varying vec3 wp;varying float kind;
 void main(){float d=texture2D(detail,wp.xz*.024).r,ao=texture2D(lots,wp.xz/3200.+.5).r;
 vec3 base=kind>2.5?mix(vec3(.21,.23,.18),vec3(.135,.22,.123),(year-2026.)*.05):vec3(.48,.48,.42);
 vec3 c=base*(.72+.42*d)*ao*((.38+.18*solar.y)*(1.-.83*night)+sunTint*.74*daylight()*sunlightAt(wp,vec3(0.,1.,0.)));
 gl_FragColor=vec4(aerial(c,wp),1.);}`,{uniforms:{...U,lots:{value:bakeLots()}},side:THREE.DoubleSide});
add(banks.bake(),landMat);
const ledges=[];
for(const sign of [-1,1]){
 const width=2000,mid=sign*(width/2+24);
 const wall=blitBox(rigRoot,mid,2,0,width,8.3,5,0xb1aba0);
 updates.push(()=>wall.position.y=2-4*phase(2028,2042,Y));
 for(let j=0;j<3;j++){
  const shelf=pivot(),start=2028+j*5;ledges.push({shelf,start,j});
  blitBox(shelf,mid,1.5-j*.72,0,width,2.3,19, j===2?0x687157:0x839067).rotation.x=.067;
  blitBox(shelf,mid,2.4-j*.72,0,width,.14,2.4,0xc1bca5);
 }
}
updates.push(()=>ledges.forEach(({shelf,start,j})=>{
 const f=phase(start,start+3.3,Y);shelf.position.z=(8+j*16)*f;shelf.scale.z=Math.max(.001,f);
}));
// New trees establish in three parallel belts. Keep a continuous tidal creek
// under the camera, with crowns on both sides and visible prop roots at low tide.
for(let i=0;i<1700;i++){
 const x=-930+cityRandom()*1680,z=30+cityRandom()*225;
 const creek=-(z-20)*.66;
 if(Math.abs(x-creek)<11+7*Math.sin(z*.017)||Math.sin(x*.035+z*.045)>.79)continue;
 const born=z<56?1995:2026+(z-56)/199*17.2,size=2.1+cityRandom()*3.15;
 const l=leafRows.length,k=trunkRows.length;treeAt(V(x,-.55,z),size,cityRandom()*tau);
 for(let n=l;n<leafRows.length;n++)leafRows[n][3]=born;
 for(let n=k;n<trunkRows.length;n++)trunkRows[n][3]=born;
}
const gate=pivot();
for(const side of [-1,1]){
 blitBox(gate,side*20,5,10,4,11,12,bronze);
 blitBox(gate,side*17.9,3,10,1.5,6,13,carbon);
 for(let j=0;j<4;j++)part(gate,'ball',[side*20,8,14+j*.6],[.19,.19,.19],0xa7e2c1,1.7);
}
reveal(gate,2030,2038);
// Tidal planting fills in behind the planted banks as the terraces mature.
for(let i=0;i<93;i++){
 const x=-880+i*19;
 for(const sign of [-1,1]){
  const z=sign<0?-11:54+13*Math.sin(x*.021);
  if(Math.abs(x)<48)continue;
  const canopy=pivot(rigRoot,x,0,z);
  part(canopy,'ball',[0,4,0],[12,3.8,6.5],i%3?0x5d9144:0x8da957);
  part(canopy,'ball',[3,6.7,1],[6.8,3.2,5.8],0x719d49);
  reveal(canopy,2031+i%7,2045);
 }
}
