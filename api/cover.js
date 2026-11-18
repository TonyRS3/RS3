export default async function handler(req, res) {
  const { artista, titolo } = req.query;
  if (!artista || !titolo) return res.status(400).json({ error: "Manca artista o titolo" });

  const query = `${artista} ${titolo}`;
  
  // 1. Prova iTunes
  try {
    const it = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1`).then(r=>r.json());
    if (it.results?.[0]?.artworkUrl100) {
      return res.status(200).json({ cover: it.results[0].artworkUrl100.replace('100x100','600x600') });
    }
  } catch {}

  // 2. Prova Deezer (qui trova anche jazz raro come Claudia!)
  try {
    const dz = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}`).then(r=>r.json());
    if (dz.data?.[0]?.album?.cover_big) {
      return res.status(200).json({ cover: dz.data[0].album.cover_big });
    }
    if (dz.data?.[0]?.album?.cover_xl) {
      return res.status(200).json({ cover: dz.data[0].album.cover_xl });
    }
  } catch {}

  return res.status(404).json({ error: "Cover non trovata" });
}
