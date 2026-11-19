// A compact test city. The renderer and the tower prototypes do not depend on
// this layout. Change the footprint, height and orientation per placement.
const cityRandom=rng(247191);
const placements=[];
const species=['twist','fork','vent','terrace'];
function shoreline(x){return -37+34*Math.cos(x*.004)+12*Math.sin(x*.009)}
function placeTower(kind,x,z,height,width,depth,angle=0){
 placements.push({kind,x,z,height,width,depth,angle,variant:cityRandom()});
}
// Preserve sight corridors along the canal, street, construction orbit and bay turn.
function freeLot(x,z){
 if(x>-390&&x<135&&z>-500)return false;
 if(Math.abs(x-140)<75&&Math.abs(z+380)<92)return false;
 if(Math.abs(x+215)<251&&z>-924&&z< -470)return false;
 if(x> -520&&x< -290&&z> -540)return false;
 return !placements.some(p=>Math.hypot(x-p.x,z-p.z)<80);
}
for(let i=0;placements.length<65&&i<4000;i++){
 const x=(cityRandom()-.5)*1580,z=-100-cityRandom()*1280;if(!freeLot(x,z))continue;
 const old=placements.length<42;
 placeTower(old?'existing':species[placements.length%species.length],x,z,old?113+cityRandom()*247:302+cityRandom()*291,.77+cityRandom()*.53,.73+cityRandom()*.6,(cityRandom()-.5)*.9);
 const b=placements.at(-1);b.birth=old?2000:2026.3+(placements.length-43)*.69;
}
// Place a few of the new tower crowns along the cloud sightline.
const crownLots=placements.filter(p=>p.birth>2026).slice(-14);
const horizonLots=[[-410,-1130,541],[-185,-1040,587],[172,-1170,518],[365,-1320,645],
 [-512,-1470,680],[-360,-1640,531],[-73,-1540,824],[85,-1390,604],[282,-1690,576],
 [493,-1700,724],[575,-1570,542],[14,-1790,641],[-221,-1750,558],[401,-1500,504]];
const earlySites=[[-555,-218],[-400,-360],[245,-154],[525,-201]];
placements.filter(b=>b.birth>2026).slice(0,4).forEach((b,i)=>{[b.x,b.z]=earlySites[i]});
crownLots.forEach((b,i)=>{[b.x,b.z,b.height]=horizonLots[i]});
for(let i=0;i<105;i++){
 const x=-3300-cityRandom()*2200,z=1050+cityRandom()*1830;
 placeTower('existing',x,z,45+cityRandom()*190,.66+cityRandom(),.66+cityRandom(),cityRandom());
 placements.at(-1).birth=i%4===0?2032+i%10:2000;
}
for(const lot of placements){
 const sightX=-160+(1000-lot.z)*1860/2400;
 if(!crownLots.includes(lot)&&lot.x>0&&lot.z>-1500&&(lot.x>590||Math.abs(lot.x-sightX)<85)){
  lot.x-=240;lot.z-=285;
 }
}
// Reserve the landmark footprints and lower the secondary silhouette around grow.
for(const b of placements.filter(b=>b.x>-2500)){
 if(crownLots.includes(b)){b.z-=Math.min(180,Math.max(0,1815+ b.z));b.height=520+(b.height-500)*.39;}
 else b.height*=b.birth>2026?.40:.66;
 const ringBearing=(225+160)/1374;
 const ringLine=-160+(1000-b.z)*ringBearing;
 if(Math.abs(b.x-ringLine)<.103*(1000-b.z)){
  if(crownLots.includes(b))b.x+=b.x>ringLine?240:-245;
  else b.height=Math.min(b.height,123);
 }
 const growRay=-160+(1000-b.z)*(-100/1760);
 if(Math.abs(b.x-growRay)<.074*(1000-b.z)){
  if(crownLots.includes(b))b.x-=740;
  else b.height=Math.min(b.height,b.z>-780?91:172);
 }
}
for(let i=placements.length-1;i>=0;i--){
 const b=placements[i];
 if(landmarkLots.some(hero=>Math.hypot(b.x-hero.x,b.z-hero.z)<hero.radius+42))placements.splice(i,1);
}
const leafRows=[],trunkRows=[];
function treeAt(point,size,angle){
 const stem=point.clone().add(V(0,.78*size,0));
 trunkRows.push([stem,V(.12*size,1.56*size,.12*size),angle]);
 for(let k=0;k<3;k++){
  const a=angle+tau*k/3;
  leafRows.push([point.clone().add(V(Math.cos(a)*size*.52,size*(1.62+.13*k),Math.sin(a)*size*.52)),
   V(size*(.82+k*.1),size*(.56+.09*k),size*.88),a]);
 }
}
const up=V(0,1,0);
function instanceTransform(position,scale,angle){
 return new THREE.Matrix4().compose(position,new THREE.Quaternion().setFromAxisAngle(up,angle),scale);
}
// Retrofit selected old cores with slender, independently dated upper gardens.
const additions=placements.filter(b=>b.birth===2000&&b.x> -1900).filter((_,i)=>i%2===0).map((b,i)=>({
 ...b,kind:species[i%4],baseY:3+b.height,height:35+b.height*.23,
 width:b.width*.89,depth:b.depth*.90,birth:2030+(i%12)*.83
}));
const towerLots=[...placements,...additions,...landmarkLots],towerMeshes=[];
for(const kind of [...species,'existing',...landmarkLots.map(b=>b.kind)]){
 const hero=landmarkLots.find(b=>b.kind===kind);
 const prototype=hero?makeLandmark(hero):makeTower(kind),lots=towerLots.filter(p=>p.kind===kind);
 prototype.geometry.setAttribute('lotData',new THREE.InstancedBufferAttribute(Float32Array.from(lots.flatMap(b=>[b.birth,b.height,b.finish??0])),3));
 const cluster=new THREE.InstancedMesh(prototype.geometry,facade,lots.length);
 lots.forEach((b,i)=>{
  const matrix=instanceTransform(V(b.x,b.baseY??3,b.z),V(b.width,b.height/320,b.depth),b.angle);
  cluster.setMatrixAt(i,matrix);cluster.setColorAt(i,new THREE.Color(b.variant,b.variant,b.variant));
  const start=leafRows.length,st=trunkRows.length;
  prototype.trees.forEach(([p,s],j)=>{
   // The smaller background towers use low shrub canopies on alternate corners.
   if(b.height<160 && j%2)return;
   treeAt(p.clone().applyMatrix4(matrix),s*Math.min(b.width,b.depth),b.angle+j*.91);
  });
  for(let k=start;k<leafRows.length;k++)leafRows[k][3]=Math.max(2029,b.birth+3.8*clamp((leafRows[k][0].y-(b.baseY??3))/b.height));
  for(let k=st;k<trunkRows.length;k++)trunkRows[k][3]=Math.max(2029,b.birth+3.8*clamp((trunkRows[k][0].y-(b.baseY??3))/b.height));
 });scene.add(cluster);towerMeshes.push(cluster);
}
const botany=material(`
 attribute float born;uniform float year,motion;uniform vec3 wash;varying vec3 wp,n,tint;varying float crown;
 void main(){wp=(instanceMatrix*vec4(position*smoothstep(born-.3,born+.25,year),1.)).xyz;
 n=mat3(instanceMatrix)*(normal/vec3(dot(instanceMatrix[0].xyz,instanceMatrix[0].xyz),
 dot(instanceMatrix[1].xyz,instanceMatrix[1].xyz),dot(instanceMatrix[2].xyz,instanceMatrix[2].xyz)));
 float wind=(.047+.33*smoothstep(250.,560.,wp.y))*sin(motion*1.4+wp.x*.017);
 float dist=length(wp.xz-wash.xz),blast=exp(-dist*.065)*(1.-smoothstep(9.,25.,wash.y));
 wp.xz+=max(0.,position.y)*vec2(wind+blast*.32*sin(motion*8.),wind*.41);
 tint=instanceColor;crown=position.y;gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);}`,
 atmosphere+penumbra+`varying vec3 wp,n,tint;varying float crown;
 void main(){vec3 N=normalize(n);float fleck=texture2D(detail,wp.xz*.24+wp.y*.1).r;
 vec3 c=tint*(.7+.60*fleck)*(.72+.28*smoothstep(-1.,.45,crown))*
 ((.38+.25*max(N.y,0.))*(1.-night*.81)+sunTint*daylight()*max(dot(N,solar),0.)*sunlightAt(wp,N));
 gl_FragColor=vec4(aerial(c,wp),1.);}`);
