function worldTime(t){
 const x=clamp((t-40)/3.5);
 return t+172.5*x*x*x*(x*(6*x-15)+10);
}
const Film=Object.freeze({DUR:48,W:worldTime,T:Object.freeze({Y2026:0.0,LAPSE:1.2,IGNITE:6.0,Y2046:8.0,FLOAT:9.5,SHORE:11.5,GATE:14.0,STREET:14.5,MIRROR:19.5,MIRROR_OFF:23.5,BUILD:23.5,SLOT:26.5,CLOUD:27.3,CROWN:28.5,SUN:31.5,LAND:36.8,LIFTOFF:38.0,NIGHT:40.0,PANO:43.5,DIM:47.0})});
const T=Film.T;
function spline(rows){
 const slopes=rows.slice(1).map((r,i)=>r.slice(1).map((v,j)=>(v-rows[i][j+1])/(r[0]-rows[i][0])));
 const tangents=rows.map((r,i)=>r.slice(1).map((_,j)=>{
  if(i===0)return slopes[0][j];if(i===rows.length-1)return slopes[i-1][j];
  const a=slopes[i-1][j],b=slopes[i][j];if(a*b<=0)return 0;
  const h=r[0]-rows[i-1][0],k=rows[i+1][0]-r[0];return 3*(h+k)/((2*k+h)/a+(k+2*h)/b);
 }));
 return t=>{let i=0;while(i<rows.length-2&&rows[i+1][0]<t)i++;
 const h=rows[i+1][0]-rows[i][0],u=clamp((t-rows[i][0])/h),q=u*u;
 return rows[i].slice(1).map((v,j)=>(1-3*q+2*q*u)*v+(3*q-2*q*u)*rows[i+1][j+1]+h*(q*u-2*q+u)*tangents[i][j]+h*(q*u-q)*tangents[i+1][j]);};
}
const route=spline([[0,-160,34,1000,36],[1.2,-160,34,1000,36],[8,-160,34,1000,36],[9.5,-260,20,560,40],[11,-300,16,400,40],[12.5,-120,5,200,38],[14,0,12,20,40],[16.5,-7,34,-171,47],[17.5,-6,42,-225,48],[19.5,5,66,-412,46],[23.5,-40,170,-600,44],[25.5,-160,250,-670,42],[27,-300,330,-680,40],[28.5,-280,500,-620,34],[31,-60,540,-520,34],[32.5,300,420,-300,40],[34.5,636,260,-65,40],[36.5,500,150,400,40],[38,200,90,700,40],[40,-60,60,880,38],[43.5,-160,34,1000,36],[46,-160,34,1000,36],[48,-166,34,1006,36]]);
const looks=[[0,120,300,-500],[8,120,300,-500],[9.5,-386,9,410],[10.4,-380,9,365],[11.5,-98,9,146],[12.5,-58,8,110],[14,7,19,-164],[16.5,1,24,-423],[17.5,-12,18,-393],[19.5,38,46,-689],[21.5,138,59,-405],[23.5,-218,210,-735],[25.5,-260,300,-760],[26.5,-260,325,-746],[27.3,-245,443,-860],[28.5,-65,490,-1390],[29.5,23,491,-1420],[31,114,503,-1400],[32.5,1420,117,-990],[34.5,1650,65,-1290],[35.55,3820,84,1590],[36.5,3820,70,1590],[38,7000,53,2450],[39.6,7000,65,2450],[40,7000,76,2450],[43.5,120,300,-500],[46,120,300,-500],[48,120,300,-500]];
let az;
const gaze=spline(looks.map(([t,x,y,z])=>{
 const [cx,cy,cz]=route(t);let a=Math.atan2(x-cx,z-cz);
 if(az!==undefined){while(a-az>Math.PI)a-=tau;while(a-az< -Math.PI)a+=tau}
 az=a;return[t,a,Math.atan2(y-cy,Math.hypot(x-cx,z-cz))];
}));
const sunPath=spline([[8,4,0],[14,18,22],[19.5,35,45],[23.5,50,90],[28.5,22,134],[31,22,135],[34.5,10,180],[36.5,3,180],[38,-2,180],[40,-6,180],[43.5,-10,180],[48,-10,180]]);
function filmAt(t,overrideYear){
 U.clock.value=t;U.world.value=worldTime(t);const f=clamp((t-T.LAPSE)/(T.Y2046-T.LAPSE));
 Y=overrideYear??(2026+20*(.61*f+.39*f*f));U.year.value=adoptionYear();
 if(t<T.Y2046){
  const sway=Math.sin(f*20*tau),alt=10+phase(0,.14,f)*(15+8*Math.sin(tau*f)+1.45*sway);
  const dawn=alt+(-3-alt)*phase(.81,.975,f);setSun(dawn+(4-dawn)*phase(.977,1,f),phase(0,.18,f)*(36+5*sway)*(1-phase(.8,1,f)));
 }else setSun(...sunPath(t>40&&t<43.5?40+3.5*(worldTime(t)-40)/176:t));
 const clear=.22*era()+.78*phase(2038,2045,Y);
 // Cyclic traffic and weather sample representative days in the opening twenty-year lapse.
 U.motion.value=U.world.value-(t<8?480*(1-smooth(f)):0);
 U.extinction.value*=.39-.26*clear;
 U.zenith.value.lerp(new THREE.Color(.41,.46,.49),.39*(1-clear));
 U.mist.value.lerp(new THREE.Color(.69,.69,.67),.35*(1-clear));
 const morning=phase(6.45,8,t)*(1-phase(8,12.8,t))*Math.exp(-.25*Math.max(0,t-8))*clear;
 U.revealLight.value=morning;
 U.mist.value.lerp(new THREE.Color(.51,.78,1.13),morning);
 U.zenith.value.lerp(new THREE.Color(.091,.36,.87),morning);
 U.sunTint.value.lerp(new THREE.Color(1.56,1.45,1.16),morning);
 const coastalDusk=Math.max(.83*phase(35,36.49,t),phase(35.9,38.25,t))*(1-phase(40.3,43.5,t));
 U.mist.value.lerp(new THREE.Color(.097,.105,.166),.97*coastalDusk);
 U.zenith.value.lerp(new THREE.Color(.018,.034,.115),coastalDusk);
 U.extinction.value*=1-.63*coastalDusk;
 U.sweep.value=t<T.IGNITE||t>7.42||Y<2036?-1000:1860*(1-Math.exp(-16*(t-T.IGNITE)))+1510*(t-T.IGNITE);
 U.veil.value=phase(T.CLOUD-.31,T.CLOUD+.02,t)*(1-phase(T.CLOUD+.36,T.CROWN-.28,t))+.65*phase(31.95,32.41,t)*(1-phase(32.5,32.95,t));
 U.flash.value=phase(37.3,37.94,t)/(1+(flightPose(U.world.value-38).height/165)**2);
 U.overlay.value=phase(T.MIRROR,T.MIRROR+.6,t)*(1-phase(T.MIRROR_OFF-.35,T.MIRROR_OFF,t));
 const viewTime=t<=T.Y2046||(t>=T.PANO&&t<=46)?0:t;
 const [x,y,z,fov]=route(viewTime),[a,p]=gaze(viewTime);
 const streetLift=phase(15.1,17.35,t)*(1-phase(18.1,19.55,t));
 camera.position.set(THREE.MathUtils.lerp(x,canalX(z),streetLift),y+9*streetLift,z);
 // The offshore tracking move approaches on the water side of the outer berth.
 const offshore=phase(34.5,35,t)*(1-phase(40,40.96,t));
 const launchMove=phase(36.9,37.3,t);
 const landingDolly=phase(35,36.35,t),offshoreX=1000+1670*landingDolly;
 // The sightline clears the boom tip at the far left throughout the dolly.
 const craneEdgeZ=1351+.080*(3150-offshoreX);
 const landingZ=1590+(craneEdgeZ-1590)*(3820-offshoreX)/670;
 camera.position.lerp(V(offshoreX,64-28*landingDolly-28*launchMove,
   THREE.MathUtils.lerp(landingZ,1690,launchMove)),offshore);
 const vista=phase(40,40.96,t)*(1-phase(42.6,43.5,t));
 camera.position.lerp(V(-1650,39,2200),vista);
 const recovery=phase(34.57,34.96,t)*(1-phase(36.8,37.29,t));
 const launch=phase(36.9,37.3,t)*(1-phase(40,40.78,t));
 camera.near=.7+7*Math.max(recovery,launch);grade.uniforms.clipNear.value=camera.near;
 camera.fov=fov+5.6*(1-phase(8,9.5,t))-9*phase(32.55,34.45,t)*(1-phase(34.55,35.46,t));
 const baseDirection=V(Math.sin(a)*Math.cos(p),Math.sin(p)-.064*streetLift,Math.cos(a)*Math.cos(p)).normalize();
 const direction=baseDirection.clone();
 if(recovery>0){
  const land=arrival(U.world.value);
  direction.lerp(A.recovery.clone().add(V(land.drift,36+land.height,0)).sub(camera.position).normalize(),recovery).normalize();
  camera.fov*=Math.pow(4.1/camera.fov,phase(34.91,35.35,t)*(1-phase(36.8,36.91,t)));
 }
 if(launch>0){
  const focus=flightPose(U.world.value-38).p.add(V(0,27,3));
  direction.lerp(focus.sub(camera.position).normalize(),launch).normalize();
  camera.fov*=Math.pow(1.5/camera.fov,launch);
 }
 if(vista>0){
  const yaw=55*Math.PI/180,pitch=22*Math.PI/180;
  direction.lerp(V(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch)),vista).normalize();
  camera.fov+=(58-camera.fov)*vista;
 }
 camera.lookAt(camera.position.clone().add(direction));
 const rumble=phase(38.2,38.85,t)*(1-phase(39.36,40.08,t));
 camera.rotateX(.00038*rumble*Math.sin((t-38.2)*13.5));
 camera.rotateY(.00025*rumble*Math.sin((t-38.2)*9.7));
 const assembly=phase(24.05,26,t)*(1-phase(27,28.3,t));
 if(assembly>0){
  // Drift across the open bay at the height of the sill; keep the jib in profile.
  const slide=phase(25.95,27.04,t);
  const aim=A.grow.clone().add(V(20.5,327.9,17));
  const eye=aim.clone().add(V(47-7*slide,1.,Math.sqrt(3600-(47-7*slide)**2)));
  const forward=camera.getWorldDirection(V(0,0,0));
  camera.position.lerp(eye,assembly);
  forward.lerp(aim.sub(camera.position).normalize(),assembly).normalize();
  camera.lookAt(forward.add(camera.position));
  camera.fov=THREE.MathUtils.lerp(camera.fov,20.5,assembly);
 }
 // The bay-wide lens uses cylindrical equal-area projection. Overscan supplies
 // the corner rays that a rectilinear 58-degree image would have clipped.
 const lens=grade.uniforms;
 lens.bayLens.value=vista;
 lens.lensTan.value=Math.tan(camera.fov*Math.PI/360);
 lens.aspect.value=camera.aspect;
 lens.pitch.value=Math.asin(camera.getWorldDirection(V(0,0,0)).y);
 lens.overscan.value=1+1.85*vista;
 camera.updateProjectionMatrix();
 camera.projectionMatrix.elements[0]/=1+1.08*vista;
 camera.projectionMatrix.elements[5]/=lens.overscan.value;
 // Apply the same vertical framing to both panoramic holds, for more water below the skyline.
 const panorama=1-phase(8,9.5,t)+phase(42.6,43.5,t);
 camera.projectionMatrix.elements[9]-=.055*panorama;
 camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();camera.updateMatrixWorld();
 for(const fn of updates)fn(t);
 grade.uniforms.fade.value=1-.35*phase(T.DIM,Film.DUR,t);
}
