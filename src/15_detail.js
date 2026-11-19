// Tileable density, two signed slopes and fine grain are baked together. Every
// octave wraps at tile boundaries, including when the GPU samples its last mip.
function bakeWeather(seed=2046){
 const random=rng(seed),size=256;
 const octaves=[4,8,16,32,64,128].map(n=>({n,grid:Float32Array.from({length:n*n},random)}));
 const field=new Float32Array(size*size);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  let value=0,weight=1,norm=0;
  for(const {n,grid} of octaves){
   const u=x*n/size,v=y*n/size,i=Math.floor(u),j=Math.floor(v);
   const a=smooth(u-i),b=smooth(v-j),at=(dx,dy)=>grid[(j+dy)%n*n+(i+dx)%n];
   value+=weight*((1-b)*((1-a)*at(0,0)+a*at(1,0))+b*((1-a)*at(0,1)+a*at(1,1)));
   norm+=weight;weight*=.53;
  }
  field[y*size+x]=value/norm;
 }
 const bytes=new Uint8ClampedArray(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const i=y*size+x;
  bytes[i*4]=field[i]*255;
  bytes[i*4+1]=128+1250*(field[y*size+(x+1)%size]-field[y*size+(x+size-1)%size]);
  bytes[i*4+2]=128+1250*(field[((y+1)%size)*size+x]-field[((y+size-1)%size)*size+x]);
  bytes[i*4+3]=255*random();
 }
 const tex=new THREE.DataTexture(new Uint8Array(bytes.buffer),size,size);
 tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.magFilter=THREE.LinearFilter;
 tex.minFilter=THREE.LinearMipmapLinearFilter;tex.generateMipmaps=true;tex.needsUpdate=true;
 return tex;
}
U.detail.value=bakeWeather();
