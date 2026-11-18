'use strict';
/* Аниме-рамки, правки 3 (2026-11-18): титан выглядывает из-за стены; заново Ванпанчмен, Поднятие уровня,
   Форма голоса, Вайолет; дополнены Кагуя, Киберпанк, Магическая битва, Ван-Пис, Евангелион, Твоё имя; новые фразы Али. */
const F9_POND = `M${fP(59, -15)}A59 59 0 1 1 ${fP(59, 195)}L${fP(41, 195)}A41 41 0 1 0 ${fP(41, -15)}Z`;
const F9_ANN = 'M60 1.5A58.5 58.5 0 1 1 59.9 1.5ZM60 18.5A41.5 41.5 0 1 0 60.1 18.5Z';
document.body.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<clipPath id="fc-pond" clipPathUnits="userSpaceOnUse"><path d="${F9_POND}"/></clipPath>
<clipPath id="fc-ann" clipPathUnits="userSpaceOnUse"><path d="${F9_ANN}" clip-rule="evenodd"/></clipPath>
<linearGradient id="fg-shfl" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#05020a"/><stop offset=".45" stop-color="#3a1670"/><stop offset=".8" stop-color="#8a4ae0"/><stop offset="1" stop-color="#d9c2ff"/></linearGradient>
<radialGradient id="fg-cursaura" gradientUnits="userSpaceOnUse" cx="60" cy="60" r="60"><stop offset=".66" stop-color="#0a0614" stop-opacity=".95"/><stop offset=".85" stop-color="#1e0f3a" stop-opacity=".6"/><stop offset="1" stop-color="#1e0f3a" stop-opacity="0"/></radialGradient>
<linearGradient id="fg-straw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3d27a"/><stop offset=".5" stop-color="#e0b04a"/><stop offset="1" stop-color="#b8862a"/></linearGradient>
<radialGradient id="fg-titan" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#f0bc94"/><stop offset=".7" stop-color="#d49a72"/><stop offset="1" stop-color="#9a6040"/></radialGradient>
</defs></svg>`);

/* ---------- Атака титанов: раз в ~11 с из-за стены в углу выглядывает титан ---------- */
{ const base = FRAME_ART.an_aot;
  const face = '<ellipse cx="60" cy="14" rx="10.5" ry="11.5" fill="url(#fg-titan)" stroke="#5a3020" stroke-width=".8"/>'
    + '<ellipse cx="49.4" cy="15" rx="1.6" ry="2.8" fill="#d49a72" stroke="#5a3020" stroke-width=".5"/><ellipse cx="70.6" cy="15" rx="1.6" ry="2.8" fill="#d49a72" stroke="#5a3020" stroke-width=".5"/>'
    + '<path d="M49.6 12C49 4 54 2.4 60 2.4S71 4 70.4 12C68 7 64 6.4 60 6.6S52 7 49.6 12Z" fill="#3a2a1e"/>'
    + '<path d="M52.6 10.2L58.2 11.2M67.4 10.2L61.8 11.2" stroke="#3a1a10" stroke-width=".9" stroke-linecap="round"/>'
    + '<ellipse cx="55.6" cy="13" rx="2.5" ry="2.1" fill="#fff" stroke="#3a1a10" stroke-width=".5"/><ellipse cx="64.4" cy="13" rx="2.5" ry="2.1" fill="#fff" stroke="#3a1a10" stroke-width=".5"/><circle cx="55.9" cy="13.2" r=".75" fill="#111"/><circle cx="64.1" cy="13.2" r=".75" fill="#111"/>'
    + '<path d="M59.2 14.2L58.6 17H61.4L60.8 14.2" fill="none" stroke="#7a4a30" stroke-width=".5"/>'
    + '<path d="M51.4 18.4Q60 24.4 68.6 18.4L68 20Q60 26 52 20Z" fill="#fff" stroke="#3a1a10" stroke-width=".55"/><path d="M54 19.6V21.6M56.5 20.4V22.8M59 20.8V23.3M61.5 20.8V23.3M64 20.4V22.8M66.5 19.6V21.6" stroke="#3a1a10" stroke-width=".4"/>';
  const titan = fAt(-45, `<g mask="url(#fm-out)"><g class="fa-titan">${face}</g></g>`);
  FRAME_ART.an_aot = () => titan + base();
}

Object.assign(FRAME_ART, {
  // Ванпанчмен: комиксный взрыв от удара — линии скорости, жёлтые и оранжевые лучи с растром, красная вспышка
  an_opm: () => { const rnd = fRand(901);
    const burst = (n, r0, r1, sp, rot) => Array.from({ length: n }, (_, i) => fP(i % 2 ? r0 : r1 + rnd() * sp, rot + i * (360 / n)).replace(' ', ',')).join(' ');
    const y = burst(56, 47, 56, 6, 0), o = burst(44, 44, 50, 4, 4), r = burst(36, 41.5, 46, 3, 2);
    return `<g opacity=".85">${fRep(60, (k) => `<path d="M60 ${(-3 - (k % 3) * 1.5).toFixed(1)}V${(2.5 + (k % 2) * 2).toFixed(1)}" stroke="#111" stroke-width="${(0.35 + (k % 3) * 0.25).toFixed(2)}"/>`, 3)}</g>`
      + `<g mask="url(#fm-out)"><polygon points="${y}" fill="#ffd91a" stroke="#111" stroke-width="1.5" stroke-linejoin="miter"/><polygon points="${y}" fill="url(#fp-dots)" opacity=".5"/>`
      + `<polygon points="${o}" fill="#ff9a1a" stroke="#111" stroke-width="1.1"/><polygon points="${r}" fill="#ff3b2f" stroke="#111" stroke-width="1"/></g>`
      + fRing(41.8, 1.8, '#fff') + fRing(40.9, 0.8, '#111');
  },

  // Поднятие уровня: окно «системы» с заголовком, полоска опыта, теневое пламя и глаза теней внизу
  an_sololvl: () => { const rnd = fRand(911), fl = 'M57 18C53 14 56 10 57 5C58.5 8 60 9 59.5 3C63 7 65 11 62 14C64.5 13 65.5 11 65 9C67.5 13 66 17 63 18Z';
    return '<path d="M14 6H106L114 14V106L106 114H14L6 106V14Z" fill="#071a33" opacity=".6" mask="url(#fm-out)"/>'
      + [128, 146, 164, 180, 196, 214, 232].map((d, k) => fAt(d, `<g transform="translate(60 18) scale(${(0.9 + rnd() * 0.6).toFixed(2)}) translate(-60 -18)"><path class="fa-flick" style="animation-delay:${(-rnd()).toFixed(2)}s" d="${fl}" fill="url(#fg-shfl)" opacity="${k % 2 ? 0.8 : 1}"/></g>`)).join('')
      + `<g class="fa-glow" style="--g:#3aa0ff"><path d="M14 6H106L114 14V106L106 114H14L6 106V14Z" fill="none" stroke="#3aa0ff" stroke-width=".9"/>${[0, 90, 180, 270].map((d) => fAt(d, '<path d="M6 26V14L14 6H26" fill="none" stroke="#bfe4ff" stroke-width="2" stroke-linejoin="round"/>')).join('')}${fRing(42, 1.4, '#3aa0ff')}</g>`
      + `<g class="fa-spin slow">${fRing(44.8, 0.6, '#8fd0ff', 'stroke-dasharray="4 1.5 1 1.5"')}</g>` + fTicks(36, 46, 47.6, '#8fd0ff', 0.5, 0, 0.7)
      + '<rect x="33" y="6.6" width="54" height="8" rx="1.2" fill="#0b2a52" stroke="#3aa0ff" stroke-width=".7"/><path d="M35 8.6V12.6M85 8.6V12.6" stroke="#8fd0ff" stroke-width=".8"/>'
      + '<rect x="30" y="106.5" width="60" height="3.6" rx="1" fill="#0b2a52" stroke="#3aa0ff" stroke-width=".6"/><rect class="fa-fill" x="31" y="107.4" width="58" height="1.8" rx=".6" fill="#7fd4ff"/>'
      + [[18, 98], [100, 100], [30, 108]].map(([x, y], i) => `<g class="fa-blink" style="animation-delay:${-i * 1.1}s"><ellipse cx="${x}" cy="${y}" rx="1.3" ry=".55" fill="#c9a0ff" class="fa-glow" style="--g:#8a4ae0"/><ellipse cx="${x + 3.4}" cy="${y}" rx="1.3" ry=".55" fill="#c9a0ff"/></g>`).join('');
  },

  // Форма голоса: сверху ночное небо и деревянный мост с перилами, снизу пруд с карпами и кувшинками
  an_silentvoice: () => { const rnd = fRand(921);
    const koi = (c, spots) => `<path d="M53 10C55.5 7 62.5 6.8 67 10C62.5 13.2 55.5 13 53 10Z" fill="#fff4ec" stroke="#b8a898" stroke-width=".3"/>${spots}<path d="M53 10L48.6 7.2Q50 10 48.6 12.8Z" fill="${c}"/><path d="M58 7.8L56.6 5.8 59.6 7.4ZM58 12.2L56.6 14.2 59.6 12.6Z" fill="${c}" opacity=".8"/><circle cx="65" cy="9.4" r=".35" fill="#111"/>`;
    return fRing(49.3, 16, 'url(#fg-pond)') + fRing(41.5, 1, '#0f4d5f')
      + `<path d="${f5sector(41, 59, -168, -12)}" fill="#141c48"/>` + Array.from({ length: 12 }, () => { const [x, y] = X6(44 + rnd() * 13, -160 + rnd() * 140); return `<circle cx="${x}" cy="${y}" r="${(0.3 + rnd() * 0.35).toFixed(2)}" fill="#fff"/>`; }).join('')
      + `<g clip-path="url(#fc-pond)"><g class="fa-spin" style="animation-duration:22s">${fAt(120, `<g transform="translate(60 10) scale(1.35) translate(-60 -10)">${koi('#ff6a1a', '<circle cx="60" cy="9.4" r="1.6" fill="#ff6a1a"/><circle cx="63.6" cy="10.4" r="1.1" fill="#ff6a1a"/>')}</g>`)}${fAt(250, `<g transform="translate(60 10) scale(1.2) translate(-60 -10)">${koi('#111', '<circle cx="59" cy="9.6" r="1.3" fill="#ff6a1a"/><circle cx="62.6" cy="10.2" r=".9" fill="#111"/>')}</g>`)}</g>`
      + `<g class="fa-spin rev" style="animation-duration:17s">${fAt(185, `<g transform="translate(120 0) scale(-1 1)"><g transform="translate(60 8.5) scale(1.25) translate(-60 -10)">${koi('#ff7a2a', '<path d="M55 8.6Q60 6.6 66 9.4V10.6Q60 13.4 55 11.4Z" fill="#ff7a2a"/>')}</g></g>`)}</g></g>`
      + [[53, 160, 4.2], [54, 30, 3.6], [55, 75, 3], [52, 120, 3.3]].map(([r, a, s], i) => { const [x, y] = X6(r, a); return `<path d="M${x} ${y}L${(x + s).toFixed(1)} ${(y - 1.2).toFixed(1)}A${s} ${s} 0 1 1 ${(x + s).toFixed(1)} ${(y + 1.2).toFixed(1)}Z" fill="#5aa55a" stroke="#2e6b2e" stroke-width=".5" transform="rotate(${i * 70} ${x} ${y})"/>`; }).join('')
      + (() => { const [x, y] = X6(53, 160); return `<g transform="translate(${x + 1} ${y - 1})">${[0, 72, 144, 216, 288].map((r) => `<ellipse transform="rotate(${r})" cx="0" cy="-1.6" rx="1" ry="1.8" fill="#ffc2d6" stroke="#e86a98" stroke-width=".3"/>`).join('')}<circle r=".7" fill="#ffd75e"/></g>`; })()
      + `<path d="${fArc(50.5, -170, -10)}" fill="none" stroke="#5a3418" stroke-width="3.6"/><path d="${fArc(50.5, -170, -10)}" fill="none" stroke="#a8703c" stroke-width="2.4" stroke-dasharray="2.2 .5"/>`
      + Array.from({ length: 11 }, (_, i) => { const a = -165 + i * 15; return `<path d="M${fP(51.8, a)}L${fP(56.4, a)}" stroke="#7a4a22" stroke-width="1"/>`; }).join('')
      + `<path d="${fArc(56.2, -168, -12)}" fill="none" stroke="#c98c4e" stroke-width="1.2"/><path d="${fArc(54, -166, -14)}" fill="none" stroke="#a8703c" stroke-width=".5"/>`;
  },

  // Вайолет Эвергарден: сверху — лист в пишущей машинке, по бокам клавиши, внизу изумрудная брошь среди фиалок
  an_violet: () => { const L = 'QWERTYUIOPAS', keys = [-48, -28, -8, 12, 32, 52, 128, 148, 168, 188, 208, 228];
    const lines = ['Дорогая мама,', 'я теперь знаю,', 'что значит', '«люблю».'];
    return fRing(43.4, 3, 'url(#fg-gold)') + fRing(45, 0.5, '#6b4a0c') + fRing(41.8, 0.5, '#6b4a0c')
      + '<path d="M39 -3H81V15H39Z" fill="#fffaf0" stroke="#cdbf9a" stroke-width=".5"/><path d="M39 -3H81" stroke="#e8dcc0" stroke-width="1"/>'
      + lines.map((t, i) => `<text class="fa-ink" style="animation-duration:8s;animation-delay:${(-(8 - i * 0.9)).toFixed(1)}s" x="42" y="${(1.4 + i * 3.4).toFixed(1)}" font-size="2.9" font-family="'Courier New', monospace" fill="#2a2a30">${t}</text>`).join('')
      + '<rect x="34" y="14" width="52" height="5" rx="2.4" fill="#1b1b1e" stroke="#5a5a62" stroke-width=".5"/><path d="M36 15.4H84" stroke="#fff" stroke-width=".5" opacity=".35"/><circle cx="33.5" cy="16.5" r="2.6" fill="#2a2a2e" stroke="#c9ced6" stroke-width=".6"/><circle cx="86.5" cy="16.5" r="2.6" fill="#2a2a2e" stroke="#c9ced6" stroke-width=".6"/>'
      + keys.map((a, i) => { const [x, y] = X6(51.5, a), [sx, sy] = X6(45.5, a); return `<path d="M${sx} ${sy}L${x} ${y}" stroke="#8a8f98" stroke-width="1"/><g class="fa-press" style="animation-delay:${(i * 0.43).toFixed(2)}s"><circle cx="${x}" cy="${y}" r="4.4" fill="#1b1b1e" stroke="#c9ced6" stroke-width="1"/><circle cx="${x}" cy="${y}" r="3.3" fill="none" stroke="#5a5a62" stroke-width=".4"/><text x="${x}" y="${(y + 1.5).toFixed(1)}" text-anchor="middle" font-size="4.2" font-family="Georgia, serif" fill="#f2efe6">${L[i]}</text></g>`; }).join('')
      + [[53, 62], [56, 72], [52, 80], [52, 100], [56, 108], [53, 118]].map(([r, a], i) => { const [x, y] = X6(r, a); return fLeaf(x, y + 1.5, a - 90 + (i % 2 ? 40 : -40), 4.5, 1.5, '#4f9a4a', '#235a20', false); }).join('')
      + [[53, 62], [56, 72], [52, 80], [52, 100], [56, 108], [53, 118]].map(([r, a]) => { const [x, y] = X6(r, a); return f6flower(x, y, 1.1, '#9b6bd6', '#5a2f8a', '#ffe9a8'); }).join('')
      + '<path d="M54.5 101.5Q60 104 65.5 101.5" fill="none" stroke="url(#fg-gold)" stroke-width="1"/><ellipse cx="60" cy="110" rx="6" ry="7.4" fill="url(#fg-gold)" stroke="#6b4a0c" stroke-width=".7"/><ellipse cx="60" cy="110" rx="4.3" ry="5.6" fill="#19a35a" stroke="#0a4a26" stroke-width=".5"/><path d="M60 104.4V115.6M55.7 110H64.3M57 106L63 114M63 106L57 114" stroke="#0a4a26" stroke-width=".3" opacity=".6"/><ellipse cx="58.3" cy="107.6" rx="1.2" ry="1.8" fill="#fff" opacity=".7"/>';
  },
});

/* ---------- дополнения поверх прежних рисунков ---------- */
// Кагуя: по бокам шахматные король и ферзь — «любовь — это война»
{ const base = FRAME_ART.an_kaguya;
  const king = '<g transform="translate(6.5 60) scale(1.3)"><path d="M-4 9H4L3.2 6.6H-3.2ZM-2.4 6.6L-1.6-1H1.6L2.4 6.6Z" fill="#1b1b1e" stroke="#c9a14a" stroke-width=".5"/><ellipse cy="-2" rx="3.4" ry="1.4" fill="#1b1b1e" stroke="#c9a14a" stroke-width=".5"/><path d="M-2.6-3.4Q0-7 2.6-3.4Z" fill="#1b1b1e" stroke="#c9a14a" stroke-width=".5"/><circle cy="-7" r="1.2" fill="url(#fg-gold)"/></g>';
  const queen = '<g transform="translate(113.5 60) scale(1.3)"><path d="M-4 9H4L3.2 6.6H-3.2ZM-2.4 6.6L-1.6-1H1.6L2.4 6.6Z" fill="#fff8f0" stroke="#c9a14a" stroke-width=".5"/><ellipse cy="-2" rx="3.4" ry="1.4" fill="#fff8f0" stroke="#c9a14a" stroke-width=".5"/><path d="M-3-3.2L-3.6-7.4-1.6-5-0-8-1.6-5 0-8 1.6-5 3.6-7.4 3-3.2Z" fill="#fff8f0" stroke="#c9a14a" stroke-width=".5" stroke-linejoin="round"/><circle cx="-3.6" cy="-7.6" r=".7" fill="#e0115f"/><circle cy="-8.2" r=".7" fill="#e0115f"/><circle cx="3.6" cy="-7.6" r=".7" fill="#e0115f"/></g>';
  FRAME_ART.an_kaguya = () => base() + king + queen;
}
// Магическая битва: тёмная аура проклятия позади и глаза проклятий в ней
{ const base = FRAME_ART.an_jjk;
  FRAME_ART.an_jjk = () => '<circle cx="60" cy="60" r="60" fill="url(#fg-cursaura)" mask="url(#fm-out)"/>' + base()
    + [[14, 88], [104, 30], [96, 104]].map(([x, y], i) => `<g class="fa-blink" style="animation-delay:${-i * 1.3}s"><ellipse cx="${x}" cy="${y}" rx="1.4" ry=".7" fill="#ffd21a"/><ellipse cx="${x + 3.6}" cy="${y + 0.4}" rx="1.2" ry=".6" fill="#ffd21a"/><circle cx="${x}" cy="${y}" r=".35" fill="#111"/><circle cx="${x + 3.6}" cy="${y + 0.4}" r=".3" fill="#111"/></g>`).join('');
}
// Ван-Пис: за штурвалом — соломенное плетение с красной лентой; слева сундук, справа монеты
{ const base = FRAME_ART.an_onepiece;
  const straw = fRing(55, 5, 'url(#fg-straw)') + fRing(55, 5, '#a8781e', 'stroke-dasharray="1.2 1.6" opacity=".55"') + fRing(53.6, 2.2, '#c8102e') + fRing(57.4, 0.6, '#8a5a1a') + fRing(52.4, 0.5, '#7a0a1a');
  const chest = '<g transform="translate(13 99) rotate(-12)"><rect x="-6" y="-2" width="12" height="7" rx="1" fill="#7a4a22" stroke="#3a220d" stroke-width=".6"/><path d="M-6-2Q0-7 6-2Z" fill="#8a5a2b" stroke="#3a220d" stroke-width=".6"/><path d="M-6 0H6M-3-4.4V5M3-4.4V5" stroke="#e0b450" stroke-width=".7"/><rect x="-1" y="-.6" width="2" height="2" fill="#e0b450"/><ellipse cy="-3.4" rx="4" ry="1.2" fill="#ffd75e" opacity=".9"/></g>';
  const coins = [[100, 98], [104, 100], [97, 101], [106, 96]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2" ry="1.2" fill="url(#fg-gold)" stroke="#6b4a0c" stroke-width=".4"/>`).join('');
  FRAME_ART.an_onepiece = () => straw + base().replace('<g mask="url(#fm-out)" clip-path', chest + coins + '<g mask="url(#fm-out)" clip-path');
}
// Евангелион: угловые броневые пилоны, кабель питания с разъёмом, табло таймера
{ const base = FRAME_ART.an_eva;
  FRAME_ART.an_eva = () => base() + [45, 135, 225, 315].map((d) => fAt(d, '<path d="M55.6 9.4L60 .6L64.4 9.4L62.4 13H57.6Z" fill="#4b2378" stroke="#1d0a33" stroke-width=".6" stroke-linejoin="round"/><path d="M60 2.6V11" stroke="#7bd94b" stroke-width=".8" class="fa-glow" style="--g:#7bd94b"/>')).join('')
    + '<path d="M120 108C110 110 104 104 98 96" fill="none" stroke="#2a2a30" stroke-width="3.4" stroke-linecap="round"/><path d="M120 108C110 110 104 104 98 96" fill="none" stroke="#59606e" stroke-width="1" stroke-dasharray="1.5 1.5"/><rect x="93" y="90" width="6" height="5" rx="1" transform="rotate(40 96 92.5)" fill="#ff8a1a" stroke="#5a2a08" stroke-width=".6"/>'
    + '<rect x="4" y="5" width="21" height="9" rx="1" fill="#0b0b0e" stroke="#ff8a1a" stroke-width=".6"/>';
}
// Твоё имя: внизу слева — город, справа — горы и озеро
{ const base = FRAME_ART.an_yourname, rnd = fRand(941);
  const city = Array.from({ length: 9 }, (_, i) => { const x = 2 + i * 6, h = 10 + rnd() * 16; return `<rect x="${x}" y="${(122 - h).toFixed(1)}" width="${(4.6 + rnd() * 1.8).toFixed(1)}" height="${h.toFixed(1)}" fill="#24204e" opacity=".9"/>`; }).join('');
  const hills = '<path d="M60 122V104L70 96 78 101 88 90 98 99 106 94 120 104V122Z" fill="#2c2458" opacity=".9"/><ellipse cx="90" cy="110" rx="12" ry="3" fill="#ffb26b" opacity=".55"/>';
  FRAME_ART.an_yourname = () => { const s = base(), cut = s.indexOf('<path class="fa-shim"'); return s.slice(0, cut) + `<g clip-path="url(#fc-ann)">${city}${hills}</g>` + s.slice(cut); };
}

