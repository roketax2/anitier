// Ручной подбор альбомов YouTube для саундтреков AniTier (как плейлисты в калькуляторе).
// node yt-tool.js itunes "<запрос>" | yts "<запрос>" | ytpl <listId> | match <collectionId> <listId>
const H = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36', 'Accept-Language': 'en-US,en;q=0.9', Cookie: 'SOCS=CAI; CONSENT=YES+1' };
const getData = async (url) => {
  const html = await (await fetch(url, { headers: H })).text();
  const m = html.match(/var ytInitialData = (\{.*?\});<\/script>/s) || html.match(/ytInitialData"\]\s*=\s*(\{.*?\});/s);
  if (!m) throw new Error('нет ytInitialData');
  return JSON.parse(m[1]);
};
const walk = (o, key, out = []) => { if (o && typeof o === 'object') { if (o[key]) out.push(o[key]); for (const v of Object.values(o)) walk(v, key, out); } return out; };
const txt = (t) => t?.simpleText || (t?.runs || []).map((r) => r.text).join('') || '';
async function ytpl(list) {
  const d = await getData(`https://www.youtube.com/playlist?list=${list}`);
  let vids = walk(d, 'playlistVideoRenderer').map((v) => ({ id: v.videoId, t: txt(v.title), s: +v.lengthSeconds || 0, ch: txt(v.shortBylineText) }));
  if (!vids.length) vids = walk(d, 'lockupViewModel').filter((l) => /VIDEO/.test(l.contentType || '')).map((l) => {
    const md = l.metadata?.lockupMetadataViewModel, badge = JSON.stringify(l.contentImage || {}).match(/"text":"(\d+(?::\d+)+)"/)?.[1] || '0';
    const rows = (md?.metadata?.contentMetadataViewModel?.metadataRows || []).flatMap((r) => (r.metadataParts || []).map((p) => p.text?.content)).filter(Boolean);
    const j = JSON.stringify(md || {}), cid = j.match(/"browseId":"(UC[\w-]+)"/)?.[1] || '', url = j.match(/"canonicalBaseUrl":"(\/[^"]+)"/)?.[1] || '';
    return { id: l.contentId, t: md?.title?.content || '', s: badge.split(':').reduce((a, x) => a * 60 + +x, 0), ch: rows[0] || '', cid, url };
  });
  const hdr = walk(d, 'playlistHeaderRenderer')[0] || walk(d, 'pageHeaderViewModel')[0];
  return { title: txt(hdr?.title) || hdr?.title?.dynamicTextViewModel?.text?.content || '', vids };
}
const norm = (s) => String(s || '').toLowerCase().normalize('NFKC').replace(/\(.*?\)|\[.*?\]|feat\..*$/g, '').replace(/[^\p{L}\p{N}]+/gu, '');
(async () => {
  const [cmd, a, b] = process.argv.slice(2);
  if (cmd === 'itunes') {
    const d = await (await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(a)}&entity=album&country=JP&limit=15`)).json();
    for (const x of d.results) console.log(x.collectionId, x.trackCount, x.releaseDate?.slice(0, 4), x.collectionName, '—', x.artistName);
  } else if (cmd === 'yts') {
    const d = await getData(`https://www.youtube.com/results?search_query=${encodeURIComponent(a)}`);
    for (const p of walk(d, 'lockupViewModel')) { const id = p.contentId; const t = p.metadata?.lockupMetadataViewModel?.title?.content; if (id && id.length > 15) console.log('PL', id, '|', t); }
    for (const p of walk(d, 'playlistRenderer')) console.log('PL', p.playlistId, '|', txt(p.title), '|', txt(p.shortBylineText), p.videoCount);
    for (const v of walk(d, 'videoRenderer').slice(0, 8)) console.log('V ', v.videoId, '|', txt(v.title), '|', txt(v.ownerText), txt(v.lengthText));
  } else if (cmd === 'ytpl') {
    const p = await ytpl(a); console.log(p.title, p.vids.length);
    for (const v of p.vids) console.log(v.id, v.s, v.t, '|', v.ch);
  } else if (cmd === 'match') {
    const d = await (await fetch(`https://itunes.apple.com/lookup?id=${a}&entity=song&country=JP&limit=200`)).json();
    const tr = d.results.filter((t) => t.wrapperType === 'track').sort((x, y) => (x.discNumber || 1) - (y.discNumber || 1) || x.trackNumber - y.trackNumber);
    const p = await ytpl(b), used = new Set(), map = {}, chs = []; let bad = 0;
    for (const t of tr) {
      const n = norm(t.trackName), sec = Math.round((t.trackTimeMillis || 0) / 1000);
      const v = p.vids.find((v) => !used.has(v.id) && norm(v.t) === n && Math.abs(v.s - sec) <= 4) || p.vids.find((v) => !used.has(v.id) && (norm(v.t).includes(n) || n.includes(norm(v.t))) && Math.abs(v.s - sec) <= 4);
      if (v) { used.add(v.id); let ci = chs.findIndex((c) => c[0] === v.ch); if (ci < 0) ci = chs.push([v.ch, v.url || (v.cid ? '/channel/' + v.cid : '')]) - 1; map[t.trackId] = [v.id, ci]; } else bad++;
      console.log(v ? 'ok ' : '-- ', t.trackNumber, sec, t.trackName, v ? `→ ${v.id} ${v.s} ${v.t}` : '');
    }
    console.log(`\nсовпало ${tr.length - bad} из ${tr.length}; канал: ${p.vids[0]?.ch}`);
    console.log(JSON.stringify({ [a]: { list: b, ch: chs, v: map } }));
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
