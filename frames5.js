'use strict';
/* Рамки, пятая пачка (2026-11-18, по скриншотам автора): заново Корона, Молния (целые молнии бьют по очереди),
   Сияние (занавес полярного сияния по всему кругу), Луна (месяц + созвездие справа), Свиток (развёрнутый
   свиток со скалками и печатью), Чёрная дыра (диск с ярким и тусклым краем, линзовые дуги, падающее вещество),
   Взрыв (кипящие клубы огня, лучи, обломки). Подключается после frames4.js. */
const f5sector = (r0, r1, a0, a1) => `M${fP(r1, a0)}A${r1} ${r1} 0 0 1 ${fP(r1, a1)}L${fP(r0, a1)}A${r0} ${r0} 0 0 0 ${fP(r0, a0)}Z`;
const f5xy = (r, a) => fXY(r, a).map((n) => +n.toFixed(1));
// зубцы короны: [угол, высота, полуширина в градусах]
const F5_PEAKS = [[-151, 9, 10], [-121, 12.5, 13], [-90, 14.5, 14], [-59, 12.5, 13], [-29, 9, 10]];
const f5peak = ([a, h, w]) => `M${fP(49, a - w)}Q${fP(50 + h * 0.3, a - w * 0.18)} ${fP(49 + h, a)}Q${fP(50 + h * 0.3, a + w * 0.18)} ${fP(49, a + w)}Z`;
const F5_BAND = f5sector(44.5, 50.5, -160, -20);
const f5spiral = (r0, r1, turns, squash, ph = 0) => 'M' + Array.from({ length: 61 }, (_, k) => { const t = ph + (k / 60) * turns * 2 * Math.PI, r = r0 + ((r1 - r0) * k) / 60; return `${(60 + r * Math.cos(t)).toFixed(1)} ${(60 + r * squash * Math.sin(t)).toFixed(1)}`; }).join('L');