function vegetation(rows,geometry,colors){
 geometry.setAttribute('born',new THREE.InstancedBufferAttribute(Float32Array.from(rows,r=>r[3]??2000),1));
 const mesh=new THREE.InstancedMesh(geometry,botany,rows.length);
 rows.forEach(([p,s,a],i)=>{
  mesh.setMatrixAt(i,instanceTransform(p,s,a));
  mesh.setColorAt(i,new THREE.Color(colors[i%colors.length]));
 });
 scene.add(mesh);
}
// Bake contact shade and building height into a small top-down texture. The
// ground reuses it for soft ambient occlusion and directional contact shadows.
function bakeLots(){
 const n=256,extent=3200,bytes=new Uint8Array(n*n*4);bytes.fill(255);
 for(let i=0;i<n*n;i++)bytes[i*4+1]=0;
 for(const lot of placements){
  const cx=(lot.x/extent+.5)*n,cz=(lot.z/extent+.5)*n,r=31*Math.max(lot.width,lot.depth);
  const span=Math.ceil((r+60)/extent*n);
  for(let j=Math.max(0,Math.floor(cz)-span);j<Math.min(n,cz+span);j++)
   for(let i=Math.max(0,Math.floor(cx)-span);i<Math.min(n,cx+span);i++){
    const dx=(i+.5-cx)*extent/n,dz=(j+.5-cz)*extent/n,edge=Math.hypot(dx,dz)-r,idx=4*(j*n+i);
    bytes[idx]=Math.min(bytes[idx],Math.round(255*(1-.48*Math.exp(-Math.max(0,edge)/17))));
    if(edge<0)bytes[idx+1]=Math.max(bytes[idx+1],Math.round(lot.height/640*255));
   }
 }
 const tex=new THREE.DataTexture(bytes,n,n);tex.magFilter=tex.minFilter=THREE.LinearFilter;tex.needsUpdate=true;return tex;
}
function finishTrees(){
vegetation(trunkRows,new THREE.CylinderGeometry(.82,1,1,5,1,true),[0x736b4c,0x665e4c]);
vegetation(leafRows,new THREE.IcosahedronGeometry(1,1),[0x80a74f,0x438454,0x98b753,0x578d45]);

}
