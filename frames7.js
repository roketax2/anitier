'use strict';
/* Аниме-рамки, правки (2026-11-18): заново Аля (гжель + шёпот), Re:Zero (разбитый циферблат и теневые руки ведьмы),
   Коносуба (взрывная магия: красный круг и три парящих круга заклинания над головой, раз в несколько секунд — взрыв). */
document.body.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<radialGradient id="fg-porc" gradientUnits="userSpaceOnUse" cx="60" cy="60" r="60"><stop offset=".68" stop-color="#d6e0f2"/><stop offset=".74" stop-color="#ffffff"/><stop offset=".82" stop-color="#f3f7ff"/><stop offset=".88" stop-color="#c3d1ec"/></radialGradient>
<linearGradient id="fg-gzhel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef4ff"/><stop offset=".45" stop-color="#4a78e0"/><stop offset="1" stop-color="#14309a"/></linearGradient>
<radialGradient id="fg-voidp" gradientUnits="userSpaceOnUse" cx="60" cy="60" r="60"><stop offset=".66" stop-color="#2a0f3d" stop-opacity=".9"/><stop offset=".85" stop-color="#1a0828" stop-opacity=".55"/><stop offset="1" stop-color="#1a0828" stop-opacity="0"/></radialGradient>
<linearGradient id="fg-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0610" stop-opacity="0"/><stop offset=".45" stop-color="#0a0610" stop-opacity=".85"/><stop offset="1" stop-color="#0a0610"/></linearGradient>
<radialGradient id="fg-crimson" gradientUnits="userSpaceOnUse" cx="60" cy="60" r="60"><stop offset=".66" stop-color="#3a0505" stop-opacity=".85"/><stop offset=".86" stop-color="#5a0a0a" stop-opacity=".5"/><stop offset="1" stop-color="#5a0a0a" stop-opacity="0"/></radialGradient>
<radialGradient id="fg-boom" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffbe6"/><stop offset=".4" stop-color="#ffd25a"/><stop offset=".75" stop-color="#ff5a1f" stop-opacity=".8"/><stop offset="1" stop-color="#c8100a" stop-opacity="0"/></radialGradient>
</defs></svg>`);

// мазок гжели: широкий синий конец у основания, тает в белое к кончику
const f7stroke = (x, y, rot, len, w) => `<path transform="translate(${x} ${y}) rotate(${rot})" d="M0 0C${-w} ${-len * 0.3} ${-w * 0.8} ${-len * 0.8} 0 ${-len}C${w * 0.35} ${-len * 0.75} ${w * 0.45} ${-len * 0.3} 0 0Z" fill="url(#fg-gzhel)"/>`;
const f7rose = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${Array.from({ length: 7 }, (_, k) => f7stroke(0, 0, k * 51.4, 6.5, 3)).join('')}${Array.from({ length: 5 }, (_, k) => f7stroke(0, 0, k * 72 + 25, 3.8, 2)).join('')}<circle r="1.5" fill="#14309a"/><path d="M-.8-.2A.9.9 0 1 1 .6.6" fill="none" stroke="#eef4ff" stroke-width=".4"/></g>`;
// теневая рука ведьмы: тянется снаружи, пальцы цепляются за циферблат (в «верхней» ориентации)
const F7_HAND = '<path d="M59.2-9C58.6-2 57.2 1 57.4 4.2C55.4 5.2 54.6 7.2 55.2 9.2Q60 11 64.8 9.2C65.4 7.2 64.4 5.2 62.6 4.2C62.4 1 61.2-2 60.8-9Z" fill="url(#fg-shade)"/><path d="M64.4 9Q66.6 11 67.4 14.8M62.6 10Q63.8 12.6 64 16.6M60.4 10.4Q60.9 13.6 60.4 17.2M58.2 10Q57.2 13 56.8 16.4M55.6 9Q53.6 10.8 52.8 13.8" fill="none" stroke="#0a0610" stroke-width="1.25" stroke-linecap="round"/>';

