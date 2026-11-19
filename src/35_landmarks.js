// In metres. The common facade and shadow passes use a 320-unit prototype height.
const landmarkLots=[
 {kind:'twins',x:-672,z:-472,height:520,radius:86,birth:2028.3,finish:1},
 {kind:'orchard',x:-424,z:-80,height:380,radius:89,birth:2029,finish:2},
 {kind:'parkRing',x:225,z:-374,height:300,radius:122,birth:2033,finish:3},
 {kind:'petals',x:580,z:-598,height:850,radius:77,birth:2028.1,finish:4},
 {kind:'wind',x:969,z:-82,height:600,radius:75,birth:2035,finish:5}
].map(b=>({...b,width:1,depth:1,angle:b.kind==='wind'?-.81:0,variant:b.finish*.157}));
function makeLandmark(lot){
 const g=new FacadeGeometry(),trees=[],h=lot.height;
 const ellipse=(x,y,z,rx,rz,turn=0,count=24)=>Array.from({length:count},(_,i)=>{
  const a=-tau*i/count,dx=rx*Math.cos(a),dz=rz*Math.sin(a);
  return V(x+dx*Math.cos(turn)-dz*Math.sin(turn),y,z+dx*Math.sin(turn)+dz*Math.cos(turn));
 });
 function beam(a,b,r,finish=STONE){
  const axis=b.clone().sub(a).normalize(),right=axis.clone().cross(Math.abs(axis.y)>.95?V(1,0,0):V(0,1,0)).normalize().multiplyScalar(r);
  const fore=axis.clone().cross(right);
  const ends=[a,b].map(p=>[right,fore,right.clone().negate(),fore.clone().negate()].map(d=>p.clone().add(d)));
  g.walls(...ends,finish);
 }
 function planted(points,stride,size){
  points.forEach((p,i)=>{if(i%stride===0)trees.push([p.clone(),size*(.9+.17*Math.sin(i*2.3))])});
 }
 function lip(points,depth,finish){
  g.walls(points.map(p=>p.clone().add(V(0,-depth,0))),points,finish);
 }
 if(lot.kind==='twins'){
  for(const s of [-1,1]){
   const level=u=>rim(s*(44+8*Math.sin(u*Math.PI)),u*(h-(s>0?16:0)),s*9,19-5*u,27-8*u,s*.31*u);
   for(let i=0;i<16;i++){
    const a=level(i/16),b=level((i+1)/16);g.walls(a,b,GLASS);
    for(const k of [0,2,4,6])beam(a[k],b[k],1.85);
   }
   const roof=level(1);g.lid(roof,PLANTER);planted(roof,2,3.1);
  }
  for(const u of [.32,.59,.83]){
   const y=h*u;solid(g,0,y,0,53,11,7,STONE,.15);solid(g,0,y+7,0,51,9,4,PLANTER,.15);
   for(let i=-4;i<=4;i++)trees.push([V(i*10,y+11,i*1.15),3.1]);
  }
 }else if(lot.kind==='orchard'){
  for(let i=0;i<13;i++){
   const u=i/13,a=u*2.9,w=78-38*u,d=51-24*u,x=14*Math.sin(a),z=8*Math.cos(a),y=h*u;
   const lo=rim(x,y,z,w,d,a),hi=rim(x,y+h/13,z,w*.94,d*.94,a);
   g.walls(lo,hi,GLASS);g.lid(hi,PLANTER);
   const deck=rim(x,y+h/13,z,w+6,d+6,a);lip(deck,4.4,BRASS);g.lid(deck,PLANTER);
   deck.forEach((p,j)=>{
    const q=deck[(j+1)%8],a=p.clone().lerp(q,.07),b=p.clone().lerp(q,.94);
    for(const t of [.14,.36,.58,.80])trees.push([p.clone().lerp(q,t),5.9]);
    g.quad(a,b,b.clone().add(V(0,3.5,0)),a.clone().add(V(0,3.5,0)),PLANTER);
   });
  }
 }else if(lot.kind==='parkRing'){
  for(const a of [.4,1.97,3.54,5.11]){
   const x=92*Math.cos(a),z=81*Math.sin(a);
   const bottom=rim(x*.85,0,z*.85,20,20,a),top=rim(x,h-13,z,14,14,a+.24);
   g.walls(bottom,top,GLASS);for(const k of [0,2,4,6])beam(bottom[k],top[k],1.8);
  }
  const outer=ellipse(0,h,0,127,113,0,64),inner=ellipse(0,h,0,84,70,0,64);
  lip(outer,14,STONE);lip(inner,14,BRASS);
  for(let i=0;i<64;i++){
   const j=(i+1)%64;g.quad(outer[i],outer[j],inner[j],inner[i],PLANTER);
   g.quad(...[outer[j],outer[i],inner[i],inner[j]].map(p=>p.clone().setY(h-14)),STONE);
  }
  planted(outer.map((p,i)=>p.clone().lerp(inner[i],.37)),2,4.6);
 }else if(lot.kind==='petals'){
  for(let k=0;k<3;k++){
   const section=u=>{
    const a=k*tau/3+1.42*u,r=47-15*u+12*Math.sin(u*Math.PI),w=37-19*u;
    return ellipse(r*Math.cos(a),h*u,r*Math.sin(a),w,1.22*w,a,16);
   };
   for(let i=0;i<24;i++){
    const a=section(i/24),b=section((i+1)/24);
    if(i<21)g.walls(a,b,GLASS);
    for(const j of [0,4,8,12])beam(a[j],b[j],i>=21?1.7:2.1,i>=21?BRASS:STONE);
    if(i===8||i===15||i===20||i===22){g.lid(b,PLANTER);lip(b,4,BRASS);planted(b,2,i<20?4.8:3.6)}
   }
  }
 }else if(lot.kind==='wind'){
  // Both reveals of the oval are modelled, joined across a deep, open throat.
  const front=24,rx=31,ry=79,cy=447;
  for(const s of [-1,1])for(let i=0;i<48;i++){
   const profile=j=>{
    const a=-Math.PI/2+Math.PI*j/48,y=cy+ry*Math.sin(a),inside=rx*Math.cos(a);
    return [V(s*inside,y,front),V(s*(53-8*j/48),y,front),V(s*(53-8*j/48),y,-front),V(s*inside,y,-front)];
   };
   const a=profile(i),b=profile(i+1);
   for(let k=0;k<4;k++)g.quad(a[k],a[(k+1)%4],b[(k+1)%4],b[k],k===3?BRASS:GLASS);
   beam(a[0],b[0],2.2,STONE);
  }
  function end(y,w){return [V(-w,y,front),V(w,y,front),V(w,y,-front),V(-w,y,-front)]}
  g.walls(end(0,40),end(cy-ry,53),GLASS);g.walls(end(cy+ry,45),end(h,30),GLASS);
  g.lid(end(h,30),PLANTER);planted(end(h,30),1,4);
  // Vertical metal fins climb the outer face and sweep around the open throat.
  for(const s of [-1,1])for(let k=0;k<3;k++){
   const spine=u=>{
    const y=h*u,oval=Math.sqrt(Math.max(0,1-((y-cy)/ry)**2));
    const x=8+11*k+7*u+(1-k*.23)*29*oval;
    return V(s*x,y,front+2.5+k*.7);
   };
   for(let j=0;j<36;j++)beam(spine(j/36),spine((j+1)/36),.82,BRASS);
  }
  for(const s of [-1,1]){beam(V(s*40,0,front),V(s*53,cy-ry,front),2);beam(V(s*45,cy+ry,front),V(s*30,h,front),2)}
 }
 const geometry=g.bake();geometry.scale(1,320/h,1);
 trees.forEach(([p])=>p.y*=320/h);
 return {geometry,trees};
}
