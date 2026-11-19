const canvas=document.querySelector('canvas');
const renderer=new THREE.WebGLRenderer({canvas,alpha:false,antialias:false,powerPreference:'default'});
if(!renderer.extensions.has('EXT_color_buffer_float'))throw Error('Floating point render targets require EXT_color_buffer_float');
renderer.info.autoReset=false;
let lastTime=0,lastYear, liveScale=.9, manual=false;
function fit(scale){
 const rect=canvas.getBoundingClientRect(),ratio=Math.min(1.5,window.devicePixelRatio||1);
 const width=Math.max(2,Math.round(rect.width*ratio)),height=Math.max(2,Math.round(rect.height*ratio));
 if(canvas.width!==width||canvas.height!==height)renderer.setSize(width,height,false);
 camera.aspect=width/height;
 const w=Math.max(2,Math.round(width*scale)),h=Math.max(2,Math.round(height*scale));
 beauty.setSize(w,h);mirrorTarget.setSize(Math.ceil(w*.45),Math.ceil(h*.45));
 pyramid.forEach((level,i)=>level.setSize(Math.max(1,w>>(i+1)),Math.max(1,h>>(i+1))));
}
function draw(t,scale,year){
 lastTime=t;lastYear=year;
 // Sample the overscanned bay lens more densely before the final projection.
 fit(scale*(t>=40.34&&t<=43.21?1.54:1));
 filmAt(t,year);
 renderer.info.reset();castSun(renderer);probeCamera.update(renderer,probeScene);drawMirror(renderer);
 renderer.setRenderTarget(beauty);renderer.render(scene,camera);composite(renderer);
 return renderer.info.render.calls;
}
window.Film=Film;
Object.defineProperty(window,'Y',{get:()=>Y});
window.renderAt=function(t,year){
 if(!Number.isFinite(t))throw new TypeError('Expected seconds');
 if(year!==undefined&&!Number.isFinite(year))throw new TypeError('Expected a numeric year');
 manual=true;return draw(Math.max(0,Math.min(Film.DUR,t)),1,year===undefined?undefined:Math.max(2026,Math.min(2046,year)));
};
window.sceneReady=false;
draw(0,1);
window.sceneReady=true;
const autoplay=new URLSearchParams(location.search).get('auto')==='1';
window.addEventListener('resize',()=>{if(manual||!autoplay)draw(lastTime,1,lastYear)});
if(autoplay){
 let origin, previous, lastSlot=-1, average=16.67,samples=0;
 function tick(ms){
  if(manual)return;
  requestAnimationFrame(tick);
  if(origin===undefined){origin=ms;previous=ms-1000/60}
  const elapsed=ms-previous;
  const slot=Math.floor((ms-origin+.2)*.06);
  if(slot===lastSlot)return;
  lastSlot=slot;
  previous=ms;
  if(elapsed<150){
   average+=.065*(elapsed-average);
   if(++samples===45){
    if(average>21.8)liveScale=Math.max(.55,liveScale-.08);
    else if(average<17.6)liveScale=Math.min(1,liveScale+.035);
    samples=0;
   }
  }
  draw(((ms-origin)*.001)%Film.DUR,liveScale);
 }
 requestAnimationFrame(tick);
}
