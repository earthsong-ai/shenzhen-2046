// Lighting depends on solar altitude and azimuth. A future film can supply any
// ephemeris without changing atmosphere, windows or the water material.
function setSun(altitude,azimuth){
 const h=altitude*Math.PI/180,a=azimuth*Math.PI/180;
 U.solar.value.set(Math.cos(h)*Math.cos(a),Math.sin(h),Math.cos(h)*Math.sin(a));
 const night=1-smooth((altitude+13)/14),day=smooth((altitude+.8)/18);
 U.night.value=night;U.twilight.value=(1-day)*(1-night);
 const palette=(uniform,noon,low,deep)=>{
  uniform.value.setRGB(...low).lerp(new THREE.Color(...noon),day).lerp(new THREE.Color(...deep),night);
 };
 palette(U.mist,[.38,.54,.68],[.66,.545,.434],[.057,.084,.130]);
 palette(U.zenith,[.044,.216,.50],[.126,.235,.428],[.009,.019,.052]);
 palette(U.sunTint,[1.20,1.09,.89],[1.61,.71,.30],[.23,.32,.50]);
 U.extinction.value=.00046+.00056*(1-day)*(1-.55*night);
}
const sky=add(new THREE.SphereGeometry(1,40,20),material(`
 varying vec3 ray;void main(){ray=position;vec4 clip=projectionMatrix*vec4(mat3(viewMatrix)*position,1.);gl_Position=clip.xyww;}`,
 atmosphere+`varying vec3 ray;
 void main(){
 vec3 r=normalize(ray);vec3 c=skylight(r);float coverage=0.;
 if(r.y>.005){
  vec2 p=r.xz/(r.y+.115)*vec2(.092,.063)+vec2(motion*.0015,.19);
  float base=texture2D(detail,p).r;
  float fine=texture2D(detail,p*3.1).r;
  coverage=smoothstep(.46,.64,.76*base+.24*fine)*smoothstep(.004,.090,r.y)*.88;
  float rim=base-texture2D(detail,p+solar.xz*.018).r;
  vec3 cloud=mix(mist*.53,skylight(r)+sunTint*(.60+.29*daylight()),clamp(.55+rim*6.,0.,1.));
  c=mix(c,cloud,coverage);
  vec2 sphere=vec2(atan(r.x,r.z)/6.2831853,asin(r.y)/3.1415926)*1150.;
  float star=step(.99982,cellHash(floor(sphere)))*exp(-38.*dot(fract(sphere)-.5,fract(sphere)-.5));
  c+=vec3(.31,.40,.52)*star*night*(1.-coverage)*smoothstep(.07,.43,r.y);
 }
 float cosAngle=dot(r,solar);
 float disc=smoothstep(.999944,.999970,cosAngle)*smoothstep(-.009,.004,r.y);
 c+=sunTint*disc*(5.2+2.*daylight())*(1.-coverage);
 gl_FragColor=vec4(c,1.);}`,{side:THREE.BackSide,depthWrite:false}));
sky.frustumCulled=false;sky.renderOrder=-100;
// Bake the same procedural sky into six small HDR faces. Glass reads one
// filtered cubemap sample per fragment, including the cloud bank and sun halo.
const skyProbe=new THREE.WebGLCubeRenderTarget(64,{type:THREE.HalfFloatType,generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});
const probeScene=new THREE.Scene();probeScene.add(sky.clone());
const probeCamera=new THREE.CubeCamera(.1,10,skyProbe);
U.skyEnv={value:skyProbe.texture};
