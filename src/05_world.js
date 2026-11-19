// Metres, Y up, the waterfront near Z = 0. No scene object advances its own clock.
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(42,2.38,.7,16000);
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const tau=Math.PI*2;
const clamp=x=>Math.min(1,Math.max(0,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
function rng(initial){
 let state=initial;
 return ()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};
}
const U={
 wash:{value:V(0,1000,0)},world:{value:0},motion:{value:0},revealLight:{value:0},clock:{value:0},solar:{value:V(1,0,0)},night:{value:0},twilight:{value:0},
 mist:{value:new THREE.Color()},zenith:{value:new THREE.Color()},sunTint:{value:new THREE.Color()},
 sweep:{value:-1000},flash:{value:0},veil:{value:0},extinction:{value:.0008},detail:{value:null}
};
function material(vertexShader,fragmentShader,options={}){
 return new THREE.ShaderMaterial({vertexShader,fragmentShader,uniforms:U,...options});
}
function add(geometry,mat,parent=scene){
 const mesh=new THREE.Mesh(geometry,mat);parent.add(mesh);return mesh;
}
const atmosphere=`
uniform float world,motion,sweep,flash,clock,night,twilight,extinction,revealLight;
uniform vec3 solar,mist,zenith,sunTint;
uniform sampler2D detail;
float daylight(){return smoothstep(-.075,.12,solar.y);}
float cellHash(vec2 p){
 vec3 v=fract(vec3(p.xyx)*vec3(.1031,.0973,.1099));v+=dot(v,v.yzx+33.33);
 return fract((v.x+v.y)*v.z);
}
// Shared by the visible sky, glass and water beyond the mirror footprint.
vec3 skylight(vec3 r){
 float height=clamp(r.y,0.,1.);
 float cosine=clamp(dot(r,solar),-1.,1.);
 float air=exp(-(3.85+2.0*revealLight)*pow(height,.71));
 float coastal=max(.83*smoothstep(35.,36.49,clock),smoothstep(35.9,38.25,clock))*(1.-smoothstep(40.3,43.5,clock));
 vec3 horizon=mist*(1.09+.13*daylight());
 air=mix(air,exp(-abs(r.y)*65.),coastal);
 vec3 result=mix(zenith,horizon,air);
 float aureole=exp((cosine-1.)*9.)+.43*exp((cosine-1.)*88.);
 float lit=smoothstep(-.125,.018,solar.y);
 result+=sunTint*aureole*(.19+.55*twilight)*lit;
 result+=vec3(.069,.040,.021)*night*exp(-8.*abs(r.y-.045))*pow(max(0.,-r.z),2.);
 float afterglow=smoothstep(35.9,38.25,clock)*(1.-smoothstep(40.3,43.5,clock));
 result+=vec3(.105,.033,.012)*exp(-abs(r.y-.002)*138.)*afterglow;
 return result;
}
// Mean density along the finite line of sight through an exponential height field.
vec3 aerial(vec3 c,vec3 p){
 vec3 delta=p-cameraPosition;float d=max(length(delta),.001);
 float a=abs(cameraPosition.y)/154., b=max(0.,p.y)/154., dh=b-a;
 float column=abs(dh)<.012?exp(-.5*(a+b)):(exp(-a)-exp(-b))/dh;
 float trans=exp(-min(12.,max(0.,d-110.)*extinction*(.23+.77*column)));
 vec3 blue=mix(vec3(.40,.57,.71),vec3(.061,.099,.164),night);
 float distanceBlue=.44*(1.-exp(-d*.00078));
 vec3 air=mix(mist,blue,distanceBlue);
 float front=length(p.xz-vec2(1700.,-1400.))+p.y*.92-sweep;
 float wave=(exp(-abs(front)*.015)+.27*exp(-abs(front+77.)*.010))*exp(-max(0.,p.y)*.008);
 float cloud=smoothstep(27.4,28.45,clock)*(1.-smoothstep(31.6,32.5,clock))*(1.-smoothstep(408.,462.,p.y));
 vec3 color=mix(air,c+wave*vec3(3.70,1.41,.20),trans);
 vec2 street=abs(mod(p.xz+vec2(56.,46.),vec2(112.,92.))-vec2(56.,46.));
 float pools=exp(-min(street.x,street.y)*.062)*(.62+.38*cos(p.x*.033+p.z*.087));
 color+=night*vec3(.77,.31,.085)*(.16+pools)*exp(-max(p.y,0.)/38.)*exp(-length(p.xz-vec2(0.,-460.))/1200.);
 return mix(color,vec3(.69,.75,.78),cloud*.96);
}
`;
const A=Object.freeze({rectenna:V(2790,0,-1280),sun:V(1700,0,-1400),pad:V(7000,0,2450),recovery:V(3820,0,1590),cloud:V(0,420,0),float:V(-420,0,420),final:V(-160,34,1000),seawall:V(0,0,0),mangrove:V(-200,0,140),
 gate:V(0,0,10),canal:V(-180,0,-1250),village:V(-220,0,-300),street:V(70,0,-300),
 core:V(0,0,-650),hub:V(140,0,-380),grow:V(-260,0,-760),maglev:V(620,0,28),
 vport:V(-700,0,60),link:V(-1500,0,300),port:V(1200,0,80)});
function railCoastZ(x){return 110-.82*x}
const updates=[];
let Y=2026;
const era=()=>clamp((Y-2026)/20);
function adoptionYear(){
 const f=era();return 2026+20*(.24*f+.76*Math.pow(f,2.35));
}
const phase=(a,b,v)=>smooth((v-a)/(b-a));
U.year={value:Y};U.overlay={value:0};
// The two orthographic maps share the same sun, expressed in world space so
// reflected buildings receive the same shadow as their direct view.
for(const suffix of ['Near','Far']){
 U['shadow'+suffix]={value:null};U['sunVP'+suffix]={value:new THREE.Matrix4()};
}
const penumbra=`
uniform sampler2D shadowNear,shadowFar;
uniform mat4 sunVPNear,sunVPFar;
float filteredDepth(sampler2D map,vec3 p,float bias){
 vec2 texel=1./vec2(textureSize(map,0));float sum=0.;
 for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
  sum+=step(p.z-bias,texture2D(map,p.xy+vec2(x,y)*texel*1.35).r);
 }return sum/9.;
}
float sunlightAt(vec3 p,vec3 n){
 if(solar.y<.006)return 1.;
 vec3 a=(sunVPNear*vec4(p,1.)).xyz*.5+.5,b=(sunVPFar*vec4(p,1.)).xyz*.5+.5;
 float slope=1.-max(dot(n,solar),0.);
 float farLight=1.;
 if(all(greaterThan(b,vec3(.002)))&&all(lessThan(b,vec3(.998))))farLight=filteredDepth(shadowFar,b,.00036+.00065*slope);
 float edge=max(max(abs(a.x-.5),abs(a.y-.5)),abs(a.z-.5));
 if(edge>=.495)return farLight;
 return mix(filteredDepth(shadowNear,a,.00014+.00032*slope),farLight,smoothstep(.44,.495,edge));
}`;
