import {createServer} from 'node:http'
import {createReadStream} from 'node:fs'
import {realpath,stat} from 'node:fs/promises'
import {dirname,extname,resolve,sep} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {pipeline} from 'node:stream/promises'

export const root = dirname(dirname(fileURLToPath(import.meta.url)))
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json'}
export async function serve(port=8080){
  const base=await realpath(resolve(root,'dist'))
  const server=createServer(async(req,res)=>{
    if(req.method!=='GET' && req.method!=='HEAD'){
      res.writeHead(405,{Allow:'GET, HEAD'}).end();return
    }
    try{
      const url=new URL(req.url,'http://localhost')
      const path=decodeURIComponent(url.pathname)
      const relative=path==='/'?'shenzhen2046.html':path.slice(1)
      if(relative!=='shenzhen2046.html') throw Error()
      const file=await realpath(resolve(base,relative))
      if(!file.startsWith(base+sep)||relative.split('/').includes('..')) throw Error()
      const info=await stat(file)
      if(!info.isFile()) throw Error()
      res.writeHead(200,{'Content-Type':mime[extname(file)],'Content-Length':info.size,'Cache-Control':'no-store'})
      if(req.method==='HEAD') res.end()
      else await pipeline(createReadStream(file),res)
    }catch{
      if(!res.headersSent) res.writeHead(404)
      res.end()
    }
  })
  await new Promise((ok,fail)=>{server.once('error',fail);server.listen(port,'127.0.0.1',ok)})
  return server
}
if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const server=await serve(Number(process.argv[2]??8080))
  console.log('http://127.0.0.1:'+server.address().port+'/?auto=1')
}
