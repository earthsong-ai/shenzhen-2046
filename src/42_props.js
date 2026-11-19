// Articulated props share primitive buffers and draw calls. Their lightweight
// transform trees also let a passenger craft, hatch or rotor own moving children.
const rigRoot=new THREE.Group(),rigBuckets=new Map();
const primitives={
 box:new THREE.BoxGeometry(1,1,1),ball:new THREE.SphereGeometry(1,12,7),
 hull:new THREE.SphereGeometry(1,28,16),pipe:new THREE.CylinderGeometry(1,1,1,10),
 hex:new THREE.CylinderGeometry(1,1,1,6),ring:new THREE.TorusGeometry(1,.043,5,30),
 blade:new THREE.ConeGeometry(1,1,4),disc:new THREE.CylinderGeometry(1,1,1,36)
};
function pivot(parent=rigRoot,x=0,y=0,z=0){
 const node=new THREE.Object3D();parent.add(node);node.position.set(x,y,z);return node;
}
function part(parent,shape,xyz,size,color,glow=0){
 const n=pivot(parent,...xyz);n.scale.set(...size);
 if(!rigBuckets.has(shape))rigBuckets.set(shape,[]);
 rigBuckets.get(shape).push({n,color:new THREE.Color(color),glow});return n;
}
const porcelain=0xe8e2cd,bronze=0xbba079,carbon=0x354953,solarBlue=0x477582,moss=0x728756;
function halo(parent,x,y,z,r,color=0xf4c57f,glow=1){
 const n=part(parent,'ring',[x,y,z],[r,r,r],color,glow);n.rotation.x=Math.PI/2;return n;
}
function spar(parent,a,b,r,color){
 const dist=b.clone().sub(a),mid=a.clone().lerp(b,.5);
 const n=part(parent,'pipe',mid.toArray(),[r,dist.length(),r],color);
 n.quaternion.setFromUnitVectors(V(0,1,0),dist.normalize());return n;
}
function assembleRigs(){
 const buffers=[];
 for(const [shape,rows] of rigBuckets){
  const g=primitives[shape].clone();g.setAttribute('radiance',new THREE.InstancedBufferAttribute(Float32Array.from(rows,r=>r.glow),1));
  const mat=material(`
  attribute float radiance;varying float emit;varying vec3 wp,n,tint;
  void main(){wp=(instanceMatrix*vec4(position,1.)).xyz;emit=radiance;tint=instanceColor;
  n=mat3(instanceMatrix)*(normal/max(vec3(.000001),vec3(dot(instanceMatrix[0].xyz,instanceMatrix[0].xyz),dot(instanceMatrix[1].xyz,instanceMatrix[1].xyz),dot(instanceMatrix[2].xyz,instanceMatrix[2].xyz))));
  gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);}`,atmosphere+penumbra+`
  varying float emit;varying vec3 wp,n,tint;void main(){vec3 N=normalize(n);
  float diffuse=max(dot(N,solar),0.)*sunlightAt(wp,N),glint=pow(max(dot(reflect(-solar,N),normalize(cameraPosition-wp)),0.),50.);
  vec3 c=tint*((.34+.22*max(N.y,0.))*(1.-night*.84)+sunTint*daylight()*diffuse+.8*emit)+.48*sunTint*glint*daylight();
  float frost=smoothstep(22.,37.,wp.y)*(1.-smoothstep(62.,78.,wp.y));
  float tank=1.-smoothstep(4.0,5.2,min(length(wp.xz-vec2(7000.,2450.)),length(wp.xz-vec2(8620.,3020.))));
  c+=vec3(.17,.20,.21)*tank*frost*texture2D(detail,wp.xy*.16).r;
  c+=flash*vec3(1.65,.54,.095)*(1./(1.+dot(wp.xz-vec2(7000.,2450.),wp.xz-vec2(7000.,2450.))/2600.))*exp(-abs(wp.y-9.)*.026);
  gl_FragColor=vec4(aerial(c,wp),1.);}`);
  mat.userData.sunCaster=true;
  const mesh=new THREE.InstancedMesh(g,mat,rows.length);
  rows.forEach(({color},i)=>mesh.setColorAt(i,color));mesh.frustumCulled=false;scene.add(mesh);buffers.push({mesh,rows});
 }
 updates.push(()=>{
  rigRoot.updateMatrixWorld();
  for(const {mesh,rows} of buffers){
   rows.forEach(({n},i)=>mesh.setMatrixAt(i,n.matrixWorld));
   mesh.instanceMatrix.needsUpdate=true;
  }
 });
}
function wingCraft(parent,length,freighter=false){
 const s=length/12;
 part(parent,'ball',[0,0,0],[1.58*s,1.12*s,6*s],freighter?bronze:porcelain);
 part(parent,'ball',[0,.63*s,-1.44*s],[1.33*s,.84*s,2.91*s],carbon);
 for(const side of [-1,1]){
  const wing=part(parent,'ball',[side*3.35*s,-.13*s,.64*s],[4.15*s,.22*s,1.5*s],freighter?carbon:porcelain);
  wing.rotation.y=-side*.29;
  part(parent,'ball',[side*5.8*s,-.18*s,1.12*s],[.48*s,.45*s,1.55*s],solarBlue);
  part(parent,'ball',[side*5.8*s,-.16*s,2.24*s],[.34*s,.25*s,.53*s],0xffc978,1.8);
 }
 if(freighter)part(parent,'box',[0,-1.13*s,.6*s],[3.8*s,1.9*s,6.9*s],bronze);
}

function reveal(node,start,end){
 updates.push(()=>node.scale.setScalar(Math.max(.0001,phase(start,end,adoptionYear()))));
}
function blitBox(parent,x,y,z,w,h,d,color,light=0){return part(parent,'box',[x,y,z],[w,h,d],color,light)}
function passengerCraft(parent){
 part(parent,'hull',[0,0,0],[1.21,1.08,4.28],0xe4ebeb);
 part(parent,'hull',[0,.51,-.59],[1.16,.84,2.94],0x466975);
 blitBox(parent,0,.11,.14,8.3,.24,1.35,porcelain);
 const rotors=[];
 for(const s of [-1,1]){
  const tail=blitBox(parent,s*.92,.72,3.22,.19,1.85,1.52,solarBlue);tail.rotation.z=-s*.53;
  blitBox(parent,s*.89,-1,0,.14,.15,4.4,carbon);
  part(parent,'ball',[s*4.27,.28,.13],[.13,.12,.16],s<0?0xff3226:0x35ff9d,2);
  for(const z of [-1.48,.24,1.84]){
   const rotor=pivot(parent,s*(3.28+.66*Math.cos(z)),.30,z);rotors.push(rotor);
   part(rotor,'pipe',[0,0,0],[.21,.59,.21],carbon);
   const band=part(rotor,'ring',[0,.36,0],[.78,.78,.78],0x77868a);band.rotation.x=Math.PI/2;
   blitBox(rotor,0,.36,0,1.53,.055,.16,0xaebfc2);
  }
 }
 const strobe=part(parent,'ball',[0,.2,3.9],[.13,.13,.16],0xffffff,2.4);
 updates.push(()=>strobe.scale.setScalar((U.motion.value%1.2+1.2)%1.2<.12?.16:.035));
 return rotors;
}
