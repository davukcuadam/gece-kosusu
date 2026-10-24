const {app,BrowserWindow}=require('electron'),http=require('http'),fs=require('fs'),path=require('path');
const T={'.html':'text/html','.js':'text/javascript','.mp3':'audio/mpeg','.fbx':'application/octet-stream','.json':'application/json'};
const root=path.join(__dirname,'www');
function serve(){return new Promise(ok=>{const s=http.createServer((q,res)=>{
  let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';
  const f=path.join(root,u);if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end()}
  const size=fs.statSync(f).size,type=T[path.extname(f)]||'application/octet-stream',r=q.headers.range;
  if(r){const m=/bytes=(\d*)-(\d*)/.exec(r),a=m[1]?+m[1]:0,b=m[2]?+m[2]:size-1;
    res.writeHead(206,{'Content-Type':type,'Accept-Ranges':'bytes','Content-Range':`bytes ${a}-${b}/${size}`,'Content-Length':b-a+1});fs.createReadStream(f,{start:a,end:b}).pipe(res)}
  else{res.writeHead(200,{'Content-Type':type,'Accept-Ranges':'bytes','Content-Length':size});fs.createReadStream(f).pipe(res)}
 }).listen(0,'127.0.0.1',()=>ok(s.address().port))})}
app.whenReady().then(async()=>{const port=await serve();
  const w=new BrowserWindow({width:1280,height:720,fullscreen:true,backgroundColor:'#0b0610',autoHideMenuBar:true,webPreferences:{autoplayPolicy:'no-user-gesture-required'}});
  w.setMenuBarVisibility(false);w.loadURL('http://127.0.0.1:'+port+'/index.html');
  w.webContents.on('before-input-event',(e,i)=>{if(i.type==='keyDown'&&i.key==='F11')w.setFullScreen(!w.isFullScreen())})});
app.on('window-all-closed',()=>app.quit());
