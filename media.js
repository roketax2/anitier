'use strict';
/* Кадры и видео в карточке аниме (2026-11-18). Данные — Shikimori (screenshots, videos).
   Под шапкой — полоска кадров (вспомнить, смотрел или нет), ниже — клипы, опенинги, трейлеры.
   У клипа (kind music) своих видео нет — ищем его у основного аниме серии по названию песни. */
Object.assign(EN, {
  'Кадры': 'Screenshots', 'Видео': 'Videos', 'Смотреть клип': 'Watch the music video', 'Клип': 'Music video', 'Опенинг': 'Opening', 'Эндинг': 'Ending',
  'Трейлер': 'Trailer', 'Персонаж': 'Character', 'Реклама': 'Commercial', 'Предыдущий кадр': 'Previous', 'Следующий кадр': 'Next',
  'Не открывается? YouTube в России может работать только через VPN.': "Won't play? YouTube may need a VPN in some countries.",
});
const MEDIA_Q = 'screenshots { x332Url originalUrl } videos { kind name playerUrl imageUrl url }';
const VKIND = { op_ed_clip: 'Клип', op: 'Опенинг', ed: 'Эндинг', pv: 'Трейлер', character_trailer: 'Персонаж', cm: 'Реклама', other: 'Видео' };
const VORDER = ['op_ed_clip', 'op', 'ed', 'pv', 'character_trailer', 'other', 'cm'];
const media = { shots: [], vids: [], i: 0 };
const https = (u) => (u ? (u.startsWith('//') ? 'https:' + u : u) : '');
const isVK = (v) => /vk\.com|vkvideo\.ru/.test(v.playerUrl || v.url || '');
// адрес для встраивания: YouTube — без куки и сразу играет
function embedUrl(v) {
  const yt = /youtube\.com\/embed\/([\w-]{6,})/.exec(v.playerUrl || '') || /youtu\.be\/([\w-]{6,})/.exec(v.url || '');
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0`;
  const u = https(v.playerUrl);
  return u ? u + (u.includes('?') ? '&' : '?') + 'autoplay=1' : '';
}
function mediaVideos(full, st) {
  const list = [...(st?.clip ? [st.clip] : []), ...((full?.videos) || [])].filter((v) => VKIND[v.kind] && embedUrl(v));
  const seen = new Set();
  return list.filter((v) => { const k = embedUrl(v); if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((a, b) => VORDER.indexOf(a.kind) - VORDER.indexOf(b.kind) || (/Озвучка|Субтитры|Sub\b/.test(a.name) - /Озвучка|Субтитры|Sub\b/.test(b.name)))
    .slice(0, 18);
}
// под шапкой: кадры (и большая кнопка клипа у музыкального видео)
function mediaTop(st, full) {
  if (!full) return '';
  media.shots = (full.screenshots || []).filter((s) => s.x332Url).slice(0, 12);
  const clip = st.anime.kind === 'music' && st.clip;
  const clipH = clip ? `<button type="button" class="clip-big" data-vid="clip"><img src="${esc(https(clip.imageUrl))}" alt=""><span class="clip-play">${icon('play')}</span><span class="clip-t"><b>${tr('Смотреть клип')}</b><small>${esc(clip.name || '')}</small></span></button>` : '';
  const shotsH = media.shots.length ? `<div class="shots" aria-label="${tr('Кадры')}">${media.shots.map((s, i) => `<button type="button" data-shot="${i}"><img loading="lazy" src="${esc(s.x332Url)}" alt=""></button>`).join('')}</div>` : '';
  return clipH || shotsH ? `<section class="media-top">${clipH}${shotsH}</section>` : '';
}
// ниже оценки: видео
function mediaBottom(st, full) {
  media.vids = mediaVideos(full, st);
  if (!media.vids.length) return '';
  return `<section class="sec"><div class="sec-head"><h3>${tr('Видео')} · ${media.vids.length}</h3></div>
    <div class="vids">${media.vids.map((v, i) => `<button type="button" class="vid" data-vid="${i}">
      <span class="vid-img"><img loading="lazy" src="${esc(https(v.imageUrl))}" alt=""><span class="vid-play">${icon('play')}</span>${isVK(v) ? '<i class="vid-src">VK</i>' : ''}</span>
      <small>${tr(VKIND[v.kind])}</small><b>${esc(v.name || tr(VKIND[v.kind]))}</b></button>`).join('')}</div></section>`;
}
// клип: ищем у других частей серии видео с названием песни
async function mediaLoad(st) {
  if (st.anime.kind !== 'music' || st.clip !== undefined) return;
  st.clip = null;
  const song = String(st.anime.name || '').toLowerCase().trim();
  const ids = (st.members || []).filter((m) => m.kind !== 'music' && String(m.id) !== String(st.anime.id)).map((m) => m.id).slice(0, 20);
  if (!song || !ids.length) return;
  try {
    const d = await gql(`{ animes(ids: ${JSON.stringify(ids.join(','))}, limit: 20) { id videos { kind name playerUrl imageUrl url } } }`);
    const all = d.animes.flatMap((x) => x.videos || []).filter((v) => embedUrl(v) && String(v.name || '').toLowerCase().includes(song));
    st.clip = all.find((v) => v.kind === 'op_ed_clip' && !/\(EN\)|SPECIAL/i.test(v.name)) || all.find((v) => v.kind === 'op_ed_clip') || all.find((v) => v.kind === 'op' || v.kind === 'ed') || null;
  } catch {}
  if (cs === st && st.clip) renderCard();
}

/* ---------- просмотр: видео и кадры ---------- */
document.body.insertAdjacentHTML('beforeend', `<dialog id="vidDlg" class="sheet card vid-dlg" aria-label="${tr('Видео')}">
  <button class="icon-btn card-close" data-close aria-label="${tr('Закрыть')}">${icon('x')}</button>
  <div class="vid-box" id="vidBox"></div>
</dialog>`);
const vidDlg = $('#vidDlg');
function openVideo(v) {
  $('#vidBox').innerHTML = `<div class="vid-frame"><iframe src="${esc(embedUrl(v))}" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
    <div class="vid-cap"><b>${esc(v.name || '')}</b><small>${tr(VKIND[v.kind] || 'Видео')}${isVK(v) ? ' · VK' : ` · YouTube · ${tr('Не открывается? YouTube в России может работать только через VPN.')}`}</small></div>`;
  if (!vidDlg.open) openModal(vidDlg);
}
function openShot(i) {
  media.i = (i + media.shots.length) % media.shots.length;
  const s = media.shots[media.i];
  $('#vidBox').innerHTML = `<div class="shot-big"><img src="${esc(s.originalUrl || s.x332Url)}" alt="">
    <button type="button" class="shot-nav prev" data-shotgo="-1" aria-label="${tr('Предыдущий кадр')}">${icon('back')}</button>
    <button type="button" class="shot-nav next" data-shotgo="1" aria-label="${tr('Следующий кадр')}">${icon('back', 'flip')}</button>
    <span class="shot-n">${media.i + 1} / ${media.shots.length}</span></div>`;
  if (!vidDlg.open) openModal(vidDlg);
}
vidDlg.addEventListener('click', (e) => {
  if (e.target === vidDlg || e.target.closest('[data-close]')) { vidDlg.close(); return; }
  const g = e.target.closest('[data-shotgo]');
  if (g) openShot(media.i + +g.dataset.shotgo);
});
vidDlg.addEventListener('close', () => { $('#vidBox').innerHTML = ''; if (history.state?.modal === 'vidDlg') history.back(); });
document.addEventListener('keydown', (e) => {
  if (!vidDlg.open || !$('.shot-big', vidDlg)) return;
  if (e.key === 'ArrowLeft') openShot(media.i - 1);
  if (e.key === 'ArrowRight') openShot(media.i + 1);
});
$('#cardBody').addEventListener('click', (e) => {
  const sh = e.target.closest('[data-shot]');
  if (sh) { openShot(+sh.dataset.shot); return; }
  const v = e.target.closest('[data-vid]');
  if (v) { const vid = v.dataset.vid === 'clip' ? cs?.clip : media.vids[+v.dataset.vid]; if (vid) openVideo(vid); }
});
