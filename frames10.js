'use strict';
/* Аниме-рамки, правки 4 (2026-11-18): за стеной — Колоссальный титан (без кожи, мышцы, оскал, пар, руки
   хватаются за стену); Аля — серебряная прядь с красной лентой вместо банта; Киберпанк — дождь, летающие машины,
   неоновые вывески, сбой картинки; Поднятие уровня — заново: врата, окно системы, теневые солдаты встают. */
document.body.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<radialGradient id="fg-muscle" cx=".5" cy=".42" r=".62"><stop offset="0" stop-color="#f08070"/><stop offset=".55" stop-color="#c8402e"/><stop offset="1" stop-color="#6a140e"/></radialGradient>
<linearGradient id="fg-hair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f6fb"/><stop offset=".5" stop-color="#c4cbdc"/><stop offset="1" stop-color="#8a94ae"/></linearGradient>
<radialGradient id="fg-gate" gradientUnits="userSpaceOnUse" cx="60" cy="60" r="60"><stop offset=".66" stop-color="#0a1440" stop-opacity=".95"/><stop offset=".8" stop-color="#1a2a8a" stop-opacity=".75"/><stop offset=".92" stop-color="#3a1a8a" stop-opacity=".4"/><stop offset="1" stop-color="#3a1a8a" stop-opacity="0"/></radialGradient>
<mask id="fm-outbig" maskUnits="userSpaceOnUse" x="-80" y="-80" width="280" height="280"><rect x="-80" y="-80" width="280" height="280" fill="#fff"/><circle cx="60" cy="60" r="40.5" fill="#000"/></mask>
</defs></svg>`);

/* ---------- Атака титанов: Колоссальный титан выглядывает из-за стены ---------- */
{ const prev = FRAME_ART.an_aot;
  const striae = (n, x0, y0, x1, y1, bend, c, w = 0.35) => Array.from({ length: n }, (_, i) => { const t = i / (n - 1) - 0.5; return `<path d="M${(x0 + t * 7).toFixed(1)} ${y0}Q${(x0 + t * 7 + bend).toFixed(1)} ${((y0 + y1) / 2).toFixed(1)} ${(x1 + t * 5).toFixed(1)} ${y1}" fill="none" stroke="${c}" stroke-width="${w}" opacity=".7"/>`; }).join('');
  // вытянутый череп, широкая челюсть, впалые щёки, тяжёлые надбровья над глубокими глазницами
  const head = '<path d="M60 -7C68.4 -7 72.6 -1.4 72.4 6C72.2 11 71 14.6 70.4 18.6C69.6 23.4 65.4 25 60 25C54.6 25 50.4 23.4 49.6 18.6C49 14.6 47.8 11 47.6 6C47.4 -1.4 51.6 -7 60 -7Z" fill="url(#fg-muscle)" stroke="#4a0a06" stroke-width=".8"/>'
    + striae(9, 60, -6, 60, 3, 0, '#7a1a12') + striae(6, 53, -3, 49.6, 9, -3, '#ff9a8a', 0.3) + striae(6, 67, -3, 70.4, 9, 3, '#ff9a8a', 0.3)
    + '<path d="M49.6 11.6Q52.2 15.4 50.8 20.4M70.4 11.6Q67.8 15.4 69.2 20.4" fill="none" stroke="#5a0e08" stroke-width="1.6" opacity=".55"/>'
    + '<ellipse cx="54.6" cy="8.4" rx="3.6" ry="2.9" fill="#1e0504"/><ellipse cx="65.4" cy="8.4" rx="3.6" ry="2.9" fill="#1e0504"/>'
    + '<path d="M50.2 6.4Q54.6 3.4 58.6 6.2M61.4 6.2Q65.4 3.4 69.8 6.4" fill="none" stroke="#e86a5a" stroke-width="1.5" stroke-linecap="round"/><path d="M50.2 6.4Q54.6 3.4 58.6 6.2M61.4 6.2Q65.4 3.4 69.8 6.4" fill="none" stroke="#4a0a06" stroke-width=".4"/>'
    + '<circle class="fa-glow" style="--g:#fff3d0" cx="55" cy="8.9" r=".85" fill="#f6ead0"/><circle cx="65" cy="8.9" r=".85" fill="#f6ead0"/>'
    + '<path d="M59.4 10.4L58.8 13.4M60.6 10.4L61.2 13.4" stroke="#3a0604" stroke-width=".8" stroke-linecap="round"/>'
    + striae(5, 50.5, 11, 52.5, 20, -2, '#7a1a12') + striae(5, 69.5, 11, 67.5, 20, 2, '#7a1a12')
    + '<path d="M50.2 15.2Q60 17.6 69.8 15.2V18.4Q60 21.4 50.2 18.4Z" fill="#f2e8d8" stroke="#4a0a06" stroke-width=".55"/><path d="M50.2 16.9Q60 19.4 69.8 16.9" fill="none" stroke="#6a3020" stroke-width=".45"/>'
    + Array.from({ length: 11 }, (_, i) => { const x = 51.4 + i * 1.72; return `<path d="M${x.toFixed(1)} 15.6V${(19.4 - Math.abs(i - 5) * 0.12).toFixed(1)}" stroke="#7a5040" stroke-width=".3"/>`; }).join('')
    + '<path d="M50 18.8Q60 23.6 70 18.8" fill="none" stroke="#4a0a06" stroke-width=".7"/>';
  const steam = [[50, -6, 0], [70, -4, 0.8], [60, -9, 1.6]].map(([x, y, d]) => `<circle class="fa-smoke" style="animation-delay:${-d}s" cx="${x}" cy="${y}" r="3.4" fill="#f4efe8"/>`).join('');
  const titan = fAt(-45, `<g mask="url(#fm-outbig)"><g class="fa-titan2"><g transform="translate(60 23) scale(1.3) translate(-60 -23)">${head}${steam}</g></g></g>`);
  FRAME_ART.an_aot = () => { const s = prev(); return titan + s.slice(s.indexOf('<circle cx="60" cy="60" r="46.5"')); };
  // руки: пальцы ложатся поверх зубцов стены, пока титан выглядывает
  const hand = '<g class="fa-titanhand"><g transform="translate(60 4) scale(1.35) translate(-60 -4)"><path d="M54.6 -1.2Q60 -3.6 65.4 -1.2L65.6 3.6Q60 5 54.4 3.6Z" fill="url(#fg-muscle)" stroke="#4a0a06" stroke-width=".6"/>'
    + [55.8, 58.6, 61.4, 64.2].map((x, i) => { const L = 10 - Math.abs(i - 1.5) * 1.2; return `<path d="M${x} 2.2Q${x + 0.3} ${(2.2 + L * 0.55).toFixed(1)} ${x} ${(2.2 + L).toFixed(1)}" fill="none" stroke="#4a0a06" stroke-width="2.3" stroke-linecap="round"/><path d="M${x} 2.2Q${x + 0.3} ${(2.2 + L * 0.55).toFixed(1)} ${x} ${(2.2 + L).toFixed(1)}" fill="none" stroke="#d24a38" stroke-width="1.5" stroke-linecap="round"/><path d="M${x - 0.6} ${(2.2 + L * 0.5).toFixed(1)}H${x + 0.6}" stroke="#7a1a12" stroke-width=".35"/>`; }).join('') + '</g></g>';
  const fx = FRAME_FX.an_aot;
  FRAME_FX.an_aot = () => fx() + fAt(-71, hand) + fAt(-19, hand);
}

/* ---------- Аля: серебряная прядь, перевязанная красной лентой (вместо банта) ---------- */
{ const prev = FRAME_ART.an_alya, cut = `<g transform="translate(${X6(53.5, -132).join(' ')}) rotate(-42)`;
  const rnd = fRand(1021);
  const strands = [[-112, -118, 0], [-120, -132, 1], [-104, -100, 2], [-126, -150, 3], [-96, -84, 4], [-68, 118, 5], [-60, 132, 6], [-76, 100, 7], [-52, 146, 8], [-84, 84, 9]].map(([a0, sw, k]) => {
    const r1 = 59 + rnd() * 3.5, w = 4.4 + rnd() * 1.8;
    return `<path d="${f6tent(a0, sw, 53.8, r1, w, 0.3, 26)}" fill="url(#fg-hair)" stroke="#6e7894" stroke-width=".4" stroke-linejoin="round"/><path d="${f6mid(a0 + sw * 0.04, sw * 0.86, 54.2, r1 - 0.6, 22)}" fill="none" stroke="#fff" stroke-width=".4" opacity=".85"/>`; }).join('');
  const hair = `<g class="fa-sway" style="animation-duration:7s">${strands}</g>`;
  const ribbon = `<g transform="translate(${X6(55.5, -128).join(' ')}) rotate(-38) scale(1.15)">` + '<path d="M-5.6-1.2H5.6V1.6H-5.6Z" fill="#c8102e" stroke="#5a0610" stroke-width=".4"/>'
    + '<path d="M0 0C-2.4-4.2-7.4-4.6-7.6-1.4-7.8 1.4-3.6 1.6 0 0ZM0 0C2.4-4.2 7.4-4.6 7.6-1.4 7.8 1.4 3.6 1.6 0 0Z" fill="url(#fg-ribbon)" stroke="#5a0610" stroke-width=".5"/>'
    + '<g class="fa-swing"><path d="M-.8.6L-3.6 10.4-1.8 9.4-.6 11.8ZM.8.6L4.2 9.8 2.4 9.2 1.4 11.4Z" fill="url(#fg-ribbon)" stroke="#5a0610" stroke-width=".4"/></g>'
    + '<rect x="-1.6" y="-1.7" width="3.2" height="3.4" rx="1" fill="#e0203a" stroke="#5a0610" stroke-width=".4"/><path d="M-5.4-3.2C-4-3.6-2.6-3-1.6-1.6" fill="none" stroke="#ffb0b0" stroke-width=".4" opacity=".8"/></g>';
  FRAME_ART.an_alya = () => { const s = prev(), i = s.lastIndexOf(cut); return hair + (i >= 0 ? s.slice(0, i) : s) + ribbon; };
}

