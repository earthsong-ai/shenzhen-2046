// The street grid and its parcels use the same metre coordinates. A block
// contains several slab or courtyard wings around a shared planted court.
const blockRandom=rng(12679),housing=[],roofs=[];
const mapGrid=`
 vec2 blockSize=vec2(112.,92.);
 vec2 blockId=floor(wp.xz/blockSize);
 vec2 inside=fract(wp.xz/blockSize);
 vec2 border=min(inside,1.-inside)*blockSize;
 float arterial=1.-step(.5,mod(blockId.x+step(.5,inside.x),4.));
 vec2 curb=vec2(3.5+2.8*arterial,3.6);
 float asphalt=1.-step(0.,min(border.x-curb.x,border.y-curb.y));
 float sidewalk=1.-step(0.,min(border.x-curb.x-3.7,border.y-curb.y-3.7));
 float travelMark=(1.-smoothstep(.13,.36,border.x))*step(.55,fract(wp.z*.10));
 travelMark=max(travelMark,(1.-smoothstep(.13,.36,border.y))*step(.55,fract(wp.x*.10)));
 float park=step(.5,mod(blockId.x*3.+blockId.y*2.,9.))*(1.-step(1.5,mod(blockId.x*3.+blockId.y*2.,9.)));
 float weave=texture2D(detail,wp.xz*.0085).r;
 float tiles=.91+.09*smoothstep(.01,.055,min(fract(wp.x*.77),fract(wp.z*.48)));
 vec3 lawn=mix(vec3(.074,.121,.057),vec3(.21,.28,.138),weave);
 float promenade=1.-smoothstep(1.6,2.8,abs((inside.y-.5)*92.+13.*sin(inside.x*6.28)));
 float pond=1.-smoothstep(.93,1.,length((inside-vec2(.60,.73))/vec2(.18,.12)));
 vec3 garden=mix(mix(lawn,vec3(.45,.40,.30)*tiles,promenade),vec3(.045,.17,.171),pond);
 base=mix(base,mix(mix(mix(vec3(.31,.30,.25)*tiles,garden,park),vec3(.42,.405,.35)*tiles,sidewalk),
 vec3(.085,.092,.093)+vec3(.14)*travelMark,asphalt),step(2.5,kind));
`;
landMat.fragmentShader=landMat.fragmentShader.replace('vec3 c=base',mapGrid+'\n vec3 c=base');
function canBuildAt(x,z,w,d){
 if(landmarkLots.some(b=>Math.hypot(x-b.x,z-b.z)<b.radius+Math.max(w,d)*.5))return false;
 if(x+w/2>eastBank(z)-15||Math.abs(x-A.sun.x)<350&&Math.abs(z-A.sun.z)<200)return false;
 if(Math.abs(x-canalX(z))<32+w*.5)return false;
 if(x> -382-w*.5&&x<110+w*.5&&z> -487-d*.5&&z<0)return false;
 if(Math.abs(x-140)<50+w*.5&&Math.abs(z+380)<67+d*.5)return false;
 if(Math.abs(x+260)<53+w*.5&&Math.abs(z+760)<55+d*.5)return false;
 if(Math.abs(x-A.sun.x)<235&&Math.abs(z-A.sun.z)<201)return false;
 if(x>0&&Math.abs(z-(railCoastZ(x)))<17+d*.5)return false;
 return !placements.some(b=>Math.abs(x-b.x)<35*b.width+w*.5&&Math.abs(z-b.z)<30*b.depth+d*.5);
}
for(let ix=-20;ix<22;ix++)for(let iz=-20;iz<0;iz++){
 const x=(ix+.5)*112,z=(iz+.5)*92;
 const park=((ix*3+iz*2)%9+9)%9===1;
 if(!park){
  const palette=blockRandom();
  for(const side of [-1,1])for(const half of [-1,1]){
   const xx=x+side*24,zz=z+half*21,w=25+blockRandom()*13,d=15+blockRandom()*12;
   if(!canBuildAt(xx,zz,w,d))continue;
   const h=8+Math.floor(blockRandom()*5+(Math.abs(x)<760?2:0))*3.35;
   housing.push([xx,3+h/2,zz,w,h,d,palette]);roofs.push([xx,3+h,zz,w,d]);
  }
 }
 if((park||ix%3===0)&&iz%2===0&&x<2040&&x> -1100){
  for(let k=0;k<5;k++){const xx=x-39+k*15,zz=z+36;
   if(canBuildAt(xx,zz,2,2))treeAt(V(xx,3,zz),2.9+blockRandom()*1.4,k*.78);}
 }
}
for(const b of placements.filter(b=>b.x> -2000)){
 const w=b.width*85,d=b.depth*65,h=11+(b.height%16);
 housing.push([b.x,3+h/2,b.z,w,h,d,b.variant]);roofs.push([b.x,3+h,b.z,w,d]);
 const other=placements.find(q=>q!==b&&q.x>b.x&&q.x-b.x<147&&Math.abs(q.z-b.z)<70);
 if(other&&b.variant>.55){const a=V(b.x,h*.8,b.z),end=V(other.x,h*.8+1,other.z);
 const bridge=pivot(rigRoot,...a.clone().lerp(end,.5).toArray());bridge.rotation.y=Math.atan2(end.x-a.x,end.z-a.z);
 blitBox(bridge,0,0,0,4.8,3.3,end.distanceTo(a),0x899c99);
 blitBox(bridge,0,1.7,0,5.4,.44,end.distanceTo(a),porcelain);}
}
const blockMat=material(`varying vec3 wp,n,local,dim;varying float style;
 void main(){wp=(instanceMatrix*vec4(position,1.)).xyz;local=position;n=normal;style=instanceColor.r;
 dim=vec3(instanceMatrix[0].x,instanceMatrix[1].y,instanceMatrix[2].z);
 gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);}`,atmosphere+penumbra+`
 varying vec3 wp,n,local,dim;varying float style;
 void main(){float lit=sunlightAt(wp,n)*daylight()*max(dot(n,solar),0.);
 vec3 masonry=mix(vec3(.39,.355,.284),vec3(.59,.60,.53),style);
 float dirt=texture2D(detail,wp.xz*.071+wp.y*.018).r;
 vec3 c=masonry*(.75+.38*dirt)*(.23+.10*max(n.y,0.)+.90*lit)*(1.-night*.85);
 if(n.y<.5){vec2 uv=vec2(abs(n.x)>.5?wp.z:wp.x,wp.y)/vec2(3.35,3.32);
 vec2 f=fract(uv);float pane=smoothstep(.13,.22,f.x)*(1.-smoothstep(.77,.86,f.x))*smoothstep(.24,.33,f.y)*(1.-smoothstep(.78,.87,f.y));
 float room=cellHash(vec2(floor(uv.x/3.),floor(uv.y))+floor(style*29.));
 float floorOn=cellHash(vec2(floor(uv.y),floor(style*391.)));
 float on=step(.19,floorOn)*step(.245,room);
 vec3 windowColor=vec3(.051,.097,.12)*(.32+lit)+mix(vec3(.77,.93,1.14),vec3(1.15,.64,.30),step(.23,style))*night*on*(.42+.58*room);
 float band=1.-smoothstep(.012,.012+max(.03,fwidth(uv.y)),min(f.y,1.-f.y));
 c=mix(c,windowColor,pane*.9);c*=1.-band*.23;c*=.75+.25*smoothstep(-.5,-.25,local.y);
 }else{vec2 edge=(.5-abs(local.xz))*dim.xz;
 float rim=1.-smoothstep(.42,.72,min(edge.x,edge.y));
 float panel=step(.38,fract((wp.x+wp.z*.18)*.15))*step(.69,style);
 c=mix(c*(.72+.13*dirt),vec3(.030,.068,.079)*(.62+lit),panel*.84);c+=rim*.16;
 }gl_FragColor=vec4(aerial(c,wp),1.);}`);
