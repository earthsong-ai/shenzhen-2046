// Geometry is built in metres around a prototype's local origin. UVs measure
// distance along a wall and height above ground, not fractions of the mesh.
const GLASS=0,STONE=1,BRASS=2,PLANTER=3,LAMP=4;
class FacadeGeometry{
 constructor(){this.pos=[];this.nor=[];this.uv=[];this.info=[];this.index=[]}
 quad(a,b,c,d,finish,occlusion=1,vertical=true){
  const start=this.pos.length/3;
  const n=b.clone().sub(a).cross(d.clone().sub(a)).normalize();
  const m=c.clone().sub(b).cross(d.clone().sub(b)).normalize();
  for(const [i,p] of [a,b,c,d].entries()){
   this.pos.push(...p.toArray());this.nor.push(...(i===2?m:n).toArray());
   this.info.push(finish,occlusion);
  }
  const width=a.distanceTo(b),lo=vertical?a.y:0,hi=vertical?d.y:a.distanceTo(d);
  this.uv.push(0,lo,width,lo,width,hi,0,hi);this.index.push(start,start+1,start+2,start,start+2,start+3);
 }
 walls(bottom,top,finish,ao=1){
  bottom.forEach((p,i)=>{const j=(i+1)%bottom.length;this.quad(p,bottom[j],top[j],top[i],finish,ao)});
 }
 lid(ring,finish,down=false){
  const points=down?[...ring].reverse():ring;
  const center=points.reduce((sum,p)=>sum.add(p),V(0,0,0)).multiplyScalar(1/points.length);
  for(let i=0;i<points.length;i+=2)
   this.quad(center,points[i],points[(i+1)%points.length],points[(i+2)%points.length],finish,down?.62:1,false);
 }
 bake(){
  const g=new THREE.BufferGeometry();
  for(const [key,data,size] of [['position',this.pos,3],['normal',this.nor,3],['uv',this.uv,2],['finish',this.info,2]])
   g.setAttribute(key,new THREE.Float32BufferAttribute(data,size));
  g.setIndex(this.index);return g;
 }
}
function rim(x,y,z,w,d,turn=0){
 const poly=[[-.71,-1],[-1,-.67],[-1,.65],[-.74,1],[.72,1],[1,.68],[1,-.71],[.69,-1]];
 const c=Math.cos(turn),s=Math.sin(turn);
 return poly.map(([a,b])=>V(x+a*w*c-b*d*s,y,z+a*w*s+b*d*c));
}
function solid(g,x,y,z,w,d,h,finish,angle=0){
 const lower=rim(x,y,z,w,d,angle),upper=rim(x,y+h,z,w,d,angle);
 g.walls(lower,upper,finish);g.lid(upper,finish===GLASS?STONE:finish);
}
const facadeVertex=`
 attribute vec3 lotData; uniform float year;varying float built,localY,oldTower,finishFamily;attribute vec2 finish;varying vec3 wp,norm;varying vec2 panel,surface;varying float variation;
 void main(){vec4 world=instanceMatrix*vec4(position,1.);wp=world.xyz;
 norm=mat3(instanceMatrix)*(normal/vec3(dot(instanceMatrix[0].xyz,instanceMatrix[0].xyz),
 dot(instanceMatrix[1].xyz,instanceMatrix[1].xyz),dot(instanceMatrix[2].xyz,instanceMatrix[2].xyz)));
 oldTower=step(lotData.x,2026.);finishFamily=lotData.z;
 built=(oldTower>.5||year>=lotData.x+3.8)?400.:floor(clamp((year-lotData.x)/3.8,0.,1.)*80.)*4.;
 localY=position.y;
 panel=uv*vec2(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz));surface=finish;
 variation=instanceColor.r;gl_Position=projectionMatrix*viewMatrix*world;}`;
