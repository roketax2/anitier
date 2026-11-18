'use strict';
/* Аниме-рамки, правки 2 (2026-11-18): заново Фрирен (магический круг + луг голубых цветов + посох),
   Клинок (больше клинок, волна «дыхания воды», крупная глициния), Fate Series (закат, шестерни, мечи, Грааль);
   Аля — сугробы, бант, больше снега и разные фразы шёпота. */
document.body.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<radialGradient id="fg-frglow" gradientUnits="userSpaceOnUse" cx="60" cy="60" r="60"><stop offset=".66" stop-color="#e8f2ff" stop-opacity=".45"/><stop offset=".86" stop-color="#cfe2ff" stop-opacity=".22"/><stop offset="1" stop-color="#cfe2ff" stop-opacity="0"/></radialGradient>
<radialGradient id="fg-ubw2" gradientUnits="userSpaceOnUse" cx="60" cy="60" r="60"><stop offset=".66" stop-color="#ff8a3a" stop-opacity=".8"/><stop offset=".8" stop-color="#d0461a" stop-opacity=".6"/><stop offset=".92" stop-color="#7a1a10" stop-opacity=".3"/><stop offset="1" stop-color="#7a1a10" stop-opacity="0"/></radialGradient>
<linearGradient id="fg-wist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a4ad0"/><stop offset=".6" stop-color="#b98cf0"/><stop offset="1" stop-color="#f0e2ff"/></linearGradient>
<linearGradient id="fg-satin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a86e8"/><stop offset=".45" stop-color="#2a4fb8"/><stop offset="1" stop-color="#14286e"/></linearGradient>
<linearGradient id="fg-wave" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fb0ff"/><stop offset="1" stop-color="#1446a8"/></linearGradient>
</defs></svg>`);

Object.assign(FRAME_ART, {
  // Фрирен: двойной золотой магический круг с рунами и узлами, посох с красным камнем, луг голубых цветов внизу
  an_frieren: () => { const rnd = fRand(801), runes = ['M59 8H61M60 6.5V9.5', 'M58.8 9.5L60 6.5L61.2 9.5Z', 'M58.8 9A1.4 1.4 0 0 1 61.2 9', 'M58.8 7L60 9.3L61.2 7', 'M59.2 6.8V9.4M60.8 6.8V9.4'];
    const grass = Array.from({ length: 52 }, () => { const a = 16 + rnd() * 148, len = 5 + rnd() * 8, bend = (rnd() - 0.5) * 12, [x0, y0] = X6(47, a), [x1, y1] = X6(47 + len, a + bend * 0.5), [cx, cy] = X6(47 + len * 0.6, a + bend); return `<path d="M${x0} ${y0}Q${cx} ${cy} ${x1} ${y1}" fill="none" stroke="${rnd() < 0.5 ? '#4f9a5e' : '#78c784'}" stroke-width="${(0.5 + rnd() * 0.5).toFixed(2)}" stroke-linecap="round"/>`; }).join('');
    const flowers = Array.from({ length: 26 }, () => { const a = 18 + rnd() * 144, r = 50 + rnd() * 8, [x, y] = X6(r, a), w = rnd() < 0.18; return f6flower(x, y, 0.8 + rnd() * 0.65, w ? '#f4f8ff' : '#8fc8ff', w ? '#a8b8d8' : '#3f74c0', '#fff3b0'); }).join('');
    return '<circle cx="60" cy="60" r="60" fill="url(#fg-frglow)" mask="url(#fm-out)"/>'
      + '<path d="M3 117L22 9" stroke="#5a3a20" stroke-width="2.2" stroke-linecap="round"/><path d="M3 117L22 9" stroke="#a87a4a" stroke-width=".7" stroke-linecap="round" opacity=".7"/>'
      + '<g transform="translate(23 6)"><path d="M-5.6 2.6A6 6 0 1 1 5.2 3.4" fill="none" stroke="url(#fg-gold)" stroke-width="2" stroke-linecap="round"/><path d="M-3.4 4.4L0 9 3.4 4.4" fill="none" stroke="url(#fg-gold)" stroke-width="1.2"/><circle r="2.4" fill="#d0182a" stroke="#6a0610" stroke-width=".5"/><circle cx="-.8" cy="-.8" r=".7" fill="#fff" opacity=".8"/></g>'
      + `<g class="fa-glow" style="--g:#fff2b0">${fRing(42.2, 0.9, '#e9d39a') + fRing(44.6, 0.4, '#e9d39a', 'stroke-dasharray="2 1.5"') + fRing(49.5, 0.7, '#e9d39a') + fRing(56.5, 0.9, '#e9d39a') + fRing(57.6, 0.4, '#e9d39a')}`
      + fTicks(72, 49.5, 50.9, '#e9d39a', 0.35, 0, 0.8)
      + `<g class="fa-spin slow">${fRep(30, (k) => `<path d="${runes[k % 5]}" fill="none" stroke="#f4e3b0" stroke-width=".55" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 -1)"/>`)}</g>`
      + `<g class="fa-spin rev slow"><g mask="url(#fm-out)"><polygon points="${f6poly(3, 49.5, -90)}" fill="none" stroke="#e9d39a" stroke-width=".6"/><polygon points="${f6poly(3, 49.5, 90)}" fill="none" stroke="#e9d39a" stroke-width=".6"/><circle cx="60" cy="60" r="47" fill="none" stroke="#e9d39a" stroke-width=".35"/></g>${fRep(6, () => '<circle cx="60" cy="10.5" r="1.4" fill="#fff8e0" stroke="#c9a85a" stroke-width=".4"/>')}</g>`
      + fRep(4, () => '<circle cx="60" cy="3" r="3.2" fill="#fffaf0" fill-opacity=".25" stroke="#e9d39a" stroke-width=".6"/><path d="M60 1L60.6 2.4 62 3 60.6 3.6 60 5 59.4 3.6 58 3 59.4 2.4Z" fill="#fff4c8"/>', 45) + '</g>'
      + grass + flowers;
  },

  // Клинок, рассекающий демонов: клетка, большой чёрный клинок с цубой по верху, волна «дыхания воды» снизу, гроздья глицинии по бокам
  an_kny: () => { const rnd = fRand(811);
    const hamon = P6(Array.from({ length: 49 }, (_, i) => fXY(54.9 + 0.55 * Math.sin(i * 1.25), -150 + (i * 124) / 48)));
    const cluster = (cx, cy, n = 18) => `<path d="M${cx} ${cy - 1}V${cy + 1}" stroke="#3f7a2a" stroke-width=".6"/>` + Array.from({ length: n }, (_, i) => { const t = i / (n - 1), x = cx + (rnd() - 0.5) * 8 * (1 - t * 0.8), y = cy + 1 + t * 16; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(2 - t * 0.9).toFixed(1)}" fill="url(#fg-wist)" stroke="#5a2f8a" stroke-width=".3"/>`; }).join('')
      + fLeaf(cx - 2, cy, -60, 5.5, 1.8, '#4caf50', '#1f5a22', false) + fLeaf(cx + 2, cy, 60, 5.5, 1.8, '#4caf50', '#1f5a22', false);
    const crest = '<path d="M53.6 9.6C54.2 4.4 59.4 2.2 63 4.2C65.4 5.6 64.6 8.6 62.4 8.4C60.8 8.2 60.4 6.6 61.4 5.9C58.8 5.4 57.2 7.6 57.8 9.6Z" fill="url(#fg-wave)" stroke="#0b3f8a" stroke-width=".5" stroke-linejoin="round"/><path d="M59.6 3.4L60.4 1.6 61 3.4M62.2 3.6L63.8 2.4 63.6 4.2M57.2 4.6L57.4 2.8 58.4 4.2" fill="none" stroke="#fff" stroke-width=".55" stroke-linecap="round" stroke-linejoin="round"/>';
    return fRing(44.5, 4, '#121212') + '<circle cx="60" cy="60" r="44.5" fill="none" stroke="#1f9a63" stroke-width="4" pathLength="72" stroke-dasharray="1 1"/>'
      + fRing(48.5, 4, '#121212') + '<circle cx="60" cy="60" r="48.5" fill="none" stroke="#1f9a63" stroke-width="4" pathLength="72" stroke-dasharray="1 1" stroke-dashoffset="1"/>'
      + fRing(42.5, 0.8, '#0a0a0a') + fRing(46.5, 0.4, '#0a0a0a') + fRing(50.5, 0.9, '#0a0a0a') + fRing(49.7, 0.5, '#fff', 'opacity=".18"')
      + `<path d="${fArc(54.4, 8, 172)}" fill="none" stroke="url(#fg-wave)" stroke-width="5"/><path d="${fArc(56.6, 10, 170)}" fill="none" stroke="#e6f4ff" stroke-width=".7" stroke-dasharray="3 1.6 1 1.6"/>`
      + Array.from({ length: 8 }, (_, i) => fAt(102 + i * 22, `<g transform="translate(0 ${-1 - (i % 2) * 1.2})">${crest}</g>`)).join('')
      + `<path d="M${fP(53, -150)}A53 53 0 0 1 ${fP(53, -27)}L${fP(55, -14)}L${fP(56.8, -28)}A56.8 56.8 0 0 0 ${fP(56.8, -150)}Z" fill="#16181c" stroke="#000" stroke-width=".5"/>`
      + `<path d="${fArc(56.5, -149, -29)}" fill="none" stroke="#eef3fa" stroke-width="1"/><path d="${hamon}" fill="none" stroke="#9aa3b0" stroke-width=".4" opacity=".85"/>`
      + `<path d="${fArc(55, -158, -178)}" fill="none" stroke="#1e1e1e" stroke-width="3.8"/><path d="${fArc(55, -158, -178)}" fill="none" stroke="#e9e4d6" stroke-width="3.4" stroke-dasharray="1.3 1.3" opacity=".9"/>`
      + (() => { const [x, y] = X6(55, -154), [px, py] = X6(55, -180.5); return `<circle cx="${x}" cy="${y}" r="4.6" fill="#1e1e1e" stroke="#a0a0a0" stroke-width=".7"/><circle cx="${x}" cy="${y}" r="1.8" fill="none" stroke="#a0a0a0" stroke-width=".5"/>${[0, 60, 120, 180, 240, 300].map((r) => `<circle cx="${(x + 3.2 * Math.cos((r * Math.PI) / 180)).toFixed(1)}" cy="${(y + 3.2 * Math.sin((r * Math.PI) / 180)).toFixed(1)}" r=".75" fill="#555"/>`).join('')}<circle cx="${px}" cy="${py}" r="2" fill="#6a6a6a" stroke="#222" stroke-width=".4"/>`; })()
      + cluster(7, 38) + cluster(113, 38) + cluster(15, 26, 12) + cluster(105, 26, 12);
  },

  // Fate Series: закатное небо, тёмные шестерни, поле воткнутых мечей разных видов, золотой Грааль внизу
  an_fate: () => { const rnd = fRand(821);
    const sword = (k) => { const t = k % 4, tilt = ((rnd() - 0.5) * 18).toFixed(1);
      const blade = t === 2 ? '<path d="M58.3 17V6.5L60 4.6L61.7 6.5V17Z" fill="#2a2e36" stroke="#000" stroke-width=".45"/><path d="M60 16V6" stroke="#ff3a3a" stroke-width=".5" opacity=".9"/>'
        : t === 3 ? '<path d="M58.5 17V6.2L60 4.2L61.5 6.2V17Z" fill="#dfeaff" stroke="#3a5aa8" stroke-width=".45"/><path d="M60 16V6" stroke="#6fa8ff" stroke-width=".6"/>'
        : `<path d="M${t ? 59 : 58.5} 17V6H${t ? 61 : 61.5}V17Z" fill="url(#fg-steel)" stroke="#2c3852" stroke-width=".4"/><path d="M60 16.5V6.5" stroke="#fff" stroke-width=".45" opacity=".7"/>`;
      const guard = t === 1 ? '<circle cx="60" cy="5.6" r="2.2" fill="#2a2a2a" stroke="#c9a14a" stroke-width=".5"/>' : t === 3 ? '<path d="M55 6.4Q60 3.6 65 6.4L64.4 4.6Q60 2.6 55.6 4.6Z" fill="url(#fg-gold)" stroke="#6b4a0c" stroke-width=".35"/><circle cx="60" cy="4.8" r=".9" fill="#2f6bff"/>' : `<path d="M${t ? 55.8 : 54.6} 6.5H${t ? 64.2 : 65.4}V4.8H${t ? 55.8 : 54.6}Z" fill="url(#fg-gold)" stroke="#6b4a0c" stroke-width=".35"/>`;
      return `<g transform="rotate(${tilt} 60 17)">${blade}${guard}<rect x="59.1" y="0.4" width="1.8" height="4.6" fill="${t === 3 ? '#2a3a7a' : t === 2 ? '#1a1a1a' : '#6a1a1a'}" stroke="#1a0808" stroke-width=".3"/><circle cx="60" cy="0" r="1.15" fill="url(#fg-gold)" stroke="#6b4a0c" stroke-width=".3"/></g>`; };
    return '<circle cx="60" cy="60" r="60" fill="url(#fg-ubw2)" mask="url(#fm-out)"/>'
      + [[20, 17, 12, 9.5, 12.5, 24], [101, 19, 10, 8, 10.4, 30], [108, 84, 9, 6, 8, 20]].map(([x, y, n, r0, r1, dur], i) => `<g class="fa-twirl" style="animation-duration:${dur}s${i % 2 ? ';animation-direction:reverse' : ''}"><path d="${f6gear(x, y, n, r0, r1)}" fill="#3a2418" fill-opacity=".75" stroke="#c8864a" stroke-width=".7"/><circle cx="${x}" cy="${y}" r="${(r0 * 0.55).toFixed(1)}" fill="none" stroke="#c8864a" stroke-width=".7"/><circle cx="${x}" cy="${y}" r="${(r0 * 0.2).toFixed(1)}" fill="#c8864a"/></g>`).join('')
      + Array.from({ length: 13 }, (_, k) => { const d = 210 + (k * 300) / 12 + (rnd() - 0.5) * 6; return fAt(d % 360, sword(k)); }).join('')
      + fRing(42.4, 3.4, '#3a2a24') + fRing(44.2, 0.6, '#8a5a3a') + fRing(40.9, 0.6, '#1a0d08')
      + [30, 110, 170, 250, 320].map((a, i) => `<path d="${fCrack(a, 41, 44, 831 + i)}" fill="none" stroke="#120806" stroke-width=".5"/>`).join('')
      + '<g class="fa-glow" style="--g:#ffd75e"><path d="M52.5 100.5H67.5C67.5 105.5 64.5 108.6 61.2 109V112.4H64.8V114.6H55.2V112.4H58.8V109C55.5 108.6 52.5 105.5 52.5 100.5Z" fill="url(#fg-gold)" stroke="#6b4a0c" stroke-width=".55" stroke-linejoin="round"/><path d="M54.6 102.2C55 104.6 56.4 106.2 58 107" fill="none" stroke="#fff8d6" stroke-width=".7" stroke-linecap="round"/><circle cx="60" cy="104.6" r="1.2" fill="#d0182a"/></g>';
  },
});

