// The two flocks share a folded, curved wing silhouette. The flight, the
// reflection and the single late crossing are sampled from absolute film time.
const birdVertices=[];
for(const s of [-1,1]){
 const a=[0,0,.44],b=[s*.81,.23,.24],c=[s*.78,.13,-.4],d=[0,-.04,-.55],tip=[s*1.73,.08,-.35];
 for(const p of [a,b,c,a,c,d,b,tip,c,[0,.08,.75],[s*.14,-.02,.2],d,[0,.08,.75],[s*.07,.07,.62],[0,.05,1.04]])birdVertices.push(...p);
}
const silhouette=new THREE.BufferGeometry();silhouette.setAttribute('position',new THREE.Float32BufferAttribute(birdVertices,3));
const egrets=new THREE.InstancedMesh(silhouette,material(atmosphere+`
 varying vec3 wp;void main(){float id=float(gl_InstanceID),s=cellHash(vec2(id,2.));
 bool last=id>22.5;float age=max(0.,clock-11.1-s*.76);
 vec3 p=position;p.y+=abs(p.x)*.49*sin(clock*6.9+id);
 if(last){p.xz=mat2(0.,-1.,1.,0.)*p.xz;
 wp=vec3(-270.+(clock-43.5)*32.,3.5+.18*sin(clock*2.),780.)+p*1.75;}
 else {p.xz=mat2(.52,.85,-.85,.52)*p.xz;
 wp=vec3(-108.+id*1.7+age*3.,2.+s+10.*smoothstep(0.,4.,age),160.+s*20.-age*3.)+p;}
 gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);if(last&&clock<43.5)gl_Position=vec4(2.,2.,2.,1.);}`,
 atmosphere+`varying vec3 wp;void main(){gl_FragColor=vec4(aerial(vec3(1.44,1.37,1.17)*(1.-night*.57),wp),1.);}`,{side:THREE.DoubleSide}),24);
egrets.frustumCulled=false;scene.add(egrets);
// Laundry is a handful of unmarked strips over the communal roof decks.
for(let i=4;i<villageLots.length;i+=6){
 const {x,z,h}=villageLots[i];
 for(let k=0;k<4;k++)blitBox(district,x-4+k*1.1,h+5.38,z-5,.83,.95,.09,[0xdad5bc,0xaabbb8,0xccaa83,0xc4c8b9][k]);
}
// Old towers acquire photovoltaic roofs in parcels while their concrete cores remain.
for(const b of placements.filter(p=>p.birth===2000&&p.x>-2500)){
 const r=pivot(rigRoot,b.x,b.height*1.012+3,b.z);r.rotation.y=b.angle;
 for(let k=0;k<3;k++)blitBox(r,(k-1)*11,.5,2,9,1,24,solarBlue).rotation.x=Math.PI/9;
 blitBox(r,-13,1,-14,13,2,4,moss);reveal(r,2027+b.variant*11,2043+b.variant*2);
}
finishTrees();assembleRigs();
