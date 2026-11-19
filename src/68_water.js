const mirrorTarget=new THREE.WebGLRenderTarget(2,2,{type:THREE.HalfFloatType});
const mirrorCam=new THREE.PerspectiveCamera(),mirrorVP=new THREE.Matrix4(),reflectedLook=V(0,0,0);
const waterUniforms={...U,mirrorImage:{value:mirrorTarget.texture},mirrorVP:{value:mirrorVP},
 launchPosition:{value:A.pad.clone()},wakeBoat:{value:V(-400,0,420)},secondWake:{value:V(0,0,0)},ships:{value:shipping.map(()=>V(0,0,0))},downwash:{value:V(0,0,0)},bedCenter:{value:dataSite}};
const water=add(new THREE.PlaneGeometry(30000,30000),material(`
 uniform mat4 mirrorVP;varying vec4 mirrorPos;varying vec3 wp;
 void main(){wp=(modelMatrix*vec4(position,1.)).xyz;mirrorPos=mirrorVP*vec4(wp,1.);
 gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);}`,atmosphere+`
 uniform sampler2D mirrorImage;uniform vec3 launchPosition,wakeBoat,secondWake;uniform vec3 ships[3],downwash,bedCenter;uniform float year;varying vec4 mirrorPos;varying vec3 wp;
 void main(){
 vec2 p=wp.xz;vec3 eye=normalize(cameraPosition-wp);float d=length(cameraPosition-wp);
 vec2 a=texture2D(detail,p*vec2(.021,.058)+vec2(clock*.004,-clock*.007)).gb-.5;
 vec2 b=texture2D(detail,mat2(.85,-.53,.53,.85)*p*vec2(.009,.028)-clock*.0028).gb-.5;
 vec2 slope=(a*.14+b*.095+.022*vec2(sin(p.y*.46+p.x*.055-clock*1.35),cos(p.x*.32+p.y*.12-clock*.7)))*mix(1.,.28,smoothstep(90.,1450.,d));
 vec2 wash=p-downwash.xz;float waveRing=sin(length(wash)*1.8-motion*5.)*exp(-length(wash)*.085)*(1.-smoothstep(8.,24.,downwash.y))*smoothstep(2034.,2045.,year);
 slope+=.040*waveRing*normalize(wash+vec2(.01));
 vec3 n=normalize(vec3(slope.x,1.,slope.y));float facing=clamp(dot(eye,n),0.,1.);
 vec2 uv=mirrorPos.xy/mirrorPos.w*.5+.5;
 vec2 distortion=vec2(dot(slope,vec2(viewMatrix[0][0],viewMatrix[2][0])),slope.y+.4*slope.x);
 uv+=distortion*(.033+.024*abs(eye.y));vec3 image=texture2D(mirrorImage,clamp(uv,.001,.999)).rgb;
 float fresnel=.15+.82*pow(1.-facing,3.);
 vec3 bed=mix(vec3(.025,.145,.187),vec3(.035,.222,.166),1.-smoothstep(-33.,64.,p.y))*(.64+.45*texture2D(detail,p*.009).r)*(1.-night*.81);
 float swell=texture2D(detail,p*vec2(.0029,.013)+clock*.0007).r*.74+texture2D(detail,p*vec2(.007,.029)-clock*.002).r*.26;
 vec3 c=mix(bed,image,fresnel)*mix(vec3(.64,.77,.84),vec3(1.),.41+.38*swell);
 c+=sunTint*3.7*pow(max(dot(reflect(-solar,n),eye),0.),190.)*smoothstep(-.035,.047,solar.y);
 vec2 aft=p-wakeBoat.xz;float behind=-aft.x;
 float wake=(exp(-2.*abs(abs(aft.y)-2.8-.089*behind))+.50*exp(-2.*abs(aft.y)))*smoothstep(1.,8.,behind)*exp(-max(0.,behind)*.037);
 vec2 stern=p-secondWake.xy;
 float alongWake=stern.x*sign(secondWake.z);
 float crossWake=abs(stern.y+.043*stern.x);
 float wing=abs(crossWake-(4.8+.117*alongWake));
 float foam=(exp(-wing/(1.1+.011*max(0.,alongWake)))+.37*exp(-.14*crossWake))*smoothstep(8.,20.,alongWake)*exp(-max(0.,alongWake)*.012);
 foam*=smoothstep(.05,.65,abs(secondWake.z))*(.56+.8*swell);
 c+=vec3(.75,.90,.85)*(wake+foam)*smoothstep(2034.,2044.,year)*(1.-night*.62);
 for(int i=0;i<3;i++){
  vec2 axis=vec2(sin(ships[i].z),cos(ships[i].z)),off=p-ships[i].xy;
  float aft=-dot(off,axis)-36.,side=abs(dot(off,vec2(axis.y,-axis.x)));
  float foam=(.50*exp(-abs(side-.3541*aft)*.45)+.44*exp(-side*side/120.))*smoothstep(0.,10.,aft)*(1.-smoothstep(160.,270.,aft));
  c+=vec3(.56,.68,.69)*foam*(.55+.53*swell)*(1.-.74*night);
 }
 vec2 wet=p-bedCenter.xz+slope*17.;
 float shallows=exp(-dot(wet/vec2(110.,56.),wet/vec2(110.,56.)));
 c=mix(c,vec3(.13,.36,.35)*(.89+.22*swell),.57*shallows*smoothstep(2038.,2045.,year));
 vec2 cableDir=normalize(vec2(660.,-669.));
 float lead=dot(wet,cableDir),lateral=length(wet-cableDir*lead);
 c+=vec3(.10,.15,.11)*step(0.,lead)*step(lead,920.)*exp(-lateral*.69)*smoothstep(2038.,2045.,year);
 vec2 cells=floor((wet+vec2(90.,44.))/vec2(30.,22.));
 if(all(greaterThanEqual(cells,vec2(0.)))&&all(lessThan(cells,vec2(6.,4.)))){
  vec2 q=mod(wet+vec2(90.,44.),vec2(30.,22.))-vec2(15.,11.);
  float shape=length(vec2(max(0.,abs(q.x)-6.4),q.y));
  float body=1.-smoothstep(3.1,4.15,shape);
  float rib=step(.80,fract((q.x+10.)/4.));
  vec3 pod=mix(vec3(.08,.23,.25),vec3(.38,.62,.58),sqrt(max(0.,1.-pow(shape/4.2,2.))))*(1.-.28*rib);
  pod+=vec3(.07,.47,.71)*(1.-smoothstep(.30,.95,length(vec2(mod(q.x+1.5,3.)-1.5,q.y-.8))));
  c=mix(c,pod,body*smoothstep(2038.,2045.,year)*(.80-.23*fresnel));
 }
 vec2 outflow=(p-vec2(1890.,-1290.))/vec2(84.,27.);
 c+=vec3(.025,.12,.096)*exp(-dot(outflow,outflow))*(.5+swell)*smoothstep(2035.,2042.,year);
 vec3 virtualFlame=vec3(launchPosition.x,-launchPosition.y,launchPosition.z);
 float along=dot(normalize(wp-cameraPosition),normalize(virtualFlame-cameraPosition));
 vec2 axis=normalize(launchPosition.xz-cameraPosition.xz),sight=normalize(wp.xz-cameraPosition.xz);
 float crossTrack=abs(axis.x*sight.y-axis.y*sight.x);
 float streak=exp(-crossTrack/(.0013+.0017*abs(a.x)))*pow(max(along,0.),270.);
 float glitter=smoothstep(.30,.66,texture2D(detail,p*vec2(.011,.073)+clock*.007).r);
 c+=vec3(5.9,2.35,.51)*flash*streak*(.12+1.8*glitter);
 gl_FragColor=vec4(mix(c,skylight(normalize(wp-cameraPosition)),smoothstep(5500.,14500.,d)),1.);
 }`,{uniforms:waterUniforms}));
water.rotation.x=-Math.PI/2;
updates.push(()=>{shipping.forEach((s,i)=>waterUniforms.ships.value[i].set(s.position.x,s.position.z,s.rotation.y));
 waterUniforms.downwash.value.copy(shuttle.position);U.wash.value.copy(shuttle.position);});
function drawMirror(renderer){
 mirrorCam.copy(camera,false);mirrorCam.position.y*=-1;
 camera.getWorldDirection(reflectedLook);reflectedLook.y*=-1;reflectedLook.add(mirrorCam.position);
 mirrorCam.up.copy(camera.up);mirrorCam.up.y*=-1;mirrorCam.lookAt(reflectedLook);mirrorCam.updateMatrixWorld();
 mirrorVP.multiplyMatrices(mirrorCam.projectionMatrix,mirrorCam.matrixWorldInverse);
 water.visible=false;renderer.setRenderTarget(mirrorTarget);renderer.render(scene,mirrorCam);water.visible=true;
}
