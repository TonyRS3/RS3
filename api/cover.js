export default async function handler(req, res) {
  const { artista, titolo } = req.query;
  if (!artista || !titolo) {
    return res.status(400).json({ error: "Manca artista o titolo" });
  }

  try {
    const query = `${artista} ${titolo}`;
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1`;
    
    const r = await fetch(url);
    const data = await r.json();
    
    if (data.results && data.results[0] && data.results[0].artworkUrl100) {
      // Prende la cover in alta risoluzione 600x600
      let cover = data.results[0].artworkUrl100.replace('100x100', '600x600');
      return res.status(200).json({ cover });
    } else {
      return res.status(404).json({ error: "Cover non trovata" });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
