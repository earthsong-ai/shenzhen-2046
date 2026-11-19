// Narrow public garden between the canal and the four-lane street.
landMat.fragmentShader=landMat.fragmentShader.replace('vec3 c=base',`
 if(wp.x>canalEast&&wp.x<49.&&wp.z> -525.&&wp.z< -35.&&kind>2.5){
  float path=1.-smoothstep(1.8,2.25,abs(wp.x-(13.+11.*sin(wp.z*.029))));
  float crossPath=1.-smoothstep(1.3,1.85,abs(mod(wp.z+wp.x*.18,55.)-27.5));
  base=mix(lawn,vec3(.54,.48,.36)*tiles,max(path,crossPath));
 }vec3 c=base`.replace('canalEast','(8.*sin(wp.z/105.)-180.*smoothstep(430.,1250.,-wp.z)+22.)'));
for(let i=0;i<57;i++){
 const z=-43-i*8.2,x=canalX(z)+(i%3?38:25)+2*Math.sin(z*.12);
 if(Math.abs(z+327)<12)continue;
 treeAt(V(x,3,z),1.55+(i%5)*.29,i*.83);
}
const maintenance=[];
function serviceUnit(x,y,z,role){
 const base=pivot(rigRoot,x,y,z),arm=pivot(base,0,1.05,0);
 part(base,'ball',[0,.77,0],[.63,.44,.78],porcelain);
 part(base,'ball',[0,1.11,-.28],[.30,.25,.34],carbon);
 for(const s of [-1,1])for(const k of [-1,1]){
  spar(base,V(s*.32,.67,k*.41),V(s*.74,.42,k*.71),.09,bronze);
  spar(base,V(s*.74,.42,k*.71),V(s*.81,.04,k*.79),.08,carbon);
 }
 spar(arm,V(0,0,0),V(.5,.72,0),.105,bronze);
 spar(arm,V(.5,.72,0),V(1.12,.40,0),.084,carbon);
 part(arm,'disc',[1.16,.36,0],[.28,.11,.25],solarBlue);
 maintenance.push({base,arm,x,y,z,role});reveal(base,2031,2042);
}
for(const i of [10,33,69]){const lot=villageLots[i];serviceUnit(lot.x-4,lot.h+4,lot.z,0)}
serviceUnit(83,3.6,-414,1);serviceUnit(canalX(-253)+21,3.2,-253,2);
updates.push(t=>maintenance.forEach(({base,arm,x,z,role},i)=>{
 arm.rotation.z=(role===1?.46:-.41)+.34*Math.sin(t*1.36+i);arm.rotation.y=.45*Math.sin(t*.68+i);
 base.position.z=z+.5*Math.sin(t*.33+i);base.position.x=x+.12*Math.cos(t*.47);
}));
// Transparent tube follows the same centreline as the moving train.
const tubeCurve=new THREE.CatmullRomCurve3(Array.from({length:86},(_,i)=>railAt(15+i*32.4).add(V(0,4.6,0))));
const sleeve=add(new THREE.TubeGeometry(tubeCurve,180,5.9,12,false),material(`
 varying vec3 wp,n;void main(){wp=position;n=normal;gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);}`,
 atmosphere+`varying vec3 wp,n;uniform float year;void main(){float f=pow(1.-abs(dot(normalize(n),normalize(cameraPosition-wp))),3.);
 float rib=1.-smoothstep(.015,.049,abs(fract(wp.x/24.)-.5));
 gl_FragColor=vec4(aerial(mix(vec3(.26,.59,.65),vec3(.81,.87,.83),f+rib*.3),wp),(.11+.48*f+.40*rib)*smoothstep(2039.,2045.,year));}`,
 {transparent:true,depthWrite:false}));
updates.push(()=>sleeve.visible=adoptionYear()>2039);
// The receiving field uses the east horizon so it shares the bay composition.
function receiver(x,z,r){
 const root=pivot(rigRoot,x,0,z);part(root,'disc',[0,1,0],[r,2,r],0x485d64);
 for(let i=1;i<=6;i++)halo(root,0,2.8,0,r*i/7,0x758e91,.05);
 for(let i=0;i<18;i++){const spoke=pivot(root);spoke.rotation.y=i*tau/18;
  blitBox(spoke,0,3,r*.48,1.8,1.2,r*.89,bronze);}
 reveal(root,2040,2046);
}
receiver(A.rectenna.x,A.rectenna.z,256);
const distantPlatform=pivot(rigRoot,8110,0,-2090);
part(distantPlatform,'hex',[0,6,0],[67,12,55],carbon);reveal(distantPlatform,2041,2046);
// Reuse the quay profile at the outer berth. Its truss silhouettes frame
// the telephoto view with a nearer depth cue.
const outer=pivot(rigRoot,3150,0,1325);
blitBox(outer,-53,3,0,117,6,34,0x566360);
for(const x of [-81,-34,0]){
 for(const side of [-1,1]){
  const knee=V(x+side*5,53,-2),end=V(x+side*5,53,28);
  spar(outer,V(x+side*10,5,-6),knee,1.05,carbon);
  spar(outer,V(x+side*10,5,11),knee,1.0,carbon);
  spar(outer,knee,end,.86,bronze);spar(outer,knee,V(x+side*5,68,-13),.78,carbon);
  spar(outer,V(x+side*5,68,-13),end,.28,bronze);
 }
}
// A sloping mainland shelf meets the water below the opposite skyline.
const farCoast=new FacadeGeometry();
for(let x=2480;x<5350;x+=35){
 const coast=u=>-1820-290*Math.sin((u-2770)*.38/31)+46*Math.sin(u*.014);
 const a=V(x,-1,coast(x)+30),b=V(x+35,-1,coast(x+35)+30);
 const c=V(x+35,8,coast(x+35)-28),d=V(x,8,coast(x)-28);
 farCoast.quad(a,b,c,d,STONE);farCoast.quad(d,c,V(x+35,8,-2990),V(x,8,-2990),PLANTER);
}
add(farCoast.bake(),landMat);
for(let i=0;i<8;i++){
 const z=-32+i*9;
 blitBox(hub,26.6,29,z,.5,43,.60,bronze);blitBox(hub,0,51.5,z,53.4,1,.62,porcelain);
 blitBox(hub,-26.7,49,z,.8,3.1,6.5,solarBlue);
}
for(let i=0;i<6;i++){
 const x=-20+i*8;blitBox(hub,x,28,38.1,6.8,2.4,.32,solarBlue);
 blitBox(hub,x,32,38.1,6.8,2.4,.32,solarBlue);
 blitBox(hub,x,29.5,38.45,7.2,.21,.9,bronze);
}
