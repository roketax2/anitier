'use strict';
/* Рамки, третья пачка (2026-11-17, по списку автора). Подключается после frames2.js и перекрывает
   FRAME_ART / FRAME_FX. Чёрная дыра — по мотивам квазара TON 618. */
document.body.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<linearGradient id="fg-quasar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4dd2ff" stop-opacity="0"/><stop offset=".18" stop-color="#7fe0ff"/><stop offset=".42" stop-color="#ffffff"/><stop offset=".58" stop-color="#fff2c8"/><stop offset=".82" stop-color="#ffa257"/><stop offset="1" stop-color="#ff5a1f" stop-opacity="0"/></linearGradient>
<linearGradient id="fg-jet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bff2ff" stop-opacity="0"/><stop offset=".55" stop-color="#9fe8ff"/><stop offset="1" stop-color="#ffffff"/></linearGradient>
<linearGradient id="fg-flame2" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#3f6cff"/><stop offset=".18" stop-color="#ff3d00"/><stop offset=".6" stop-color="#ffa21f"/><stop offset="1" stop-color="#fff3b0"/></linearGradient>
<linearGradient id="fg-aur2" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#3ee6b0"/><stop offset=".5" stop-color="#4dd2ff" stop-opacity=".8"/><stop offset="1" stop-color="#b061ff" stop-opacity="0"/></linearGradient>
<radialGradient id="fg-ball" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#fff6c8"/><stop offset=".45" stop-color="#ffb020"/><stop offset="1" stop-color="#d1350b"/></radialGradient>
<radialGradient id="fg-smoke" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#6b6470"/><stop offset="1" stop-color="#2a262e"/></radialGradient>
<radialGradient id="fg-moonball" cx=".3" cy=".3" r=".8"><stop offset="0" stop-color="#fffbe6"/><stop offset=".6" stop-color="#f1d98c"/><stop offset="1" stop-color="#b8923a"/></radialGradient></defs></svg>`);

const fFleur = (h) => `<path d="M60 ${-h}C57 ${-h + 4} 56.500 ${-h + 7} 58.500 ${-h + 10}C55 ${-h + 9} 52.500 ${-h + 11} 53.500 ${-h + 14}C55.500 ${-h + 13} 57.500 ${-h + 13.500} 59 ${-h + 15}H61C62.500 ${-h + 13.500} 64.500 ${-h + 13} 66.500 ${-h + 14}C67.500 ${-h + 11} 65 ${-h + 9} 61.500 ${-h + 10}C63.500 ${-h + 7} 63 ${-h + 4} 60 ${-h}Z" fill="url(#fg-gold)" stroke="#5a3d0a" stroke-width=".8" stroke-linejoin="round"/>`;

Object.assign(FRAME_ART, {
  // чёрная дыра (TON 618): ослепительный бело-голубой диск квазара, тень, фотонное кольцо и два джета
  blackhole: () => '<circle cx="60" cy="60" r="60" fill="url(#fg-halo)"/>'
    + '<path d="M54 41 56 -10H64L66 41Z" fill="url(#fg-jet)" opacity=".9"/><path d="M54 79 56 130H64L66 79Z" fill="url(#fg-jet)" opacity=".9" transform="rotate(180 60 104.500) translate(0 0)"/>'
    + '<path class="fa-jet" d="M58.600 40 59.300 -12H60.700L61.400 40Z" fill="#fff"/><path class="fa-jet" style="animation-delay:-.6s" d="M58.600 80 59.300 132H60.700L61.400 80Z" fill="#fff"/>'
    + '<path d="M16 60A44 30 0 0 1 104 60" fill="none" stroke="url(#fg-quasar)" stroke-width="4" mask="url(#fm-out)" opacity=".85"/>'
    + '<ellipse cx="60" cy="60" rx="60" ry="10" fill="none" stroke="url(#fg-quasar)" stroke-width="8" mask="url(#fm-out)"/><path d="M0 60A60 10 0 0 0 120 60" fill="none" stroke="url(#fg-quasar)" stroke-width="8.500" stroke-linecap="round"/><path d="M5 61A55 7.500 0 0 0 115 61" fill="none" stroke="#fff" stroke-width="1.400" opacity=".9"/>'
    + fRing(41.6, 2.4, '#e6fbff', 'class="fa-glow" style="--g:#7fe0ff"'),
  // сверхновая: остаток взрыва — рваные цветные волокна, как у Крабовидной туманности
  supernova: () => { const rnd = fRand(101); const fil = (n, r0, r1, c, w) => Array.from({ length: n }, () => { const a = rnd() * 360, pts = Array.from({ length: 5 }, (_, i) => fP(r0 + (r1 - r0) * (i / 4) + (rnd() - 0.5) * 3, a + (rnd() - 0.5) * 14)); return `<path d="M${pts.join('L')}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${(0.55 + rnd() * 0.4).toFixed(2)}"/>`; }).join('');
    return `<circle cx="60" cy="60" r="60" fill="url(#fg-nova)" mask="url(#fm-out)" opacity=".6"/><g mask="url(#fm-out)">${fil(26, 44, 60, '#ff6b3d', 1.6) + fil(22, 43, 56, '#ffd36b', 1) + fil(18, 42, 54, '#7fe0ff', 1.2) + fil(10, 46, 60, '#ff4dd8', 0.8)}</g>`
      + fRing(42, 2.2, '#ffffff', 'class="fa-glow" style="--g:#9fe8ff"'); },
  // взрыв: кольцо клубящихся огненных шаров, снаружи дым
  explosion: () => { const rnd = fRand(103); const balls = (n, r, s0, s1, fill) => Array.from({ length: n }, (_, i) => { const [x, y] = fXY(r + rnd() * 5, i * (360 / n) + rnd() * 10); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(s0 + rnd() * (s1 - s0)).toFixed(1)}" fill="${fill}"/>`; }).join('');
    return `<g mask="url(#fm-out)">${balls(14, 53, 5, 8, 'url(#fg-smoke)') + balls(16, 48, 5, 8.5, 'url(#fg-ball)') + balls(12, 45, 3, 5, '#fff1a8')}</g>` + fRing(41.6, 1.6, '#7a1406'); },
  // пламя: языки огня по кругу с синим основанием, сверху выше
  fire: () => { const rnd = fRand(105);
    const tongues = (n, scale, fill, op) => Array.from({ length: n }, (_, i) => { const a = i * (360 / n) + rnd() * 6, up = Math.cos((a * Math.PI) / 360) ** 2, h = scale * (8 + rnd() * 5 + up * 10), w = 3 + rnd() * 2, lean = (rnd() - 0.5) * 4;
      return fAt(a, `<path class="fa-flick" style="animation-delay:${-(rnd() * 0.8).toFixed(2)}s;animation-duration:${(0.5 + rnd() * 0.5).toFixed(2)}s" d="M${60 - w} 19C${60 - w} ${19 - h * 0.5} ${60 + lean - w * 0.3} ${19 - h * 0.75} ${60 + lean} ${19 - h}C${60 + lean + w * 0.3} ${19 - h * 0.6} ${60 + w} ${19 - h * 0.45} ${60 + w} 19Z" fill="${fill}" opacity="${op}"/>`); }).join('');
    return tongues(20, 1.1, '#c21807', 0.9) + tongues(20, 0.9, 'url(#fg-flame2)', 1) + tongues(16, 0.5, '#fff3b0', 0.9) + fRing(43, 4, 'url(#fg-flame2)') + fRing(41.4, 1, '#3f6cff', 'opacity=".9"'); },
  // корона: золотой обод с камнями и пять зубцов-лилий
  crown: () => '<path d="M24 44V30C34 24 46 22 60 22S86 24 96 30V44Z" fill="url(#fg-gold)" stroke="#5a3d0a" stroke-width="1.200" stroke-linejoin="round"/>'
    + '<path d="M26 32C36 27 48 25 60 25S84 27 94 32" fill="none" stroke="#fff8d6" stroke-width=".9" opacity=".7"/><path d="M24 40H96" stroke="#5a3d0a" stroke-width=".7" opacity=".6"/>'
    + [[60, 22, 18], [44, 24, 14], [76, 24, 14], [30, 28, 10], [90, 28, 10]].map(([x, y, h]) => `<g transform="translate(${x - 60} ${y})">${fFleur(h)}</g>`).join('')
    + fGem(60, 34, 3.6, '#ff3d6e') + fGem(46, 34, 2.6, '#3f6cff') + fGem(74, 34, 2.6, '#3f6cff') + fGem(34, 35, 2, '#2fcf96') + fGem(86, 35, 2, '#2fcf96')
    + fRing(41.6, 2.4, 'url(#fg-gold)') + fLaurel(46, 6, 11, 'url(#fg-gold)', '#6b4a0c'),
  // бронза: восьмиугольная бронзовая плакетка с фаской, заклёпками и гравировкой
  bronze: () => { const oct = (r) => fPoly(Array.from({ length: 8 }, (_, k) => fXY(r, k * 45 + 22.5)));
    return `<polygon points="${oct(57)}" fill="url(#fg-bronze)" stroke="#3d2610" stroke-width="1.400" stroke-linejoin="round" mask="url(#fm-out)"/><polygon points="${oct(53)}" fill="none" stroke="#fbe0bd" stroke-width=".8" opacity=".6" stroke-linejoin="round"/><polygon points="${oct(50.5)}" fill="none" stroke="#3d2610" stroke-width=".7" opacity=".6" stroke-linejoin="round"/>`
      + fRep(8, () => '<circle cx="60" cy="7.200" r="2.200" fill="url(#fg-bronze)" stroke="#3d2610" stroke-width=".7"/><circle cx="59.400" cy="6.600" r=".7" fill="#fff" opacity=".8"/>', 22.5) + fBevel('bronze', 44, 5); },
  // солнце: протуберанцы-петли над диском и лучи
  sun: () => `<circle cx="60" cy="60" r="60" fill="url(#fg-corona)" mask="url(#fm-out)"/><g class="fa-spin slow">${fRep(12, (k) => `<path d="M54 15 60 ${k % 2 ? 7 : -1} 66 15Z" fill="url(#fg-sun)" stroke="#c46a00" stroke-width=".6" stroke-linejoin="round"/>`)}</g>`
    + [[-40, 9], [70, 7], [170, 8], [250, 6]].map(([a, h]) => fAt(a, `<path class="fa-glow" style="--g:#ff7a00" d="M53 16C52 ${16 - h} 68 ${16 - h} 67 16" fill="none" stroke="#ff7a00" stroke-width="2.200" stroke-linecap="round"/><path d="M53 16C52 ${16 - h} 68 ${16 - h} 67 16" fill="none" stroke="#fff3b0" stroke-width=".8" stroke-linecap="round"/>`)).join('')
    + fBevel('sun', 45, 9) + fRing(41, 0.9, '#c46a00'),
  // сияние: волнистые ленты-занавесы, колышутся и переливаются
  aurora: () => `<g class="fa-hue">${[[0, 52, 10], [1.4, 49, 8], [2.6, 55, 7]].map(([ph, r, h]) => { const top = Array.from({ length: 41 }, (_, i) => { const a = -200 + i * 5.5; return fP(r + h + 3 * Math.sin(i * 0.6 + ph), a); }), bot = Array.from({ length: 41 }, (_, i) => { const a = -200 + (40 - i) * 5.5; return fP(r - 2, a); });
      return `<path class="fa-sway" style="animation-delay:${-ph}s" d="M${top.join('L')}L${bot.join('L')}Z" fill="url(#fg-aur2)" opacity=".8"/>`; }).join('')}</g>` + fRing(42, 1.6, '#3ee6b0', 'opacity=".9"') + fTwinkles(8, 107, 47, 58, '#fff', 0.4),
  // луна: объёмный месяц с кратерами и мягким свечением
  moon: () => '<path class="fa-glow" style="--g:#ffe9a8" d="M60 2A58 58 0 0 0 60 118A74 74 0 0 1 60 2Z" fill="url(#fg-moonball)" stroke="#b8923a" stroke-width="1" mask="url(#fm-out)"/>'
    + [[14, 40, 3.2], [9, 66, 2.4], [20, 90, 2.8], [26, 20, 1.8], [12, 52, 1.2]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#d8b866" opacity=".75"/><path d="M${x - r * 0.7} ${y - r * 0.5}A${r} ${r} 0 0 1 ${x + r * 0.7} ${y - r * 0.5}" fill="none" stroke="#fffbe6" stroke-width=".6" opacity=".8"/>`).join('')
    + '<path d="M60 2A58 58 0 0 0 60 118" fill="none" stroke="#fffbe6" stroke-width="1.400" opacity=".9"/>' + `<path d="${fArc(43, -80, 80)}" fill="none" stroke="url(#fg-silver)" stroke-width="1.600" stroke-linecap="round"/>`,
  // свиток: пергамент с опалёнными краями, лентой и сургучом, строки «письма»
  paper: () => '<path d="M10 14C30 11 50 15 70 12S100 15 110 13V107C90 110 70 105 50 108S20 105 10 107Z" fill="url(#fg-paper)" stroke="#8a5a2b" stroke-width="1.400" mask="url(#fm-out)"/>'
    + '<path d="M10 14C30 11 50 15 70 12S100 15 110 13" fill="none" stroke="#5a3418" stroke-width="2.400" opacity=".45"/><path d="M10 107C20 105 50 108 70 105S100 110 110 107" fill="none" stroke="#5a3418" stroke-width="2.400" opacity=".45"/>'
    + [24, 30, 36].map((y) => `<path d="M16 ${y}H${y === 36 ? 26 : 30}M90 ${y}H104" stroke="#8f7443" stroke-width=".8" stroke-linecap="round" opacity=".7"/>`).join('')
    + [6, 108].map((y) => `<rect x="4" y="${y}" width="112" height="8" rx="4" fill="#e4cf9f" stroke="#8f7443" stroke-width="1"/><path d="M8 ${y + 2.5}H112" stroke="#fff" stroke-width="1" opacity=".5"/>`).join('')
    + '<path d="M84 100 80 116 86 112 90 117 92 102Z" fill="#c9163f" stroke="#6b0a22" stroke-width=".6"/>' + fRing(41.4, 1.6, '#8f7443') + '<circle cx="90" cy="98" r="6.400" fill="#c9163f" stroke="#6b0a22" stroke-width=".8"/>' + fStar5(90, 98, 3.6, 0, '#ff8fa8', '#6b0a22'),
});

