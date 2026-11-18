'use strict';
/* Аниме-рамки (2026-11-18). Открываются, когда оценишь тайтл (achievements.js: ANIME_FR).
   Только мотивы — без логотипов, надписей из тайтлов и персонажей. Поле 120×120, аватарка — круг r=40. */
const X6 = (r, a) => f5xy(r, a);
const P6 = (pts) => 'M' + pts.map(([x, y]) => `${(+x).toFixed(1)} ${(+y).toFixed(1)}`).join('L');
// сужающийся «язык» вдоль дуги: от угла a0 на sweep градусов, радиус r0→r1, толщина w0→w1
const f6tent = (a0, sweep, r0, r1, w0, w1, n = 18) => { const L = [], R = []; for (let i = 0; i <= n; i++) { const t = i / n, a = a0 + sweep * t, r = r0 + (r1 - r0) * t, w = w0 + (w1 - w0) * t; L.push(fXY(r - w / 2, a)); R.push(fXY(r + w / 2, a)); } return P6([...L, ...R.reverse()]) + 'Z'; };
const f6mid = (a0, sweep, r0, r1, n = 18) => P6(Array.from({ length: n + 1 }, (_, i) => fXY(r0 + ((r1 - r0) * i) / n, a0 + (sweep * i) / n)));
const f6flower = (x, y, s, c = '#8fc8ff', edge = '#4a7fc0', mid = '#fff8d6') => `<g transform="translate(${x} ${y}) scale(${s})">${[0, 72, 144, 216, 288].map((r) => `<ellipse transform="rotate(${r})" cx="0" cy="-2.2" rx="1.4" ry="2.2" fill="${c}" stroke="${edge}" stroke-width=".3"/>`).join('')}<circle r=".9" fill="${mid}"/></g>`;
const f6poly = (n, r, rot = 0) => Array.from({ length: n }, (_, i) => fP(r, rot + (i * 360) / n).replace(' ', ',')).join(' ');
const f6gear = (cx, cy, n, r0, r1) => 'M' + Array.from({ length: n * 4 }, (_, i) => { const k = Math.floor(i / 2) % 2, a = ((i * 90) / n - 90) * (Math.PI / 180), r = k ? r1 : r0; return `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`; }).join('L') + 'Z';

