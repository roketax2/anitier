'use strict';
/* «Лучшие персонажи» (2026-11-22): тест-опрос — «Кто самый сильный?», «Кто самая красивая?», «Кто самый умный?»…
   На каждый вопрос 4 персонажа из аниме твоего топа. Правильных ответов нет — это твоё мнение.
   В конце — твои ответы и кого чаще всего выбирают остальные игроки (сервер считает выборы без имён игроков). */
Object.assign(EN, {
  'Лучшие персонажи': 'Best characters', 'Кто самый сильный, самый умный, самая красивая? Выбери из четырёх вариантов.': 'Who is the strongest, the smartest, the most beautiful? Pick one of four options.',
  'Вопросов': 'Questions', 'Персонажи — из аниме твоего топа. Правильных ответов нет — это твоё мнение.': 'Characters come from the anime in your top. There are no right answers — it’s your opinion.',
  'Кто самый сильный?': 'Who is the strongest?', 'Кто самый умный?': 'Who is the smartest?', 'Кто самая красивая?': 'Who is the most beautiful?', 'Кто самый красивый?': 'Who is the most handsome?',
  'Кто самый смешной?': 'Who is the funniest?', 'Кто самый добрый?': 'Who is the kindest?', 'Кто самый страшный?': 'Who is the scariest?', 'Кто самый крутой?': 'Who is the coolest?',
  'Кого бы ты взял в команду?': 'Who would you take on your team?', 'С кем бы ты дружил?': 'Who would you be friends with?', 'Чья судьба самая печальная?': 'Whose fate is the saddest?',
  'Кто самый харизматичный?': 'Who is the most charismatic?', 'Кто лучше всех одет?': 'Who has the best outfit?', 'Кого бы ты спас первым?': 'Who would you save first?',
  'Вопрос {a} из {b}': 'Question {a} of {b}', 'Назад': 'Back', 'Другие варианты': 'Other options', 'Пропустить': 'Skip', 'Твои ответы': 'Your answers', 'пропущено': 'skipped',
  'Игроки чаще выбирают: {t}': 'Players most often pick: {t}', 'Игроки выбирают так же': 'Players agree with you',
  'Нужно хотя бы 4 персонажа. Оцени больше аниме — персонажи берутся из них.': 'At least 4 characters are needed. Rate more anime — characters come from them.',
});
// sex — для вопросов про красоту: только девушки / только парни
const BS_Q = [
  { id: 'strong', q: 'Кто самый сильный?', must: 1 }, { id: 'smart', q: 'Кто самый умный?', must: 1 }, { id: 'pretty_f', q: 'Кто самая красивая?', sex: 'f', must: 1 },
  { id: 'pretty_m', q: 'Кто самый красивый?', sex: 'm' }, { id: 'funny', q: 'Кто самый смешной?' }, { id: 'kind', q: 'Кто самый добрый?' },
  { id: 'scary', q: 'Кто самый страшный?' }, { id: 'cool', q: 'Кто самый крутой?' }, { id: 'team', q: 'Кого бы ты взял в команду?' },
  { id: 'friend', q: 'С кем бы ты дружил?' }, { id: 'sad', q: 'Чья судьба самая печальная?' }, { id: 'charisma', q: 'Кто самый харизматичный?' },
  { id: 'outfit', q: 'Кто лучше всех одет?' }, { id: 'save', q: 'Кого бы ты спас первым?' },
];
const bs = { n: ['5', '10', '14'].includes(pref('bsN', '10')) ? pref('bsN', '10') : '10', on: false, qs: [], i: 0, pool: [], used: new Map(), ans: [], rerolls: 0 };
function bsSettingsHTML() {
  return `<div class="set-sec"><h3>${tr('Вопросов')}</h3><div class="set-seg gm-seg">${[['5', '5'], ['10', '10'], ['14', '14']].map(([v, l]) => `<button type="button" data-bsset="n" data-v="${v}" class="${bs.n === v ? 'on' : ''}">${l}</button>`).join('')}</div></div>
    <p class="set-note">${tr('Персонажи — из аниме твоего топа. Правильных ответов нет — это твоё мнение.')}</p>`;
}