const facade=material(facadeVertex,atmosphere+penumbra+`
 uniform samplerCube skyEnv;uniform float year;varying float built,localY,oldTower,finishFamily;varying vec3 wp,norm;varying vec2 panel,surface;varying float variation;
 float joint(float x,float thickness){
  float w=max(fwidth(x),.002);return (1.-smoothstep(thickness,thickness+w,abs(fract(x+.5)-.5)))*(1.-smoothstep(.29,.92,w));
 }
 void main(){
 if(localY>built+.01||built<1.)discard;
 vec3 n=normalize(norm),eye=normalize(cameraPosition-wp);float sun=max(dot(n,solar),0.);
 float lit=sunlightAt(wp,n);float direct=daylight()*sun*lit;float top=max(n.y,0.);float seed=variation*96.;
 vec3 c;
 if(surface.x<.5){
  vec2 grid=panel/vec2(3.16,4.05);
  vec2 id=floor(grid)+floor(seed*vec2(7.,9.));float room=cellHash(id),floorNoise=cellHash(vec2(id.y,seed));
  float profile=max(joint(grid.x,.024),joint(grid.y,.047));
  float service=joint(grid.y/6.,.019);
  vec3 r=reflect(-eye,n);
  // A slightly bowed outer pane shifts the reflection across a single bay.
  r.y+=.018*sin((fract(grid.x)-.5)*3.14159)*(1.-smoothstep(.17,.73,fwidth(grid.x)));
  float fres=pow(1.-max(0.,dot(eye,n)),3.);
  float ridge=-.09+.12*sin(r.x*11.+seed)+.075*cos(r.z*22.-seed);
  float glazing=smoothstep(ridge-.035,ridge+.08,r.y);
  vec3 glass=mix(vec3(.027,.069,.079)*(1.-night*.73),textureCube(skyEnv,normalize(r)).rgb*vec3(.55,.74,.80),.14+.77*glazing);
  float retrofit=smoothstep(.24+room*.48,.32+room*.48,(year-2026.)/20.);
  c=glass*(.40+.39*fres+.13*room)*(.47+.91*direct)*mix(vec3(1.),vec3(.97,1.19,1.28),retrofit*oldTower);
  vec3 enamel=mix(vec3(.27,.49,.52),vec3(.55,.76,.80),glazing);
  if(finishFamily>.5){
   if(finishFamily<1.5)enamel=vec3(.68,.82,.84)*(.71+.40*glazing);
   else if(finishFamily<2.5)enamel=mix(vec3(.51,.115,.043),vec3(.69,.32,.13),glazing);
   else if(finishFamily<3.5)enamel=vec3(.065,.42,.27)*(.70+.50*glazing);
   else if(finishFamily<4.5)enamel=vec3(.045,.46,.58)*(.65+.54*glazing);
   else enamel=vec3(.72,.64,.47)*(.78+.34*glazing);
  }
  if(finishFamily>.5){
   c*=.58;
   float aspect=.67+.39*max(0.,dot(n,normalize(vec3(.68,.22,.71))));
   enamel*=aspect;
   if(abs(finishFamily-5.)<.4)enamel*=mix(vec3(.55,.71,.80),vec3(.93,.88,.66),glazing);
  }
  c+=enamel*retrofit*(.51+.64*direct+.05*revealLight)*(1.-night);
  float scaleGlint=cellHash(floor(grid/vec2(2.,3.))+seed);
  c+=retrofit*(1.-night)*glazing*(.03+.13*pow(scaleGlint,6.))*mix(vec3(.48,.90,.96),vec3(.98,.79,.51),scaleGlint);
  if(oldTower>.5)c+=vec3(.19,.166,.132)*(1.-retrofit)*daylight()*(.15+direct);
  vec2 panelGroup=floor(grid/vec2(3.,4.));
  vec2 scaleCell=floor(panel/1.5);vec2 plateUV=fract(panel/1.5)-.5;
  float deployed=smoothstep(.03,.42,dot(n,solar))*retrofit;
  vec3 aimed=normalize(mix(n,solar,.53*deployed));
  float cant=(cellHash(scaleCell+seed)-.5)*.060*retrofit;
  float seam=smoothstep(.39,.49,max(abs(plateUV.x),abs(plateUV.y)))*(1.-smoothstep(.22,.88,fwidth(panel.x/1.5)));
  c*=1.-seam*deployed*.24;
  vec3 panelRay=reflect(-eye,normalize(aimed+vec3(cant,.085*plateUV.y*deployed,-cant)));
  float highlight=pow(max(dot(panelRay,solar),0.),82.);
  c+=vec3(.10,.17,.185)*retrofit*pow(max(dot(panelRay,normalize(vec3(-.4,.56,.71))),0.),12.);
  c+=vec3(1.3,.60,.20)*flash*pow(max(dot(r,normalize(vec3(7000.,90.,2450.)-wp)),0.),50.);
  c+=sunTint*highlight*(.56+1.44*fres)*daylight()*lit;
  float bay=cellHash(vec2(floor(grid.x/3.),floor(grid.y/2.))+seed);
  // A building keeps its use on every facade. Active floors share a
  // circuit; adjacent rooms on those floors may still be switched off.
  float residential=finishFamily>.5?step(1.5,finishFamily)*(1.-step(3.5,finishFamily))+step(4.5,finishFamily):step(.38,variation);
  float circuit=cellHash(vec2(floor(wp.y/4.05),floor(seed*9.)));
  float occupied=step(mix(.65,.16,residential),circuit)*step(mix(.14,.10,residential),bay);
  float power=night*occupied*(.42+.39*bay+.19*room);
  vec2 st=fract(grid);vec2 aa=clamp(fwidth(grid),.012,.24);
  vec2 interior=smoothstep(vec2(.10,.20)-aa,vec2(.10,.20)+aa,st)*(1.-smoothstep(vec2(.88,.81)-aa,vec2(.88,.81)+aa,st));
  float diffuseRoom=mix(interior.x*interior.y,.46,smoothstep(.22,.85,max(fwidth(grid.x),fwidth(grid.y))));
  c*=1.-.83*night;
  c+=mix(vec3(.88,1.24,1.55),mix(vec3(.93,.52,.245),vec3(1.75,1.09,.57),floorNoise),residential)*power*diffuseRoom;
  float spine=joint(grid.x/4.,.017),belt=joint(grid.y/9.,.018);
  c=mix(c,vec3(.40,.37,.29)*(.19+.83*direct)*(1.-.84*night),max(spine,belt)*.82);
  c+=vec3(.85,.50,.23)*night*step(.68,variation)*(1.-smoothstep(.5,1.6,abs(localY-318.)));

  vec3 metal=mix(vec3(.26,.29,.28),vec3(.94,.98,.94),retrofit)*(.41+.89*direct)*(1.-.79*night);
  c=mix(c,metal,profile*.78);c=mix(c,metal*1.29,service*.63);
 }else{
  vec3 base=surface.x<1.5?vec3(.59,.60,.52):surface.x<2.5?vec3(.55,.39,.20):vec3(.105,.217,.104);
  if(finishFamily>.5){
   if(surface.x<1.5)base=vec3(1.20,1.20,1.10);
   else if(surface.x<2.5)base=abs(finishFamily-2.)<.4?vec3(.98,.37,.16):vec3(.91,.75,.51);
   else base=vec3(.11,.39,.105);
  }
  float grain=texture2D(detail,wp.xz*.048+wp.y*.027).r;
  c=base*(.80+.34*grain)*((.30+.26*top)*(1.-.80*night)+sunTint*direct*.78);
  if(surface.x>3.5)c=vec3(1.54,.85,.39)*(.13+.92*night);
 }
 if(finishFamily>.5){
  float crown=smoothstep(302.,318.,localY);
  float trim=step(.5,surface.x)*(1.-step(2.5,surface.x));
  vec3 rimColor=mix(vec3(.53,.79,.91),vec3(1.15,.66,.31),step(1.5,finishFamily)*step(finishFamily,3.5));
  c+=night*trim*rimColor*(crown*(.22+.64*pow(1.-abs(dot(n,eye)),2.))+.16*step(1.5,surface.x));
 }
 float foot=.76+.24*smoothstep(0.,47.,wp.y);gl_FragColor=vec4(aerial(c*surface.y*foot,wp),1.);
 }`,{side:THREE.DoubleSide});