/* ---------- Киберпанк: вывески, кромка неона, дождь, летающие машины, сбой картинки ---------- */
{ const prev = FRAME_ART.an_edgerunners;
  const sign = (x, y, c, glyphs) => `<g class="fa-flicker" style="animation-duration:${(2.6 + x / 40).toFixed(1)}s"><rect x="${x}" y="${y}" width="4.6" height="${glyphs * 4 + 1.4}" rx=".6" fill="#0a0612" stroke="${c}" stroke-width=".7" class="fa-glow" style="--g:${c}"/>${Array.from({ length: glyphs }, (_, i) => `<path d="M${x + 1.2} ${y + 1.6 + i * 4}H${x + 3.4}M${x + 2.3} ${y + 1.6 + i * 4}V${y + 4 + i * 4}M${x + 1.2} ${y + 3.2 + i * 4}L${x + 3.4} ${y + 4.2 + i * 4}" stroke="${c}" stroke-width=".5"/>`).join('')}</g>`;
  FRAME_ART.an_edgerunners = () => prev()
    + fRing(51.8, 0.7, '#ff2a8a', 'class="fa-glow" style="--g:#ff2a8a" opacity=".85"')
    + sign(4, 76, '#ff2a8a', 4) + sign(111, 72, '#2affea', 4) + sign(20, 92, '#f7e23a', 2) + sign(96, 90, '#ff2a8a', 3)
    + '<path d="M0 104L24 99M96 99L120 104" stroke="#ff2a8a" stroke-width=".5" opacity=".7"/>';
  FRAME_FX.an_edgerunners = () => { const rnd = fRand(1001);
    return `<g mask="url(#fm-out)">${['#2affea', '#ff2a8a', '#f7e23a'].map((c, i) => `<circle class="fa-sande" style="animation-delay:${(i * 0.09).toFixed(2)}s" cx="60" cy="60" r="47.4" fill="none" stroke="${c}" stroke-width="5" pathLength="36" stroke-dasharray="1 1" opacity="0"/>`).join('')}</g>`
      + `<g mask="url(#fm-out)" opacity=".55">${Array.from({ length: 16 }, () => `<path class="fa-rain" style="animation-delay:${(-rnd() * 1.2).toFixed(2)}s;animation-duration:${(0.7 + rnd() * 0.5).toFixed(2)}s" d="M${(rnd() * 124).toFixed(1)} ${(-10 + rnd() * 60).toFixed(1)}l-2 7" stroke="#8fe8ff" stroke-width=".4"/>`).join('')}</g>`
      + '<g class="fa-car"><path d="M70 30H90" stroke="url(#fg-shoot)" stroke-width="1.2"/><rect x="89" y="28.6" width="5" height="2.4" rx="1" fill="#2a2a36"/><circle cx="94" cy="29.8" r=".9" fill="#f7e23a"/></g>'
      + '<g class="fa-car" style="animation-delay:-3.4s;animation-duration:6.4s"><path d="M70 42H86" stroke="url(#fg-shoot)" stroke-width=".9"/><rect x="85" y="41" width="4" height="2" rx=".9" fill="#2a2a36"/><circle cx="89" cy="42" r=".7" fill="#ff2a8a"/></g>'
      + `<circle class="fa-flow" style="animation-duration:.9s" cx="60" cy="60" r="42" fill="none" stroke="#fff" stroke-width=".7" stroke-dasharray="2 10"/>`
      + fFly(6, 993, 50, '#2affea', 0.7, 2.6) + fFly(4, 995, 50, '#ff2a8a', 0.7, 2.2); };
}