/* ---------- движение ---------- */
Object.assign(FRAME_FX, {
  // Ванпанчмен: красная перчатка бьёт по кольцу — вспышка, ударная волна и «БАХ!»
  an_opm: () => `<g class="fa-flicker">${fRep(30, () => '<path d="M60 -6V-1" stroke="#111" stroke-width=".7"/>', 7)}</g>`
    + fAt(135, '<g transform="translate(0 -7) translate(60 18.6) scale(1.5) translate(-60 -18.6)"><g class="fa-jab"><path d="M55 4.4H65V8H55Z" fill="#fff" stroke="#111" stroke-width=".8"/><path d="M53.6 8H66.4Q67.6 8 67.6 10V15Q67.6 18.6 64 18.6H56Q52.4 18.6 52.4 15V10Q52.4 8 53.6 8Z" fill="#e8202c" stroke="#111" stroke-width=".9"/><path d="M53 12.4H67M53.2 15.4H66.8M56.6 12.4V18.4M60 12.4V18.6M63.4 12.4V18.4" stroke="#8a0a14" stroke-width=".5"/><path d="M54.6 9.6Q57 11.8 59.8 10.4" fill="none" stroke="#8a0a14" stroke-width=".6"/></g></g><g class="fa-hit" transform="translate(0 -8)"><polygon points="60,15 62,19 66.5,18.5 63.5,21.5 66,26 61,23.5 58,27 57.6,22.6 53,21 57.4,19.6" fill="#fff" stroke="#111" stroke-width=".6"/></g>')
    + '<g mask="url(#fm-out)"><circle class="fa-hitring" cx="60" cy="60" r="50" fill="none" stroke="#fff" stroke-width="2"/></g>'
    + '<g class="fa-hit2"><text x="22" y="17" transform="rotate(-14 22 17)" text-anchor="middle" font-size="9.5" font-weight="900" font-style="italic" font-family="Unbounded, Onest, sans-serif" fill="#ffd91a" stroke="#111" stroke-width="1.1" paint-order="stroke">БАХ!</text></g>',
  // Поднятие уровня: в заголовке окна по очереди «ЗАДАНИЕ», «УРОВЕНЬ ↑», «ВОССТАНЬ»; бежит луч сканера, клубится тень
  an_sololvl: () => ['ЗАДАНИЕ', 'УРОВЕНЬ ↑', 'ВОССТАНЬ'].map((t, i) => `<text class="fa-cyc3" style="animation-delay:${i * 3}s" x="60" y="12.4" text-anchor="middle" font-size="4.3" font-weight="700" letter-spacing=".4" font-family="Onest, sans-serif" fill="${i === 2 ? '#c9a0ff' : '#bfe4ff'}">${t}</text>`).join('')
    + '<rect class="fa-scan" x="8" y="8" width="104" height="1.2" fill="#8fd0ff" opacity=".5" mask="url(#fm-out)"/>'
    + [[14, 108, 0], [106, 108, 1.2], [24, 114, 2.1], [96, 114, 0.6]].map(([x, y, d]) => `<circle class="fa-smoke" style="animation-delay:${-d}s" cx="${x}" cy="${y}" r="4" fill="#3a1670"/>`).join('') + fTwinkles(5, 951, 46, 57, '#bfe4ff', 0.35),
  // Форма голоса: над мостом взлетают салюты, по пруду расходятся круги, падают лепестки
  an_silentvoice: () => [[34, 22, 0, '#ff8fb1'], [86, 18, 1.4, '#ffd75e'], [60, 7, 2.6, '#8fe8ff']].map(([x, y, d, c]) => `<g class="fa-fw" style="animation-delay:${d}s;transform-origin:${x}px ${y}px">${Array.from({ length: 12 }, (_, k) => { const a = (k * 30 * Math.PI) / 180; return `<path d="M${(x + 1.5 * Math.cos(a)).toFixed(1)} ${(y + 1.5 * Math.sin(a)).toFixed(1)}L${(x + 6 * Math.cos(a)).toFixed(1)} ${(y + 6 * Math.sin(a)).toFixed(1)}" stroke="${c}" stroke-width=".7" stroke-linecap="round"/>`; }).join('')}<circle cx="${x}" cy="${y}" r=".8" fill="#fff"/></g>`).join('')
    + [[30, 92, 0], [92, 88, 1.4], [60, 112, 2.6]].map(([x, y, d]) => `<circle class="fa-ripple" style="animation-delay:${-d}s" cx="${x}" cy="${y}" r="3" fill="none" stroke="#e6fbff" stroke-width=".5"/>`).join('')
    + [[20, 0], [100, 1.6], [70, 2.8]].map(([x, d]) => `<ellipse class="fa-fall" style="animation-delay:${-d}s" cx="${x}" cy="64" rx="1" ry=".6" fill="#ffc2d6"/>`).join(''),
  // Кагуя: стрелы Амура прилетают в сердце, вокруг кружат сердечки
  an_kaguya: () => `<g class="fa-spin" style="animation-duration:14s">${fRep(6, () => '<path d="M60 7.4C58.6 6 56.8 6.8 57.2 8.4 57.6 9.8 60 11.2 60 11.2S62.4 9.8 62.8 8.4C63.2 6.8 61.4 6 60 7.4Z" fill="#ff4d78" transform="translate(0 -3)"/>')}</g>`
    + '<g opacity="0"><path d="M-8 0H6M6 0L3-1.8M6 0L3 1.8M-8 0L-10-1.6M-8 0L-10 1.6" stroke="url(#fg-gold)" stroke-width=".9" fill="none"/><animateMotion dur="5s" repeatCount="indefinite" rotate="auto" keyPoints="0;1;1" keyTimes="0;.3;1" calcMode="linear" path="M-14 44Q20 10 52 10"/><animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;.05;.3;.36;1" dur="5s" repeatCount="indefinite"/></g>'
    + [[30, 0], [50, 1.1], [72, 2.2], [90, 0.6]].map(([x, d]) => `<ellipse class="fa-fall" style="animation-delay:${-d}s" cx="${x}" cy="104" rx="1.2" ry=".7" fill="#e8304a"/>`).join('') + fTwinkles(6, 961, 50, 58, '#ffe9a8', 0.4),
  // Магическая битва: по очереди в трёх местах вспыхивает «чёрная молния» с красными искрами
  an_jjk: () => [[-40, 0], [100, 1.5], [200, 3]].map(([a, d], i) => { const [x, y] = X6(52, a); return `<g class="fa-bflash" style="animation-delay:${-d}s;transform-origin:${x}px ${y}px"><polygon points="${Array.from({ length: 16 }, (_, k) => { const r = k % 2 ? 2 : 7 + (k % 4), t = (k * 22.5 * Math.PI) / 180; return `${(x + r * Math.cos(t)).toFixed(1)},${(y + r * Math.sin(t)).toFixed(1)}`; }).join(' ')}" fill="#0a0006" stroke="#ff2a3a" stroke-width=".7" class="fa-glow" style="--g:#ff2a3a"/><path d="${fZig(a - 14, a + 14, 52, 3.2, 971 + i, 8)}" fill="none" stroke="#ff2a3a" stroke-width=".7"/></g>`; }).join('') + fFly(10, 973, 50, '#b49bff', 0.8, 1.6),
  // Ван-Пис: качаются гребни волн, пролетает чайка, блестят монеты
  an_onepiece: () => '<g class="fa-bob" clip-path="url(#fc-r59)"><path d="M-6 105Q2 99 10 103T26 103T42 105" fill="none" stroke="#fff" stroke-width=".8" opacity=".8"/><path d="M74 105Q82 99 90 103T106 103T126 105" fill="none" stroke="#fff" stroke-width=".8" opacity=".8"/></g>'
    + '<g class="fa-cloud" style="animation-duration:10s"><path d="M14 30Q16.5 27.5 19 30Q21.5 27.5 24 30" fill="none" stroke="#fff" stroke-width=".9"/></g><g class="fa-cloud" style="animation-duration:13s;animation-delay:-5s"><path d="M92 34Q94 32 96 34Q98 32 100 34" fill="none" stroke="#fff" stroke-width=".8"/></g>'
    + fSpark(101, 97, 0.28, '#fff', 0.2) + fSpark(13, 95, 0.28, '#fff', 1.1),
  // Евангелион: поле АТ — вспышки восьмиугольников и сот, бегущий таймер
  an_eva: () => [0, 1.2].map((d) => `<g mask="url(#fm-out)"><polygon class="fa-shock" style="animation-delay:${-d}s" points="${f6poly(8, 50, 22.5)}" fill="none" stroke="#ff9a1f" stroke-width="1.4"/></g>`).join('')
    + `<g class="fa-atf">${fRep(24, () => `<polygon points="${Array.from({ length: 6 }, (_, i) => `${(60 + 2.6 * Math.cos((i * 60 * Math.PI) / 180)).toFixed(1)},${(4.5 + 2.6 * Math.sin((i * 60 * Math.PI) / 180)).toFixed(1)}`).join(' ')}" fill="#ff9a1f" fill-opacity=".25" stroke="#ffb04a" stroke-width=".5"/>`)}</g>`
    + ['05:00', '04:59', '04:58'].map((t, i) => `<text class="fa-cyc3" style="animation-delay:${i}s;animation-duration:3s" x="14.5" y="11.6" text-anchor="middle" font-size="6" font-weight="700" font-family="'Courier New', monospace" fill="#ff3a2a">${t}</text>`).join(''),
  // Твоё имя: осколки кометы падают, звёзды мерцают
  an_yourname: () => fTwinkles(8, 981, 44, 56, '#fff', 0.4).replace(/translate\(([\d.]+) ([\d.]+)\)/g, (m, x, y) => `translate(${x} ${Math.min(+y, 46)})`)
    + [[24, 6, 0], [80, 2, 1.8], [50, 0, 3.4]].map(([x, y, d]) => `<g class="fa-shoot" style="animation-delay:${-d}s;animation-duration:5.2s"><path d="M${x - 10} ${y - 4}L${x} ${y}" stroke="url(#fg-shoot)" stroke-width="1" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r=".9" fill="#fff"/></g>`).join(''),
});