// Аля: сугробы на верхней кромке и бант
{ const base = FRAME_ART.an_alya; const rnd = fRand(841);
  const drift = 'M' + Array.from({ length: 78 }, (_, i) => { const a = -168 + i * 2; return fP(53.4 + 1.3 * Math.sin(i * 0.55) + 0.6 * Math.sin(i * 1.7 + rnd()), a); }).join('L') + `L${fP(51.6, -14)}A51.6 51.6 0 0 0 ${fP(51.6, -168)}Z`;
  FRAME_ART.an_alya = () => base() + `<path d="${drift}" fill="#fff" stroke="#b8c8e8" stroke-width=".5" stroke-linejoin="round"/><path d="${fArc(52.6, -160, -110)}" fill="none" stroke="#dbe6fb" stroke-width="1" opacity=".8"/>`
    + `<g transform="translate(${X6(53.5, -132).join(' ')}) rotate(-42) scale(1.3)"><g class="fa-swing"><path d="M-1 .8L-4.6 10.6 -2.6 9.6 -1.4 12ZM1 .8L4.6 10.6 2.6 9.6 1.4 12Z" fill="url(#fg-satin)" stroke="#0e1f5a" stroke-width=".4"/></g>`
    + '<path d="M0 0C-3.6-6.4-11-5.6-10.4-.4-9.8 4.4-3.8 3.2 0 0ZM0 0C3.6-6.4 11-5.6 10.4-.4 9.8 4.4 3.8 3.2 0 0Z" fill="url(#fg-satin)" stroke="#0e1f5a" stroke-width=".55"/><path d="M-2-1.4C-4.6-4-8-3.8-8.4-1.2M2-1.4C4.6-4 8-3.8 8.4-1.2" fill="none" stroke="#9fc0ff" stroke-width=".6" stroke-linecap="round" opacity=".8"/><path d="M-1.8.8C-4.4 2.2-7.4 2-8.6 0M1.8.8C4.4 2.2 7.4 2 8.6 0" fill="none" stroke="#0e1f5a" stroke-width=".4" opacity=".6"/>'
    + '<rect x="-2" y="-2" width="4" height="4" rx="1.4" fill="#2a4fb8" stroke="#0e1f5a" stroke-width=".5"/><path d="M-1-1.2H.8" stroke="#9fc0ff" stroke-width=".5"/></g>';
}

