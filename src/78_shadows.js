// Preserve year-dependent construction cuts in the depth pass. Ordinary
// architecture, moving props and vegetation use their real instance transforms.
function casterMaterial(kind){
 return material(`uniform float year;varying float ceiling,localHeight;
 ${kind==='tower'?'attribute vec3 lotData;':''}
 ${kind==='tree'?'attribute float born;':''}
 void main(){
 vec3 p=position;ceiling=1e6;localHeight=p.y;
 ${kind==='tower'?'if(year<lotData.x+3.8)ceiling=floor(clamp((year-lotData.x)/3.8,0.,1.)*80.)*4.-.002;':''}
 ${kind==='tree'?'p*=smoothstep(born-.3,born+.25,year);':''}
 vec4 world=vec4(p,1.);
 #ifdef USE_INSTANCING
 world=instanceMatrix*world;
 #endif
 gl_Position=projectionMatrix*modelViewMatrix*world;
 }`,`varying float ceiling,localHeight;void main(){if(localHeight>ceiling)discard;gl_FragColor=vec4(1.);}`,{side:THREE.DoubleSide,colorWrite:false});
}
const depthCasters={tower:casterMaterial('tower'),tree:casterMaterial('tree'),solid:casterMaterial('solid')};
const shadowMaps=[['Near',1536,410,270],['Far',1536,2200,1450]].map(([name,res,span,ahead])=>{
 const target=new THREE.WebGLRenderTarget(res,res,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter});
 target.depthTexture=new THREE.DepthTexture(res,res,THREE.UnsignedIntType);
 U['shadow'+name].value=target.depthTexture;
 return {name,target,span,ahead,cam:new THREE.OrthographicCamera(-span,span,span,-span,1,7200)};
});
function castSun(renderer){
 if(U.solar.value.y<.006)return;
 const objects=scene.children.map(m=>[m,m.material,m.visible]);
 for(const [m,mat] of objects){
  const eligible=m.isMesh&&(mat===facade||mat===villageM||mat===botany||mat.userData.sunCaster);
  if(!eligible)m.visible=false;
  else m.material=mat===facade?depthCasters.tower:mat===botany?depthCasters.tree:depthCasters.solid;
 }
 const direction=camera.getWorldDirection(V(0,0,0));
 for(const {name,target,cam,span,ahead} of shadowMaps){
  const center=camera.position.clone().addScaledVector(direction,ahead);
  center.y=Math.min(410,Math.max(32,center.y));cam.position.copy(center).addScaledVector(U.solar.value,3500);
  cam.lookAt(center);cam.updateMatrixWorld();
  const vp=U['sunVP'+name].value.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);
  const origin=V(0,0,0).applyMatrix4(vp),pixel=2/target.width;
  cam.projectionMatrix.elements[12]+=Math.round(origin.x/pixel)*pixel-origin.x;
  cam.projectionMatrix.elements[13]+=Math.round(origin.y/pixel)*pixel-origin.y;
  vp.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);
  renderer.setRenderTarget(target);renderer.render(scene,cam);cam.updateProjectionMatrix();
 }
 for(const [m,mat,visible] of objects){m.material=mat;m.visible=visible}
}