Object.assign(FRAME_FX, {
  blackhole: () => '<path class="fa-flow" d="M0 60A60 10 0 0 0 120 60" fill="none" stroke="#fff" stroke-width="1.600" stroke-dasharray="3 9" stroke-linecap="round"/>',
  supernova: () => fFly(12, 109, 46, '#ffd36b', 0.9, 1.6) + fTwinkles(6, 111, 46, 60, '#fff', 0.5),
  explosion: () => fFly(16, 113, 50, '#ffd36b', 1.1, 1.3) + '<circle class="fa-shock" cx="60" cy="60" r="50" fill="none" stroke="#fff1a8" stroke-width="1.400"/>',
  fire: () => fFly(16, 115, 54, '#ffd36b', 1.1, 1.5), crown: () => fTwinkles(8, 117, 44, 62, '#fff', 0.55).replace(/translate\(([\d.]+) ([\d.]+)\)/g, (m, x, y) => `translate(${x} ${Math.min(+y, 30)})`),
  bronze: () => fSweep(44, 5, 'fast', '#fff1dc', 0.5),
  // молния: молнии вспыхивают, по ним бежит ток, вокруг искры
  lightning: () => [[8, 6, 112, 114, 1], [112, 6, 8, 114, 2]].map(([a, b, c, d, s], i) => `<polyline class="fa-flow" style="animation-duration:.5s" points="${fPoly(fBolt(a, b, c, d, 7, s))}" fill="none" stroke="#fff" stroke-width="1.400" stroke-dasharray="4 8" mask="url(#fm-out)"/>`).join('')
    + fFly(12, 119, 44, '#bff2ff', 0.9, 1) + `<g class="fa-spin fast">${fDot(60, 18, 1.6, '#fff36b', 'fa-glow')}</g>`,
  // энергия: ток бежит по дорожкам, кольцо пульсирует, по шестиграннику летит сгусток
  energy: () => fRep(6, () => '<path class="fa-flow" style="animation-duration:.7s" d="M60 18V12H66L70 8" fill="none" stroke="#fff" stroke-width="1" stroke-dasharray="2 4"/>', 30)
    + '<circle class="fa-breath" cx="60" cy="60" r="44" fill="none" stroke="#7cf7ff" stroke-width="1.400"/>' + `<g class="fa-spin fast">${fDot(60, 4.5, 2, '#fff', 'fa-glow')}</g><g class="fa-spin rev">${fDot(60, 10, 1.4, '#ff4dd8')}</g>`,
  moon: () => fTwinkles(8, 121, 48, 58, '#fff', 0.55),
  paper: () => fTwinkles(3, 123, 44, 52, '#fff6c8', 0.45),
  sun: () => fTwinkles(6, 125, 52, 60, '#fff8d6', 0.5) + fFly(8, 127, 50, '#ffb020', 0.9, 2),
});