/* ---------- Киберпанк: Бегущие по краю — заново ----------
   Ночь большого города: огромная луна, город с неоном внизу; рамка — кибер-позвоночник из позвонков
   с бирюзовым светом (имплант-ускоритель), кабели с жёлтыми разъёмами. Раз в 5 с — «рывок»:
   разноцветные послеобразы кольца уносятся назад. */
document.body.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<radialGradient id="fg-cybbg" gradientUnits="userSpaceOnUse" cx="60" cy="60" r="60"><stop offset=".66" stop-color="#0d0618" stop-opacity=".95"/><stop offset=".86" stop-color="#1e0a32" stop-opacity=".7"/><stop offset="1" stop-color="#1e0a32" stop-opacity="0"/></radialGradient>
<radialGradient id="fg-cybmoon" cx=".4" cy=".4" r=".65"><stop offset="0" stop-color="#fffbe0"/><stop offset=".7" stop-color="#f4e6a8"/><stop offset="1" stop-color="#d8c27a"/></radialGradient>
<linearGradient id="fg-vert" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a2a36"/><stop offset=".5" stop-color="#6a6a7e"/><stop offset="1" stop-color="#22222c"/></linearGradient>
<linearGradient id="fg-ribbon" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5a5a"/><stop offset=".45" stop-color="#d0102a"/><stop offset="1" stop-color="#7a0614"/></linearGradient>
</defs></svg>`);
FRAME_ART.an_edgerunners = () => { const rnd = fRand(991);
  const city = Array.from({ length: 17 }, (_, i) => { const x = 1 + i * 7, h = 9 + rnd() * 20, w = 5.6 + rnd() * 2;
    return `<rect x="${x.toFixed(1)}" y="${(121 - h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="#0a0612" stroke="#2a1a40" stroke-width=".4"/>` + Array.from({ length: 4 }, () => `<rect class="fa-tw" style="animation-delay:${(-rnd() * 3).toFixed(2)}s;animation-duration:${(1.5 + rnd() * 3).toFixed(1)}s" x="${(x + 1 + rnd() * (w - 2.5)).toFixed(1)}" y="${(121 - h + 2 + rnd() * (h - 4)).toFixed(1)}" width="1.1" height="1.1" fill="${['#f7e23a', '#2affea', '#ff2a8a'][Math.floor(rnd() * 3)]}"/>`).join(''); }).join('')
    + '<rect x="16" y="99" width="9" height="3.4" rx=".6" fill="none" stroke="#ff2a8a" stroke-width=".8" class="fa-glow" style="--g:#ff2a8a"/><rect x="92" y="96" width="3.4" height="9" rx=".6" fill="none" stroke="#2affea" stroke-width=".8" class="fa-glow" style="--g:#2affea"/>';
  const vert = '<path d="M55.4 7.6H64.6L63.6 12.6H56.4Z" fill="url(#fg-vert)" stroke="#0a0a10" stroke-width=".5" stroke-linejoin="round"/><path d="M58 7.6L60 3.4 62 7.6Z" fill="#3a3a48" stroke="#0a0a10" stroke-width=".4"/><path d="M56.6 10.1H63.4" stroke="#2affea" stroke-width=".9" class="fa-glow" style="--g:#2affea"/><circle cx="57.2" cy="8.6" r=".35" fill="#9a9aae"/><circle cx="62.8" cy="8.6" r=".35" fill="#9a9aae"/>';
  return '<circle cx="60" cy="60" r="60" fill="url(#fg-cybbg)" mask="url(#fm-out)"/>'
    + '<g class="fa-glow" style="--g:#fff3b0"><circle cx="99" cy="19" r="15" fill="url(#fg-cybmoon)"/></g><circle cx="94" cy="15" r="2.6" fill="#e2d39a" opacity=".7"/><circle cx="104" cy="23" r="1.8" fill="#e2d39a" opacity=".7"/><circle cx="101" cy="12" r="1.1" fill="#e2d39a" opacity=".7"/>'
    + Array.from({ length: 12 }, () => { const [x, y] = X6(46 + rnd() * 12, -170 + rnd() * 150); return `<circle cx="${x}" cy="${y}" r="${(0.25 + rnd() * 0.3).toFixed(2)}" fill="#fff" opacity=".8"/>`; }).join('')
    + `<g clip-path="url(#fc-r59)" mask="url(#fm-out)">${city}</g>`
    + [[[-6, 70], 200], [[126, 60], -10], [[100, 126], 55]].map(([[x0, y0], a]) => { const [x, y] = X6(50.5, a), q = `M${x0} ${y0}Q${((x0 + x) / 2).toFixed(1)} ${((y0 + y) / 2 + 10).toFixed(1)} ${x} ${y}`; return `<path d="${q}" fill="none" stroke="#14141c" stroke-width="2.6" stroke-linecap="round"/><path d="${q}" fill="none" stroke="#3a3a4a" stroke-width=".8" stroke-dasharray="1.4 1.4"/><circle cx="${x}" cy="${y}" r="2" fill="#f7e23a" stroke="#2a2400" stroke-width=".5"/>`; }).join('')
    + fRing(47.4, 7.4, '#101018') + fRing(43.4, 0.9, '#f7e23a') + fRing(42, 0.8, '#2affea', 'class="fa-glow" style="--g:#2affea"')
    + fRep(18, () => vert) + fRep(18, () => '<circle cx="60" cy="10.2" r=".9" fill="#f7e23a" stroke="#2a2400" stroke-width=".3"/>', 10)
    + `<path d="${fArc(51.6, -150, -112)}" fill="none" stroke="#f7e23a" stroke-width="1.1"/><path d="${fArc(51.6, 20, 64)}" fill="none" stroke="#f7e23a" stroke-width="1.1"/>`;
};
FRAME_FX.an_edgerunners = () => `<g mask="url(#fm-out)">${['#2affea', '#ff2a8a', '#f7e23a'].map((c, i) => `<circle class="fa-sande" style="animation-delay:${(i * 0.09).toFixed(2)}s" cx="60" cy="60" r="47.4" fill="none" stroke="${c}" stroke-width="5" pathLength="36" stroke-dasharray="1 1" opacity="0"/>`).join('')}</g>`
  + `<circle class="fa-flow" style="animation-duration:.9s" cx="60" cy="60" r="42" fill="none" stroke="#fff" stroke-width=".7" stroke-dasharray="2 10"/>`
  + fFly(6, 993, 50, '#2affea', 0.7, 2.6) + fFly(4, 995, 50, '#ff2a8a', 0.7, 2.2);

/* ---------- Аля: красная лента вместо синего банта; новые фразы шёпота (6 штук) ---------- */
{ const base = FRAME_ART.an_alya;
  FRAME_ART.an_alya = () => base().split('url(#fg-satin)').join('url(#fg-ribbon)').split('#0e1f5a').join('#5a0610').split('#9fc0ff').join('#ffb0b0').split('#2a4fb8').join('#c8102e'); }
ALYA_WHISPERS.splice(0, ALYA_WHISPERS.length, 'милашка', 'дурак', 'глупенький', 'заметь меня', 'нравишься', 'опять спишь?');
{ const fx = FRAME_FX.an_alya; FRAME_FX.an_alya = () => fx().split('fa-wh5').join('fa-wh6'); }
