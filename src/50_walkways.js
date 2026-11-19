// Place inhabited bridges between actual tower positions and keep both ends
// inside the facade. Alternating planted pockets break the line of the deck.
const linked=new Set();
for(const b of placements.filter(b=>b.x>-1000&&b.x<850&&b.z< -400)){
 if(linked.has(b))continue;
 const adjacent=placements.filter(q=>q!==b&&!linked.has(q)&&q.x>b.x&&Math.hypot(q.x-b.x,q.z-b.z)<254)
   .sort((p,q)=>Math.hypot(p.x-b.x,p.z-b.z)-Math.hypot(q.x-b.x,q.z-b.z))[0];
 if(!adjacent)continue;
 linked.add(b);linked.add(adjacent);
 const h=Math.min(b.height,adjacent.height)*(.58+.19*b.variant),len=Math.hypot(b.x-adjacent.x,b.z-adjacent.z);
 const base=pivot(rigRoot,(b.x+adjacent.x)/2,h,(b.z+adjacent.z)/2);
 const lamps=pivot(base);updates.push(()=>lamps.scale.y=Math.max(.0001,U.night.value));
 base.rotation.y=Math.atan2(adjacent.x-b.x,adjacent.z-b.z);
 blitBox(base,0,0,0,6.8,2.3,len,porcelain);blitBox(base,0,2.7,0,5.6,3.8,len,solarBlue);
 for(const s of [-1,1]){
  blitBox(base,s*3.2,4.6,0,.49,.6,len,bronze);
  blitBox(lamps,s*3.28,3.05,0,.28,1.1,len,0xffd29a,2.8);
  for(let z=-len/2+9;z<len/2-7;z+=13){
   spar(base,V(s*3.2,.8,z),V(s*3.2,4.6,z+6.5),.28,porcelain);
   part(base,'ball',[s*3.2,2.4,z],[2.35,1.4,3.3],moss);
  }
 }
 reveal(base,Math.max(2034,b.birth,adjacent.birth)+2,2046);
}