function makeTower(kind){
 const g=new FacadeGeometry(),trees=[];
 const h=320,w=31,d=24;
 function plant(p,scale){trees.push([p,scale])}
 function terrace(x,y,z,width,depth,angle=0){
  const lower=rim(x,y-2.2,z,width,depth,angle),upper=rim(x,y,z,width,depth,angle);
  g.walls(lower,upper,STONE);g.lid(lower,STONE,true);g.lid(upper,PLANTER);
  for(let i=0;i<8;i++){
   const p=upper[i].clone().lerp(upper[(i+1)%8],.36);plant(p,3.2+(i%3)*.64);plant(upper[i].clone().lerp(upper[(i+1)%8],.74),2.94);
  }
 }
 if(kind==='existing'){
  solid(g,0,0,0,w,d,h,GLASS);solid(g,0,h,0,w*.81,d*.79,4,STONE);
 }else if(kind==='fork'){
  const branch=(s,u)=>rim(s*(7+21*smooth(u)),h*(.29+.71*u)-(s>0?u*20:0),u*5,
    (16-6*u)*(1+.08*Math.cos(u*tau)),d*(.94-.48*u),s*u*.38);
  solid(g,0,0,0,w*.90,d,h*.30,GLASS);
  for(const s of [-1,1]){
   for(let j=0;j<15;j++){
    const a=branch(s,j/15),b=branch(s,(j+1)/15);g.walls(a,b,GLASS);
    for(const k of [1,4])g.quad(a[k],a[k].clone().lerp(a[k+1],.14),b[k].clone().lerp(b[k+1],.14),b[k],BRASS);
    if(j%5===4){g.lid(b,PLANTER);for(let k=0;k<8;k+=2)plant(b[k],3.1)}
   }
   const tip=branch(s,1);g.lid(tip,PLANTER);for(const p of tip)plant(p,3.1);
  }
  solid(g,0,h*.70,2,25,5,4.1,STONE);
 }else if(kind==='twist'){
  const section=(f,extra=0)=>rim(8*f*f,h*f,0,w*(1-.31*f-.32*Math.sin(Math.PI*f))+extra,d*(1-.24*f-.23*Math.sin(Math.PI*f))+extra,1.66*f);
  for(let i=0;i<32;i++){
   const a=section(i/32),b=section((i+1)/32);g.walls(a,b,GLASS);
   for(let k=0;k<8;k+=2){
    const j=(k+1)%8;
    g.quad(a[k],a[k].clone().lerp(a[j],.045),b[k].clone().lerp(b[j],.045),b[k],BRASS);
   }
   if(i%6===5){
    const lip=section((i+1)/32,2);g.walls(section((i+1)/32-.007,2),lip,PLANTER);
    for(let k=0;k<8;k++)plant(lip[k],2.85);
   }
  }
  g.lid(section(1),STONE);terrace(8,h+.5,0,18,18,.92);
 }else if(kind==='vent'){
  const profile=(f,extra=0)=>rim(0,h*f,0,w*(1-.13*f)+extra,d*(1-.17*f)+extra);
  const left=profile(.45),top=profile(.75);
  g.walls(profile(0),left,GLASS);g.lid(left,STONE);
  // The gap is open all the way through the tower. Its sill, reveals and
  // soffit have geometry so the negative space also reads in reflection.
  for(const sign of [-1,1]){
   const foot=rim(sign*21,h*.45,0,9.5,d*.93),head=rim(sign*20,h*.75,0,8.8,d*.88);
   g.walls(foot,head,GLASS);
   g.walls(rim(sign*21,h*.45,0,9.8,d*.94),rim(sign*21,h*.45+1.6,0,9.8,d*.94),BRASS);
  }
  g.lid(top,STONE,true);g.walls(top,profile(1),GLASS);g.lid(profile(1),STONE);
  g.walls(profile(.746,.65),profile(.751,.65),LAMP);
  terrace(0,h+.5,0,w*.90,d*.89);
 }else if(kind==='terrace'){
  for(let i=0;i<9;i++){
   const f=i/9,x=6*Math.sin(3.8*f),z=9*f,r=w*(1-.54*f),depth=d*(1-.43*f);
   solid(g,x,h*f,z,r,depth,h/9,GLASS);terrace(x,h*(i+1)/9,z,r+3.3,depth+3.3);
  }
 }else throw Error('Unknown tower form '+kind);
 solid(g,0,0,0,w*1.35,d*1.27,8.4,STONE);
 solid(g,0,8.4,0,w*1.26,d*1.18,10,GLASS);
 return {geometry:g.bake(),trees};
}
