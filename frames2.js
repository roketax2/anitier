'use strict';
/* Силуэты рамок, вторая пачка (2026-11-17). Подключается сразу после frames.js и перекрывает
   рисунки FRAME_ART и движение FRAME_FX: у каждой рамки своя форма, а не «кольцо плюс украшения». */
const fPoly = (pts) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
const fBolt = (x1, y1, x2, y2, w, seed) => { const rnd = fRand(seed), n = 6, pts = []; for (let i = 0; i <= n; i++) { const t = i / n, j = i && i < n ? (i % 2 ? 1 : -1) * w * (0.8 + rnd() * 0.6) : 0; const nx = -(y2 - y1), ny = x2 - x1, l = Math.hypot(nx, ny); pts.push([x1 + (x2 - x1) * t + (nx / l) * j, y1 + (y2 - y1) * t + (ny / l) * j]); } return pts; };
const fLaurel = (r, n, step, fill, edge) => Array.from({ length: n }, (_, i) => { const a = 110 + i * step, [x, y] = fXY(r, a); const leaf = fLeaf(x, y, a + 140, 9, 3, fill, edge); return leaf + `<g transform="translate(120 0) scale(-1 1)">${leaf}</g>`; }).join('');

Object.assign(FRAME_ART, {
  // лёд: шестиугольный кристалл, на углах ледяные шипы, внутри иней
  ice: () => { const hex = (r) => fPoly([0, 1, 2, 3, 4, 5].map((k) => fXY(r, k * 60 - 90)));
    return `<polygon points="${hex(54)}" fill="url(#fg-ice)" stroke="#1f66b8" stroke-width="1.400" stroke-linejoin="round" mask="url(#fm-out)"/><polygon points="${hex(48)}" fill="none" stroke="#fff" stroke-width=".8" opacity=".75" stroke-linejoin="round"/>`
      + fRep(6, () => '<path d="M60 7.500 55.600 0 60 -4 64.400 0Z" fill="#f2fdff" stroke="#1f66b8" stroke-width=".7" stroke-linejoin="round"/><path d="M60 -4V7.500" stroke="#5db6ff" stroke-width=".7"/>')
      + fRep(6, () => '<path d="M60 12V19M57 14.500 60 17 63 14.500" fill="none" stroke="#fff" stroke-width=".7" stroke-linecap="round"/>', 30) + fRing(41.2, 1.4, '#e6faff'); },
  // молния: две огромные молнии крест-накрест за аватаркой
  lightning: () => [[8, 6, 112, 114, 1], [112, 6, 8, 114, 2]].map(([a, b, c, d, s]) => { const p = fPoly(fBolt(a, b, c, d, 7, s)); return `<polyline points="${p}" fill="none" stroke="#2b6dff" stroke-width="9" opacity=".35" mask="url(#fm-out)"/><polyline class="fa-glow" style="--g:#6ec8ff" points="${p}" fill="none" stroke="#fff36b" stroke-width="4.200" mask="url(#fm-out)"/><polyline points="${p}" fill="none" stroke="#fff" stroke-width="1.600" mask="url(#fm-out)"/>`; }).join('')
    + fRing(42, 2.6, 'url(#fg-steel)') + fRing(42, 0.8, '#4dd2ff', 'opacity=".8"'),
  // галактика: два спиральных рукава из звёзд и пыли
  galaxy: () => { const arm = (off) => { const pts = Array.from({ length: 34 }, (_, i) => fXY(42 + (i / 33) * 17, off + (i / 33) * 200)); const d = 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L'); const rnd = fRand(off + 5);
      return `<path d="${d}" fill="none" stroke="url(#fg-nebula)" stroke-width="7" stroke-linecap="round" opacity=".85" mask="url(#fm-out)"/><path d="${d}" fill="none" stroke="#e6d9ff" stroke-width="1.200" stroke-linecap="round" opacity=".8" mask="url(#fm-out)"/>`
        + pts.filter((_, i) => i % 2).map(([x, y]) => fDot((x + (rnd() - 0.5) * 6).toFixed(1), (y + (rnd() - 0.5) * 6).toFixed(1), (0.3 + rnd() * 0.6).toFixed(2), '#fff')).join(''); };
    return `<g class="fa-spin slow">${arm(0) + arm(180)}</g>` + fRing(41.8, 2.2, '#5b3fd6') + fRing(41.8, 0.7, '#e6d9ff', 'opacity=".8"'); },
  // пепел: рваный обугленный обломок с тлеющими краями
  ash: () => { const rnd = fRand(57); const P = fPoly(Array.from({ length: 22 }, (_, i) => fXY(49 + rnd() * 9, i * (360 / 22) + rnd() * 6)));
    return `<polygon points="${P}" fill="url(#fg-obsidian)" stroke="#ff7a1f" stroke-width="1.400" stroke-linejoin="round" class="fa-ember" mask="url(#fm-out)"/><polygon points="${P}" fill="none" stroke="#ffe0a3" stroke-width=".5" stroke-linejoin="round" mask="url(#fm-out)"/>`
      + [12, 70, 128, 190, 250, 312].map((a, k) => `<path d="${fCrack(a, 41.4, 52, k + 2)}" fill="none" stroke="#ff8a1f" stroke-width="1.200" stroke-linecap="round" class="fa-ember" style="animation-delay:${-k * 0.4}s"/>`).join('') + fRing(41.2, 1.2, '#2a1a12'); },
  // энергия: шестигранник-реактор с дорожками микросхемы и узлами
  energy: () => { const hex = (r) => fPoly([0, 1, 2, 3, 4, 5].map((k) => fXY(r, k * 60)));
    return `<polygon points="${hex(56)}" fill="#120a24" stroke="url(#fg-plasma)" stroke-width="2.600" stroke-linejoin="round" mask="url(#fm-out)" class="fa-glow" style="--g:#a85cff"/><polygon points="${hex(50)}" fill="none" stroke="#7cf7ff" stroke-width=".7" opacity=".7" stroke-linejoin="round"/>`
      + fRep(6, () => '<path d="M60 18V12H66L70 8" fill="none" stroke="#7cf7ff" stroke-width=".9" stroke-linejoin="round"/><circle cx="70" cy="8" r="1.400" fill="#ff4dd8"/>', 30) + fRing(42.4, 2.4, 'url(#fg-plasma)') + fRing(42.4, 0.8, '#fff', 'opacity=".8"'); },
  // ветер: вихрь-вертушка из трёх изогнутых потоков
  wind: () => `<g class="fa-spin">${fRep(3, () => '<path d="M60 18C76 10 98 16 110 34C96 24 80 22 66 26Z" fill="url(#fg-ice)" stroke="#5fb8c9" stroke-width=".8" stroke-linejoin="round" opacity=".92"/><path d="M64 21C78 15 94 19 104 30" fill="none" stroke="#fff" stroke-width=".9" opacity=".8"/>')}</g>`
    + fRing(42, 2, '#cdeff5') + fRing(42, 0.6, '#5fb8c9'),
  // солнце: золотой диск и 12 больших треугольных лучей
  sun: () => `<circle cx="60" cy="60" r="60" fill="url(#fg-corona)" mask="url(#fm-out)"/><g class="fa-spin slow">${fRep(12, (k) => `<path d="M53 15 60 ${k % 2 ? 6 : -2} 67 15Z" fill="url(#fg-sun)" stroke="#c46a00" stroke-width=".7" stroke-linejoin="round"/>`)}</g>`
    + fBevel('sun', 45, 9) + fRing(41, 0.9, '#c46a00'),
  // сверхновая: вспышка-крест, как блик линзы, и сияющее кольцо
  supernova: () => `<circle cx="60" cy="60" r="60" fill="url(#fg-nova)" mask="url(#fm-out)"/>`
    + [0, 90, 45, 135].map((a, i) => { const w = i < 2 ? 2.4 : 1.3; return fAt(a, `<path d="M60 -2L${60 + w} 20H${60 - w}Z" fill="#fff"/><path d="M60 122L${60 + w} 100H${60 - w}Z" fill="#fff"/>`); }).join('')
    + fRing(42.2, 2.6, '#ffffff', 'class="fa-glow" style="--g:#9fe8ff"') + fRing(45, 0.8, '#ff8fd8', 'opacity=".8"'),
  // чёрная дыра: горизонтальный диск и светящаяся арка над тенью, как в фильмах
  blackhole: () => '<circle cx="60" cy="60" r="60" fill="url(#fg-halo)"/>'
    + '<path d="M14 60A46 46 0 0 1 106 60" fill="none" stroke="url(#fg-disk)" stroke-width="6" mask="url(#fm-out)" opacity=".9"/><path d="M18 60A42 30 0 0 0 102 60" fill="none" stroke="#ffcf8a" stroke-width="2.400" mask="url(#fm-out)" opacity=".7"/>'
    + '<ellipse cx="60" cy="60" rx="60" ry="9" fill="none" stroke="url(#fg-disk)" stroke-width="7" mask="url(#fm-out)"/><path d="M0 60A60 9 0 0 0 120 60" fill="none" stroke="url(#fg-disk)" stroke-width="7.500" stroke-linecap="round"/><path d="M6 61A54 7 0 0 0 114 61" fill="none" stroke="#fff6dc" stroke-width="1.200" opacity=".8"/>'
    + fRing(41.6, 2, '#fff3d6', 'class="fa-glow" style="--g:#ffb347"'),
  // вода: стеклянная капля с бликами и брызгами снизу
  water: () => { const drop = 'M60 -4C74 18 106 32 106 66A46 46 0 0 1 14 66C14 32 46 18 60 -4Z';
    return `<path d="${drop}" fill="url(#fg-water)" stroke="#0b4fb3" stroke-width="1.800" mask="url(#fm-out)"/><path d="${drop}" fill="none" stroke="#e6fbff" stroke-width="1" opacity=".9"/>`
      + '<path d="M42 22C47 14 53 7 57.500 1" fill="none" stroke="#fff" stroke-width="2.600" stroke-linecap="round" opacity=".85"/><path d="M98 60C99 72 96 84 88 94" fill="none" stroke="#fff" stroke-width="1.500" stroke-linecap="round" opacity=".55"/>'
      + [[22, 108, 2.2], [32, 114, 1.5], [98, 110, 2], [88, 116, 1.3], [60, 116, 1.6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#8fd8ff" stroke="#0b4fb3" stroke-width=".5"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.3}" fill="#fff"/>`).join('') + fRing(41.2, 1.4, '#e6fbff'); },
  // земля: горный хребет со снежными вершинами снизу и каменное кольцо
  earth: () => '<path d="M0 98 14 74 22 82 34 60 44 76 52 66 60 80 70 62 80 76 88 64 100 80 108 70 120 98V120H0Z" fill="url(#fg-rock)" stroke="#2a1f18" stroke-width="1" stroke-linejoin="round" mask="url(#fm-out)"/>'
    + '<path d="M30 67 34 60 38 66ZM66 69 70 62 74 68ZM84 70 88 64 92 70Z" fill="#f4f1ea"/><path d="M0 104C24 98 40 108 60 104S96 98 120 104V120H0Z" fill="#3f7d34" mask="url(#fm-out)"/>'
    + fRing(42.4, 3, 'url(#fg-rock)') + fRing(42.4, 0.7, '#d6c2a8', 'opacity=".7"') + '<circle cx="16" cy="26" r="2.400" fill="#ffb347" stroke="#7a3d00" stroke-width=".6"/><circle cx="102" cy="30" r="2.400" fill="#ffb347" stroke="#7a3d00" stroke-width=".6"/>',
  // сияние: занавес северного сияния над аватаркой
  aurora: () => `<g class="fa-hue">${Array.from({ length: 15 }, (_, i) => { const a = -170 + i * 11.5, h = 16 + Math.sin(i * 0.9) * 5; return fAt(a + 90, `<rect x="57" y="${(16 - h).toFixed(1)}" width="6" height="${h.toFixed(1)}" rx="3" fill="url(#fg-aurora)" opacity="${(0.55 + (i % 3) * 0.15).toFixed(2)}"/>`); }).join('')}</g>`
    + fRing(42, 1.6, '#3ee6b0', 'opacity=".9"') + fTwinkles(8, 71, 47, 58, '#fff', 0.4),
  // пламя: огненный силуэт вокруг аватарки, вытянутый вверх
  fire: () => '<path class="fw-flick" d="M60 -4C66 10 80 8 84 20C92 14 96 26 100 34C110 46 106 62 104 74A44 44 0 0 1 16 74C14 62 10 46 20 34C24 26 28 14 36 20C40 8 54 10 60 -4Z" fill="url(#fg-fire)" stroke="#a3150a" stroke-width="1.200" stroke-linejoin="round" mask="url(#fm-out)"/>'
    + '<path d="M60 10C64 20 74 20 78 30C86 30 92 44 94 56A34 34 0 0 1 26 56C28 44 34 30 42 30C46 20 56 20 60 10Z" fill="#ffe9a3" opacity=".75" mask="url(#fm-out)"/>' + fRing(41.6, 2, '#fff3b0'),
  // золото: барочная рама с завитками по четырём сторонам и рубинами
  gold: () => fRep(4, () => '<path d="M44 6C50 0 70 0 76 6C80 10 76 16 70 14C66 12 62 14 60 18C58 14 54 12 50 14C44 16 40 10 44 6Z" fill="url(#fg-gold)" stroke="#6b4a0c" stroke-width="1" stroke-linejoin="round"/><circle cx="60" cy="8" r="2.600" fill="#ff3d6e" stroke="#6b4a0c" stroke-width=".7"/><circle cx="59.200" cy="7.200" r=".8" fill="#fff"/>')
    + fRep(4, () => '<path d="M60 4C64 8 66 12 64 16C62 12 58 10 54 12C56 8 58 6 60 4Z" fill="url(#fg-gold)" stroke="#6b4a0c" stroke-width=".8"/>', 45)
    + fBevel('gold', 45, 8) + fRep(48, () => '<path d="M58.600 18.900L61.400 15.100" stroke="#6b4a0c" stroke-width=".55" opacity=".45"/>'),
  // бронза: медаль — рельефный лавр по кругу, ленты в полоску и ушко
  bronze: () => '<path d="M36 94 24 122 36 116 43 124 54 98Z" fill="#c9163f" stroke="#6b0a22" stroke-width=".8" stroke-linejoin="round"/><path d="M40 100 33 117M48 99 42 120" stroke="#fff" stroke-width="1.400" opacity=".7"/><path d="M84 94 96 122 84 116 77 124 66 98Z" fill="#1f3f9e" stroke="#10245e" stroke-width=".8" stroke-linejoin="round"/><path d="M80 100 87 117M72 99 78 120" stroke="#fff" stroke-width="1.400" opacity=".7"/>'
    + '<rect x="55" y="2" width="10" height="9" rx="3" fill="url(#fg-bronze)" stroke="#3d2610" stroke-width=".8"/>' + fRing(47.5, 14, 'url(#fg-bronze)') + fTicks(90, 52, 54.5, '#3d2610', 0.5, 0, 0.6) + fRing(54.5, 0.8, '#3d2610') + fRing(40.6, 0.9, '#3d2610')
    + fLaurel(46.5, 7, 10.5, '#e0a468', '#5a3a1a') + `<path d="${fArc(47.5, 200, 270)}" fill="none" stroke="#fff" stroke-width="2.600" stroke-linecap="round" opacity=".5"/>`,
  // корона: европейская корона с дугами, державой и крестом, бархатом и камнями
  crown: () => '<path d="M30 40C30 18 46 6 60 6S90 18 90 40" fill="#7a0f2b" stroke="#5a3d0a" stroke-width="1"/>'
    + '<path d="M30 40C30 20 44 8 60 6M90 40C90 20 76 8 60 6M60 6V40" fill="none" stroke="url(#fg-gold)" stroke-width="3.400" stroke-linecap="round"/><path d="M30 40C30 20 44 8 60 6M90 40C90 20 76 8 60 6M60 6V40" fill="none" stroke="#5a3d0a" stroke-width=".6" opacity=".7"/>'
    + [[36, 22], [44, 13], [52, 8.5], [68, 8.5], [76, 13], [84, 22], [60, 16], [60, 26]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.300" fill="#fff8e6" stroke="#5a3d0a" stroke-width=".4"/>`).join('')
    + '<circle cx="60" cy="1" r="4.200" fill="url(#fg-gold)" stroke="#5a3d0a" stroke-width=".8"/><path d="M56 1H64" stroke="#5a3d0a" stroke-width=".7"/><path d="M60 -3.200V-9M57.400 -6.600H62.600" stroke="url(#fg-gold)" stroke-width="2" stroke-linecap="round"/>'
    + '<path d="M24 36H96L94 46H26Z" fill="url(#fg-gold)" stroke="#5a3d0a" stroke-width="1" stroke-linejoin="round"/><path d="M26 38.500H94" stroke="#fff8d6" stroke-width=".8" opacity=".7"/>'
    + fGem(60, 41, 3.2, '#ff3d6e') + fGem(44, 41, 2.4, '#3f6cff') + fGem(76, 41, 2.4, '#3f6cff') + fGem(32, 41, 1.8, '#2fcf96') + fGem(88, 41, 1.8, '#2fcf96')
    + fRing(41.6, 2.4, 'url(#fg-gold)') + fLaurel(46, 6, 11, 'url(#fg-gold)', '#6b4a0c'),
});

// движение под новые силуэты
Object.assign(FRAME_FX, {
  ice: () => fTwinkles(8, 73, 46, 58, '#fff', 0.5), lightning: () => fFly(8, 75, 46, '#bff2ff', 0.8, 1.2),
  galaxy: () => fTwinkles(10, 77, 46, 60, '#fff', 0.45), ash: () => fFly(14, 79, 52, '#ffb03a', 1, 2.2),
  energy: () => `<g class="fa-spin fast">${fDot(60, 4.5, 1.8, '#7cf7ff', 'fa-glow')}</g>`, wind: () => fFly(10, 81, 48, '#e6fbff', 0.6, 1.4),
  sun: () => fTwinkles(6, 83, 52, 60, '#fff8d6', 0.5), supernova: () => fTwinkles(10, 85, 46, 60, '#fff', 0.5),
  blackhole: () => '<path class="fa-flow" d="M0 60A60 9 0 0 0 120 60" fill="none" stroke="#fff6dc" stroke-width="1.400" stroke-dasharray="3 10" stroke-linecap="round" opacity=".9"/>',
  water: () => [[40, 0, 1.6], [70, 0.8, 1.2], [56, 1.5, 1.8]].map(([x, d, r]) => `<circle class="fa-rise" style="animation-delay:${d}s" cx="${x}" cy="96" r="${r}" fill="none" stroke="#e6fbff" stroke-width=".6"/>`).join(''),
  earth: () => '', aurora: () => fTwinkles(6, 87, 50, 60, '#e6fffa', 0.4), fire: () => fFly(14, 89, 50, '#ffd36b', 1.1, 1.6),
  gold: () => fSweep(45, 3, 'fast', '#fffbe6', 0.8) + fTwinkles(6, 91, 50, 58, '#fff', 0.5), bronze: () => fSweep(47.5, 6, 'fast', '#fff1dc', 0.45),
  crown: () => fTwinkles(8, 93, 44, 62, '#fff', 0.55).replace(/translate\(([\d.]+) ([\d.]+)\)/g, (m, x, y) => `translate(${x} ${Math.min(+y, 34)})`),
});