// варианты: 4 разных персонажа, реже повторяющиеся и по возможности из разных аниме
function bsOptions(q) {
  const ok = bs.pool.filter((x) => !q.sex || chSex(x.cid) === q.sex);
  if (ok.length < 4) return null;
  const pick = [], animes = new Set();
  const ranked = shuffle(ok.slice()).sort((a, b) => (bs.used.get(a.id) || 0) - (bs.used.get(b.id) || 0));
  for (const x of ranked) { if (pick.length >= 4) break; if (!animes.has(x.sub) || ranked.length - pick.length <= 4) { pick.push(x); animes.add(x.sub); } }
  for (const x of ranked) { if (pick.length >= 4) break; if (!pick.includes(x)) pick.push(x); }
  for (const x of pick) bs.used.set(x.id, (bs.used.get(x.id) || 0) + 1);
  return pick;
}
async function bsStart() {
  gmStopAudio();
  if (!$('#gmMsg')) gmMenu();
  $('#gmMsg').textContent = tr('Готовлю игру…');
  $('[data-gmgo]') && ($('[data-gmgo]').disabled = true);
  try {
    if (thSources().some((s) => !chFresh(s))) await chLoad();
    const cands = thSources().flatMap((s) => { const L = chCache[s.id]?.list || []; return [...L.filter((c) => c.m), ...L.filter((c) => !c.m).slice(0, 15)].map((c) => ({ c, s })); });
    await chSexLoad(cands.map((x) => x.c), (d, n) => { const m = $('#gmMsg'); if (m) m.textContent = tr('Узнаю пол персонажей… {d} из {n}', { d, n }); });
    const seen = new Set();
    bs.pool = cands.filter(({ c }) => !seen.has(c.id) && seen.add(c.id)).map(({ c, s }) => ({ id: 'c' + c.id, cid: c.id, img: c.big || c.p || '', title: chName(c), sub: tn(s.anime) }));
  } catch { bs.pool = []; }
  if (!$('#gmMsg')) gmMenu();
  if (bs.pool.length < 4) { $('#gmMsg').textContent = tr('Нужно хотя бы 4 персонажа. Оцени больше аниме — персонажи берутся из них.'); $('[data-gmgo]').disabled = false; return; }
  // обязательные вопросы (сильный / умный / красивая) + случайные остальные
  bs.used = new Map();
  const n = +bs.n, must = BS_Q.filter((q) => q.must), rest = shuffle(BS_Q.filter((q) => !q.must));
  bs.qs = shuffle([...must, ...rest].slice(0, Math.max(n, must.length)).slice(0, n)).map((q) => ({ ...q, opts: bsOptions(q) })).filter((q) => q.opts);
  Object.assign(bs, { on: true, i: 0, ans: [], rerolls: 0 });
  gm.rounds = [];
  bsRender();
}
function bsRender() {
  const q = bs.qs[bs.i], n = bs.qs.length;
  gmBox.innerHTML = `<div class="gm-play bs-play">
    <div class="gm-top"><span>${tr('Вопрос {a} из {b}', { a: bs.i + 1, b: n })}</span><b>${tr('Лучшие персонажи')}</b></div>
    <div class="gm-bar"><i style="width:${(bs.i / n) * 100}%"></i></div>
    <h2 class="bs-q">${tr(q.q)}</h2>
    <div class="bs-opts">${q.opts.map((x, i) => `<button type="button" class="bs-opt" data-bspick="${i}"><span class="kg-img"><img src="${esc(x.img)}" alt=""></span><b>${esc(x.title)}</b><small>${esc(x.sub)}</small></button>`).join('')}</div>
    <div class="kg-foot"><button type="button" class="link" data-bsback ${bs.i ? '' : 'disabled'}>${icon('back')}<span>${tr('Назад')}</span></button><button type="button" class="btn kg-swap" data-bsreroll>${icon('sort')}<span>${tr('Другие варианты')}</span></button><button type="button" class="link" data-bsskip>${tr('Пропустить')}</button></div>
  </div>`;
}
function bsAnswer(i) {
  const q = bs.qs[bs.i];
  bs.ans[bs.i] = { q, pick: i == null ? null : q.opts[i] };
  bs.i++;
  if (bs.i >= bs.qs.length) bsEnd(); else bsRender();
}
function bsEnd() {
  bs.on = false;
  gmBox.innerHTML = `<div class="gm-play gm-end bs-end">
    <span class="kg-crown big">${icon('sparkle')}</span><h2>${tr('Твои ответы')}</h2>
    <div class="bs-res">${bs.ans.map((a, k) => `<div class="bs-row"><p class="bs-rq">${tr(a.q.q)}</p>${a.pick ? `<div class="kg-trow"><span class="kg-img"><img loading="lazy" src="${esc(a.pick.img)}" alt=""></span><span><b>${esc(a.pick.title)}</b><small>${esc(a.pick.sub)}</small></span><em></em></div>` : `<p class="set-note">${tr('пропущено')}</p>`}<div class="bs-pl" data-bscat="${a.q.id}" data-k="${k}"></div></div>`).join('')}</div>
    <div class="gm-end-btns"><button type="button" class="btn primary" data-gmgo>${tr('Ещё раз')}</button><button type="button" class="btn" data-gmmenu>${tr('К играм')}</button></div>
  </div>`;
  bsPlayers();
}
// отправляем свои выборы и показываем под каждым вопросом, кого чаще выбирают все игроки
async function bsPlayers() {
  const answers = bs.ans.filter((a) => a.pick).map((a) => ({ cat: a.q.id, pick: { id: a.pick.id, t: a.pick.title, img: a.pick.img, sub: a.pick.sub } }));
  if (answers.length && !window.VIEWING && typeof visitorId !== 'undefined') { try { await api('POST', '/api/best', { vid: visitorId, answers }); } catch {} }
  let d = null;
  try { d = await api('GET', '/api/best'); } catch {}
  if (!d?.cats) return;
  for (const el of $$('.bs-pl')) {
    const top = d.cats[el.dataset.bscat]?.[0], a = bs.ans[+el.dataset.k];
    if (!top) continue;
    const [id, t, img, sub, picks] = top;
    el.innerHTML = a.pick && a.pick.id === id
      ? `<p class="bs-same">${icon('check')}${tr('Игроки выбирают так же')}</p>`
      : `<div class="bs-other"><span class="kg-img"><img loading="lazy" src="${esc(img)}" alt=""></span><span>${esc(tr('Игроки чаще выбирают: {t}', { t }))}<small>${esc(sub)} · ${picks}</small></span></div>`;
  }
}

gmBox.addEventListener('click', (e) => {
  const s = e.target.closest('[data-bsset]');
  if (s) { bs.n = s.dataset.v; setPref('bsN', bs.n); gmMenu(); return; }
  if (!bs.on) return;
  const p = e.target.closest('[data-bspick]');
  if (p) { bsAnswer(+p.dataset.bspick); return; }
  if (e.target.closest('[data-bsskip]')) { bsAnswer(null); return; }
  if (e.target.closest('[data-bsreroll]')) { const q = bs.qs[bs.i], o = bsOptions(q); if (o) { q.opts = o; bsRender(); } return; }
  if (e.target.closest('[data-bsback]')) { if (bs.i > 0) { bs.i--; bsRender(); } }
});
