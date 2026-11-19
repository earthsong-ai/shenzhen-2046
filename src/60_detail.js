// A single delivery can be followed to its receiving shelf in the street shot.
const address=villageLots[7*12+11];
const parcelDrone=pivot(),parcel=pivot();
part(parcelDrone,'ball',[0,0,0],[.70,.34,.52],porcelain);
for(const x of [-1,1])for(const z of [-1,1]){
 part(parcelDrone,'disc',[x*.53,.12,z*.41],[.33,.10,.33],carbon);
}
blitBox(parcel,0,0,0,.64,.45,.52,bronze);
updates.push(t=>{
 const f=phase(15,17.7,t),depart=phase(17.7,19.8,t),landing=V(address.x+address.w*.65,address.h+.70,address.z+address.d+.82);
 parcelDrone.position.copy(landing).add(V((1-f)*17+depart*9,1.17+11*(1-f)+17*depart,(1-f)*7-depart*10));
 parcel.position.copy(t<17.7?parcelDrone.position:landing);if(t<17.7)parcel.position.y-=1.17;
 parcelDrone.scale.setScalar(0.65*Math.max(.0001,phase(2029,2037,Y)));parcel.scale.copy(parcelDrone.scale);
});
// Adjacent roofs share short, staggered delivery hops across the village alleys.
for(let i=0;i<4;i++){
 const a=villageLots[(6-i)*12+11],b=villageLots[(5-i)*12+11-i%2];
 const craft=pivot();part(craft,'ball',[0,0,0],[1.05,.43,.89],porcelain);
 for(const x of [-1,1])for(const z of [-1,1]){
  spar(craft,V(0,0,0),V(x*1.08,.15,z*.89),.1,carbon);
  part(craft,'disc',[x*1.08,.18,z*.89],[.63,.095,.63],solarBlue);
 }
 blitBox(craft,0,-.51,0,.79,.48,.61,bronze);
 updates.push(t=>{
  const f=.5-.5*Math.cos(t*.65+i*1.29),arch=Math.sin(f*Math.PI);
  craft.position.set(THREE.MathUtils.lerp(a.x+a.w*.57,b.x+b.w*.57,f),
   THREE.MathUtils.lerp(a.h,b.h,f)+5.4+arch*9,THREE.MathUtils.lerp(a.z-a.d*.35,b.z-b.d*.35,f));
  craft.scale.setScalar(.38*Math.max(.0001,phase(2031,2041,Y)));
 });
}
// One delivery crosses the canal close to the lens. The airframe is the same one-metre mesh as the fleet.
const localDelivery=deliveryGeometry(0);
const courier=add(localDelivery,material(`attribute vec3 tint;attribute float opacity;varying vec4 paint;
 void main(){paint=vec4(tint*(.52+.45*max(0.,normal.y)),opacity);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 'varying vec4 paint;void main(){gl_FragColor=paint;}',{transparent:true,side:THREE.DoubleSide}));
const routeHome=villageLots[8*12+11],routeDest=villageLots[4*12+10];
const courierPath=spline([[12,routeHome.x,routeHome.h+5,routeHome.z],[14,routeHome.x,routeHome.h+8,routeHome.z],
 [16,-35,41,-235],[17.5,-14,47.3,-237],[19.4,14,58,-245],[22,27,64,-276],[25,routeDest.x,routeDest.h+9,routeDest.z],[28,routeDest.x,routeDest.h+5,routeDest.z]]);
const courierNav=pivot();
for(const s of [-1,1])part(courierNav,'ball',[s*.47,.045,-.18],[.055,.045,.055],s<0?0xff3330:0x52ff91,2.1);
const rear=part(courierNav,'ball',[0,.07,.39],[.045,.05,.048],0xffffff,2.6);
updates.push(t=>{
 const p=courierPath(t),q=courierPath(Math.min(28,t+.08)),prev=courierPath(Math.max(12,t-.08));
 const dx=q[0]-p[0],dz=q[2]-p[2],yaw=Math.atan2(-dx,-dz);
 courier.visible=t>=12&&t<=28&&Y>=2035;
 courier.position.set(...p);courier.rotation.order='YXZ';courier.rotation.set(-.24*Math.min(1,Math.hypot(dx,dz)),yaw,
  .21*Math.tanh(dx*(p[2]-prev[2])-dz*(p[0]-prev[0])));
 courierNav.position.copy(courier.position);courierNav.quaternion.copy(courier.quaternion);
 courierNav.scale.setScalar(courier.visible?1:.0001);rear.scale.setScalar(t%1.1<.12?.055:.004);
});
