const sail=pivot();
part(sail,'hull',[0,0,0],[85,18,22],porcelain);
part(sail,'hull',[0,13.1,0],[65,7,17],solarBlue);
for(let i=-4;i<=4;i++){
 const r=Math.sqrt(1-(i*.19)**2),band=part(sail,'ring',[i*16,0,0],[22*r,18*r,.8],bronze);
 band.rotation.y=Math.PI/2;
}
part(sail,'ball',[0,-17.1,0],[41,4.2,8],carbon);
for(let side of [-1,1]){
 const fin=part(sail,'ball',[66,6,side*13],[16,1.3,15],solarBlue);fin.rotation.x=side*.53;
 part(sail,'ball',[-16,-12,side*19],[13,3,2.8],bronze);
}
updates.push(t=>{sail.position.set(33-(U.motion.value-29.5)*12,513+2*Math.sin(t*.13),-990);const vis=phase(27.7,28.5,t)*(1-phase(31.2,32,t))*phase(2040,2045,Y);sail.scale.set(1.06*vis+.0001,.89*vis+.0001,.74*vis+.0001);sail.rotation.z=.023*Math.sin(t*.10)});
// A continuous relief sheet with two scales of billows. Holes and swept rims
// are evaluated in world space, so a tower breaks the same cloud in its mirror.
const cloudUniforms={...U,cover:{value:0},envelope:{value:V(0,0,0)},tops:{value:crownLots.map(b=>b.height)},crowns:{value:crownLots.map(b=>new THREE.Vector2(b.x,b.z))}};
const cloudField=`
 uniform float cover;uniform float tops[14];uniform vec2 crowns[14];uniform vec3 envelope;
 float lobes(vec2 p){
  vec2 grid=floor(p),st=fract(p);float peak=0.;
  for(int j=-1;j<=1;j++)for(int k=-1;k<=1;k++){
   vec2 id=grid+vec2(k,j),mid=vec2(k,j)+.18+.63*vec2(cellHash(id),cellHash(id+13.7));
   vec2 d=(st-mid)*vec2(1.,1.13);peak=max(peak,exp(-dot(d,d)*3.35));
  }return peak;
 }
 float field(vec2 p){
 vec2 flow=p*.00029+vec2(motion*.00046,.13);
 float base=texture2D(detail,flow).r;
 vec2 warp=vec2(base,texture2D(detail,flow+.35).r);
 return .44*base+.32*lobes(p/463.+warp*.28)+.16*lobes(p/319.+warp*.36)+.08*texture2D(detail,flow*8.2).r;
 }
 float edgeWake(vec2 p){
 float w=0.;for(int j=0;j<14;j++){vec2 d=p-crowns[j];d.x=(d.x-22.)*.48;
 w=max(w,1.-smoothstep(15.,65.,length(d)));}return w;
 }`;
