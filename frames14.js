'use strict';
/* Музыкальные рамки (2026-11-18) — за достижения раздела «Опенинги»: Нотный стан, Эквалайзер, Пластинка, Наушники. */
document.body.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<linearGradient id="fg-vsheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity=".22"/><stop offset=".55" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="fg-cup" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4466"/><stop offset=".5" stop-color="#2a2640"/><stop offset="1" stop-color="#17142a"/></linearGradient>
<linearGradient id="fg-band" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a3556"/><stop offset=".5" stop-color="#55507a"/><stop offset="1" stop-color="#3a3556"/></linearGradient>
<linearGradient id="fg-arm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f4f8"/><stop offset="1" stop-color="#8d8aa0"/></linearGradient>
</defs></svg>`);
{
  // восьмая нота: головка, штиль и флажок
  const note = (x, y, s, c, extra = '') => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})" ${extra}><ellipse rx="1.9" ry="1.35" transform="rotate(-20)" fill="${c}"/><path d="M1.7-.3V-7.4Q4.6-6.2 4.6-3.6" fill="none" stroke="${c}" stroke-width=".75" stroke-linecap="round"/></g>`;
  // ноты, взлетающие с кольца (слой движения)
  const flying = (n, seed, r, colors) => { const rnd = fRand(seed); return Array.from({ length: n }, (_, i) => { const [x, y] = fXY(r, -160 + rnd() * 140 + (i % 2 ? 180 : 0)); return note(x, y, 0.9 + rnd() * 0.5, colors[i % colors.length], `class="fa-note" style="animation-delay:${(-i * 0.8).toFixed(1)}s;animation-duration:${(3.6 + rnd() * 1.6).toFixed(1)}s"`); }).join(''); };

  /* Нотный стан: тёмная лента с пятью линиями, тактовые черты, ноты на линейках */
  const staffR = [44, 46, 48, 50, 52];
  const NOTES = [[8, 46, 1], [23, 49, 0], [37, 45, 1], [52, 51, 0], [66, 47, 1], [80, 44, 0], [97, 50, 1], [111, 46, 0], [126, 48, 1], [140, 52, 0], [156, 45, 1], [170, 49, 0]];
  const notesArt = () => fRing(48, 12.5, '#1a1530', 'opacity=".92"')
    + fRing(41.6, 1.1, '#c9a54a') + fRing(54.4, 1.1, '#c9a54a')
    + staffR.map((r) => fRing(r, 0.45, '#efe3b8', 'opacity=".85"')).join('')
    + fRep(6, () => `<path d="M60 ${60 - 44}V${60 - 52}" stroke="#efe3b8" stroke-width=".6" opacity=".9"/>`, 15)
    + NOTES.map(([, r, flag], i) => fAt(i * 30 + 8, `<g transform="translate(60 ${60 - r})">${flag ? note(0, 0, 0.95, i % 3 ? '#ffe9a8' : '#ff8fb0') : `<ellipse rx="1.8" ry="1.3" transform="rotate(-20)" fill="${i % 3 ? '#ffe9a8' : '#8fe3ff'}"/><path d="M1.6-.3V-6.6" stroke="${i % 3 ? '#ffe9a8' : '#8fe3ff'}" stroke-width=".7"/>`}</g>`)).join('');

  /* Эквалайзер: 48 полос по кругу, цвет — от бирюзового к фиолетовому, полосы прыгают */
  const eqArt = () => fRing(42, 1.3, '#3ee6b0', 'opacity=".9"') + fRing(57.5, 0.6, '#a64dff', 'opacity=".5"')
    + fRep(48, (k) => {
      const t = Math.abs(((k / 48) * 2) % 2 - 1), len = 4 + ((k * 7) % 11) * 0.95, hue = 165 + t * 120;
      return `<rect class="fa-eqb" style="animation-duration:${(0.55 + ((k * 5) % 7) * 0.09).toFixed(2)}s;animation-delay:${(-((k * 3) % 10) * 0.11).toFixed(2)}s" x="59.1" y="${(60 - 43.2 - len).toFixed(1)}" width="1.8" height="${len.toFixed(1)}" rx=".9" fill="hsl(${hue.toFixed(0)} 85% 62%)"/>`;
    });

  /* Пластинка: чёрный винил с бороздками, блик, золотые метки дорожек крутятся, звукосниматель в углу */
  const vinylArt = () => fRing(49.6, 17, '#0f0e14')
    + Array.from({ length: 11 }, (_, i) => fRing(42.6 + i * 1.28, 0.35, i % 4 === 3 ? '#3a3648' : '#24212e')).join('')
    + fRing(41.3, 0.8, '#3a3648') + fRing(57.9, 0.8, '#3a3648')
    + `<g class="fa-spin" style="animation-duration:5s">${fRep(4, () => `<path d="${fArc(56.2, -100, -80)}" stroke="#d9b45a" stroke-width=".9" fill="none" opacity=".8"/><path d="${fArc(45, -96, -84)}" stroke="#ff4d78" stroke-width=".9" fill="none" opacity=".7"/>`)}</g>`
    + `<path d="${fArc(49.6, -150, -100)}" stroke="url(#fg-vsheen)" stroke-width="16" fill="none"/><path d="${fArc(49.6, 30, 80)}" stroke="url(#fg-vsheen)" stroke-width="16" fill="none" opacity=".7"/>`
    // звукосниматель: ось в правом верхнем углу, рычаг к краю пластинки
    + `<circle cx="109" cy="14" r="5.4" fill="#2a2738" stroke="#8d8aa0" stroke-width=".8"/><circle cx="109" cy="14" r="2.2" fill="url(#fg-arm)"/>`
    + `<path d="M109 14L94 19.5Q87 21.5 84.2 17.6" fill="none" stroke="url(#fg-arm)" stroke-width="1.9" stroke-linecap="round"/>`
    + `<rect x="79.6" y="13.2" width="6.4" height="4.2" rx="1" transform="rotate(32 82.8 15.3)" fill="#d9d7e3" stroke="#6d6a80" stroke-width=".5"/>`;

  /* Наушники: оголовье поверх аватарки, чашки по бокам с розовой подсветкой */
  const cup = (x, flip) => `<g transform="translate(${x} 60) scale(${flip ? -1 : 1} 1)">
      <rect x="-5.2" y="-12.5" width="10.4" height="25" rx="4.6" fill="url(#fg-cup)" stroke="#0e0c18" stroke-width=".7"/>
      <rect x="2.6" y="-10.5" width="4.4" height="21" rx="2.2" fill="#14121f" stroke="#3a3556" stroke-width=".5"/>
      <rect x="-3.6" y="-8" width="1.5" height="16" rx=".75" fill="#ff4d78" class="fa-glow" style="--g:#ff4d78"/>
      <rect x="-1.6" y="-11" width="2.6" height="22" rx="1.3" fill="#fff" opacity=".08"/>
    </g>`;
  const phonesArt = () => fRing(42, 1, '#ff4d78', 'opacity=".55"')
    + `<path d="${fArc(54.5, -168, -12)}" stroke="#0e0c18" stroke-width="7" fill="none" stroke-linecap="round"/>`
    + `<path d="${fArc(54.5, -168, -12)}" stroke="url(#fg-band)" stroke-width="5.4" fill="none" stroke-linecap="round"/>`
    + `<path d="${fArc(56.4, -150, -30)}" stroke="#8c86b8" stroke-width=".8" fill="none" stroke-linecap="round" opacity=".8"/>`
    + `<path d="${fArc(54.5, -112, -68)}" stroke="#ff4d78" stroke-width="1.4" fill="none" stroke-linecap="round"/>`
    + `<path d="M6.2 49.5V47M113.8 49.5V47" stroke="#55507a" stroke-width="3" stroke-linecap="round"/>`
    + cup(9.4, false) + cup(110.6, true);

  Object.assign(FRAME_ART, { th_notes: notesArt, th_eq: eqArt, th_vinyl: vinylArt, th_phones: phonesArt });
  Object.assign(FRAME_FX, {
    th_notes: () => flying(6, 11, 55, ['#ffe9a8', '#ff8fb0', '#8fe3ff']),
    th_eq: () => fTwinkles(8, 23, 50, 58, '#c9a6ff', 0.4),
    th_vinyl: () => flying(3, 31, 58, ['#d9b45a', '#ff8fb0']),
    th_phones: () => flying(5, 41, 52, ['#ff8fb0', '#8fe3ff', '#ffe9a8']),
  });
}
