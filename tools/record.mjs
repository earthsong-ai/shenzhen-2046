import {spawn} from 'node:child_process'
import {mkdir,mkdtemp,rm,writeFile,rename} from 'node:fs/promises'
import {join} from 'node:path'
import {setTimeout as sleep} from 'node:timers/promises'
import {serve,root} from './serve.mjs'

const chrome=process.env.CHROME_BIN||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const output=join(root,'out')
const frames=join(output,'frames'), keys=join(output,'keys')
const moments=new Map([0.5,4.5,6.1,8,10,17.5,21.5,26.5,29.5,34.5,38.6,46].map(t=>[Math.round(t*30),String(t)]))
let browser,encoder,server,profile
const controller=new AbortController()
for(const sig of ['SIGINT','SIGTERM']) process.once(sig,()=>controller.abort(Error(sig)))

// Chrome's pipe transport uses NUL-delimited CDP messages on fds 3 and 4.
// It avoids a separate debugging listener and attaches to this process only.
function connect(child){
  let sequence=0,buffer='',closed
  const waiting=new Map()
  function stop(error){
    closed=error
    for(const req of waiting.values()) req.reject(error)
    waiting.clear()
  }
  child.once('error',stop)
  child.once('exit',(code,signal)=>stop(Error('Chrome exited '+(signal||code))))
  child.stdio[3].on('error',stop)
  child.stdio[4].setEncoding('utf8').on('data',data=>{
    buffer+=data
    let end
    while((end=buffer.indexOf('\0'))>=0){
      const msg=JSON.parse(buffer.slice(0,end));buffer=buffer.slice(end+1)
      const req=waiting.get(msg.id)
      if(req){
        waiting.delete(msg.id)
        if(msg.error) req.reject(Error(msg.error.message))
        else req.resolve(msg.result)
      }else if(msg.method==='Runtime.exceptionThrown'){
        stop(Error(msg.params.exceptionDetails.exception?.description||msg.params.exceptionDetails.text))
      }else if(msg.method==='Runtime.consoleAPICalled'&&msg.params.type==='error'){
        stop(Error(msg.params.args.map(a=>a.value||a.description).join(' ')))
      }
    }
  })
  controller.signal.addEventListener('abort',()=>stop(controller.signal.reason),{once:true})
  return async(method,params={},sessionId)=>{
    controller.signal.throwIfAborted()
    if(closed) throw closed
    const id=++sequence
    let timer
    try{
      return await new Promise((resolve,reject)=>{
        timer=setTimeout(()=>reject(Error('CDP timeout '+method)),60000)
        waiting.set(id,{resolve,reject})
        child.stdio[3].write(JSON.stringify({id,method,params,sessionId})+'\0')
      })
    }finally{clearTimeout(timer);waiting.delete(id)}
  }
}
async function closeProcess(child){
  if(!child?.pid || child.exitCode!==null || child.signalCode!==null) return
  const done=new Promise(resolve=>child.once('exit',resolve))
  child.kill('SIGTERM')
  const timer=setTimeout(()=>child.kill('SIGKILL'),2000)
  try{await done}finally{clearTimeout(timer)}
}
async function record(){
  server=await serve(0)
  await mkdir(frames,{recursive:true});await mkdir(keys,{recursive:true})
  profile=await mkdtemp(join(output,'.chrome-'))
  browser=spawn(chrome,['--headless=new','--mute-audio','--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist','--disable-background-networking','--disable-component-update','--no-first-run','--no-default-browser-check','--hide-scrollbars','--remote-debugging-pipe','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','inherit','pipe','pipe']})
  const send=connect(browser)
  const {targetInfos}=await send('Target.getTargets')
  const page=targetInfos.find(p=>p.type==='page')||await send('Target.createTarget',{url:'about:blank'})
  const {sessionId}=await send('Target.attachToTarget',{targetId:page.targetId,flatten:true})
  const cdp=(method,params)=>send(method,params,sessionId)
  await cdp('Page.enable');await cdp('Runtime.enable')
  await cdp('Emulation.setDeviceMetricsOverride',{width:1920,height:1080,deviceScaleFactor:1,mobile:false})
  const nav=await cdp('Page.navigate',{url:'http://127.0.0.1:'+server.address().port+'/shenzhen2046.html'})
  if(nav.errorText) throw Error(nav.errorText)
  async function evaluate(expression){
    const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})
    if(r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text)
    return r.result.value
  }
  const deadline=Date.now()+60000
  while(!await evaluate('window.sceneReady===true')){
    if(Date.now()>deadline) throw Error('sceneReady timed out')
    await sleep(100)
  }
  const shot=async(path,format)=>{
    const params={format,fromSurface:true}
    if(format==='jpeg') params.quality=92
    const {data}=await cdp('Page.captureScreenshot',params)
    await writeFile(path,Buffer.from(data,'base64'))
  }
  let maxCalls=0
  for(let i=0;i<1440;i++){
    const calls=await evaluate(`(async()=>{const calls=await window.renderAt(${i}/30);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return calls})()`)
    if(!(Number.isFinite(calls) && calls>0)) throw Error('Unexpected draw calls '+calls)
    maxCalls=Math.max(calls,maxCalls)
    await shot(join(frames,String(i).padStart(4,'0')+'.jpg'),'jpeg')
    if(moments.has(i)) await shot(join(keys,moments.get(i)+'.png'),'png')
    if((i+1)%60===0) console.log((i+1)+'/1440')
  }
  console.log('Maximum draw calls:',maxCalls)
  const temp=join(profile,'film.mp4')
  encoder=spawn(process.env.FFMPEG_BIN||'ffmpeg',['-hide_banner','-loglevel','error','-framerate','30','-start_number','0','-i',join(frames,'%04d.jpg'),'-frames:v','1440','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',temp],{stdio:'inherit',signal:controller.signal})
  await new Promise((ok,fail)=>{encoder.once('error',fail);encoder.once('exit',code=>code===0?ok():fail(Error('ffmpeg exited '+code)))})
  await rename(temp,join(output,'shenzhen2046.mp4'))
}
try{await record()}catch(error){console.error(error.message);process.exitCode=1}
finally{
  await closeProcess(encoder);await closeProcess(browser)
  if(server){server.closeAllConnections();await new Promise(r=>server.close(r))}
  if(profile) await rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:200})
}