blockMat.userData.sunCaster=true;
function blocks(rows){
 const mesh=new THREE.InstancedMesh(primitives.box,blockMat,rows.length);
 rows.forEach(([x,y,z,w,h,d,s],i)=>{mesh.setMatrixAt(i,instanceTransform(V(x,y,z),V(w,h,d),0));mesh.setColorAt(i,new THREE.Color(s,s,s));});
 scene.add(mesh);
}
blocks(housing);
const plantedRoofs=[];
for(let i=0;i<roofs.length;i+=2){
 const [x,y,z,w,d]=roofs[i],born=2029+(i%12);
 plantedRoofs.push([x+w*.19,y+.35,z,w*.50,.72,d*.72,born]);
 if(i%8===0&&x<1400&&x> -1150){
  const l=leafRows.length,k=trunkRows.length;
  treeAt(V(x+w*.22,y+.65,z),2.5+(i%3)*.4,i);
  for(let j=l;j<leafRows.length;j++)leafRows[j][3]=born;
  for(let j=k;j<trunkRows.length;j++)trunkRows[j][3]=born;
 }
}
const gardens=new THREE.InstancedMesh(primitives.box.clone(),botany,plantedRoofs.length);
gardens.geometry.setAttribute('born',new THREE.InstancedBufferAttribute(Float32Array.from(plantedRoofs,r=>r[6]),1));
plantedRoofs.forEach(([x,y,z,w,h,d],i)=>{gardens.setMatrixAt(i,instanceTransform(V(x,y,z),V(w,h,d),0));gardens.setColorAt(i,new THREE.Color(i%2?0x548249:0x779956))});
scene.add(gardens);
blocks(roofs.map(([x,y,z,w,d],i)=>[x-w*.19,y+1.4,z+d*.12,w*.29,2.8,d*.30,(i%13)/13]));
