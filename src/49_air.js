// One timed arc-length traversal per lane. The final descent is sampled at 2 m/s.
const lanes=48,steps=192,paths=[],data=new Float32Array(lanes*steps*4),routeLines=[],routeSeconds=[],fleet=[];
for(let lane=0;lane<lanes;lane++){
 const lot=villageLots[(lane*19+7)%villageLots.length],alt=60+20*(lane%4);
 const home=V(lot.x+lot.w*.57,lot.h+5,lot.z-lot.d*.35);
 const end=V(110,9+(lane%5)*8,-412+(lane%8)*9);
 const knots=[home,home.clone().add(V(0,9,0)),V(home.x-12,alt-6,home.z+18),
  V(-25,alt,home.z+46),V(58,alt,-316),V(92,alt-4,-338)];
 for(let j=0;j<=10;j++){
  const a=j*tau/8;knots.push(V(81+24*Math.cos(a),alt-8-(alt-end.y-18)*j/10,end.z+24*Math.sin(a)));
 }
 knots.push(end.clone().add(V(-5,6,0)),end,end.clone().add(V(4,.2,0)),V(165,end.y+1,end.z),
  V(181,alt+7,end.z-27),V(90,alt+13,end.z-64),V(-52,alt+14,home.z-55),
  V(home.x,alt-3,home.z-23),home.clone().add(V(0,8,0)));
 const curve=new THREE.CatmullRomCurve3(knots,true,'centripetal');
 const fine=curve.getSpacedPoints(400),times=[0];
 for(let i=1;i<fine.length;i++){
  const delta=fine[i].clone().sub(fine[i-1]),speed=(15+lane%6)*(.18+.82*phase(3,22,Math.min(fine[i].distanceTo(home),fine[i].distanceTo(end))));
  times.push(times[i-1]+Math.max(delta.length()/speed,Math.abs(delta.y)/(Math.abs(delta.y)>.8*delta.length()?2:9)));
 }
 const period=times.at(-1),points=[];let k=0;
 for(let i=0;i<steps;i++){
  const time=period*i/steps;while(times[k+1]<time)k++;
  const p=fine[k].clone().lerp(fine[k+1],(time-times[k])/(times[k+1]-times[k]));
  points.push(p);data.set([p.x,p.y,p.z,period],(lane*steps+i)*4);
 }
 paths.push(points);routeSeconds.push(period);
 const count=Math.max(4,Math.floor(curve.getLength()/53));
 for(let i=0;i<count;i++)fleet.push(lane,(i+.63*Math.sin(i*1.7+lane)*.32)/count,(lane*17+i*31)%97/97);
 if(lane%12===0)for(let j=0;j<steps;j++)routeLines.push(...points[j].toArray(),...points[(j+1)%steps].toArray());
}
const routeTex=new THREE.DataTexture(data,steps,lanes,THREE.RGBAFormat,THREE.FloatType);routeTex.needsUpdate=true;
// Bake a ceramic pod, four carbon arms and ducted rotors into shared LOD meshes.
function deliveryGeometry(level){
 const positions=[],normals=[],colors=[],alpha=[];
 const duct=new THREE.TorusGeometry(.83,.17,5,16);duct.rotateX(-Math.PI/2);
 function piece(shape,pos,size,color,rotation=0,opacity=1){
  const geom=shape==='duct'?duct:primitives[shape],a=geom.attributes.position,n=geom.attributes.normal,ix=geom.index;
  const tint=new THREE.Color(color),c=Math.cos(rotation),s=Math.sin(rotation);
  for(let j=0;j<(ix?ix.count:a.count);j++){
   const i=ix?ix.getX(j):j,x=a.getX(i)*size[0],z=a.getZ(i)*size[2];
   positions.push(pos[0]+c*x+s*z,pos[1]+a.getY(i)*size[1],pos[2]-s*x+c*z);
   normals.push(n.getX(i)*c+n.getZ(i)*s,n.getY(i),-n.getX(i)*s+n.getZ(i)*c);colors.push(tint.r,tint.g,tint.b);alpha.push(opacity);
  }
 }
 piece('box',[0,0,0],[.37,.17,.48],0xe7edef);
 if(level===0)piece('box',[0,-.16,.025],[.31,.19,.36],0xa88c61);
 for(const x of [-1,1])for(const z of [-1,1]){
  piece('box',[x*.2,0,z*.18],[.048,.053,.46],0x243842,x*z*.82);
  if(level===0){
   piece('duct',[x*.365,.029,z*.31],[.158,.15,.158],0x40515b);
   piece('disc',[x*.365,.063,z*.31],[.116,.009,.116],0xc9dbe0,0,.42);
  }else piece('disc',[x*.365,.04,z*.31],[.15,.016,.15],0x627a80,0,.55);
 }
 const g=new THREE.BufferGeometry();
 for(const [key,vals,sz] of [['position',positions,3],['normal',normals,3],['tint',colors,3],['opacity',alpha,1]])g.setAttribute(key,new THREE.Float32BufferAttribute(vals,sz));
 return g;
}
const fleetPose=`
 uniform sampler2D routes;uniform float motion,year;attribute vec3 trip;
 vec3 sampleRoute(float frame){
  float s=fract(frame)*192.;int i=int(floor(s));int lane=int(trip.x);
  return mix(texelFetch(routes,ivec2(i,lane),0).xyz,texelFetch(routes,ivec2((i+1)%192,lane),0).xyz,fract(s));
 }
 void pose(out vec3 p,out mat3 basis,out float distanceToEye){
  float period=texelFetch(routes,ivec2(0,int(trip.x)),0).w;
  float f=motion/period+trip.y+trip.x*.037;p=sampleRoute(f);
  vec3 ahead=sampleRoute(f+.35/period)-p,behind=p-sampleRoute(f-.35/period);
  vec3 forward=normalize(vec3(ahead.x,0.,ahead.z)+vec3(.00001,0.,0.)),right=vec3(-forward.z,0.,forward.x);
  vec3 prev=normalize(vec3(behind.x,0.,behind.z)+vec3(.00001,0.,0.));
  float bank=clamp(dot(prev,right)*1.3,-.33,.33),pitch=.26*smoothstep(.35,5.6,length(ahead.xz));
  basis=mat3(right+vec3(0.,bank,0.),vec3(0.,1.,0.),forward-vec3(0.,pitch,0.));
  distanceToEye=length(p-cameraPosition);
 }`;