/* ---------- Поднятие уровня: заново ---------- */
FRAME_ART.an_sololvl = () => { const rnd = fRand(1011), fl = 'M57 18C53 14 56 10 57 5C58.5 8 60 9 59.5 3C63 7 65 11 62 14C64.5 13 65.5 11 65 9C67.5 13 66 17 63 18Z';
  const dagger = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0-10L1.4-1.6H-1.4Z" fill="url(#fg-steel)" stroke="#1d2129" stroke-width=".4"/><path d="M0-9V-2" stroke="#fff" stroke-width=".3"/><rect x="-3" y="-1.8" width="6" height="1.2" rx=".4" fill="#2a2a36" stroke="#8fd0ff" stroke-width=".3"/><rect x="-.7" y="-.6" width="1.4" height="4" fill="#3a1670"/><circle cy="3.8" r=".8" fill="#8a4ae0"/></g>`;
  return '<circle cx="60" cy="60" r="60" fill="url(#fg-gate)" mask="url(#fm-out)"/>'
    + `<g class="fa-spin rev slow" mask="url(#fm-out)">${Array.from({ length: 6 }, (_, k) => `<path d="${f5spiral(60, 42, 0.45, 1, k * 1.047)}" fill="none" stroke="${k % 2 ? '#6fb8ff' : '#a070ff'}" stroke-width="${k % 2 ? 0.9 : 0.6}" opacity=".55"/>`).join('')}</g>`
    + [128, 146, 164, 196, 214, 232].map((d, k) => fAt(d, `<g transform="translate(60 18) scale(${(0.9 + rnd() * 0.6).toFixed(2)}) translate(-60 -18)"><path class="fa-flick" style="animation-delay:${(-rnd()).toFixed(2)}s" d="${fl}" fill="url(#fg-shfl)" opacity="${k % 2 ? 0.8 : 1}"/></g>`)).join('')
    + `<g class="fa-glow" style="--g:#3aa0ff"><path d="M14 6H106L114 14V106L106 114H14L6 106V14Z" fill="none" stroke="#3aa0ff" stroke-width=".9"/><path d="M16 9H104L111 16V104L104 111H16L9 104V16Z" fill="none" stroke="#3aa0ff" stroke-width=".4" opacity=".7"/>${[0, 90, 180, 270].map((d) => fAt(d, '<path d="M6 26V14L14 6H26" fill="none" stroke="#e6f6ff" stroke-width="2.2" stroke-linejoin="round"/><path d="M9 30V17L17 9" fill="none" stroke="#8fd0ff" stroke-width=".5"/>')).join('')}${fRing(42, 1.4, '#3aa0ff')}</g>`
    + `<g class="fa-spin slow">${fRing(44.8, 0.6, '#8fd0ff', 'stroke-dasharray="4 1.5 1 1.5"')}</g>` + fTicks(36, 46, 47.6, '#8fd0ff', 0.5, 0, 0.7)
    + [[6, 50], [114, 50], [6, 70], [114, 70]].map(([x, y]) => `<rect x="${x - 1}" y="${y - 3}" width="2" height="6" fill="#3aa0ff" opacity=".8"/>`).join('')
    + '<rect x="31" y="5.8" width="58" height="9" rx="1.2" fill="#0b2a52" fill-opacity=".92" stroke="#3aa0ff" stroke-width=".7"/><path d="M33 7.8V12.8M87 7.8V12.8" stroke="#8fd0ff" stroke-width=".8"/>'
    + '<rect x="30" y="106.5" width="60" height="3.6" rx="1" fill="#0b2a52" stroke="#3aa0ff" stroke-width=".6"/><rect class="fa-fill" x="31" y="107.4" width="58" height="1.8" rx=".6" fill="#7fd4ff"/>'
    + dagger(17, 22, -40) + dagger(103, 22, 40);
};
// тени-солдаты поднимаются из тьмы по очереди, глаза горят фиолетовым
const F10_SHADOW = '<path d="M-7 9Q-7.4 3-3.6 1.6L-3.4-3.6Q-3.2-7.6 0-8Q3.2-7.6 3.4-3.6L3.6 1.6Q7.4 3 7 9Z" fill="#05020a" stroke="#3a1670" stroke-width=".5"/><path d="M0-8L.9-11.6 1.4-7.6M-3.2-5.4L-5.2-7.6-3.4-3.8M3.2-5.4L5.2-7.6 3.4-3.8" fill="#05020a" stroke="#3a1670" stroke-width=".4"/><path d="M-2.2-3.4H-.6M.6-3.4H2.2" stroke="#d9a8ff" stroke-width=".7" stroke-linecap="round" class="fa-glow" style="--g:#a24dff"/>';
FRAME_FX.an_sololvl = () => [[24, 108, 1.1, 0], [60, 115, 1.35, 1.2], [96, 108, 1.1, 2.4]].map(([x, y, s, d]) => `<g mask="url(#fm-out)"><g transform="translate(${x} ${y}) scale(${s})"><g class="fa-arise" style="animation-delay:${-d}s">${F10_SHADOW}</g></g></g>`).join('')
  + ['ЗАДАНИЕ', 'УРОВЕНЬ ↑', 'ВОССТАНЬ'].map((t, i) => `<text class="fa-cyc3" style="animation-delay:${i * 3}s" x="60" y="12" text-anchor="middle" font-size="4.4" font-weight="700" letter-spacing=".4" font-family="Onest, sans-serif" fill="${i === 2 ? '#d9a8ff' : '#e6f6ff'}">${t}</text>`).join('')
  + '<rect class="fa-scan" x="8" y="8" width="104" height="1.2" fill="#8fd0ff" opacity=".5" mask="url(#fm-out)"/>'
  + [[14, 108, 0], [106, 108, 1.2]].map(([x, y, d]) => `<circle class="fa-smoke" style="animation-delay:${-d}s" cx="${x}" cy="${y}" r="4" fill="#3a1670"/>`).join('') + fTwinkles(5, 1013, 46, 57, '#bfe4ff', 0.35);