document.body.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<radialGradient id="fg-velvet" gradientUnits="userSpaceOnUse" cx="60" cy="60" r="57"><stop offset=".86" stop-color="#d02048"/><stop offset=".93" stop-color="#8f0f2c"/><stop offset="1" stop-color="#520818"/></radialGradient>
<clipPath id="fc-crown" clipPathUnits="userSpaceOnUse"><path d="${F5_BAND}"/>${F5_PEAKS.map((p) => `<path d="${f5peak(p)}"/>`).join('')}</clipPath>
<radialGradient id="fg-storm" gradientUnits="userSpaceOnUse" cx="60" cy="60" r="60"><stop offset=".66" stop-color="#16285a" stop-opacity=".95"/><stop offset=".86" stop-color="#101d44" stop-opacity=".7"/><stop offset="1" stop-color="#101d44" stop-opacity="0"/></radialGradient>
<radialGradient id="fg-nightsky" gradientUnits="userSpaceOnUse" cx="60" cy="60" r="60"><stop offset=".66" stop-color="#0a1635" stop-opacity=".95"/><stop offset=".86" stop-color="#0d1c45" stop-opacity=".8"/><stop offset="1" stop-color="#0d1c45" stop-opacity="0"/></radialGradient>
<radialGradient id="fg-curtA" gradientUnits="userSpaceOnUse" cx="60" cy="60" r="60"><stop offset=".7" stop-color="#7dffd2"/><stop offset=".78" stop-color="#3ee6b0" stop-opacity=".9"/><stop offset=".87" stop-color="#2fc9d6" stop-opacity=".6"/><stop offset=".95" stop-color="#8b5cf6" stop-opacity=".3"/><stop offset="1" stop-color="#8b5cf6" stop-opacity="0"/></radialGradient>
<radialGradient id="fg-curtB" gradientUnits="userSpaceOnUse" cx="60" cy="60" r="60"><stop offset=".8" stop-color="#ff7ab8" stop-opacity="0"/><stop offset=".87" stop-color="#ff7ab8" stop-opacity=".6"/><stop offset=".94" stop-color="#b061ff" stop-opacity=".45"/><stop offset="1" stop-color="#b061ff" stop-opacity="0"/></radialGradient>
<clipPath id="fc-wavA" clipPathUnits="userSpaceOnUse"><path d="${fWave(51, 6, 5, 0)}"/></clipPath>
<clipPath id="fc-wavB" clipPathUnits="userSpaceOnUse"><path d="${fWave(55, 3.5, 7, 1.2)}"/></clipPath>
<linearGradient id="fg-roll" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9a7444"/><stop offset=".35" stop-color="#f1deb4"/><stop offset=".5" stop-color="#fff8e3"/><stop offset=".75" stop-color="#dcc28e"/><stop offset="1" stop-color="#8a6436"/></linearGradient>
<linearGradient id="fg-sheet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8ecca"/><stop offset=".5" stop-color="#fbf2da"/><stop offset="1" stop-color="#ead5a3"/></linearGradient>
<linearGradient id="fg-knob" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a2210"/><stop offset=".45" stop-color="#9a6a3c"/><stop offset="1" stop-color="#3a2210"/></linearGradient>
<radialGradient id="fg-wax" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#ff6a5a"/><stop offset=".5" stop-color="#c81e1e"/><stop offset="1" stop-color="#6a0808"/></radialGradient>
<linearGradient id="fg-dopp" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="120" y2="0"><stop offset="0" stop-color="#cfefff" stop-opacity=".2"/><stop offset=".12" stop-color="#ffffff"/><stop offset=".35" stop-color="#ffe7b0"/><stop offset=".62" stop-color="#ffa257"/><stop offset=".86" stop-color="#c2361b"/><stop offset="1" stop-color="#6a1208" stop-opacity=".3"/></linearGradient>
<radialGradient id="fg-burst" gradientUnits="userSpaceOnUse" cx="60" cy="60" r="64"><stop offset=".62" stop-color="#fffbe0"/><stop offset=".72" stop-color="#ffe066"/><stop offset=".85" stop-color="#ff7a1f" stop-opacity=".85"/><stop offset="1" stop-color="#ff3d00" stop-opacity="0"/></radialGradient>
<radialGradient id="fg-qglow" gradientUnits="userSpaceOnUse" cx="60" cy="60" r="60"><stop offset=".68" stop-color="#ffb060" stop-opacity=".5"/><stop offset=".82" stop-color="#ff7a2a" stop-opacity=".2"/><stop offset="1" stop-color="#ff5a1f" stop-opacity="0"/></radialGradient>
<filter id="ff-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.1"/></filter>
<filter id="ff-cloud" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.8"/></filter>
</defs></svg>`);

Object.assign(FRAME_ART, {
  // корона: большой венец обнимает верх аватарки — бархат, пять зубцов с жемчугом, камни на обруче
  crown: () => {
    const pearl = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fffaf0" stroke="#a8946a" stroke-width=".5"/><circle cx="${(x - r * 0.35).toFixed(1)}" cy="${(y - r * 0.35).toFixed(1)}" r="${(r * 0.35).toFixed(2)}" fill="#fff"/>`;
    const gems = ['#2f6bff', '#1fbf6a', '#e0115f', '#1fbf6a', '#2f6bff'];
    return fBevel('gold', 43, 4)
      + `<path d="${f5sector(49, 57.5, -152, -28)}" fill="url(#fg-velvet)" stroke="#3a0410" stroke-width=".6"/>`
      + Array.from({ length: 20 }, (_, i) => `<path d="M${fP(50, -148 + i * 6)}L${fP(57, -148 + i * 6)}" stroke="#3a0410" stroke-width=".6" opacity=".35"/>`).join('')
      + F5_PEAKS.map(([a, h, w]) => `<path d="${f5peak([a, h, w])}" fill="url(#fg-gold)" stroke="#5a3d0a" stroke-width=".8" stroke-linejoin="round"/>`
        + `<path d="M${fP(50.5, a - w * 0.55)}Q${fP(50 + h * 0.4, a - w * 0.2)} ${fP(47.5 + h, a - 0.6)}" fill="none" stroke="#fff8d6" stroke-width=".8" stroke-linecap="round" opacity=".75"/>`).join('')
      + `<path d="${F5_BAND}" fill="url(#fg-gold)" stroke="#5a3d0a" stroke-width=".9" stroke-linejoin="round"/>`
      + `<path d="${fArc(45.7, -159, -21)}" fill="none" stroke="#7a5310" stroke-width=".5" opacity=".7"/><path d="${fArc(49.3, -159, -21)}" fill="none" stroke="#7a5310" stroke-width=".5" opacity=".7"/><path d="${fArc(50, -157, -23)}" fill="none" stroke="#fff8d6" stroke-width=".5" opacity=".6"/>`
      + [-140, -115, -90, -65, -40].map((a, i) => { const [x, y] = f5xy(47.5, a); return fGem(x, y, 1.9, gems[i], '#5a3d0a'); }).join('')
      + [-152, -127.5, -102.5, -77.5, -52.5, -28].map((a) => { const [x, y] = f5xy(47.5, a); return pearl(x, y, 0.9); }).join('')
      + (() => { const [x, y] = f5xy(55, -90); return `<circle cx="${x}" cy="${y}" r="3.6" fill="url(#fg-gold)" stroke="#5a3d0a" stroke-width=".7"/>` + fGem(x, y, 2.5, '#e0115f', '#5a3d0a'); })()
      + [-121, -59].map((a) => { const [x, y] = f5xy(53.5, a); return fGem(x, y, 1.6, '#2f6bff', '#5a3d0a'); }).join('')
      + F5_PEAKS.map(([a, h]) => { const r = h > 8 ? 1.9 : 1.5, [x, y] = f5xy(49 + h + r - 0.2, a); return pearl(x, y, r); }).join('')
      + fAt(180, fBezel(43, 2.4, '#e0115f')) + fAt(140, fBezel(43, 1.5, '#2f6bff')) + fAt(-140, fBezel(43, 1.5, '#2f6bff'));
  },

  // молния: грозовые тучи по кругу, стальное кольцо, по нему ползёт ток (сами молнии — в слое движения)
  lightning: () => { const rnd = fRand(197);
    return '<circle cx="60" cy="60" r="60" fill="url(#fg-storm)" mask="url(#fm-out)"/>'
      + '<g filter="url(#ff-cloud)">' + Array.from({ length: 26 }, (_, i) => { const a = i * (360 / 26) + rnd() * 6, [x, y] = f5xy(53 + rnd() * 2.5, a), s = 5 + rnd() * 3, [hx, hy] = f5xy(55 + rnd() * 2, a + 4);
        return `<circle cx="${x}" cy="${y}" r="${s.toFixed(1)}" fill="#1a2754" opacity=".9"/><circle cx="${hx}" cy="${hy}" r="${(s * 0.5).toFixed(1)}" fill="#3a5290" opacity=".55"/>`; }).join('') + '</g>'
      + fBevel('steel', 44, 4.4) + fRing(41.6, 1, '#7cf7ff', 'class="fa-glow" style="--g:#5fe3ff"')
      + `<g class="fa-glow" style="--g:#5fe3ff">${[0, 1, 2].map((i) => `<path class="fa-arc" style="animation-delay:${(-i * 0.12).toFixed(2)}s" d="${fZig(0, 360, 48.7, 2.3, 201 + i, 48)}" fill="none" stroke="#bff6ff" stroke-width=".8" stroke-linejoin="round"/>`).join('')}</g>`;
  },

  // сияние: ночное небо вокруг и два занавеса света — зелёный и розовый — с волнистым верхом
  aurora: () => { const rnd = fRand(221);
    return '<circle cx="60" cy="60" r="60" fill="url(#fg-nightsky)" mask="url(#fm-out)"/>'
      + Array.from({ length: 22 }, () => { const [x, y] = f5xy(45 + rnd() * 14, rnd() * 360); return `<circle cx="${x}" cy="${y}" r="${(0.3 + rnd() * 0.45).toFixed(2)}" fill="#fff" opacity="${(0.5 + rnd() * 0.5).toFixed(2)}"/>`; }).join('')
      + `<g class="fa-spin slow"><g clip-path="url(#fc-wavA)" class="fa-shim"><circle cx="60" cy="60" r="51" fill="none" stroke="url(#fg-curtA)" stroke-width="17" opacity=".45"/><g class="fa-spin rev"><circle cx="60" cy="60" r="51" fill="none" stroke="url(#fg-curtA)" stroke-width="17" stroke-dasharray=".8 1.3"/></g></g></g>`
      + `<g class="fa-spin rev"><g clip-path="url(#fc-wavB)" class="fa-shim" style="animation-delay:-2s"><circle cx="60" cy="60" r="54" fill="none" stroke="url(#fg-curtB)" stroke-width="10" opacity=".5"/><g class="fa-spin"><circle cx="60" cy="60" r="54" fill="none" stroke="url(#fg-curtB)" stroke-width="10" stroke-dasharray=".7 1.6"/></g></g></g>`
      + fRing(43, 1.6, '#7dffcf', 'class="fa-glow" style="--g:#3ee6b0"') + fRing(41.4, 0.8, '#0a1635', 'opacity=".8"');
  },

  // луна: ночное кольцо со звёздами, большой месяц с кратерами слева, созвездие справа
  moon: () => { const rnd = fRand(229);
    const cons = [[-62, 55], [-38, 52.5], [-14, 56], [12, 53], [36, 56.5], [58, 52.5]].map(([a, r]) => f5xy(r, a));
    return fRing(45.5, 9, 'url(#fg-night)') + fRing(50, 0.9, '#c9d2ff', 'opacity=".8"') + fRing(41.2, 0.8, '#c9d2ff', 'opacity=".6"')
      + Array.from({ length: 20 }, () => { const [x, y] = f5xy(42.5 + rnd() * 6, rnd() * 360); return `<circle cx="${x}" cy="${y}" r="${(0.3 + rnd() * 0.4).toFixed(2)}" fill="#fff" opacity="${(0.5 + rnd() * 0.5).toFixed(2)}"/>`; }).join('')
      + `<path d="M${cons.map(([x, y]) => `${x} ${y}`).join('L')}" fill="none" stroke="#c9d2ff" stroke-width=".5" opacity=".7"/>`
      + cons.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 2 ? 1 : 1.4}" fill="#fff"/>`).join('')
      + '<path class="fa-glow" style="--g:#ffe9a8" d="M60 2A58 58 0 0 0 60 118A74 74 0 0 1 60 2Z" fill="url(#fg-moonball)" stroke="#b8923a" stroke-width=".8" mask="url(#fm-out)"/>'
      + [[10, 60, 3], [16, 38, 2], [17, 84, 2.5], [8, 46, 1.2], [9, 74, 1.4], [28, 18, 1.4], [27, 102, 1.6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#c9a650" opacity=".45" mask="url(#fm-out)"/><path d="M${x - r * 0.7} ${y - r * 0.5}A${r} ${r} 0 0 1 ${x + r * 0.7} ${y - r * 0.5}" fill="none" stroke="#fffbe6" stroke-width=".5" opacity=".7" mask="url(#fm-out)"/>`).join('')
      + '<path d="M54 5A55 55 0 0 0 54 115" fill="none" stroke="#fffbe6" stroke-width="1" opacity=".6" mask="url(#fm-out)"/>';
  },

  // свиток: развёрнутый лист между двумя скалками, на нём строки текста, внизу восковая печать с лентами
  paper: () => { const rnd = fRand(233);
    const sheet = 'M16 13C38 9 82 17 104 13V107C82 111 38 103 16 107Z';
    const line = (y) => { let x = 22, d = ''; while (x < 96) { const n = 2 + Math.floor(rnd() * 4); d += `M${x} ${y}q1 -1.4 2 0${'t2 0'.repeat(n - 1)}`; x += n * 2 + 2.5; } return d; };
    const seal = Array.from({ length: 14 }, (_, i) => { const a = (i * 360) / 14, r = 6.6 + (rnd() - 0.5) * 1.6, t = (a * Math.PI) / 180; return `${(60 + r * Math.cos(t)).toFixed(1)},${(108 + r * Math.sin(t)).toFixed(1)}`; }).join(' ');
    return `<path d="${sheet}" fill="url(#fg-sheet)" stroke="#b98d4f" stroke-width=".9" mask="url(#fm-out)"/>`
      + `<g mask="url(#fm-out)"><path d="${sheet}" fill="none" stroke="#d9b97a" stroke-width="3" opacity=".45"/><path d="M21 13V107M99 13V107" stroke="#6b4a2a" stroke-width="3" opacity=".12"/>`
      + Array.from({ length: 13 }, (_, i) => `<path class="fa-ink" style="animation-delay:${(-(7 - i * 0.35)).toFixed(2)}s" d="${line(21 + i * 6.5)}" fill="none" stroke="#5b3a1e" stroke-opacity=".6" stroke-width=".6" stroke-linecap="round"/>`).join('') + '</g>'
      + [5, 100].map((x) => `<rect x="${x}" y="7" width="15" height="106" rx="7" fill="url(#fg-roll)" stroke="#7a5530" stroke-width=".8"/>`
        + `<path d="M${x + 1.5} 14H${x + 13.5}M${x + 1.5} 106H${x + 13.5}" stroke="#7a5530" stroke-width=".6" opacity=".6"/><path d="M${x + 6} 12V108" stroke="#fff" stroke-width="1.2" opacity=".45"/>`
        + [1.5, 111.5].map((y) => `<rect x="${x + 3.5}" y="${y}" width="8" height="7" rx="3" fill="url(#fg-knob)" stroke="#2e1a0a" stroke-width=".7"/><circle cx="${x + 7.5}" cy="${y + 3.5}" r="1.2" fill="#c89a5c" opacity=".8"/>`).join('')).join('')
      + '<path d="M56.5 112L50 122.5 54 121.5 56 125 60.5 113Z" fill="#b01c1c" stroke="#5a0505" stroke-width=".6" stroke-linejoin="round"/><path d="M63.5 112L70 122.5 66 121.5 64 125 59.5 113Z" fill="#c42424" stroke="#5a0505" stroke-width=".6" stroke-linejoin="round"/>'
      + `<polygon points="${seal}" fill="url(#fg-wax)" stroke="#5a0505" stroke-width=".7" stroke-linejoin="round"/><circle cx="60" cy="108" r="4.4" fill="none" stroke="#ff9a8a" stroke-width=".6" opacity=".5"/>`
      + fStar5(60, 108.2, 3, 0, '#8f1010', '#4a0303');
  },

  // чёрная дыра (TON 618): тень + фотонное кольцо, наклонный диск (левый край ярче), линзовые дуги сверху и снизу, джеты
  blackhole: () => '<circle cx="60" cy="60" r="60" fill="url(#fg-qglow)" mask="url(#fm-out)"/><circle cx="60" cy="60" r="47" fill="none" stroke="#120806" stroke-width="7" opacity=".7"/>'
    + '<g transform="rotate(-14 60 60)">'
    + [0, 180].map((r) => `<g transform="rotate(${r} 60 60)" mask="url(#fm-out)"><path d="M56 44 53 -16H67L64 44Z" fill="url(#fg-jet)" opacity=".35"/><path class="fa-glow" style="--g:#7fe0ff" d="M58.8 44 58 -16H62L61.2 44Z" fill="url(#fg-jet)"/></g>`).join('')
    + '<path d="M9 60A51 49 0 0 1 111 60" fill="none" stroke="url(#fg-dopp)" stroke-width="6" opacity=".55" mask="url(#fm-out)"/><path d="M11 60A49 47 0 0 1 109 60" fill="none" stroke="url(#fg-dopp)" stroke-width="2.6" mask="url(#fm-out)"/><path d="M12 60A48 46 0 0 1 108 60" fill="none" stroke="#fff" stroke-width=".8" opacity=".7" mask="url(#fm-out)"/>'
    + '<path d="M15 61A45 41 0 0 0 105 61" fill="none" stroke="url(#fg-dopp)" stroke-width="2" opacity=".75" mask="url(#fm-out)"/>'
    + '<g mask="url(#fm-out)"><ellipse cx="60" cy="60" rx="59" ry="15" fill="none" stroke="url(#fg-dopp)" stroke-width="14" opacity=".3"/><ellipse cx="60" cy="60" rx="58" ry="14" fill="none" stroke="url(#fg-dopp)" stroke-width="7" opacity=".85"/><ellipse cx="60" cy="60" rx="56" ry="13" fill="none" stroke="#fff" stroke-width="1.4" opacity=".8"/><ellipse cx="60" cy="60" rx="52" ry="11.5" fill="none" stroke="#ffe7b0" stroke-width=".8" opacity=".6"/></g>'
    + '</g>' + fRing(41.9, 2.6, '#ffd9a0', 'class="fa-glow" style="--g:#ff9a3d"') + fRing(41.2, 0.9, '#fff'),

  // взрыв: лучи вспышки, клубы дыма и огня сливаются в одно облако (размытие) и кипят, белое ядро у аватарки
  explosion: () => { const rnd = fRand(241);
    const spikes = Array.from({ length: 36 }, (_, i) => fP(i % 2 ? 46 : 57 + rnd() * 7, i * 10 + rnd() * 4)).join(' ');
    const balls = (n, r, s0, s1, fill, op = 1) => Array.from({ length: n }, (_, i) => { const [x, y] = f5xy(r + rnd() * 3, i * (360 / n) + rnd() * 8); return `<circle class="fa-boil" style="animation-delay:${(-rnd() * 2).toFixed(2)}s;animation-duration:${(1.3 + rnd() * 0.9).toFixed(2)}s" cx="${x}" cy="${y}" r="${(s0 + rnd() * (s1 - s0)).toFixed(1)}" fill="${fill}" opacity="${op}"/>`; }).join('');
    return `<g class="fa-spin slow"><polygon points="${spikes}" fill="url(#fg-burst)" mask="url(#fm-out)" class="fa-shim"/></g>`
      + `<g mask="url(#fm-out)"><g filter="url(#ff-cloud)">${balls(20, 53.5, 6, 9, '#3a3338', 0.9)}</g><g filter="url(#ff-soft)">${balls(26, 48.5, 6.5, 9.5, 'url(#fg-ball)')}${balls(22, 44.5, 3.5, 5.5, '#ffe9a0')}</g>`
      + `${balls(12, 50, 1.6, 2.6, '#fff6c8', 0.9)}</g>`
      + fRing(41.8, 2.4, '#fff6c8', 'class="fa-glow" style="--g:#ff8a1f"') + fRing(40.9, 0.8, '#7a1406');
  },
});

