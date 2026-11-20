// Пакетный подбор: популярные аниме Shikimori → альбомы iTunes (как на сайте) → официальный альбом YouTube (OLAK5uy) → сопоставление треков.
// node yt-batch.js <сколько аниме> ; результат копится в yt-batch.json (можно перезапускать — продолжит)
const fs = require('fs');
const OUT = __dirname + '/yt-batch.json', LOG = __dirname + '/yt-batch.log';
const st = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : { anime: {}, albums: {}, res: {} };
const save = () => fs.writeFileSync(OUT, JSON.stringify(st));
const log = (...a) => { const s = a.join(' '); console.log(s); fs.appendFileSync(LOG, s + '\n'); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const gate = {}; const wait = async (k, ms) => { const w = (gate[k] || 0) + ms - Date.now(); if (w > 0) await sleep(w); gate[k] = Date.now(); };
const H = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36', 'Accept-Language': 'en-US,en;q=0.9', Cookie: 'SOCS=CAI; CONSENT=YES+1' };
async function itunes(path) {
  for (let n = 0; n < 4; n++) { await wait('it', 3200); try { const r = await fetch('https://itunes.apple.com/' + path); if (r.ok) return await r.json(); } catch {} await sleep(15000 * (n + 1)); }
  throw new Error('itunes ' + path);
}
async function gql(query) {
  for (let n = 0; n < 4; n++) { await wait('sh', 900); try { const r = await fetch('https://shikimori.io/api/graphql', { method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': 'AniTier-check' }, body: JSON.stringify({ query }) }); if (r.ok) { const j = await r.json(); if (j.data) return j.data; } } catch {} await sleep(3000 * (n + 1)); }
  throw new Error('gql');
}
async function ytData(url) {
  for (let n = 0; n < 3; n++) {
    await wait('yt', 2500);
    try { const html = await (await fetch(url, { headers: H })).text(); const m = html.match(/var ytInitialData = (\{.*?\});<\/script>/s); if (m) return JSON.parse(m[1]); } catch {}
    await sleep(10000);
  }
  return null;
}
const walk = (o, key, out = []) => { if (o && typeof o === 'object') { if (o[key]) out.push(o[key]); for (const v of Object.values(o)) walk(v, key, out); } return out; };
const txt = (t) => t?.simpleText || (t?.runs || []).map((r) => r.text).join('') || '';
async function ytpl(list) {
  const d = await ytData(`https://www.youtube.com/playlist?list=${list}`);
  if (!d) return [];
  return walk(d, 'lockupViewModel').filter((l) => /VIDEO/.test(l.contentType || '')).map((l) => {
    const md = l.metadata?.lockupMetadataViewModel, badge = JSON.stringify(l.contentImage || {}).match(/"text":"(\d+(?::\d+)+)"/)?.[1] || '0';
    const rows = (md?.metadata?.contentMetadataViewModel?.metadataRows || []).flatMap((r) => (r.metadataParts || []).map((p) => p.text?.content)).filter(Boolean);
    const j = JSON.stringify(md || {}), cid = j.match(/"browseId":"(UC[\w-]+)"/)?.[1] || '', url = j.match(/"canonicalBaseUrl":"(\/[^"]+)"/)?.[1] || '';
    return { id: l.contentId, t: md?.title?.content || '', s: badge.split(':').reduce((a, x) => a * 60 + +x, 0), ch: rows[0] || '', url: url || (cid ? '/channel/' + cid : '') };
  });
}
async function ytAlbums(q) {
  const d = await ytData(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`);
  if (!d) return [];
  const out = [];
  for (const p of walk(d, 'lockupViewModel')) if (/^OLAK5uy_/.test(p.contentId || '')) out.push({ id: p.contentId, t: p.metadata?.lockupMetadataViewModel?.title?.content || '' });
  for (const p of walk(d, 'playlistRenderer')) if (/^OLAK5uy_/.test(p.playlistId || '')) out.push({ id: p.playlistId, t: txt(p.title) });
  return [...new Map(out.map((x) => [x.id, x])).values()];
}
const osNorm = (s) => (s || '').toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu, '');
const tNorm = (s) => osNorm(String(s || '').replace(/\(.*?\)|\[.*?\]|（.*?）|feat\..*$/gi, '')) || osNorm(s);
const OS_KW = /サウンドトラック|サントラ|soundtrack|\bost\b|オリジナル・?サウンド|music collection|ミュージックコレクション|bgm/i;
const OS_BAD = /cover|piano|lofi|lo-fi|8-?bit|music box|オルゴール|karaoke|tribute|remix|instrumental covers|- single$/i;
function match(tracks, vids) {
  const used = new Set(), map = {}, chs = [];
  for (const t of tracks) {
    const n = tNorm(t.trackName), sec = Math.round((t.trackTimeMillis || 0) / 1000), ok = (v) => !used.has(v.id) && Math.abs(v.s - sec) <= 4;
    const v = vids.find((v) => ok(v) && tNorm(v.t) === n) || vids.find((v) => ok(v) && n.length >= 3 && (tNorm(v.t).includes(n) || n.includes(tNorm(v.t))));
    if (!v) continue;
    used.add(v.id);
    let ci = chs.findIndex((c) => c[0] === v.ch); if (ci < 0) ci = chs.push([v.ch, v.url]) - 1;
    map[t.trackId] = [v.id, ci];
  }
  return { map, chs, n: Object.keys(map).length };
}
(async () => {
  const want = +process.argv[2] || 150, done = new Set(Object.keys(st.res));
  // 1) популярные аниме
  if (Object.keys(st.anime).length < want) {
    for (let p = 1; Object.keys(st.anime).length < want && p <= 20; p++) {
      const d = await gql(`{ animes(order: popularity, limit: 50, page: ${p}, kind: "tv,movie,ona") { id name english japanese } }`);
      for (const a of d.animes) if (Object.keys(st.anime).length < want) st.anime[a.id] = st.anime[a.id] || { n: a.name, en: a.english, jp: a.japanese, done: false };
    }
    save();
  }
  // 2) альбомы iTunes по каждому аниме — как на сайте
  for (const [id, a] of Object.entries(st.anime)) {
    if (a.done) continue;
    const names = [a.jp, a.en, a.n].map(osNorm).filter((n) => n.length >= 2);
    const okAlbum = (x) => x.collectionType === 'Album' && OS_KW.test(x.collectionName) && !OS_BAD.test(x.collectionName) && names.some((n) => osNorm(x.collectionName).includes(n));
    try {
      for (const term of [a.jp && a.jp + ' サウンドトラック', (a.en || a.n) + ' soundtrack'].filter(Boolean)) {
        const d = await itunes(`search?country=JP&entity=album&limit=25&term=${encodeURIComponent(term)}`);
        for (const x of d.results || []) if (okAlbum(x) && !st.albums[x.collectionId]) st.albums[x.collectionId] = { n: x.collectionName, ar: x.artistName, cnt: x.trackCount, anime: id };
      }
      a.done = true; save();
      log('аниме', id, a.n, '— альбомов всего', Object.keys(st.albums).length);
    } catch (e) { log('ошибка iTunes', id, e.message); }
  }
  // 3) YouTube по каждому альбому
  for (const [alId, al] of Object.entries(st.albums)) {
    if (done.has(alId) || al.tried) continue;
    try {
      const d = await itunes(`lookup?id=${alId}&entity=song&country=JP&limit=200`);
      const tracks = (d.results || []).filter((t) => t.wrapperType === 'track' && t.previewUrl);
      if (!tracks.length) { al.tried = 'нет треков'; save(); continue; }
      let best = null;
      for (const q of [al.n, `${al.n} ${al.ar}`]) {
        const cands = (await ytAlbums(q)).slice(0, 3);
        for (const c of cands) {
          const m = match(tracks, await ytpl(c.id));
          if (!best || m.n > best.m.n) best = { c, m };
          if (m.n === tracks.length) break;
        }
        if (best && best.m.n >= Math.min(3, tracks.length)) break;
      }
      if (best && best.m.n >= Math.min(3, tracks.length)) {
        const first = Object.values(best.m.map)[0][0];
        const emb = (await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${first}&format=json`)).status;
        if (emb === 200) { st.res[alId] = { list: best.c.id, ch: best.m.chs, v: best.m.map }; log('ОК', alId, al.n, `${best.m.n}/${tracks.length}`, best.c.t); }
        else { al.tried = 'не встраивается ' + emb; log('не встраивается', alId, al.n); }
      } else { al.tried = `мало совпадений ${best ? best.m.n : 0}/${tracks.length}`; log('мимо', alId, al.n, al.tried); }
      save();
    } catch (e) { log('ошибка', alId, al.n, e.message); }
  }
  log('ГОТОВО: альбомов', Object.keys(st.albums).length, 'подобрано', Object.keys(st.res).length);
})();