for(let level=0;level<3;level++){
 const g=level<2?deliveryGeometry(level):new THREE.PlaneGeometry(1,1);
 g.setAttribute('trip',new THREE.InstancedBufferAttribute(new Float32Array(fleet),3));
 const v=level<2?`attribute vec3 tint;attribute float opacity;varying vec4 paint;uniform vec3 solar;
 void main(){vec3 p;mat3 basis;float dist;pose(p,basis,dist);paint=vec4(tint*(.47+.75*max(0.,dot(normalize(basis*normal),solar))),opacity);
 gl_Position=projectionMatrix*viewMatrix*vec4(p+basis*position,1.);
 if(dist<${level===0?'0.':'150.'}||dist>=${level===0?'150.':'380.'}||trip.z>smoothstep(2026.,2045.,year))gl_Position=vec4(2.,2.,2.,1.);}`:
 `varying vec4 paint;void main(){vec3 p;mat3 basis;float dist;pose(p,basis,dist);
 float side=mod(float(gl_InstanceID),3.);bool blink=fract(motion*.84+trip.y)<.14;
 vec3 color=side<1.?vec3(.96,.06,.035):side<2.?vec3(.06,.95,.34):vec3(1.6);
 if(dist<150.)p+=basis*vec3(side<1.?-.45:side<2.?.45:0.,.07,side<2.?0.:-.42);
 paint=vec4(color*(side<2.?1.:1.65),side<2.?.85:float(blink));
 vec4 eye=viewMatrix*vec4(p,1.);eye.xy+=position.xy*max(.094,min(2.1,dist*.0014));gl_Position=projectionMatrix*eye;
 if(trip.z>smoothstep(2026.,2045.,year))gl_Position=vec4(2.,2.,2.,1.);}`;
 if(level===2){
  const lights=[];for(let i=0;i<fleet.length;i+=3)for(let j=0;j<3;j++)lights.push(...fleet.slice(i,i+3));
  g.setAttribute('trip',new THREE.InstancedBufferAttribute(new Float32Array(lights),3));
 }
 const m=material(fleetPose+v,'varying vec4 paint;void main(){gl_FragColor=paint;}',{
  uniforms:{...U,routes:{value:routeTex}},transparent:true,depthWrite:false,side:THREE.DoubleSide});
 const mesh=new THREE.InstancedMesh(g,m,g.attributes.trip.count);mesh.frustumCulled=false;scene.add(mesh);
}
const overlayMat=material(`uniform float overlay;varying float lineDepth;
 void main(){vec3 p=position+vec3(18.,6.,-9.)*(1.-overlay);vec4 eye=viewMatrix*vec4(p,1.);
 lineDepth=-eye.z;gl_Position=projectionMatrix*eye;gl_Position.z-=.00014*gl_Position.w;}`,
 `uniform float overlay;varying float lineDepth;void main(){gl_FragColor=vec4(.31,1.7,2.55,overlay*.95*exp(-max(lineDepth,0.)*.00042));}`,
 {transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
function lineLayer(coords,dynamic=false){
 const g=new THREE.BufferGeometry(),a=new THREE.Float32BufferAttribute(coords,3);g.setAttribute('position',a);
 const l=new THREE.LineSegments(g,overlayMat);scene.add(l);l.frustumCulled=!dynamic;
 updates.push(()=>l.visible=U.overlay.value>.001);return a;
}
lineLayer(routeLines);
const edges=[];
for(const mesh of towerMeshes){
 const edge=new THREE.EdgesGeometry(mesh.geometry,16),p=edge.attributes.position,mat=new THREE.Matrix4();
 for(let i=0;i<mesh.count;i++){
  mesh.getMatrixAt(i,mat);if(mat.elements[12]<-2600)continue;
  for(let j=0;j<p.count;j++)edges.push(...V(0,0,0).fromBufferAttribute(p,j).applyMatrix4(mat).toArray());
 }
 edge.dispose();
}
const villageEdges=new THREE.EdgesGeometry(villageMesh.geometry,32).attributes.position;
for(let i=0;i<villageEdges.count;i++)edges.push(villageEdges.getX(i),villageEdges.getY(i),villageEdges.getZ(i));
lineLayer(edges);
const cables=[];villageLots.filter((_,i)=>i%11===9).forEach(p=>{
 const pts=[V(p.x,p.h+5,p.z),V(p.x+11,p.h+5,p.z),V(p.x+11,4,p.z),V(96,4,p.z),V(96,4,-275)];
 for(let i=1;i<pts.length;i++)cables.push(...pts[i-1].toArray(),...pts[i].toArray());
});lineLayer(cables);
const predictions=lineLayer(new Float32Array(cars.length*6),true);
updates.push(t=>{if(U.overlay.value>0){
 cars.forEach((c,i)=>{const [x,y,z]=carPose(i,U.motion.value+.85);predictions.setXYZ(i*2,c.position.x,c.position.y+.45,c.position.z);predictions.setXYZ(i*2+1,c.scale.x<.5?c.position.x:x,y+.45,c.scale.x<.5?c.position.z:z)});
 predictions.needsUpdate=true;
}});
// Luminous rims and transparent cylindrical walls describe three altitude bands.
const laneShell=material(`varying vec3 wp,n;void main(){wp=position;n=normal;gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);}`,
 atmosphere+`uniform float overlay;varying vec3 wp,n;void main(){
 float rim=pow(1.-abs(dot(normalize(n),normalize(cameraPosition-wp))),2.);
 gl_FragColor=vec4(.70,1.20,1.46,overlay*(.018+.29*rim));}`,{transparent:true,depthWrite:false,side:THREE.DoubleSide});
for(const id of [0,17,34]){
 const curve=new THREE.CatmullRomCurve3(paths[id],true);
 const tube=add(new THREE.TubeGeometry(curve,160,.78,8,true),laneShell);
 updates.push(()=>tube.visible=U.overlay.value>.002);
}
for(let j=0;j<7;j++)for(let k=0;k<5;k++){
 const x=-21+j*7,y=8+k*8;
 blitBox(bays,x,y,-38.45,5.9,4.75,1.6,carbon);
 blitBox(bays,x,y-1.75,-39.7,6.3,.48,3.5,porcelain);
 blitBox(bays,x,y+1.7,-39.32,4.9,.28,.40,0xbde4e2,.83);
}
// Submit only the silhouettes whose range can resolve them in the primary view.
const deliveryMeshes=scene.children.filter(m=>m.isInstancedMesh&&m.geometry.getAttribute('trip'));
updates.push(()=>{
 const n=[0,0],eye=camera.position,year=adoptionYear(),fraction=smooth((year-2026)/19);
 for(let i=0;i<fleet.length;i+=3){
  if(fleet[i+2]>fraction)continue;
  const lane=fleet[i],f=U.motion.value/routeSeconds[lane]+fleet[i+1]+lane*.037;
  const point=paths[lane][Math.floor((f-Math.floor(f))*steps)];
  const range=point.distanceTo(eye),lod=range<154?0:range<385?1:2;
  if(lod===2)continue;
  const attr=deliveryMeshes[lod].geometry.attributes.trip;
  attr.setXYZ(n[lod]++,lane,fleet[i+1],fleet[i+2]);
 }
 for(let j=0;j<2;j++){deliveryMeshes[j].count=n[j];deliveryMeshes[j].geometry.attributes.trip.needsUpdate=true;}
});
// Short ribbons begin at the front bumper and occupy real lane width in the overlay.
const dashGeometry=new THREE.BufferGeometry(),dashVertices=new THREE.Float32BufferAttribute(new Float32Array(cars.length*18),3);
dashGeometry.setAttribute('position',dashVertices);
const dashes=add(dashGeometry,material(`void main(){gl_Position=projectionMatrix*viewMatrix*vec4(position,1.);}`,
 `uniform float overlay;void main(){gl_FragColor=vec4(.29,1.63,2.03,overlay*.88);}`,{side:THREE.DoubleSide,transparent:true,depthWrite:false}));
dashes.frustumCulled=false;
updates.push(()=>{
 dashes.visible=U.overlay.value>.001;if(!dashes.visible)return;
 cars.forEach((c,i)=>{
  const a=c.position,b=carPose(i,U.motion.value+.80),dx=b[0]-a.x,dz=b[2]-a.z,dist=Math.hypot(dx,dz)||1;
  const sx=dx/dist,sz=dz/dist,w=c.scale.x>.1?.42:0,fx=a.x+2.9*sx,fz=a.z+2.9*sz;
  const pts=[[fx-sz*w,fz+sx*w],[b[0]-sz*w,b[2]+sx*w],[b[0]+sz*w,b[2]-sx*w],[fx+sz*w,fz-sx*w]];
  [0,1,2,0,2,3].forEach((k,j)=>dashVertices.setXYZ(i*6+j,pts[k][0],a.y+.24,pts[k][1]));
 });dashVertices.needsUpdate=true;
});