document.body.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<linearGradient id="fg-cursed" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#0b0820"/><stop offset=".35" stop-color="#3b22c9"/><stop offset=".7" stop-color="#8f7bff"/><stop offset="1" stop-color="#e8e0ff"/></linearGradient>
<linearGradient id="fg-wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a3416"/><stop offset=".45" stop-color="#c98c4e"/><stop offset=".6" stop-color="#a8703c"/><stop offset="1" stop-color="#5a3416"/></linearGradient>
<radialGradient id="fg-woodR" gradientUnits="userSpaceOnUse" cx="60" cy="60" r="60"><stop offset=".74" stop-color="#5a3416"/><stop offset=".79" stop-color="#c98c4e"/><stop offset=".84" stop-color="#7a4a22"/></radialGradient>
<radialGradient id="fg-apple" cx=".35" cy=".35" r=".75"><stop offset="0" stop-color="#ff6a6a"/><stop offset=".55" stop-color="#d0101e"/><stop offset="1" stop-color="#6a0008"/></radialGradient>
<linearGradient id="fg-kagune" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5a6a"/><stop offset=".5" stop-color="#d0102a"/><stop offset="1" stop-color="#5a0010"/></linearGradient>
<linearGradient id="fg-twi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16235e"/><stop offset=".35" stop-color="#4a3f9c"/><stop offset=".6" stop-color="#ff8fb1"/><stop offset=".85" stop-color="#ffb26b"/><stop offset="1" stop-color="#ffd59a"/></linearGradient>
<linearGradient id="fg-tail" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>
<radialGradient id="fg-pond" gradientUnits="userSpaceOnUse" cx="60" cy="60" r="60"><stop offset=".68" stop-color="#1f6f86"/><stop offset=".85" stop-color="#2a8fa6"/><stop offset=".96" stop-color="#6cc7d6"/><stop offset="1" stop-color="#9fe0ea"/></radialGradient>
<radialGradient id="fg-ubw" gradientUnits="userSpaceOnUse" cx="60" cy="60" r="60"><stop offset=".66" stop-color="#ff9a3a" stop-opacity=".6"/><stop offset=".85" stop-color="#b8401a" stop-opacity=".3"/><stop offset="1" stop-color="#b8401a" stop-opacity="0"/></radialGradient>
<clipPath id="fc-r59" clipPathUnits="userSpaceOnUse"><circle cx="60" cy="60" r="59"/></clipPath>
<pattern id="fp-dots" width="2.6" height="2.6" patternUnits="userSpaceOnUse"><circle cx="1.3" cy="1.3" r=".55" fill="#c27a00"/></pattern>
</defs></svg>`);

Object.assign(FRAME_ART, {
  // Атака титанов: каменная стена с зубцами, тросы снаряжения цепляются за стену, зелёный плащ внизу
  an_aot: () => { const rnd = fRand(301);
    return fRing(46.5, 10, '#9a9283')
      + [42.75, 45.25, 47.75, 50.25].map((r, i) => { const n = Math.round((2 * Math.PI * r) / 6); return `<circle cx="60" cy="60" r="${r}" fill="none" stroke="#4e483f" stroke-width="2.5" pathLength="${n * 10}" stroke-dasharray="1 9" stroke-dashoffset="${i % 2 ? 5 : 0}"/>`; }).join('')
      + [44, 46.5, 49].map((r) => fRing(r, 0.5, '#4e483f')).join('') + fRing(41.8, 1.2, '#2e2a24') + fRing(51.3, 0.8, '#c9c0ae')
      + Array.from({ length: 16 }, () => { const [x, y] = X6(42 + rnd() * 9, rnd() * 360); return `<circle cx="${x}" cy="${y}" r=".5" fill="#c9c0ae" opacity=".7"/>`; }).join('')
      + fRep(28, () => '<rect x="57.6" y="3.8" width="4.8" height="5" fill="#a39a8a" stroke="#4e483f" stroke-width=".6"/>')
      + `<path d="M${fP(51, 150)}A51 51 0 0 0 ${fP(51, 30)}L103 97Q93 104 84 108T66 114T48 112T30 106T17 97Z" fill="#2f5a3a" stroke="#183020" stroke-width=".7" stroke-linejoin="round"/>`
      + '<path d="M38 101L34 109M50 104L48 113M62 105V115M74 104L77 112M86 101L90 107" stroke="#183020" stroke-width=".6" opacity=".6"/>'
      + [[[-4, 6], -128], [[124, 12], -52]].map(([[x0, y0], a]) => { const [x, y] = X6(55, a); return `<path d="M${x0} ${y0}Q${((x0 + x) / 2).toFixed(1)} ${(Math.max(y0, y) + 8).toFixed(1)} ${x} ${y}" fill="none" stroke="#d6dde6" stroke-width=".8"/><circle cx="${x}" cy="${y}" r="1.4" fill="#59606e" stroke="#2a2e36" stroke-width=".5"/>`; }).join('');
  },

  // Магическая битва: чёрное кольцо, сине-фиолетовое проклятое пламя, бумажные печати-талисманы
  an_jjk: () => { const rnd = fRand(311), flame = 'M57 18C53 14 56 10 57 5C58.5 8 60 9 59.5 3C63 7 65 11 62 14C64.5 13 65.5 11 65 9C67.5 13 66 17 63 18Z';
    const flames = (n, off, s0, op) => fRep(n, (k) => `<g transform="translate(60 18) scale(${(s0 + rnd() * 0.35).toFixed(2)}) translate(-60 -18)"><path class="fa-flick" style="animation-delay:${(-rnd() * 0.8).toFixed(2)}s" d="${flame}" fill="url(#fg-cursed)" opacity="${op}"/></g>`, off);
    return flames(18, 10, 0.75, 0.7) + flames(14, 0, 0.85, 1)
      + fRing(44.5, 5, '#120f1d') + fRing(47, 0.8, '#7b5cff') + fRing(42, 0.8, '#7b5cff')
      + [45, 135, 225, 315].map((d) => fAt(d, '<g class="fa-swing"><rect x="56.5" y="3" width="7" height="13" fill="#f3ead2" stroke="#b8a77a" stroke-width=".5"/><rect x="56.5" y="3" width="7" height="1.8" fill="#c4161c"/><path d="M58 6.5H62M60 6.5V15M57.8 9.5L62 11.8M58.2 13.5H61.8" stroke="#c4161c" stroke-width=".8" fill="none"/></g>')).join('');
  },

  // Клинок, рассекающий демонов: кольцо в зелёно-чёрную клетку, чёрный клинок с цубой по верху, глициния внизу
  an_kny: () => { const rnd = fRand(321);
    const hamon = P6(Array.from({ length: 41 }, (_, i) => fXY(54.2 + 0.45 * Math.sin(i * 1.3), -148 + (i * 120) / 40)));
    const cluster = (cx, cy) => Array.from({ length: 11 }, (_, i) => { const t = i / 10, x = cx + (rnd() - 0.5) * 7 * (1 - t), y = cy + t * 11; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.8 - t * 0.7).toFixed(1)}" fill="${['#b07ce8', '#cfa6ff', '#8e5ad0'][i % 3]}" stroke="#5a2f8a" stroke-width=".3"/>`; }).join('');
    return fRing(44.5, 4, '#121212') + '<circle cx="60" cy="60" r="44.5" fill="none" stroke="#1f9a63" stroke-width="4" pathLength="72" stroke-dasharray="1 1"/>'
      + fRing(48.5, 4, '#121212') + '<circle cx="60" cy="60" r="48.5" fill="none" stroke="#1f9a63" stroke-width="4" pathLength="72" stroke-dasharray="1 1" stroke-dashoffset="1"/>'
      + fRing(42.5, 0.8, '#0a0a0a') + fRing(46.5, 0.4, '#0a0a0a') + fRing(50.5, 0.9, '#0a0a0a')
      + `<path d="M${fP(53, -150)}A53 53 0 0 1 ${fP(53, -24)}L${fP(54.4, -15)}L${fP(55.7, -26)}A55.7 55.7 0 0 0 ${fP(55.7, -150)}Z" fill="#1d1f24" stroke="#000" stroke-width=".5"/>`
      + `<path d="${fArc(55.5, -149, -27)}" fill="none" stroke="#e8edf4" stroke-width=".7"/><path d="${hamon}" fill="none" stroke="#9aa3b0" stroke-width=".35" opacity=".8"/>`
      + `<path d="${fArc(54.4, -157, -176)}" fill="none" stroke="#2b2b2b" stroke-width="3.4"/><path d="${fArc(54.4, -157, -176)}" fill="none" stroke="#e9e4d6" stroke-width="3" stroke-dasharray="1.2 1.3" opacity=".9"/>`
      + (() => { const [x, y] = X6(54.4, -153), [px, py] = X6(54.4, -178); return `<circle cx="${x}" cy="${y}" r="3.8" fill="#2a2a2a" stroke="#8a8a8a" stroke-width=".6"/>${[0, 60, 120, 180, 240, 300].map((r) => `<circle cx="${(x + 2.4 * Math.cos((r * Math.PI) / 180)).toFixed(1)}" cy="${(y + 2.4 * Math.sin((r * Math.PI) / 180)).toFixed(1)}" r=".7" fill="#555"/>`).join('')}<circle cx="${px}" cy="${py}" r="1.7" fill="#6a6a6a"/>`; })()
      + cluster(42, 104) + cluster(60, 108) + cluster(78, 104)
      + [[42, 103, -30], [60, 107, 0], [78, 103, 30]].map(([x, y, r]) => fLeaf(x - 3, y, r - 70, 5, 1.6, '#4caf50', '#1f5a22', false) + fLeaf(x + 3, y, r + 70, 5, 1.6, '#4caf50', '#1f5a22', false)).join('');
  },

  // Наруто: оранжевое кольцо, налобная пластина без знака на синей ткани, скрещённые кунаи внизу
  an_naruto: () => {
    const kunai = (r) => `<g transform="translate(60 109) rotate(${r}) scale(1.15)"><path d="M0-12L2.6-3.5L1-2.4H-1L-2.6-3.5Z" fill="url(#fg-steel)" stroke="#1d2129" stroke-width=".5" stroke-linejoin="round"/><rect x="-.9" y="-2.4" width="1.8" height="6" fill="#2a2e36"/><path d="M-.9-1.5H.9M-.9 0H.9M-.9 1.5H.9" stroke="#8a93a5" stroke-width=".4"/><circle cy="5.4" r="1.6" fill="none" stroke="#59606e" stroke-width=".8"/></g>`;
    return fRing(45.5, 7, '#ff8a1f') + fRing(43, 1.6, '#1a1a1a') + fRing(48.5, 1.2, '#1a1a1a') + fRing(45.6, 0.5, '#ffd08a', 'opacity=".8"')
      + `<path d="${f5sector(50, 54, -128, -52)}" fill="#24324f" stroke="#111a2e" stroke-width=".6"/>`
      + `<path d="M${fP(52, -52)}C104 12 112 6 118 10C112 12 108 16 104 22Z" fill="#24324f" stroke="#111a2e" stroke-width=".6"/><path d="M${fP(51, -55)}C102 20 110 20 116 26C110 26 106 28 101 30Z" fill="#2c3d60" stroke="#111a2e" stroke-width=".6"/>`
      + '<rect x="45" y="1.5" width="30" height="13" rx="2" fill="url(#fg-steel)" stroke="#3a4558" stroke-width=".9"/><rect x="47" y="3.5" width="26" height="9" rx="1.2" fill="none" stroke="#fff" stroke-width=".5" opacity=".5"/>'
      + [[47.5, 4], [72.5, 4], [47.5, 12], [72.5, 12]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".8" fill="#5a6478"/>`).join('')
      + kunai(-38) + kunai(38);
  },

  // Ван-Пис: штурвал корабля (ручки торчат наружу), латунные заклёпки, волны внизу
  an_onepiece: () => '<g class="fa-sway" style="animation-duration:6s">'
    + fRep(8, () => '<path d="M58.7 21V11H61.3V21Z" fill="url(#fg-wood)" stroke="#3a220d" stroke-width=".5"/><path d="M58.3 9.8C57.2 8.3 57.6 6.8 58.6 5.8C57.6 4.5 58.2 2.3 60 1.9C61.8 2.3 62.4 4.5 61.4 5.8C62.4 6.8 62.8 8.3 61.7 9.8Z" fill="url(#fg-wood)" stroke="#3a220d" stroke-width=".6"/>', 22.5)
    + fRing(47.5, 6, 'url(#fg-woodR)') + fRing(50.5, 0.8, '#2e1a0a') + fRing(44.5, 0.8, '#2e1a0a') + fRing(47.5, 0.4, '#e0a860', 'opacity=".6"')
    + fRep(16, () => '<circle cx="60" cy="12.5" r=".9" fill="#e0b450" stroke="#6a4a10" stroke-width=".3"/>') + fRing(42.2, 2.4, '#6a4020') + fRing(41.1, 0.6, '#2e1a0a') + '</g>'
    + '<g mask="url(#fm-out)" clip-path="url(#fc-r59)"><path d="M-6 106Q2 100 10 104T26 104T42 106T58 104T74 106T90 104T106 104T126 106V124H-6Z" fill="#1f6fc2" stroke="#bfe6ff" stroke-width="1"/><path d="M-6 112Q4 108 14 111T34 111T54 112T74 111T94 112T126 111V124H-6Z" fill="#2a86d8" opacity=".9"/></g>',

  // Тетрадь смерти: чёрная кожа с прошивкой, строки почерком по кругу, перо, красное яблоко
  an_deathnote: () => fRing(45.5, 9, '#121015') + fRing(41.4, 0.8, '#c8c8d0', 'opacity=".6"') + fRing(49.6, 0.8, '#c8c8d0', 'opacity=".6"')
    + fRing(42.6, 0.4, '#8a8a95', 'stroke-dasharray="1.6 1.2"') + fRing(48.4, 0.4, '#8a8a95', 'stroke-dasharray="1.6 1.2"')
    + [[44.2, 150, 0, 0], [46.8, 170, 1, 2.5]].map(([r, n, ph, d]) => `<path class="fa-ink" style="animation-duration:9s;animation-delay:${-d}s" d="${fWave(r, 0.5, n, ph)}" fill="none" stroke="#e8e8ee" stroke-opacity=".85" stroke-width=".4" stroke-dasharray="5 1.6 3 1.6 7 2.2 4 1.6"/>`).join('')
    + [45, 135, 225, 315].map((d) => fAt(d, '<path d="M60 5L62.6 8.5L60 14.5L57.4 8.5Z" fill="#bfc3cc" stroke="#55585f" stroke-width=".5"/>')).join('')
    + '<g transform="translate(13 1) rotate(-38)"><path d="M0 2C-4.5 6-5 14-1 20L0 22L1 20C5 14 4.5 6 0 2Z" fill="#1a1a1f" stroke="#6a6a75" stroke-width=".4"/><path d="M0 1V22M0 6L-3 4M0 9L-3.5 7M0 12L-3.5 10M0 6L3 4M0 9L3.5 7M0 12L3.5 10" stroke="#8a8a95" stroke-width=".3"/><path d="M-.8 22L0 27.5L.8 22Z" fill="#c9ced6"/></g>'
    + '<g transform="translate(98 99)"><path d="M0-4.5C-2-6.5-6.5-6-6.5-1.5C-6.5 3-3.5 6.5 0 5.5C3.5 6.5 6.5 3 6.5-1.5C6.5-6 2-6.5 0-4.5Z" fill="url(#fg-apple)" stroke="#4a0006" stroke-width=".5"/><path d="M0-4.5Q.5-7.5 2-8.5" fill="none" stroke="#4a2a10" stroke-width=".8"/><path d="M1.2-7C3-9 5.5-8.5 6-7.5C4-6.5 2.5-6.5 1.2-7Z" fill="#3f8a2a"/><ellipse cx="-3.2" cy="-2.2" rx="1.2" ry="1.8" fill="#fff" opacity=".55"/></g>',

  // Человек-бензопила: стальная шина, цепь с зубьями (крутится), оранжевая кромка, шнур стартера, брызги
  an_csm: () => { const rnd = fRand(331);
    return fBevel('steel', 45.5, 6) + fRing(41.6, 1.4, '#ff7a1a')
      + `<g class="fa-saw">${fRep(30, () => '<rect x="57.8" y="9.2" width="4.4" height="3" rx="1" fill="#3a3f48" stroke="#14171c" stroke-width=".4"/>')}${fRep(30, () => '<path d="M57.4 10L58.4 5.4L62.9 4.4L61.2 6.6L62.5 10Z" fill="url(#fg-steel)" stroke="#14171c" stroke-width=".45" stroke-linejoin="round"/>', 6)}</g>`
      + '<path d="M60 108Q62.5 112 60 116" fill="none" stroke="#c9ced6" stroke-width="1"/><rect x="53.5" y="115.4" width="13" height="3.4" rx="1.6" fill="#ff7a1a" stroke="#5a2a08" stroke-width=".6"/>'
      + Array.from({ length: 11 }, () => { const [x, y] = X6(51 + rnd() * 8, rnd() * 360); return `<circle cx="${x}" cy="${y}" r="${(0.5 + rnd() * 1.3).toFixed(1)}" fill="#b5101c" opacity=".9"/>`; }).join('');
  },

  // Фрирен: тонкий золотой магический круг с рунами, гексаграмма, голубые цветы внизу
  an_frieren: () => { const rnd = fRand(341), runes = ['M59 8H61M60 6.5V9.5', 'M58.8 9.5L60 6.5L61.2 9.5Z', 'M58.8 9A1.4 1.4 0 0 1 61.2 9', 'M58.8 7L60 9.3L61.2 7', 'M59.2 6.8V9.4M60.8 6.8V9.4'];
    return fRing(49.4, 16.4, '#eaf4ff', 'opacity=".16"') + fRing(42.2, 0.9, '#e9d39a') + fRing(49.5, 0.7, '#e9d39a') + fRing(56.5, 0.9, '#e9d39a') + fRing(57.6, 0.4, '#e9d39a')
      + `<g class="fa-spin slow">${fRep(24, (k) => `<path d="${runes[k % 5]}" fill="none" stroke="#f4e3b0" stroke-width=".55" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 -1)"/>`)}</g>`
      + `<g class="fa-spin rev slow"><g mask="url(#fm-out)"><polygon points="${f6poly(3, 49.5, -90)}" fill="none" stroke="#e9d39a" stroke-width=".6"/><polygon points="${f6poly(3, 49.5, 90)}" fill="none" stroke="#e9d39a" stroke-width=".6"/></g>${fRep(6, () => '<circle cx="60" cy="10.5" r="1" fill="#fff8e0" stroke="#c9a85a" stroke-width=".3"/>')}</g>`
      + [[60, 32, 54], [72, 22, 53], [84, 38, 55], [96, 26, 53.5], [108, 34, 55], [48, 24, 53], [118, 30, 54.5], [66, 36, 57]].map(([a, , r]) => { const [x, y] = X6(r, a); return fLeaf(x, y + 2, a - 90 + (rnd() - 0.5) * 30, 4.5, 1.4, '#5aa86a', '#2a5a32', false); }).join('')
      + [[60, 54], [72, 53], [84, 55], [96, 53.5], [108, 55], [48, 53], [118, 54.5], [36, 54], [130, 53.5]].map(([a, r]) => { const [x, y] = X6(r, a); return f6flower(x, y, 0.95 + rnd() * 0.35); }).join('');
  },

  // Стальной алхимик: круг преобразования — мелом по тёмному, гексаграмма, малые круги в вершинах
  an_fma: () => { const marks = ['M59 4.6H61', 'M60 3.8V5.6', 'M59.2 5.4L60 3.8L60.8 5.4', 'M59.3 4.7A.8.8 0 1 0 60.7 4.7A.8.8 0 1 0 59.3 4.7'];
    return fRing(49.5, 17, '#0f1830', 'opacity=".85"')
      + `<g class="fa-glow" style="--g:#6fb8ff">${fRing(57.2, 0.9, '#dce9ff') + fRing(53.5, 0.7, '#dce9ff') + fRing(42.3, 0.8, '#dce9ff') + fRing(45.5, 0.4, '#dce9ff', 'stroke-dasharray="2 1.5"')}`
      + fRep(36, (k) => `<path d="${marks[k % 4]}" fill="none" stroke="#dce9ff" stroke-width=".45" stroke-linecap="round"/>`)
      + `<g mask="url(#fm-out)"><polygon points="${f6poly(3, 53.5, -90)}" fill="none" stroke="#dce9ff" stroke-width=".7"/><polygon points="${f6poly(3, 53.5, 90)}" fill="none" stroke="#dce9ff" stroke-width=".7"/></g>`
      + fRep(6, (k) => `<circle cx="60" cy="6.5" r="3.4" fill="#0f1830" stroke="#dce9ff" stroke-width=".7"/>${['<circle cx="60" cy="6.5" r="1" fill="#dce9ff"/>', '<path d="M58.5 7.6L60 5L61.5 7.6Z" fill="none" stroke="#dce9ff" stroke-width=".5"/>', '<path d="M59 5.4A1.6 1.6 0 1 0 61 7.6" fill="none" stroke="#dce9ff" stroke-width=".5"/>'][k % 3]}`) + '</g>';
  },

  // Re:Zero: тёмный циферблат с римскими цифрами в серебряной оправе, трещины на стекле, фиолетовая мгла
  an_rezero: () => { const rnd = fRand(351), rom = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    return `<g filter="url(#ff-cloud)">${Array.from({ length: 9 }, () => { const [x, y] = X6(54 + rnd() * 4, 110 + rnd() * 100); return `<circle cx="${x}" cy="${y}" r="${(4 + rnd() * 3).toFixed(1)}" fill="#2a0f3d" opacity=".8"/>`; }).join('')}</g>`
      + fRing(48, 14, '#1d1430') + fRing(55.6, 2.4, 'url(#fg-silver)') + fRing(56.9, 0.5, '#3a3048') + fRing(41.6, 1, '#b9a7d9')
      + fTicks(60, 52.5, 54.3, '#cbbfe6', 0.4, 0, 0.8) + fTicks(12, 50.5, 54.3, '#efe6ff', 1.3, 0, 1)
      + rom.map((t, i) => { const [x, y] = X6(46.3, -90 + i * 30); return `<text x="${x}" y="${(y + 1.4).toFixed(1)}" text-anchor="middle" font-size="3.8" font-family="Georgia, serif" fill="#d9cff0">${t}</text>`; }).join('')
      + [-50, -42, -34].map((a, i) => `<path d="${fCrack(a, 42, 56, 361 + i)}" fill="none" stroke="#fff" stroke-width=".4" opacity=".6"/>`).join('');
  },

  // Твоё имя: сумеречное небо по кругу, комета раскалывается надвое, красный плетёный шнурок с узлом
  an_yourname: () => { const rnd = fRand(371);
    return '<circle cx="60" cy="60" r="49.5" fill="none" stroke="url(#fg-twi)" stroke-width="17"/>' + fRing(57.6, 0.6, '#ffd2e0', 'opacity=".6"') + fRing(41.6, 0.6, '#fff', 'opacity=".5"')
      + Array.from({ length: 16 }, () => { const [x, y] = X6(44 + rnd() * 12, -170 + rnd() * 160); return `<circle cx="${x}" cy="${y}" r="${(0.3 + rnd() * 0.4).toFixed(2)}" fill="#fff"/>`; }).join('')
      + `<path class="fa-shim" d="${f6tent(-140, 100, 50, 50, 0.3, 3)}" fill="url(#fg-tail)"/><path class="fa-shim" style="animation-delay:-1.5s" d="${f6tent(-115, 70, 56, 50.5, 0.2, 1.8)}" fill="url(#fg-tail)" opacity=".85"/>`
      + (() => { const [x, y] = X6(50, -40), [fx, fy] = X6(55.5, -58); return `<circle class="fa-glow" style="--g:#bfe6ff" cx="${x}" cy="${y}" r="2.2" fill="#fff"/><circle cx="${fx}" cy="${fy}" r="1.1" fill="#fff"/>`; })()
      + fRing(42.2, 1.7, '#d8202c') + fRing(42.2, 1.7, '#ff7a80', 'stroke-dasharray="1 1.4" opacity=".7"')
      + '<g class="fa-swing"><path d="M59 104.5Q56.5 110 58 117M61 104.5Q63.5 110 62.5 117" fill="none" stroke="#d8202c" stroke-width="1.4" stroke-linecap="round"/><path d="M57 116.5H59.5M61.5 116.5H64" stroke="#ff7a80" stroke-width="1.6"/></g>'
      + '<path d="M60 103c-3-2.5-6-1-5 1.5s4 1 5-1.5c1 2.5 4 4 5 1.5s-2-4-5-1.5Z" fill="#d8202c" stroke="#7a0a12" stroke-width=".5"/>';
  },

  // Евангелион: фиолетовая броня с зелёной окантовкой, оранжевые вставки, жёлто-чёрные полосы, восьмиугольное поле
  an_eva: () => `<polygon points="${f6poly(8, 57.5, 22.5)}" fill="none" stroke="#ff9a1f" stroke-width=".7" opacity=".35"/><polygon points="${f6poly(8, 54, 22.5)}" fill="none" stroke="#ff9a1f" stroke-width=".9" opacity=".55"/>`
    + fRing(46, 8, '#4b2378') + fRep(12, () => '<path d="M60 10V18" stroke="#2a0f48" stroke-width=".8"/>', 15) + fRing(42.6, 1, '#7bd94b') + fRing(49.4, 1, '#7bd94b') + fRing(48.2, 0.5, '#9b6bd6')
    + [-90, 0, 180].map((a) => `<path d="${fArc(46, a - 7, a + 7)}" fill="none" stroke="#ff8a1a" stroke-width="3" stroke-linecap="butt"/>`).join('')
    + fRep(12, () => '<circle cx="60" cy="14" r=".8" fill="#c9b6e8"/>')
    + `<path d="${fArc(53, 58, 122)}" fill="none" stroke="#ffd21a" stroke-width="4.4"/><path d="${fArc(53, 58, 122)}" fill="none" stroke="#111" stroke-width="4.4" stroke-dasharray="2 2"/><path d="${fArc(55.4, 58, 122)}" fill="none" stroke="#111" stroke-width=".6"/><path d="${fArc(50.6, 58, 122)}" fill="none" stroke="#111" stroke-width=".6"/>`,

  // Ковбой Бибоп: виниловая пластинка с бороздками, тонарм в углу (ноты — в слое движения)
  an_bebop: () => fRing(49.2, 16, '#141417') + Array.from({ length: 15 }, (_, i) => fRing(43 + i * 0.95, 0.35, '#2e2e37')).join('')
    + `<path d="${fArc(50, -70, -28)}" fill="none" stroke="#fff" stroke-width="14" opacity=".07"/><path d="${fArc(50, 110, 152)}" fill="none" stroke="#fff" stroke-width="14" opacity=".07"/>`
    + fRing(42, 1.6, '#e8b23a') + fRing(43.1, 0.4, '#7a5a1a') + fRing(57.2, 0.6, '#3a3a44')
    + '<path d="M113 9L97 7.5L88 12.5" fill="none" stroke="#c9ced6" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M85.2 10.6L90.6 12.6L89.2 15.8L83.8 13.8Z" fill="#2a2a30" stroke="#aab0bb" stroke-width=".4"/>'
    + '<circle cx="113" cy="9" r="4.2" fill="url(#fg-steel)" stroke="#3a4558" stroke-width=".6"/><circle cx="113" cy="9" r="1.4" fill="#3a4558"/><rect x="116" y="6.8" width="4" height="4.4" rx="1" fill="#59606e"/>',

  // Токийский гуль: чёрное кольцо с красными трещинами, четыре красных отростка-«крыла», паучьи лилии внизу
  an_ghoul: () => { const rnd = fRand(381);
    const lily = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0V9" stroke="#2f6a2a" stroke-width=".8"/>${[0, 60, 120, 180, 240, 300].map((r) => `<g transform="rotate(${r})"><path d="M0 0C2-1 4-3 4.5-6C5-4 4-1 1 .5Z" fill="#e0142c"/><path d="M0 0Q3-7 6.5-8.5" fill="none" stroke="#ff4a5a" stroke-width=".35"/><circle cx="6.5" cy="-8.5" r=".5" fill="#ffd36b"/></g>`).join('')}</g>`;
    return fRing(44.5, 6, '#140609') + [20, 95, 160, 235, 300].map((a, i) => `<path class="fa-glow" style="--g:#ff2a3a" d="${fCrack(a, 41.8, 47.2, 391 + i)}" fill="none" stroke="#ff2a3a" stroke-width=".6"/>`).join('')
      + [[116, 92, 45, 58.5, 10], [150, 74, 46, 55.5, 7], [64, -92, 45, 58.5, 10], [30, -74, 46, 55.5, 7]].map(([a, sw, r0, r1, w], k) => `<g class="fa-sway" style="animation-duration:${(2.6 + k * 0.4).toFixed(1)}s;animation-delay:${-k * 0.7}s"><path d="${f6tent(a, sw, r0, r1, w, 0.6)}" fill="url(#fg-kagune)" stroke="#3a0006" stroke-width=".7" stroke-linejoin="round"/>${Array.from({ length: 7 }, (_, i) => { const t = (i + 1) / 8, g = a + sw * t, r = r0 + (r1 - r0) * t, ww = (w + (0.6 - w) * t) / 2; return `<path d="M${fP(r - ww, g)}Q${fP(r, g + (sw > 0 ? 2 : -2))} ${fP(r + ww, g)}" fill="none" stroke="#5a0010" stroke-width=".5" opacity=".8"/>`; }).join('')}<path d="${f6mid(a + sw * 0.05, sw * 0.85, r0 + 0.6, r1 - 0.2)}" fill="none" stroke="#ffb0b0" stroke-width=".6" opacity=".55"/></g>`).join('')
      + lily(47, 108, 0.9) + lily(73, 110, 0.8) + Array.from({ length: 6 }, () => { const [x, y] = X6(50 + rnd() * 7, rnd() * 360); return `<circle cx="${x}" cy="${y}" r=".6" fill="#ff4a5a"/>`; }).join('');
  },

  // Ванпанчмен: комиксный взрыв от удара — жёлтые лучи с растром, красная вспышка, белое кольцо
  an_opm: () => { const rnd = fRand(401);
    const y = Array.from({ length: 56 }, (_, i) => fP(i % 2 ? 45 : 55 + rnd() * 6, i * (360 / 56)).replace(' ', ',')).join(' ');
    const r = Array.from({ length: 40 }, (_, i) => fP(i % 2 ? 42 : 47.5 + rnd() * 4, i * 9 + 4).replace(' ', ',')).join(' ');
    return `<polygon points="${y}" fill="#ffd91a" stroke="#111" stroke-width="1.5" stroke-linejoin="miter" mask="url(#fm-out)"/><polygon points="${y}" fill="url(#fp-dots)" opacity=".5" mask="url(#fm-out)"/>`
      + `<polygon points="${r}" fill="#ff3b2f" stroke="#111" stroke-width="1.1" mask="url(#fm-out)"/>` + fRing(41.8, 1.8, '#fff') + fRing(40.9, 0.8, '#111');
  },

  // Поднятие уровня: голубое окно «системы» — восьмиугольная панель с уголками, полоска опыта, кольцо
  an_sololvl: () => '<path d="M14 6H106L114 14V106L106 114H14L6 106V14Z" fill="#071a33" opacity=".6" mask="url(#fm-out)"/>'
    + `<g class="fa-glow" style="--g:#3aa0ff"><path d="M14 6H106L114 14V106L106 114H14L6 106V14Z" fill="none" stroke="#3aa0ff" stroke-width=".9"/>${[0, 90, 180, 270].map((d) => fAt(d, '<path d="M6 26V14L14 6H26" fill="none" stroke="#bfe4ff" stroke-width="2" stroke-linejoin="round"/>')).join('')}${fRing(42, 1.4, '#3aa0ff')}</g>`
    + fRing(44.6, 0.5, '#8fd0ff', 'stroke-dasharray="3 2"')
    + '<rect x="40" y="8.5" width="40" height="5" rx="1" fill="#0b2a52" stroke="#3aa0ff" stroke-width=".6"/><path d="M43 11H56M60 11H63M66 11H77" stroke="#8fd0ff" stroke-width="1.2" stroke-linecap="round"/>'
    + '<rect x="30" y="106.5" width="60" height="3.6" rx="1" fill="#0b2a52" stroke="#3aa0ff" stroke-width=".6"/><rect class="fa-fill" x="31" y="107.4" width="58" height="1.8" rx=".6" fill="#7fd4ff"/>',

  // Коносуба: красный магический круг (вращается), зелёная жаба выглядывает снизу (капуста летает в слое движения)
  an_konosuba: () => '<g class="fa-spin slow">' + fRing(49, 15, '#3a0505', 'opacity=".55"') + `<g class="fa-glow" style="--g:#ff3a3a">${fRing(56, 1.2, '#ff3a3a') + fRing(53, 0.6, '#ff3a3a') + fRing(42.4, 1, '#ff3a3a')}`
    + fRep(30, (k) => `<path d="${['M59 5H61M60 4V6', 'M59.2 5.8L60 4.2L60.8 5.8', 'M59.3 4.3L60.7 5.7M60.7 4.3L59.3 5.7'][k % 3]}" fill="none" stroke="#ff8a8a" stroke-width=".5"/>`)
    + `<g mask="url(#fm-out)"><polygon points="${Array.from({ length: 5 }, (_, i) => fP(53, -90 + i * 144).replace(' ', ',')).join(' ')}" fill="none" stroke="#ff3a3a" stroke-width=".8"/></g></g></g>`
    + '<path d="M33 121C33 108 44 102 60 102S87 108 87 121Z" fill="#7cc35a" stroke="#2f5a1f" stroke-width="1"/><path d="M42 113Q60 119 78 113" fill="none" stroke="#2f5a1f" stroke-width="1" stroke-linecap="round"/><ellipse cx="44" cy="112" rx="2.2" ry="1.2" fill="#ff9aa8" opacity=".7"/><ellipse cx="76" cy="112" rx="2.2" ry="1.2" fill="#ff9aa8" opacity=".7"/>'
    + [44.5, 75.5].map((x) => `<circle cx="${x}" cy="104" r="5" fill="#7cc35a" stroke="#2f5a1f" stroke-width="1"/><g class="fa-blink"><circle cx="${x}" cy="103.6" r="3.4" fill="#fff"/><circle cx="${x + (x < 60 ? 0.8 : -0.8)}" cy="103.8" r="1.7" fill="#111"/><circle cx="${x + (x < 60 ? 0.3 : -1.3)}" cy="103" r=".5" fill="#fff"/></g>`).join(''),

  // Форма голоса: пруд с кувшинками (карпы плавают в слое движения)
  an_silentvoice: () => fRing(49.3, 16, 'url(#fg-pond)') + fRing(57.3, 1.2, '#cfeff2', 'opacity=".7"') + fRing(41.5, 1, '#0f4d5f')
    + [[53, 150, 4.2], [54, 20, 3.6], [52, -110, 3.2], [55, 75, 3]].map(([r, a, s], i) => { const [x, y] = X6(r, a); return `<circle cx="${x}" cy="${y}" r="${s + 2.2}" fill="none" stroke="#bfeef4" stroke-width=".4" opacity=".6"/><path d="M${x} ${y}L${(x + s).toFixed(1)} ${(y - 1.2).toFixed(1)}A${s} ${s} 0 1 1 ${(x + s).toFixed(1)} ${(y + 1.2).toFixed(1)}Z" fill="#5aa55a" stroke="#2e6b2e" stroke-width=".5" transform="rotate(${i * 70} ${x} ${y})"/>`; }).join('')
    + (() => { const [x, y] = X6(53, 150); return `<g transform="translate(${x + 1} ${y - 1})">${[0, 72, 144, 216, 288].map((r) => `<ellipse transform="rotate(${r})" cx="0" cy="-1.6" rx="1" ry="1.8" fill="#ffc2d6" stroke="#e86a98" stroke-width=".3"/>`).join('')}<circle r=".7" fill="#ffd75e"/></g>`; })(),

  // Госпожа Кагуя: красная лента с золотой кромкой, сердце, пронзённое стрелой, розы внизу
  an_kaguya: () => { const rose = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-4.5 1C-6 4-2 6 0 5.5C2 6 6 4 4.5 1" fill="#9a0c22"/><circle r="4" fill="#c8102e" stroke="#6a0616" stroke-width=".5"/><path d="M0-.2C1.6-.4 1.8 1.6.2 1.8-1.8 2-2.2-.6-.6-1.8 1.6-3.2 3.6-1 3 1" fill="none" stroke="#6a0616" stroke-width=".6"/></g>`;
    return fRing(46, 7, 'url(#fg-heart)') + fRing(42.3, 1, 'url(#fg-gold)') + fRing(49.7, 1, 'url(#fg-gold)') + fScallops(24, 50.6, 1.6, 'url(#fg-gold)', 0.9)
      + fLeaf(40, 108, -120, 7, 2.4, '#3f8a2a', '#1f4a14', false) + fLeaf(80, 108, 120, 7, 2.4, '#3f8a2a', '#1f4a14', false) + rose(45, 107, 1) + rose(75, 107, 1) + rose(60, 111, 1.15)
      + '<path class="fa-beat" d="M60 17.5C49.5 10.5 50.5 1 55.8 1.5C58 1.7 59.3 3 60 4.5C60.7 3 62 1.7 64.2 1.5C69.5 1 70.5 10.5 60 17.5Z" fill="url(#fg-heart)" stroke="#7a0a22" stroke-width=".8"/><path d="M54.5 5C55 3.5 56.5 3 57.5 3.6" fill="none" stroke="#fff" stroke-width=".9" stroke-linecap="round" opacity=".8"/>'
      + '<path d="M42 19L53.2 12.4M67.4 4.1L77 -1.5" stroke="url(#fg-gold)" stroke-width="1.1" stroke-linecap="round"/><path d="M80 -3.3L74.6 -1.6L77.4 2.2Z" fill="url(#fg-gold)" stroke="#6b4a0c" stroke-width=".4"/><path d="M42 19L38.6 18.4L40.4 21.2ZM44 17.8L40.6 17.2L42.4 20Z" fill="#fff" stroke="#c9a14a" stroke-width=".4"/>';
  },

  // Торадора!: слева тигриные полосы, справа драконья чешуя, сверху рождественская звезда
  an_toradora: () => { const rnd = fRand(411);
    const stripes = Array.from({ length: 10 }, (_, k) => { const a = 98 + k * 17 + rnd() * 5, inner = k % 2; return inner ? `<path d="M${fP(42, a - 2.4)}L${fP(42, a + 2.4)}L${fP(46 + rnd() * 3, a + 1 + rnd() * 4)}Z" fill="#1a1208"/>` : `<path d="M${fP(51.2, a - 2.5)}L${fP(51.2, a + 3)}L${fP(44 + rnd() * 3, a + rnd() * 4)}Z" fill="#1a1208"/>`; }).join('');
    const scales = [43.6, 46.6, 49.6].map((r, row) => Array.from({ length: 26 }, (_, k) => { const a = -86 + k * 6.9 + (row % 2) * 3.4; return a > 88 ? '' : `<path d="M${fP(r + 1.5, a - 3.3)}Q${fP(r - 2.6, a)} ${fP(r + 1.5, a + 3.3)}" fill="none" stroke="#9ff3e6" stroke-width=".5" opacity=".8"/>`; }).join('')).join('');
    return `<path d="${f5sector(42, 51.2, 90, 270)}" fill="#ff9a2a" stroke="#5a2a00" stroke-width=".6"/>` + stripes
      + `<path d="${f5sector(42, 51.2, -90, 90)}" fill="#1f8f8a" stroke="#0a3a38" stroke-width=".6"/>` + scales
      + '<path d="M5 48L13 56M3.5 55L11.5 63M5 62L13 70" stroke="#ff9a2a" stroke-width="1.5" stroke-linecap="round"/><path d="M110 52Q118 46 115 39M110 68Q119 72 116 80" fill="none" stroke="#38c4b8" stroke-width="1.1" stroke-linecap="round"/>'
      + fRing(41.6, 0.8, '#2a1a08') + '<g class="fa-glow" style="--g:#ffd75e">' + fStar5(60, 7.5, 7, 0) + '</g>';
  },

  // Вайолет Эвергарден: клавиши пишущей машинки по кругу, изумрудная брошь, фиалки внизу
  an_violet: () => { const L = 'QWERTYUIOPASDFGHJKL';
    const keys = [-70, -50, -30, -10, 10, 30, 50, 130, 150, 170, 190, 210, 230, 250];
    return fRing(43.4, 3, 'url(#fg-gold)') + fRing(45, 0.5, '#6b4a0c') + fRing(41.8, 0.5, '#6b4a0c')
      + keys.map((a, i) => { const [x, y] = X6(51, a); return `<g class="fa-press" style="animation-delay:${(i * 0.37).toFixed(2)}s"><circle cx="${x}" cy="${y}" r="4.4" fill="#1b1b1e" stroke="#c9ced6" stroke-width="1"/><circle cx="${x}" cy="${y}" r="3.3" fill="none" stroke="#5a5a62" stroke-width=".4"/><text x="${x}" y="${(y + 1.5).toFixed(1)}" text-anchor="middle" font-size="4.2" font-family="Georgia, serif" fill="#f2efe6">${L[i]}</text></g>`; }).join('')
      + [[52, 72], [55, 82], [53, 92], [56, 100], [52, 108], [57, 90]].map(([r, a], i) => { const [x, y] = X6(r, a); return fLeaf(x, y + 1.5, a - 90 + (i % 2 ? 40 : -40), 4.5, 1.5, '#4f9a4a', '#235a20', false); }).join('')
      + [[52, 72], [55, 82], [53, 92], [56, 100], [52, 108]].map(([r, a]) => { const [x, y] = X6(r, a); return f6flower(x, y, 1.05, '#9b6bd6', '#5a2f8a', '#ffe9a8'); }).join('')
      + '<path d="M47 8C50 5 53 7 54 6M73 8C70 5 67 7 66 6" fill="none" stroke="url(#fg-gold)" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="60" cy="7.5" rx="6.2" ry="7.6" fill="url(#fg-gold)" stroke="#6b4a0c" stroke-width=".7"/>'
      + '<ellipse cx="60" cy="7.5" rx="4.4" ry="5.8" fill="#19a35a" stroke="#0a4a26" stroke-width=".5"/><path d="M60 1.7V13.3M55.6 7.5H64.4M57 3.5L63 11.5M63 3.5L57 11.5" stroke="#0a4a26" stroke-width=".3" opacity=".6"/><ellipse cx="58.3" cy="5" rx="1.2" ry="1.8" fill="#fff" opacity=".7"/>';
  },

  // Fate: поле воткнутых мечей вокруг, закатное зарево, шестерни в небе
  an_fate: () => { const rnd = fRand(421);
    const sword = (k) => { const t = k % 3, tilt = ((rnd() - 0.5) * 18).toFixed(1);
      const blade = t === 2 ? '<path d="M58.4 18V7.5L60 5.8L61.6 7.5V18Z" fill="#59606e" stroke="#1d2129" stroke-width=".45"/>' : `<path d="M${t ? 59 : 58.6} 18V7.5H${t ? 61 : 61.4}V18Z" fill="url(#fg-steel)" stroke="#2c3852" stroke-width=".4"/><path d="M60 17.5V8" stroke="#fff" stroke-width=".4" opacity=".7"/>`;
      const guard = t === 1 ? '<circle cx="60" cy="7" r="2.1" fill="#2a2a2a" stroke="#c9a14a" stroke-width=".5"/>' : `<path d="M${t ? 55.8 : 55} 7.9H${t ? 64.2 : 65}V6.3H${t ? 55.8 : 55}Z" fill="url(#fg-gold)" stroke="#6b4a0c" stroke-width=".35"/>`;
      return `<g transform="rotate(${tilt} 60 18)">${blade}${guard}<rect x="59.1" y="1.8" width="1.8" height="4.6" fill="${t === 2 ? '#3a1a1a' : '#6a1a1a'}" stroke="#1a0808" stroke-width=".3"/><circle cx="60" cy="1.4" r="1.15" fill="url(#fg-gold)" stroke="#6b4a0c" stroke-width=".3"/></g>`; };
    return '<circle cx="60" cy="60" r="60" fill="url(#fg-ubw)" mask="url(#fm-out)"/>'
      + `<path class="fa-twirl" style="animation-duration:20s" d="${f6gear(22, 16, 12, 9, 11)}" fill="none" stroke="#e8a060" stroke-width=".8" opacity=".45"/><path class="fa-twirl" style="animation-duration:26s;animation-direction:reverse" d="${f6gear(101, 21, 10, 7, 9)}" fill="none" stroke="#e8a060" stroke-width=".8" opacity=".4"/>`
      + Array.from({ length: 12 }, (_, k) => fAt((k * 360) / 12 + rnd() * 10, sword(k))).join('')
      + fRing(42, 3, '#3a1f15') + fRing(43.5, 0.6, '#8a4a2a') + fRing(40.9, 0.6, '#1a0d08');
  },

  // Аля: серебряное кольцо с русским узором, белое кружево, голубой бант, снежинки
  an_alya: () => { const flake = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="#bfe0ff" stroke-width=".6" stroke-linecap="round">${[0, 60, 120].map((r) => `<path transform="rotate(${r})" d="M0-4V4M-1.2-2.8L0-2 1.2-2.8M-1.2 2.8L0 2 1.2 2.8"/>`).join('')}</g>`;
    return fScallops(20, 50.5, 2.6, '#dfe6f7', 1) + fScallops(20, 47.2, 3.2, '#f4f6ff', 1.6) + fRep(20, () => '<circle cx="60" cy="11.2" r=".75" fill="none" stroke="#c4cde4" stroke-width=".4"/>', 9) + fRep(40, () => '<circle cx="60" cy="14" r=".45" fill="#fff"/>')
      + fRing(43, 3, 'url(#fg-silver)') + fRing(44.6, 0.4, '#6a7385') + fRing(41.4, 0.4, '#6a7385') + fRep(16, (k) => fDiamond(60, 17, 1.1, k % 2 ? '#d8263a' : '#2f5fc8', '#3a1a2a'))
      + flake(14, 30, 0.9) + flake(105, 84, 0.8) + flake(18, 94, 0.7) + flake(100, 104, 0.6)
      + (() => { const [x, y] = X6(50.5, -48); return `<g transform="translate(${x} ${y}) rotate(42) scale(1.25)"><g class="fa-swing"><path d="M-.6.4L-3.5 8.5L-1.8 7.6L-.8 9.6ZM.6.4L3.5 8.5L1.8 7.6L.8 9.6Z" fill="#2f5fc8" stroke="#1d3d8a" stroke-width=".4"/></g><path d="M0 0C-4-5-9-3-8 1C-7 4-3 3 0 0ZM0 0C4-5 9-3 8 1C7 4 3 3 0 0Z" fill="#3d6fd8" stroke="#1d3d8a" stroke-width=".5"/><circle r="1.6" fill="#2f5fc8" stroke="#1d3d8a" stroke-width=".4"/></g>`; })();
  },

  // Эта фарфоровая кукла: сантиметровая лента по кругу, булавки, иголка с нитью, кружево снизу
  an_bisque: () => {
    const nums = Array.from({ length: 12 }, (_, i) => `<text transform="rotate(${i * 30} 60 60)" x="60" y="18" text-anchor="middle" font-size="2.6" font-weight="700" font-family="Onest, sans-serif" fill="#3a2a00">${(i + 1) * 10}</text>`).join('');
    return Array.from({ length: 9 }, (_, i) => { const a = 52 + i * 9.5; return `<path d="M${fP(52, a - 4.7)}Q${fP(55.5, a)} ${fP(52, a + 4.7)}" fill="none" stroke="#fff" stroke-width="1.2"/><circle cx="${X6(53, a)[0]}" cy="${X6(53, a)[1]}" r=".5" fill="#e6d6ea"/>`; }).join('')
      + fRing(45.5, 6.4, '#a87a00') + fRing(45.5, 5.6, '#ffd24a') + fTicks(90, 46.3, 48.6, '#3a2a00', 0.3, 0, 0.9) + fTicks(18, 45.6, 48.6, '#3a2a00', 0.45, 0, 1) + nums
      + '<path d="M105 76Q119 88 108 100Q100 108 113 117" fill="none" stroke="#a87a00" stroke-width="6.4"/><path d="M105 76Q119 88 108 100Q100 108 113 117" fill="none" stroke="#ffd24a" stroke-width="5.6"/><path d="M105 76Q119 88 108 100Q100 108 113 117" fill="none" stroke="#3a2a00" stroke-width="2" stroke-dasharray=".3 1.7" opacity=".8"/>'
      + [[-130, '#ff4d8d'], [-100, '#4dc3ff'], [-70, '#ffd24a'], [-20, '#7be08a'], [160, '#b07ce8'], [200, '#ff8a3a']].map(([a, c]) => { const [x1, y1] = X6(47, a), [x2, y2] = X6(55, a); return `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="#c9ced6" stroke-width=".6"/><circle cx="${x2}" cy="${y2}" r="1.8" fill="${c}" stroke="#333" stroke-width=".3"/><circle cx="${(x2 - 0.5).toFixed(1)}" cy="${(y2 - 0.6).toFixed(1)}" r=".5" fill="#fff" opacity=".8"/>`; }).join('')
      + '<path class="fa-thread" pathLength="60" d="M11 21C1 30 4 45 16 41S31 30 24 23" fill="none" stroke="#ff4d8d" stroke-width=".9" stroke-linecap="round"/><path d="M8 25L30 3" stroke="#c9ced6" stroke-width="1.1" stroke-linecap="round"/><ellipse cx="28.5" cy="4.5" rx="1.4" ry=".5" transform="rotate(-45 28.5 4.5)" fill="#333"/>';
  },

  // Киберпанк: Бегущие по краю — хромированное кольцо, жёлтые сегменты, розовые дорожки схем, рамки прицела, луна
  an_edgerunners: () => '<circle cx="99" cy="18" r="13" fill="#f4ecc8" opacity=".85"/><circle cx="95" cy="15" r="2.4" fill="#e2d7a8"/><circle cx="103" cy="22" r="1.6" fill="#e2d7a8"/>'
    + [-150, -110, -40, 10, 60, 110, 160, 200, 240, -80].map((a, i) => { const s = i % 2 ? 6 : -6, d = `M${fP(47, a)}L${fP(52, a)}L${fP(55.5, a + s)}`; return `<path d="${d}" fill="none" stroke="#ff2a8a" stroke-width=".7"/><circle cx="${X6(55.5, a + s)[0]}" cy="${X6(55.5, a + s)[1]}" r="1.1" fill="#120a14" stroke="#ff2a8a" stroke-width=".6"/>`; }).join('')
    + fBevel('steel', 44, 4.4) + [[-80, -20], [40, 75], [140, 200]].map(([a0, a1]) => `<path d="${fArc(47.6, a0, a1)}" fill="none" stroke="#f7e23a" stroke-width="1.6"/>`).join('')
    + `<g class="fa-flicker" style="animation-duration:3.7s">${[0, 90, 180, 270].map((d) => fAt(d, '<path d="M8 22V8H22" fill="none" stroke="#f7e23a" stroke-width="1.6"/><path d="M11 11H15" stroke="#2affea" stroke-width="1"/>')).join('')}</g>` + fRing(41.6, 0.9, '#2affea'),
});

Object.assign(FRAME_FX, {
  an_aot: () => [[22, 100, 0], [98, 100, 1.1], [60, 112, 2], [8, 70, 0.6], [112, 66, 1.6]].map(([x, y, d]) => `<circle class="fa-smoke" style="animation-delay:${-d}s" cx="${x}" cy="${y}" r="4" fill="#ece8e0"/>`).join('') + fTwinkles(4, 431, 52, 57, '#fff', 0.35),
  an_jjk: () => fFly(10, 441, 50, '#b49bff', 0.8, 1.6) + `<g class="fa-flicker">${[-30, 150].map((a, i) => `<path d="${fZig(a, a + 28, 52, 2.6, 443 + i, 7)}" fill="none" stroke="#111" stroke-width="1.4"/><path d="${fZig(a, a + 28, 52, 2.6, 443 + i, 7)}" fill="none" stroke="#ff2a3a" stroke-width=".6" class="fa-glow" style="--g:#ff2a3a"/>`).join('')}</g>`,
  an_kny: () => `<path class="fa-flow" d="${fArc(57.6, -160, -15)}" fill="none" stroke="#7fd4ff" stroke-width="1" stroke-dasharray="4 3 1 3" stroke-linecap="round"/>` + `<path class="fa-flow rev" d="${fArc(51.8, -150, -25)}" fill="none" stroke="#e6fbff" stroke-width=".5" stroke-dasharray="2 5" opacity=".7"/>`
    + [[44, 0], [58, 1.2], [76, 2.1], [66, 0.6]].map(([x, d]) => `<ellipse class="fa-fall" style="animation-delay:${-d}s" cx="${x}" cy="112" rx="1" ry=".6" fill="#cfa6ff"/>`).join(''),
  an_naruto: () => `<g class="fa-spin" style="animation-duration:7s">${[0, 120, 240].map((d) => fAt(d, '<g transform="translate(60 4.5)"><g class="fa-twirl"><path d="M0-4.6L1-1L4.6 0L1 1L0 4.6L-1 1L-4.6 0L-1-1Z" fill="#59606e" stroke="#1d2129" stroke-width=".5"/><circle r=".9" fill="#ff8a1f"/></g></g>')).join('')}</g>`
    + `<g class="fa-spin fast">${fSwoosh(53.5, 20, 80, 1.8, 'rgba(120,210,255,.85)')}</g>`,
  an_onepiece: () => '<g class="fa-bob" clip-path="url(#fc-r59)"><path d="M-6 105Q2 99 10 103T26 103T42 105" fill="none" stroke="#fff" stroke-width=".8" opacity=".8"/><path d="M74 105Q82 99 90 103T106 103T126 105" fill="none" stroke="#fff" stroke-width=".8" opacity=".8"/></g>'
    + '<g class="fa-cloud" style="animation-duration:10s"><path d="M14 22Q16.5 19.5 19 22Q21.5 19.5 24 22" fill="none" stroke="#fff" stroke-width=".9"/></g>' + fTwinkles(4, 451, 44, 50, '#ffe9a8', 0.35),
  an_deathnote: () => [[78, 0], [92, 1.4], [40, 0.7]].map(([a, d]) => { const [x, y] = X6(49.5, a); return `<path class="fa-drip" style="animation-delay:${-d}s" d="M${x} ${y}c-1 1.6-1.4 2.6-1.4 3.2a1.4 1.4 0 0 0 2.8 0c0-.6-.4-1.6-1.4-3.2Z" fill="#121015" stroke="#3a3a44" stroke-width=".3"/>`; }).join('') + fSpark(95.5, 96.5, 0.25, '#fff', 0.3),
  an_csm: () => fFly(14, 461, 54, '#ffb020', 0.8, 0.9) + fFly(6, 463, 52, '#c1121f', 1.1, 1.6),
  an_frieren: () => fTwinkles(8, 471, 44, 58, '#fff4c8', 0.4) + [[42, 0], [58, 1], [78, 1.8], [95, 0.5]].map(([x, d]) => `<ellipse class="fa-rise" style="animation-delay:${-d}s;animation-duration:3s" cx="${x}" cy="102" rx=".8" ry="1.3" fill="#8fc8ff"/>`).join(''),
  an_fma: () => [[-20, 0], [70, 0.9], [160, 1.7], [230, 0.4], [300, 1.3]].map(([a, d], i) => `<g class="fa-flicker" style="animation-delay:${-d}s;animation-duration:${(1.6 + i * 0.3).toFixed(1)}s"><path class="fa-arc" d="${fZig(a, a + 22, 49.5, 2.8, 481 + i, 7)}" fill="none" stroke="#9fd4ff" stroke-width=".8"/><path class="fa-arc" style="animation-delay:-.18s" d="${fZig(a, a + 22, 49.5, 2.8, 491 + i, 7)}" fill="none" stroke="#e6f4ff" stroke-width=".5"/></g>`).join('')
    + '<circle class="fa-breath" cx="60" cy="60" r="53.5" fill="none" stroke="#6fb8ff" stroke-width="1"/>',
  an_rezero: () => '<g class="fa-spin rev" style="animation-duration:40s"><path d="M59 60L60 15.5L61 60Z" fill="#efe6ff" mask="url(#fm-out)"/></g><g class="fa-spin rev" style="animation-duration:6s"><path d="M59.5 60L60 8.5L60.5 60Z" fill="#efe6ff" mask="url(#fm-out)"/><path d="M58.4 11.5L60 7.2L61.6 11.5Z" fill="#efe6ff"/></g>'
    + fFly(6, 501, 54, '#b36bff', 0.9, 2.4) + fRing(41.6, 1.4, '#b36bff', 'class="fa-breath"'),
  an_yourname: () => fTwinkles(8, 511, 44, 56, '#fff', 0.4).replace(/translate\(([\d.]+) ([\d.]+)\)/g, (m, x, y) => `translate(${x} ${Math.min(+y, 46)})`) + fFly(4, 513, 51, '#fff', 0.6, 2),
  an_eva: () => [0, 1.2].map((d) => `<g mask="url(#fm-out)"><polygon class="fa-shock" style="animation-delay:${-d}s" points="${f6poly(8, 50, 22.5)}" fill="none" stroke="#ff9a1f" stroke-width="1.4"/></g>`).join('') + fSweep(46, 2, 'fast', '#d9c2ff', 0.45),
  an_bebop: () => fSweep(48, 0.5, 'fast', '#fff', 0.35) + fSweep(54, 0.5, 'fast', '#fff', 0.3)
    + [[16, 30, 0, '#ffd75e'], [104, 70, 1.3, '#fff'], [12, 84, 2.4, '#ff9a6a'], [108, 96, 3.2, '#ffd75e']].map(([x, y, d, c]) => `<g class="fa-note" style="animation-delay:${-d}s"><ellipse cx="${x}" cy="${y}" rx="1.8" ry="1.3" transform="rotate(-20 ${x} ${y})" fill="${c}"/><path d="M${x + 1.6} ${y - 0.3}V${y - 7}Q${x + 3.5} ${y - 5.5} ${x + 4} ${y - 3.5}" fill="none" stroke="${c}" stroke-width=".7"/></g>`).join(''),
  an_ghoul: () => '<circle class="fa-breath" cx="60" cy="60" r="44.5" fill="none" stroke="#ff2a3a" stroke-width="1.2"/>' + fFly(10, 521, 50, '#ff4a5a', 0.8, 1.8),
  an_opm: () => `<g class="fa-flicker">${fRep(36, () => '<path d="M60 -3V2" stroke="#111" stroke-width=".7"/>', 5)}</g>` + '<circle class="fa-shock" cx="60" cy="60" r="50" fill="none" stroke="#fff" stroke-width="1.4"/>',
  an_sololvl: () => '<rect class="fa-scan" x="8" y="8" width="104" height="1.2" fill="#8fd0ff" opacity=".5" mask="url(#fm-out)"/>'
    + [[12, 108, 0], [104, 108, 1.2], [20, 112, 2.1], [96, 112, 0.6]].map(([x, y, d]) => `<circle class="fa-smoke" style="animation-delay:${-d}s" cx="${x}" cy="${y}" r="4" fill="#5b2a9a"/>`).join('') + fTwinkles(5, 531, 46, 57, '#bfe4ff', 0.35),
  an_konosuba: () => `<g class="fa-spin" style="animation-duration:9s">${[0, 120, 240].map((d) => fAt(d, '<g transform="translate(60 6)"><path class="fa-wing" d="M-3-1C-8-6-10-1-6.5 1.2Z" fill="#fff" stroke="#9aa" stroke-width=".4"/><path class="fa-wing" d="M3-1C8-6 10-1 6.5 1.2Z" fill="#fff" stroke="#9aa" stroke-width=".4"/><circle r="4" fill="#a8e07c" stroke="#3f8a2a" stroke-width=".6"/><path d="M-2.5-1Q0 2 2.5-1M-3 1.5Q0 4 3 1.5M0-4V3" fill="none" stroke="#3f8a2a" stroke-width=".5"/></g>')).join('')}</g>` + fFly(6, 541, 54, '#ff6a4a', 0.8, 1.4),
  an_silentvoice: () => [['fa-spin', 0, '#ff6a1a', 50], ['fa-spin', 180, '#ff6a1a', 50]].map(([cls, d, c, r]) => `<g class="${cls}" style="animation-duration:18s"><g transform="rotate(${d} 60 60)"><path d="M${54} ${60 - r}C${56} ${57.6 - r} ${62} ${57.4 - r} ${66} ${60 - r}C${62} ${62.6 - r} ${56} ${62.4 - r} ${54} ${60 - r}Z" fill="#fff4ec" stroke="#c9b8a8" stroke-width=".3"/><circle cx="${60}" cy="${59.6 - r}" r="1.4" fill="${c}"/><circle cx="${63.5}" cy="${60.3 - r}" r="1" fill="${c}"/><path d="M${54} ${60 - r}L${50.5} ${57.6 - r}Q${51.5} ${60 - r} ${50.5} ${62.4 - r}Z" fill="${c}"/></g></g>`).join('')
    + `<g class="fa-spin rev" style="animation-duration:14s"><g transform="translate(120 0) scale(-1 1)"><path d="M54 6.5C56 4.1 62 3.9 66 6.5C62 9.1 56 8.9 54 6.5Z" fill="#ff7a2a" stroke="#8a3a0a" stroke-width=".3"/><circle cx="61" cy="6.2" r="1.1" fill="#111"/><path d="M54 6.5L50.5 4.1Q51.5 6.5 50.5 8.9Z" fill="#ff7a2a"/></g></g>`
    + [[30, 30, 0], [92, 40, 1.4], [40, 100, 2.6]].map(([x, y, d]) => `<circle class="fa-ripple" style="animation-delay:${-d}s" cx="${x}" cy="${y}" r="3" fill="none" stroke="#e6fbff" stroke-width=".5"/>`).join(''),
  an_kaguya: () => [[30, 0], [50, 1.1], [72, 2.2], [90, 0.6]].map(([x, d]) => `<ellipse class="fa-fall" style="animation-delay:${-d}s" cx="${x}" cy="104" rx="1.2" ry=".7" fill="#e8304a"/>`).join('') + fTwinkles(6, 551, 50, 58, '#ffe9a8', 0.4),
  an_toradora: () => { const rnd = fRand(561); return Array.from({ length: 9 }, () => `<circle class="fa-snow" style="animation-delay:${-(rnd() * 5).toFixed(2)}s" cx="${(10 + rnd() * 100).toFixed(1)}" cy="${(rnd() * 12).toFixed(1)}" r="${(0.6 + rnd() * 0.6).toFixed(1)}" fill="#fff"/>`).join('') + fSpark(60, 7.5, 0.4, '#fff', 0.2); },
  an_violet: () => `<g class="fa-spin slow">${[30, 210].map((d) => fAt(d, '<g transform="translate(60 2.5) rotate(12)"><rect x="-4" y="-2.6" width="8" height="5.2" rx=".6" fill="#fffaf0" stroke="#b8a77a" stroke-width=".4"/><path d="M-4-2.6L0 .8L4-2.6" fill="none" stroke="#b8a77a" stroke-width=".4"/><circle cy=".8" r="1" fill="#c42424"/></g>')).join('')}</g>` + fSpark(58, 5, 0.3, '#fff', 0.5),
  an_fate: () => fFly(16, 571, 50, '#ffb04a', 0.9, 2.2) + fSweep(52, 7, 'fast', '#fff', 0.22),
  an_alya: () => { const rnd = fRand(581); return Array.from({ length: 8 }, () => `<circle class="fa-snow" style="animation-delay:${-(rnd() * 5).toFixed(2)}s" cx="${(10 + rnd() * 100).toFixed(1)}" cy="${(rnd() * 12).toFixed(1)}" r="${(0.5 + rnd() * 0.6).toFixed(1)}" fill="#fff"/>`).join('') + fTwinkles(5, 583, 46, 54, '#fff', 0.4); },
  an_bisque: () => fTwinkles(6, 591, 48, 58, '#ffc2d6', 0.45) + fSpark(28.5, 4.5, 0.3, '#fff', 0.2),
  an_edgerunners: () => ['#2affea', '#ff2a8a'].map((c, i) => `<g mask="url(#fm-out)"><circle class="fa-trail" style="animation-delay:${(-i * 0.6).toFixed(2)}s" cx="60" cy="60" r="46" fill="none" stroke="${c}" stroke-width="1.2" opacity=".6"/></g>`).join('')
    + [-150, 10, 160].map((a, i) => `<path class="fa-flow" style="animation-duration:.8s" d="M${fP(47, a)}L${fP(52, a)}L${fP(55.5, a + (i % 2 ? 6 : -6))}" fill="none" stroke="#fff" stroke-width=".6" stroke-dasharray="1 4"/>`).join(''),
});