Object.assign(FRAME_FX, {
  // корона: блеск пробегает по обручу и зубцам, камни вспыхивают
  crown: () => `<g clip-path="url(#fc-crown)">${fSweep(53, 20, 'fast', '#fff', 0.55)}</g>`
    + [-140, -90, -40, -115, -65].map((a, i) => { const [x, y] = f5xy(a === -90 ? 55 : 47.5, a); return fSpark(x - 1, y - 1, 0.32, '#fff', (i * 0.45).toFixed(2)); }).join('')
    + fTwinkles(6, 251, 50, 60, '#fff8d6', 0.45).replace(/translate\(([\d.]+) ([\d.]+)\)/g, (m, x, y) => `translate(${x} ${Math.min(+y, 34)})`),

  // молния: шесть целых молний по очереди бьют из туч в кольцо, с ответвлениями и вспышкой в месте удара
  lightning: () => [-80, 10, 100, 190, -35, 145].map((a, i) => {
    const rnd = fRand(211 + i), dir = i % 2 ? 1 : -1, span = 70 + rnd() * 30, N = 12;
    const pts = Array.from({ length: N + 1 }, (_, k) => [k === N ? 46.3 : 57 - (8 * k) / N + (k && k < N ? (k % 2 ? 1 : -1) * (1 + rnd() * 1.8) : 0), a + dir * span * (k / N) + (k && k < N ? (rnd() - 0.5) * 3 : 0)]);
    const path = (p) => 'M' + p.map(([r, g]) => fP(r, g)).join('L');
    const br = (k, out) => { const [r, g] = pts[k]; return path([pts[k], [r + out * 3, g + dir * 4], [r + out * 4.5, g + dir * 9], [r + out * 7, g + dir * 12]]); };
    const st = `animation-delay:${(-i * 0.6).toFixed(1)}s`, [ix, iy] = f5xy(46.3, pts[N][1]), [cx, cy] = f5xy(57, a);
    const bolt = (d, c, w) => `<path pathLength="100" class="fa-strike" style="${st}" d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
    return `<g class="fa-glow" style="--g:#5fe3ff">${bolt(path(pts), '#5fe3ff', 3)}${bolt(path(pts), '#fff', 1)}${bolt(br(4, 1), '#9ff0ff', 0.9)}${bolt(br(8, -1), '#9ff0ff', 0.9)}</g>`
      + `<circle class="fa-zap" style="${st}" cx="${ix}" cy="${iy}" r="3.4" fill="#e6fbff" filter="url(#ff-soft)"/><circle class="fa-zap" style="${st}" cx="${cx}" cy="${cy}" r="7" fill="#9fe8ff" opacity=".5" filter="url(#ff-cloud)"/>`;
  }).join('') + fFly(8, 257, 47, '#bff6ff', 0.7, 1.1),

  // сияние: мерцающие звёзды
  aurora: () => fTwinkles(12, 261, 48, 59, '#e6fffa', 0.42),

  // луна: свечение месяца дышит, звёзды мерцают, падающая звезда, облачко проплывает по низу месяца
  moon: () => '<path class="fa-breath" d="M60 2A58 58 0 0 0 60 118" fill="none" stroke="#ffe9a8" stroke-width="2.4" opacity=".6"/>'
    + [[-62, 55], [-14, 56], [36, 56.5]].map(([a, r], i) => { const [x, y] = f5xy(r, a); return fSpark(x, y, 0.32, '#fff', (i * 0.6).toFixed(1)); }).join('')
    + fTwinkles(6, 263, 42, 49, '#fff', 0.35)
    + '<g class="fa-shoot" style="animation-duration:6s"><path d="M84 6L98 11" stroke="url(#fg-shoot)" stroke-width="1" stroke-linecap="round"/><circle cx="98" cy="11" r=".9" fill="#fff"/></g>',

  // свиток: строки проступают чернилами (в рисунке), печать блестит, пылинки
  paper: () => fSpark(57.5, 105.5, 0.3, '#fff', 0.4) + fTwinkles(4, 267, 46, 56, '#fff6c8', 0.4),

  // чёрная дыра: диск вращается, по джетам летят сгустки, вещество по спирали падает в дыру
  blackhole: () => '<g transform="rotate(-14 60 60)"><g mask="url(#fm-out)">'
    + '<ellipse class="fa-flow" cx="60" cy="60" rx="58" ry="14" fill="none" stroke="#fff" stroke-width="1.4" stroke-dasharray="2 9" stroke-linecap="round" opacity=".85"/>'
    + '<ellipse class="fa-flow" style="animation-duration:.7s" cx="60" cy="60" rx="53" ry="12" fill="none" stroke="#ffe2a8" stroke-width="1" stroke-dasharray="1 6" stroke-linecap="round"/>'
    + '<path class="fa-flow" style="animation-duration:.8s" d="M60 44V-12M60 76V132" stroke="#fff" stroke-width="1.2" stroke-dasharray="1.5 7" stroke-linecap="round"/>'
    + [0, 1, 2, 3, 4].map((i) => `<circle r="${(1 - i * 0.1).toFixed(1)}" fill="#fff4d6"><animateMotion dur="${(3.4 + i * 0.5).toFixed(1)}s" begin="${(-i * 0.8).toFixed(1)}s" repeatCount="indefinite" path="${f5spiral(58, 41, 1.6, 0.24, i * 1.3)}"/><animate attributeName="opacity" values="0;1;1;0" dur="${(3.4 + i * 0.5).toFixed(1)}s" begin="${(-i * 0.8).toFixed(1)}s" repeatCount="indefinite"/></circle>`).join('')
    + '</g></g><circle class="fa-breath" cx="60" cy="60" r="42.6" fill="none" stroke="#fff" stroke-width=".8"/>',

  // взрыв: две ударные волны, обломки и искры летят наружу, сверху поднимается дым
  explosion: () => { const rnd = fRand(271);
    return '<circle class="fa-shock" cx="60" cy="60" r="50" fill="none" stroke="#fff1a8" stroke-width="1.4"/><circle class="fa-shock" style="animation-delay:-1.2s" cx="60" cy="60" r="50" fill="none" stroke="#ffb020" stroke-width=".9"/>'
      + Array.from({ length: 10 }, () => fAt(rnd() * 360, `<path class="fa-fly" style="animation-delay:${(-rnd() * 1.6).toFixed(2)}s;animation-duration:${(1.2 + rnd() * 0.7).toFixed(2)}s" d="M58.6 ${(7 + rnd() * 3).toFixed(1)}l1.6 -2.6 1.4 2.2Z" fill="#3a2a22"/>`)).join('')
      + fFly(18, 273, 50, '#ffd36b', 1.1, 1.3)
      + [[30, 0], [60, 1.1], [90, 2.2]].map(([x, d]) => `<circle class="fa-smoke" style="animation-delay:${-d}s" cx="${x}" cy="12" r="4" fill="#4a4550"/>`).join(''); },
});