Object.assign(FRAME_ART, {
  // Аля иногда кокетничает со мной по-русски: фарфоровое кольцо, расписанное гжелью — синие розы и завитки
  an_alya: () => fRing(46.5, 11, 'url(#fg-porc)') + fRing(41.4, 1.2, '#1a3fa8') + fRing(42.8, 0.4, '#1a3fa8') + fRing(50.6, 0.4, '#1a3fa8') + fRing(52, 1.2, '#1a3fa8')
    + fRep(36, () => '<circle cx="60" cy="6.4" r=".9" fill="#1a3fa8"/>', 5) + fRep(36, () => '<circle cx="60" cy="4.6" r=".45" fill="#4a78e0"/>')
    + `<path d="${fArc(49, -170, -100)}" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>`
    + [-150, -95, -30, 25, 80, 140, 200].map((a, i) => { const [x1, y1] = X6(46.5, a + 9), [x2, y2] = X6(46.5, a + 24); return f7stroke(x1, y1, a + 9 + (i % 2 ? 60 : 120), 6, 2.2) + f7stroke(x2, y2, a + 24 + (i % 2 ? 120 : 60), 5, 1.8) + `<circle cx="${X6(48.5, a + 17)[0]}" cy="${X6(48.5, a + 17)[1]}" r=".7" fill="#1a3fa8"/>`; }).join('')
    + [[-130, 1.45], [-55, 1.1], [10, 1.2], [60, 1.45], [115, 1.1], [175, 1.2]].map(([a, s]) => { const [x, y] = X6(46.5, a); return f7rose(x, y, s); }).join(''),

  // Re:Zero: разбитый на осколки циферблат, теневые руки ведьмы тянутся снаружи и вцепляются в него
  an_rezero: () => { const rnd = fRand(701), rom = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    return '<circle cx="60" cy="60" r="60" fill="url(#fg-voidp)" mask="url(#fm-out)"/>'
      + Array.from({ length: 12 }, (_, k) => { const a = -105 + k * 30, sh = rnd() * 1.6, da = (rnd() - 0.5) * 2.4, [dx, dy] = X6(sh, a + 15).map((v, j) => v - 60);
        return `<g transform="translate(${dx.toFixed(2)} ${dy.toFixed(2)}) rotate(${da.toFixed(1)} 60 60)"><path d="${f5sector(41.5, 55, a + 1, a + 29)}" fill="#1d1430" stroke="#c9bfe6" stroke-width=".7" stroke-linejoin="round"/><path d="${fArc(54, a + 2, a + 28)}" fill="none" stroke="url(#fg-silver)" stroke-width="1.6"/>`
          + '</g>'; }).join('')
      + rom.map((t, i) => { const [x, y] = X6(47, -90 + i * 30); return `<text x="${x}" y="${(y + 1.4).toFixed(1)}" text-anchor="middle" font-size="4" font-family="Georgia, serif" fill="#e6dcff">${t}</text>`; }).join('')
      + fTicks(60, 51.5, 53, '#cbbfe6', 0.35, 0, 0.7)
      + Array.from({ length: 7 }, () => { const [x, y] = X6(57 + rnd() * 3, rnd() * 360), r = 1 + rnd() * 1.4, t = rnd() * 360; return `<path transform="rotate(${t.toFixed(0)} ${x} ${y})" d="M${x} ${(y - r).toFixed(1)}L${(x + r * 0.8).toFixed(1)} ${(y + r * 0.6).toFixed(1)}L${(x - r * 0.7).toFixed(1)} ${(y + r * 0.5).toFixed(1)}Z" fill="#2a1d44" stroke="#c9bfe6" stroke-width=".4"/>`; }).join('')
      + [[150, 0], [205, 1], [118, 2], [-28, 3], [28, 4]].map(([d, k]) => fAt(d, `<g class="fa-creep" style="animation-delay:${(-k * 0.9).toFixed(1)}s"><g class="fa-glow" style="--g:#a24dff">${F7_HAND}</g></g>`)).join('');
  },

  // Коносуба: багровый магический круг взрывной магии, над головой — три парящих круга заклинания
  an_konosuba: () => '<circle cx="60" cy="60" r="60" fill="url(#fg-crimson)" mask="url(#fm-out)"/>'
    + `<g class="fa-spin slow"><g class="fa-glow" style="--g:#ff3a3a">${fRing(56, 1.2, '#ff4a3a') + fRing(53, 0.6, '#ff4a3a') + fRing(42.4, 1.1, '#ff4a3a') + fRing(44.6, 0.5, '#ff8a6a', 'stroke-dasharray="2 1.4"')}`
    + fRep(36, (k) => `<path d="${['M59 5H61M60 4V6', 'M59.2 5.8L60 4.2L60.8 5.8', 'M59.3 4.3L60.7 5.7M60.7 4.3L59.3 5.7', 'M59.2 5A.8.8 0 1 1 60.8 5'][k % 4]}" fill="none" stroke="#ffb09a" stroke-width=".5"/>`)
    + `<g mask="url(#fm-out)"><polygon points="${Array.from({ length: 5 }, (_, i) => fP(53, -90 + i * 144).replace(' ', ',')).join(' ')}" fill="none" stroke="#ff4a3a" stroke-width=".8"/><polygon points="${f6poly(5, 53, -90)}" fill="none" stroke="#ff4a3a" stroke-width=".5" opacity=".7"/></g>`
    + fRep(5, () => '<circle cx="60" cy="7" r="2.2" fill="#2a0505" stroke="#ffb09a" stroke-width=".6"/><circle cx="60" cy="7" r=".8" fill="#ffd25a"/>', 36) + '</g></g>'
    + [[16, 30, 5.4], [8, 23, 4.2], [1, 15, 3]].map(([y, rx, ry], i) => `<g class="fa-charge" style="animation-delay:${(-i * 0.15).toFixed(2)}s"><ellipse cx="60" cy="${y}" rx="${rx}" ry="${ry}" fill="#ff3a3a" fill-opacity=".22" stroke="#ff6a4a" stroke-width="1.3" class="fa-glow" style="--g:#ff3a3a"/><ellipse class="fa-flow${i % 2 ? ' rev' : ''}" cx="60" cy="${y}" rx="${rx - 2}" ry="${(ry * 0.7).toFixed(1)}" fill="none" stroke="#ffe0c0" stroke-width=".8" stroke-dasharray="1.5 2.2"/></g>`).join(''),
});

