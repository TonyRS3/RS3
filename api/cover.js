import * as ftp from "basic-ftp"
import { Writable } from "stream"

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const artist = (req.query.artist || "").toLowerCase();
  const title = (req.query.title || "").toLowerCase();
  if (!artist && !title) return res.status(404).end();

  const client = new ftp.Client();
  client.ftp.verbose = false;
  try {
    await client.access({
      host: "listentomystream.com",
      user: "bomyydij",
      password: "METTI_QUI_LA_TUA_PASSWORD_AUTODJ", // <--- CAMBIA QUI!
      secure: false
    });

    async function cerca(dir, depth=0) {
      if(depth>4) return null;
      let list;
      try { list = await client.list(dir); } catch { return null; }
      for(let f of list){
        if(f.name.toLowerCase().endsWith(".mp3")){
          const low = f.name.toLowerCase();
          if((title && low.includes(title)) || (artist && low.includes(artist)) || (artist && title && low.includes(artist) && low.includes(title))){
            return (dir === "/" ? "" : dir) + "/" + f.name;
          }
        }
      }
      for(let f of list){
        if(f.type===2 && !f.name.startsWith(".")){
          const found = await cerca((dir === "/" ? "" : dir) + "/" + f.name, depth+1);
          if(found) return found;
        }
      }
      return null;
    }

    const mp3Path = await cerca("/");
    if(!mp3Path) return res.status(404).end();

    // Scarica primi 800KB
    const chunks=[];
    const writable = new Writable({
      write(chunk, enc, cb){ chunks.push(chunk); cb(); }
    });
    // scarica parziale - basic-ftp non supporta range, scarichiamo e interrompiamo a 800k
    let downloaded=0;
    const originalWrite = writable.write.bind(writable);
    writable.write = (chunk, enc, cb)=>{
      downloaded+=chunk.length;
      chunks.push(chunk);
      if(downloaded>800000){ client.close(); }
      cb();
    };
    
    try { await client.downloadTo(writable, mp3Path); } catch(e){}

    const buffer = Buffer.concat(chunks);
    
    // ESTRAI COPERTINA ID3
    function estraiCover(buf){
      if(buf.slice(0,3).toString()!=='ID3') return null;
      const size = (buf[6]<<21)|(buf[7]<<14)|(buf[8]<<7)|buf[9];
      let offset=10;
      const end=10+size;
      while(offset+10<end && offset+10<buf.length){
        const id=buf.slice(offset,offset+4).toString();
        const frameSize=buf.readUInt32BE(offset+4);
        if(frameSize<=0 || offset+10+frameSize>buf.length) break;
        if(id==='APIC'){
          let p=offset+10;
          const encoding=buf[p]; p+=1;
          const mimeEnd=buf.indexOf(0,p); if(mimeEnd===-1) break;
          const mime=buf.slice(p,mimeEnd).toString(); p=mimeEnd+1;
          const picType=buf[p]; p+=1;
          const descEnd=buf.indexOf(0,p); p=(descEnd===-1? p : descEnd+1);
          const img=buf.slice(p, offset+10+frameSize);
          return {data:img, mime: mime.includes("png")?"image/png":"image/jpeg"};
        }
        offset+=10+frameSize;
      }
      return null;
    }

    const cover = estraiCover(buffer);
    if(!cover) return res.status(404).end();
    
    res.setHeader('Content-Type', cover.mime);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(cover.data);

  } catch(e){
    res.status(500).json({error:e.message});
  } finally {
    try{ client.close(); }catch{}
  }
}
