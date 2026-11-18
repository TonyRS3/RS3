export default async function handler(req, res) {
  const { artista, titolo } = req.query;
  if (!artista || !titolo) return res.status(400).json({ error: "Manca artista o titolo" });

  const clean = (s) => s
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/['’`]/g, " ")
    .replace(/[\(\[]?\b(19|20)\d{2}\b[\)\]]?/g, "") // TOGLIE (1989) [1989] 1989
    .replace(/\s*-\s*\b(19|20)\d{2}\b/g, "") // TOGLIE - 1989
    .replace(/\s+/g, " ")
    .trim();
  
  const titoloPulito = clean(titolo);
  const artistaPulito = clean(artista);

  const queries = [
    `${artista} ${titolo}`,
    `${artistaPulito} ${titoloPulito}`,
    `${titoloPulito} ${artistaPulito}`,
    titoloPulito
  ];

  for (const q of queries) {
    try {
      const r = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=1`).then(x=>x.json());
      if (r.results?.[0]?.artworkUrl100) {
        return res.status(200).json({ cover: r.results[0].artworkUrl100.replace('100x100','600x600') });
      }
    } catch {}
  }
  for (const q of queries) {
    try {
      const d = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(q)}`).then(x=>x.json());
      if (d.data?.[0]?.album?.cover_big) {
        return res.status(200).json({ cover: d.data[0].album.cover_big });
      }
    } catch {}
  }
  return res.status(404).json({ error: "Cover non trovata" });
}