// ветер, земля, вода — доработка
const fWindLeaf = (x, y, rot, c) => `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0C-3-2-3-6 0-8 3-6 3-2 0 0Z" fill="${c}" stroke="#2f6b2a" stroke-width=".4"/><path d="M0-.5V-7" stroke="#2f6b2a" stroke-width=".35"/></g>`;
Object.assign(FRAME_ART, {
  wind: () => `<g class="fa-spin">${fRep(3, () => '<path d="M60 18C76 10 98 16 110 34C96 24 80 22 66 26Z" fill="url(#fg-ice)" stroke="#5fb8c9" stroke-width=".8" stroke-linejoin="round" opacity=".92"/><path d="M64 21C78 15 94 19 104 30M68 24C80 20 90 23 98 29" fill="none" stroke="#fff" stroke-width=".8" opacity=".8"/>')}</g>`
    + `<g class="fa-spin rev">${[[104, 20, 30, '#7fd36b'], [18, 98, -40, '#c7e86b'], [100, 96, 120, '#5fbf5a']].map(([x, y, r, c]) => fWindLeaf(x, y, r, c)).join('')}</g>`
    + fRing(42, 2, '#cdeff5') + fRing(42, 0.6, '#5fb8c9') + `<path d="${fArc(47, 150, 210)}M${fP(51, 160)}" fill="none" stroke="#fff" stroke-width=".8" opacity=".6"/>`,
  earth: () => '<path d="M0 92 10 78 18 84 28 70 38 80 48 72 58 82 70 68 82 80 92 72 104 82 112 76 120 90V120H0Z" fill="#6f8fb8" opacity=".7" mask="url(#fm-out)"/>'
    + '<path d="M0 100 14 76 22 84 34 62 44 78 52 68 60 82 70 64 80 78 88 66 100 82 108 72 120 100V120H0Z" fill="url(#fg-rock)" stroke="#2a1f18" stroke-width="1" stroke-linejoin="round" mask="url(#fm-out)"/>'
    + '<path d="M30 69 34 62 38 68ZM66 71 70 64 74 70ZM84 72 88 66 92 72Z" fill="#f4f1ea"/><path d="M0 106C24 100 40 110 60 106S96 100 120 106V120H0Z" fill="#3f7d34" mask="url(#fm-out)"/>'
    + [[10, 100], [18, 102], [102, 101], [110, 99], [26, 104]].map(([x, y]) => `<path d="M${x} ${y - 9}L${x - 3.500} ${y}H${x + 3.500}Z" fill="#2d6a2a" stroke="#1a3f18" stroke-width=".5"/>`).join('')
    + fRing(42.4, 3, 'url(#fg-rock)') + fRing(42.4, 0.7, '#d6c2a8', 'opacity=".7"'),
  water: () => { const drop = 'M60 -4C74 18 106 32 106 66A46 46 0 0 1 14 66C14 32 46 18 60 -4Z';
    return `<path d="${drop}" fill="url(#fg-water)" stroke="#0b4fb3" stroke-width="1.800" mask="url(#fm-out)"/>`
      + `<g mask="url(#fm-out)">${[0, 1, 2].map((i) => `<path class="fa-sway" style="animation-delay:${-i * 1.300}s" d="${fWave(46 + i * 4.500, 1.300, 11 + i * 2, i)}" fill="none" stroke="#e6fbff" stroke-width="${1 - i * 0.200}" opacity="${0.7 - i * 0.150}"/>`).join('')}</g>`
      + `<path d="${drop}" fill="none" stroke="#e6fbff" stroke-width="1" opacity=".9"/><path d="M42 22C47 14 53 7 57.500 1" fill="none" stroke="#fff" stroke-width="2.600" stroke-linecap="round" opacity=".85"/><path d="M98 60C99 72 96 84 88 94" fill="none" stroke="#fff" stroke-width="1.500" stroke-linecap="round" opacity=".55"/>`
      + [[22, 108, 2.200], [32, 114, 1.500], [98, 110, 2], [88, 116, 1.300], [60, 116, 1.600]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#8fd8ff" stroke="#0b4fb3" stroke-width=".5"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.3}" fill="#fff"/>`).join('') + fRing(41.2, 1.4, '#e6fbff'); },
});