Object.assign(FRAME_FX, {
  // Аля: в углу появляется облачко шёпота с сердечком, падает снег, фарфор блестит
  an_alya: () => { const rnd = fRand(711);
    return Array.from({ length: 8 }, () => `<circle class="fa-snow" style="animation-delay:${-(rnd() * 5).toFixed(2)}s" cx="${(10 + rnd() * 100).toFixed(1)}" cy="${(rnd() * 12).toFixed(1)}" r="${(0.5 + rnd() * 0.6).toFixed(1)}" fill="#fff" stroke="#c3d1ec" stroke-width=".2"/>`).join('')
      + fSweep(46.5, 3, '', '#fff', 0.55)
      + '<g class="fa-whisper"><path d="M90 1H114A3 3 0 0 1 117 4V12A3 3 0 0 1 114 15H98L93 19L94 15H90A3 3 0 0 1 87 12V4A3 3 0 0 1 90 1Z" fill="#fff" stroke="#1a3fa8" stroke-width=".7"/><text x="102" y="10.2" text-anchor="middle" font-size="5.2" font-family="Georgia, serif" font-style="italic" fill="#1a3fa8">мило</text><path d="M110.5 5.6C109.6 4.4 108 5 108.2 6.4C108.4 7.6 110.5 9 110.5 9S112.6 7.6 112.8 6.4C113 5 111.4 4.4 110.5 5.6Z" fill="#ff6a9a" transform="translate(1 -.5) scale(.9)"/></g>'; },
  // Re:Zero: стрелки крутятся назад, фиолетовые искры, весь циферблат иногда «отматывается»
  an_rezero: () => '<g class="fa-spin rev" style="animation-duration:40s"><path d="M59 60L60 15.5L61 60Z" fill="#efe6ff" mask="url(#fm-out)"/></g><g class="fa-spin rev" style="animation-duration:5s"><path d="M59.5 60L60 9L60.5 60Z" fill="#efe6ff" mask="url(#fm-out)"/><path d="M58.4 12L60 7.6L61.6 12Z" fill="#efe6ff"/></g>'
    + fFly(8, 721, 55, '#b36bff', 0.9, 2.4) + `<g class="fa-spin rev" style="animation-duration:7s"><path d="${fArc(58.5, -60, 40)}" fill="none" stroke="#c9a6ff" stroke-width=".7" stroke-dasharray="3 2" opacity=".7"/><path d="M${fP(58.5, -60)}l2.4 -2.6l.6 3.4Z" fill="#c9a6ff" opacity=".7" transform="rotate(0)"/></g>`,
  // Коносуба: круги над головой разгораются — и бабах: вспышка над аватаркой, ударная волна, искры
  an_konosuba: () => '<g class="fa-kaboomtop"><polygon points="' + Array.from({ length: 24 }, (_, i) => { const r = i % 2 ? 7 : 15 + (i % 4) * 2, a = (i * 15 * Math.PI) / 180; return `${(60 + r * Math.cos(a)).toFixed(1)},${(4 + r * Math.sin(a) * 0.8).toFixed(1)}`; }).join(' ') + '" fill="url(#fg-boom)"/><circle cx="60" cy="4" r="7" fill="#fffbe6"/></g>'
    + '<g mask="url(#fm-out)"><circle class="fa-kaboom" cx="60" cy="60" r="50" fill="none" stroke="#ffd25a" stroke-width="3"/><circle class="fa-kaboom" style="animation-delay:-.12s" cx="60" cy="60" r="46" fill="none" stroke="#ff5a1f" stroke-width="1.6"/></g>'
    + fFly(12, 731, 54, '#ffb04a', 0.9, 1.6),
});