// шёпот Али: фразы по очереди, у каждой своё облачко нужной ширины
const ALYA_WHISPERS = ['мило', 'дурак', 'глупенький', 'заметь меня', 'нравишься'];
Object.assign(FRAME_FX, {
  an_frieren: () => fTwinkles(8, 851, 44, 58, '#fff4c8', 0.4) + fFly(8, 853, 50, '#fff2b0', 0.7, 2.6)
    + [[34, 0], [46, 0.7], [60, 1.5], [74, 0.4], [86, 1.1], [98, 1.9], [24, 2.3], [52, 2.8]].map(([x, d]) => `<ellipse class="fa-rise" style="animation-delay:${-d}s;animation-duration:3.2s" cx="${x}" cy="${104 + (x % 3) * 2}" rx=".8" ry="1.3" fill="#8fc8ff"/>`).join(''),
  an_kny: () => `<path class="fa-flow" style="animation-duration:1.4s" d="${fArc(56.6, 10, 170)}" fill="none" stroke="#fff" stroke-width=".8" stroke-dasharray="2 9" stroke-linecap="round"/>`
    + `<path class="fa-flow" style="animation-duration:.9s" d="${fArc(56.5, -149, -29)}" fill="none" stroke="#fff" stroke-width="1.2" stroke-dasharray="6 40" stroke-linecap="round"/>`
    + [[6, 0], [10, 1.4], [112, 0.7], [116, 2.1], [16, 2.6], [104, 1.9]].map(([x, d]) => `<ellipse class="fa-fall" style="animation-delay:${-d}s" cx="${x}" cy="54" rx="1" ry=".6" fill="#cfa6ff"/>`).join(''),
  an_fate: () => fFly(16, 861, 50, '#ffb04a', 0.9, 2.2) + [[0, 0], [5, 0.8], [9, 1.6]].map(([k, d]) => fAt(210 + (k * 300) / 12, fSpark(60, 2.5, 0.3, '#fff', d))).join('') + '<circle class="fa-breath" cx="60" cy="106" r="7" fill="#ffd75e" opacity=".35"/>',
  an_alya: () => { const rnd = fRand(871);
    const flakes = Array.from({ length: 22 }, () => `<circle class="fa-snow" style="animation-delay:${-(rnd() * 5).toFixed(2)}s;animation-duration:${(4 + rnd() * 3).toFixed(1)}s" cx="${(4 + rnd() * 112).toFixed(1)}" cy="${(rnd() * 70).toFixed(1)}" r="${(0.5 + rnd() * 0.7).toFixed(1)}" fill="#fff" stroke="#c3d1ec" stroke-width=".2"/>`).join('')
      + Array.from({ length: 7 }, () => `<g transform="translate(${(6 + rnd() * 108).toFixed(1)} ${(rnd() * 60).toFixed(1)})"><g class="fa-snow" style="animation-delay:${-(rnd() * 5).toFixed(2)}s;animation-duration:${(5 + rnd() * 3).toFixed(1)}s" stroke="#dfeaff" stroke-width=".5" stroke-linecap="round">${[0, 60, 120].map((r) => `<path transform="rotate(${r})" d="M0-2.4V2.4M-.8-1.7L0-1.1.8-1.7M-.8 1.7L0 1.1.8 1.7"/>`).join('')}</g></g>`).join('');
    const bubbles = ALYA_WHISPERS.map((t, i) => { const w = 14 + t.length * 2.75, x0 = 117 - w; return `<g class="fa-wh5" style="animation-delay:${i * 6}s"><path d="M${x0 + 3} 1H114A3 3 0 0 1 117 4V12A3 3 0 0 1 114 15H${x0 + 11}L${x0 + 6} 19L${x0 + 7} 15H${x0 + 3}A3 3 0 0 1 ${x0} 12V4A3 3 0 0 1 ${x0 + 3} 1Z" fill="#fff" stroke="#1a3fa8" stroke-width=".7"/><text x="${((x0 + 109) / 2).toFixed(1)}" y="10.2" text-anchor="middle" font-size="5.2" font-family="Georgia, serif" font-style="italic" fill="#1a3fa8">${t}</text><path d="M110.5 5.6C109.6 4.4 108 5 108.2 6.4C108.4 7.6 110.5 9 110.5 9S112.6 7.6 112.8 6.4C113 5 111.4 4.4 110.5 5.6Z" fill="#ff6a9a" transform="translate(1 -.5) scale(.9)" style="transform-box:fill-box"/></g>`; }).join('');
    return `<g mask="url(#fm-out)">${flakes}</g>` + fSweep(46.5, 3, '', '#fff', 0.55) + bubbles; },
});

