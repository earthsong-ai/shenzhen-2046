function hdr(depthBuffer=false){
 return new THREE.WebGLRenderTarget(2,2,{depthBuffer,type:THREE.HalfFloatType,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter});
}
const beauty=hdr(true), pyramid=[hdr(),hdr(),hdr(),hdr()];
beauty.depthTexture=new THREE.DepthTexture(2,2,THREE.UnsignedIntType);
const screen=new THREE.Scene(),flatCamera=new THREE.Camera();
const plane=add(new THREE.PlaneGeometry(2,2),null,screen);
const blitVertex='varying vec2 st; void main(){st=uv;gl_Position=vec4(position.xy,0.,1.);}';
const sampleUniforms={source:{value:null},pixel:{value:new THREE.Vector2()},extract:{value:0}};
const reduce=material(blitVertex,`
 uniform sampler2D source;uniform vec2 pixel;uniform float extract;varying vec2 st;
 void main(){vec3 c=texture2D(source,st).rgb*4.;
 for(int i=-1;i<=1;i++)for(int j=-1;j<=1;j++){
 if(i!=0||j!=0)c+=texture2D(source,st+vec2(float(i),float(j))*pixel*1.22).rgb;
 }
 c/=12.;float peak=max(c.r,max(c.g,c.b));c*=mix(1.,smoothstep(.48,1.68,peak),extract);
 gl_FragColor=vec4(c,1.);}`,{uniforms:sampleUniforms,depthTest:false,depthWrite:false});
const grade=material(blitVertex,`
 varying vec2 st;uniform sampler2D base,b0,b1,b2,b3;uniform sampler2D depthImage;uniform float clock,fade,veil,revealLight,clipNear;
 uniform float bayLens,lensTan,aspect,pitch,overscan;
 vec2 bayCoordinates(vec2 film){
  vec2 ndc=2.*film-1.;
  if(bayLens<.0001)return film;
  float az=ndc.x*1.22*atan(aspect*lensTan);
  float altitude=asin(clamp(sin(pitch)+ndc.y*cos(pitch)*lensTan,-.98,.98));
  float radial=cos(altitude)*cos(az),vertical=sin(altitude);
  float depth=max(.11,radial*cos(pitch)+vertical*sin(pitch));
  vec2 ray=vec2(cos(altitude)*sin(az)/aspect,vertical*cos(pitch)-radial*sin(pitch))/(depth*lensTan);
  return .5+.5*mix(ndc,ray,bayLens)/vec2(1.+1.08*bayLens,overscan);
 }
 float eyeDepth(vec2 p){return clipNear/(1.-texture2D(depthImage,p).r*(1.-clipNear/16000.));}
 vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
 void main(){
 vec2 radial=st-.5;vec2 shift=radial*dot(radial,radial)*.0018;
 float ignition=smoothstep(37.3,37.94,clock)*(1.-smoothstep(40.,40.7,clock));
 vec2 tex=bayCoordinates(st),sourceUV=tex;
 float shimmer=ignition*exp(-dot((st-vec2(.54,.42))*vec2(3.2,6.),(st-vec2(.54,.42))*vec2(3.2,6.)));
 sourceUV.x+=.0009*shimmer*(sin(st.y*94.+clock*28.)+.35*sin(st.y*219.-clock*35.));
 vec3 c=vec3(texture2D(base,sourceUV+shift).r,texture2D(base,sourceUV).g,texture2D(base,sourceUV-shift).b);
 float z=eyeDepth(tex),occ=0.;vec2 pixel=1./vec2(textureSize(depthImage,0));
 for(int i=0;i<8;i++){float angle=float(i)*2.39996;
 vec2 offset=vec2(cos(angle),sin(angle))*pixel*clamp(4200./max(z,1.),2.,19.);
 float gap=z-eyeDepth(tex+offset);occ+=smoothstep(.25,2.,gap)*(1.-smoothstep(3.,16.,gap));}
 c*=1.-.48*occ/8.;
 c+=(1.+.70*ignition)*(texture2D(b0,tex).rgb*.09+texture2D(b1,tex).rgb*.10+texture2D(b2,tex).rgb*.13+texture2D(b3,tex).rgb*.17);
 c=mix(c,vec3(.46,.58,.69),veil*.83);c=aces(c*(.89+.61*revealLight)*exp2(-.5*ignition));float l=dot(c,vec3(.22,.70,.08));
 c=mix(vec3(l),c,.94)*mix(vec3(.92,1.014,1.035),vec3(1.04,1.006,.956),l);
 c*=1.-.21*smoothstep(.08,.52,dot(radial,radial));
 c=mix(12.92*c,1.055*pow(max(c,0.),vec3(1./2.4))-.055,step(vec3(.0031308),c));
 float grain=fract(sin(dot(mod(gl_FragCoord.xy,251.)+floor(clock*30.),vec2(17.17,73.41)))*7629.3)-.5;
 gl_FragColor=vec4((c+grain*.009)*fade,1.);
 }`,{uniforms:{...U,bayLens:{value:0},lensTan:{value:1},aspect:{value:2.38},pitch:{value:0},overscan:{value:1},depthImage:{value:beauty.depthTexture},base:{value:beauty.texture},fade:{value:1},clipNear:{value:.7},...Object.fromEntries(pyramid.map((p,i)=>['b'+i,{value:p.texture}]))},depthWrite:false,depthTest:false});
function composite(renderer){
 let previous=beauty;plane.material=reduce;
 pyramid.forEach((p,i)=>{
  sampleUniforms.source.value=previous.texture;sampleUniforms.pixel.value.set(1/previous.width,1/previous.height);
  sampleUniforms.extract.value=i===0?1:0;
  renderer.setRenderTarget(p);renderer.render(screen,flatCamera);previous=p;
 });
 plane.material=grade;renderer.setRenderTarget(null);renderer.render(screen,flatCamera);
}
