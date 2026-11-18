import * as ftp from "basic-ftp"

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { artist="", title="" } = req.query;
  
  const client = new ftp.Client();
  try {
    await client.access({
      host: "listentomystream.com",
      user: "bomyydij",
      password: "h76hlx39QLDJ",
      secure: false
    });
    client.ftp.verbose = false;
    
    // qui cerca il file e ti ritorna la copertina
    // (codice completo te lo preparo appena mi dici che hai creato il file)
    
    res.status(200).send("FTP OK - cerco copertina per "+artist+" - "+title);
  } catch(e){
    res.status(500).send(e.message);
  } finally {
    client.close();
  }
}