const clouds=add(new THREE.PlaneGeometry(8800,8800,254,254),material(atmosphere+cloudField+`
 varying vec3 wp;varying float density;
 void main(){vec2 p=position.xy;float mass=field(p);float wake=edgeWake(p);
 density=mass;wp=vec3(p.x,401.+mass*26.-wake*3.,p.y);
 gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);}`,atmosphere+cloudField+`
 varying vec3 wp;varying float density;
 void main(){vec2 p=wp.xz;float m=field(p),fine=texture2D(detail,p*.008+motion*.0009).r;
 float wake=edgeWake(p);
 float crest=(m-field(p+solar.xz*62.))*1.65+(m-field(p+solar.xz*138.))*.70+(fine-.45)*.14;
 float shade=0.;for(int i=0;i<14;i++){
  vec2 off=p-crowns[i];vec2 dir=normalize(-solar.xz);
  float along=dot(off,dir),across=length(off-dir*along);
  float reach=max(40.,tops[i]-wp.y)/max(.28,solar.y);
  shade=max(shade,exp(-across*across/830.)*smoothstep(-12.,12.,along)*(1.-smoothstep(.53*reach,reach,along)));
 }
 float canopy=smoothstep(287.,459.,abs(cameraPosition.y));
 float striae=texture2D(detail,p*vec2(.002,.025)+vec2(motion*.0005,0.)).r;
 float fringe=smoothstep(.18,.79,striae+.36*(1.-wake));
 float opacity=mix(.12*smoothstep(.36,.69,m),.985+.015*fringe,canopy)*(1.-wake*.15*(1.-fringe));
 float fleece=texture2D(detail,p*vec2(.0019,.0034)+vec2(motion*.00049,.35)).r;
 float fluff=texture2D(detail,p*vec2(.005,.0085)+vec2(motion*.00061,.71)).r;
 float dusk=1.-night;
 vec3 bottom=mix(vec3(.14,.22,.31),vec3(.47,.35,.40),twilight);
 vec3 lit=mix(vec3(.94,.98,.96),vec3(1.68,1.06,.58),twilight);
 vec3 c=mix(bottom,lit,clamp(.60+crest+(m-.46)*.92,0.,1.))*mix(.16,1.,dusk);
 c*=.94+.13*smoothstep(.32,.66,.75*fleece+.25*fluff);
 float shadow=exp(-dot((p-envelope.xz-(-solar.xz*(envelope.y-wp.y)/max(.28,solar.y)))/vec2(147.,54.),(p-envelope.xz-(-solar.xz*(envelope.y-wp.y)/max(.28,solar.y)))/vec2(147.,54.)));
 c*=1.-shadow*(.54+.13*fleece);c*=1.-.34*shade-.12*wake;c+=vec3(.20,.21,.195)*wake*fringe;c+=vec3(1.4,.44,.09)*flash*exp(-length(p-vec2(7000.,2450.))*.00054);
 gl_FragColor=vec4(mix(c,mist,.34*smoothstep(1300.,7500.,distance(cameraPosition,wp))),opacity*cover);}`,{uniforms:cloudUniforms,side:THREE.DoubleSide,transparent:true,depthWrite:false}));
clouds.frustumCulled=false;clouds.renderOrder=3;
updates.push(t=>{cloudUniforms.envelope.value.copy(sail.position);clouds.visible=t>=25.8&&t<=34;cloudUniforms.cover.value=phase(25.8,27.1,t)*(1-phase(32.8,34,t));});

// Wisps curling off the crowns have finite thickness above the denser sheet.
const wispMat=material(atmosphere+`
 uniform vec2 crowns[14];uniform float cover;varying vec2 st;varying float seed,alpha;
 void main(){
 float id=float(gl_InstanceID),j=mod(id,9.);seed=cellHash(vec2(id,3.2));
 vec2 foot=crowns[int(id/9.)];float a=j*2.39996+motion*.028;
 vec3 p=vec3(foot.x+cos(a)*(27.+12.*seed)+j*3.,415.+7.*seed,foot.y+sin(a)*27.);
 vec4 eye=viewMatrix*vec4(p,1.);eye.xy+=position.xy*vec2(37.+56.*seed,5.+6.*seed);
 st=uv;alpha=cover;gl_Position=projectionMatrix*eye;}`,atmosphere+`
 varying vec2 st;varying float seed,alpha;
 void main(){float n=texture2D(detail,st*vec2(1.4,.69)+seed+motion*.0007).r;
 vec2 v=st-.5;v.y+=(n-.5)*.57;float soft=1.-smoothstep(.04,.5,length(v));
 gl_FragColor=vec4(.91,.96,1.02,.42*alpha*soft*smoothstep(.24,.62,n));}`,
 {uniforms:cloudUniforms,transparent:true,depthWrite:false});
const crownWisps=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),wispMat,14*9);
crownWisps.frustumCulled=false;crownWisps.renderOrder=4;scene.add(crownWisps);
updates.push(()=>crownWisps.visible=clouds.visible);
