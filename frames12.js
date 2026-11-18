'use strict';
/* Аниме-рамки, правки 5 (2026-11-18): дорисованы те, что ещё не правились — Тетрадь смерти, Человек-бензопила,
   Стальной алхимик, Ковбой Бибоп, Токийский гуль, Торадора!, Эта фарфоровая кукла. */
document.body.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<radialGradient id="fg-planet" cx=".35" cy=".35" r=".75"><stop offset="0" stop-color="#ffd9a0"/><stop offset=".6" stop-color="#e0864a"/><stop offset="1" stop-color="#7a3416"/></radialGradient>
<radialGradient id="fg-stone" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#ff8a8a"/><stop offset=".5" stop-color="#d0102a"/><stop offset="1" stop-color="#4a0008"/></radialGradient>
<linearGradient id="fg-snake" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b8283a"/><stop offset="1" stop-color="#5a0816"/></linearGradient>
</defs></svg>`);

/* ---------- Тетрадь смерти: серебряная готическая филигрань, кардиограмма внизу — бьётся и обрывается в прямую ---------- */
{ const base = FRAME_ART.an_deathnote;
  const ecg = 'M' + Array.from({ length: 121 }, (_, i) => { const k = i % 40; let off = 0; if (i < 80) off = { 10: -1.4, 12: 5.5, 14: -3.2, 16: 1.2 }[k] || 0; return fP(54 - off, 150 - i); }).join('L');
  const fil = '<path d="M60 3.6C55.6 5.6 53.4 9 55.6 12.2C57 14 59.2 12.8 58.4 11.2M60 3.6C64.4 5.6 66.6 9 64.4 12.2C63 14 60.8 12.8 61.6 11.2M60 1V6.4M57.6 3.2H62.4" fill="none" stroke="#d8dbe2" stroke-width=".8" stroke-linecap="round"/><circle cx="60" cy="8.4" r="1" fill="#d8dbe2"/>';
  FRAME_ART.an_deathnote = () => base() + [45, 135, 225, 315].map((d) => fAt(d, fil)).join('')
    + `<path d="${ecg}" fill="none" stroke="#1d4a2a" stroke-width=".5" opacity=".6"/><path class="fa-ecg fa-glow" style="--g:#3aff7a" pathLength="100" d="${ecg}" fill="none" stroke="#3aff7a" stroke-width=".8" stroke-linejoin="round"/>`;
  const fx = FRAME_FX.an_deathnote;
  FRAME_FX.an_deathnote = () => fx() + [[20, 0], [44, 1.6], [80, 0.8], [100, 2.4]].map(([x, d]) => `<path class="fa-fall" style="animation-delay:${-d}s;animation-duration:4s" d="M${x} 6C${x - 2} 8 ${x - 2} 12 ${x} 14C${x + 1.6} 11.6 ${x + 1.6} 8.4 ${x} 6Z" fill="#141217" stroke="#5a5a66" stroke-width=".3"/>`).join('');
}

/* ---------- Человек-бензопила: две пильные шины торчат из кольца, цепь на них бежит, кровь капает ---------- */
{ const base = FRAME_ART.an_csm;
  const bar = '<path d="M55.4 12V-4.5A4.6 4.6 0 0 1 64.6 -4.5V12Z" fill="url(#fg-steel)" stroke="#14171c" stroke-width=".6"/><path d="M57.4 10V-4A2.6 2.6 0 0 1 62.6 -4V10" fill="none" stroke="#59606e" stroke-width=".5"/><circle cx="60" cy="-4.6" r="1" fill="#2a2e36"/>'
    + '<path class="fa-flow" style="animation-duration:.3s" d="M54.8 12V-4.5A5.2 5.2 0 0 1 65.2 -4.5V12" fill="none" stroke="#2a2e36" stroke-width="1.8" stroke-dasharray="1.1 .9"/><path d="M53.6 12H66.4V15H53.6Z" fill="#ff7a1a" stroke="#5a2a08" stroke-width=".6"/>';
  const bigBar = `<g transform="translate(60 14) scale(1.35, 1.6) translate(-60 -14)">${bar}</g>`;
  FRAME_ART.an_csm = () => fAt(-38, bigBar) + fAt(38, bigBar) + base()
    + [[78, 5], [100, 4], [118, 6]].map(([a, L]) => { const [x, y] = X6(51, a); return `<path d="M${x - 1} ${y}Q${x - 1.2} ${y + L} ${x} ${y + L + 1.4}Q${x + 1.2} ${y + L} ${x + 1} ${y}Z" fill="#b5101c"/>`; }).join('');
  const fx = FRAME_FX.an_csm;
  FRAME_FX.an_csm = () => fx() + [-38, 38].map((d) => fAt(d, fFly(6, 1101 + d, 70, '#ffd36b', 0.7, 0.6))).join('');
}

/* ---------- Стальной алхимик: снаружи уроборос — змей кусает свой хвост; внизу философский камень ---------- */
{ const base = FRAME_ART.an_fma;
  const head = (() => { const [x, y] = X6(57, -84); return `<g transform="translate(${x} ${y}) rotate(-174) scale(1.6)"><path d="M0-2.8C3-3 6.2-2 7.4 0 6.2 2 3 3 0 2.8Z" fill="url(#fg-snake)" stroke="#1a0206" stroke-width=".55"/><path d="M5 -.6L7.6 -1.6M5 .6L7.6 1.6" stroke="#1a0206" stroke-width=".5"/><circle cx="2.4" cy="-1.2" r=".6" fill="#ffd25a"/></g>`; })();
  const snake = `<path d="${f6tent(-80, 345, 57, 57, 4, 0.8, 60)}" fill="url(#fg-snake)" stroke="#1a0206" stroke-width=".5" stroke-linejoin="round"/><path d="${f6mid(-79, 340, 57, 57, 60)}" fill="none" stroke="#ff7a8a" stroke-width="2" stroke-dasharray=".5 1.6" opacity=".55"/>` + head;
  FRAME_ART.an_fma = () => base() + snake
    + (() => { const [x, y] = X6(47.2, 90); return `<g class="fa-glow" style="--g:#ff2a3a" transform="translate(${x} ${y}) scale(1.25) translate(${-x} ${-y})"><path d="M${x} ${y - 4.6}L${x + 3.6} ${y - 1.4}L${x + 2.4} ${y + 3.6}H${x - 2.4}L${x - 3.6} ${y - 1.4}Z" fill="url(#fg-stone)" stroke="#2a0004" stroke-width=".6" stroke-linejoin="round"/><path d="M${x} ${y - 4.6}V${y + 3.6}M${x - 3.6} ${y - 1.4}H${x + 3.6}" stroke="#ff9a9a" stroke-width=".35" opacity=".7"/></g>`; })();
}

/* ---------- Ковбой Бибоп: саксофон, планета с кольцом, космос; мимо пролетает кораблик ---------- */
{ const base = FRAME_ART.an_bebop, rnd = fRand(1111);
  const sax = '<g transform="rotate(-8 20 90)"><path d="M12.4 68C12 80 13 92 17.6 100.4C20.6 106 27.6 106.6 30.6 101L28 97.2C26.4 100.2 23.2 100.4 21.6 97.4C18.2 90.6 17.2 80 16.6 68Z" fill="url(#fg-gold)" stroke="#6b4a0c" stroke-width=".6"/><ellipse cx="29.4" cy="99" rx="2.8" ry="1.6" transform="rotate(-40 29.4 99)" fill="#3a2a0a"/>'
    + [74, 79, 84, 89].map((y, i) => `<circle cx="${(15.8 + i * 0.6).toFixed(1)}" cy="${y}" r=".9" fill="#fff4c8" stroke="#6b4a0c" stroke-width=".3"/>`).join('') + '<path d="M12.6 68L11.2 63.4 13.6 62.8 16.4 68Z" fill="#1b1b1e"/></g>';
  const planet = '<g transform="translate(17 17)"><ellipse rx="11" ry="2.6" transform="rotate(-18)" fill="none" stroke="#e8c08a" stroke-width="1" opacity=".55"/><circle r="6.6" fill="url(#fg-planet)"/><path d="M-6 1.6Q0 3 6 .6" fill="none" stroke="#7a3416" stroke-width=".6" opacity=".6"/><path d="M10.4-3.4A11 2.6-18 0 1-1 2.6" fill="none" stroke="#f4d8a8" stroke-width="1" transform="rotate(0)" opacity=".85"/></g>';
  FRAME_ART.an_bebop = () => Array.from({ length: 14 }, () => { const [x, y] = X6(50 + rnd() * 10, rnd() * 360); return `<circle cx="${x}" cy="${y}" r="${(0.25 + rnd() * 0.35).toFixed(2)}" fill="#fff" opacity=".7"/>`; }).join('') + planet + base() + sax;
  const fx = FRAME_FX.an_bebop;
  FRAME_FX.an_bebop = () => fx() + '<g class="fa-car" style="animation-duration:8s"><path d="M64 40H84" stroke="url(#fg-shoot)" stroke-width="1"/><path d="M84 38.4L89.6 40L84 41.6L85 40Z" fill="#c9ced6" stroke="#3a3a44" stroke-width=".3"/><circle cx="84" cy="40" r=".7" fill="#ff9a3a"/></g>' + fTwinkles(5, 1113, 50, 58, '#fff', 0.35);
}

/* ---------- Токийский гуль: сверху открывается глаз гуля (чёрный белок, красная радужка), больше паучьих лилий ---------- */
{ const base = FRAME_ART.an_ghoul;
  const lily = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0V9" stroke="#2f6a2a" stroke-width=".8"/>${[0, 60, 120, 180, 240, 300].map((r) => `<g transform="rotate(${r})"><path d="M0 0C2-1 4-3 4.5-6C5-4 4-1 1 .5Z" fill="#e0142c"/><path d="M0 0Q3-7 6.5-8.5" fill="none" stroke="#ff4a5a" stroke-width=".35"/><circle cx="6.5" cy="-8.5" r=".5" fill="#ffd36b"/></g>`).join('')}</g>`;
  const eye = '<g class="fa-eyeopen"><path d="M49 7Q60 -1 71 7Q60 15 49 7Z" fill="#0a0002" stroke="#3a0006" stroke-width=".6"/><circle cx="60" cy="7" r="3.6" fill="#ff1a2a" class="fa-glow" style="--g:#ff1a2a"/><circle cx="60" cy="7" r="1.5" fill="#0a0002"/><circle cx="58.8" cy="5.8" r=".6" fill="#fff" opacity=".8"/></g>'
    + '<path d="M49 7L44 4.6M49 7L45 9.6M71 7L76 4.4M71 7L75.6 9.8M51.6 4.4L49 1.4M68.4 4.4L71 1.4" stroke="#ff2a3a" stroke-width=".45" opacity=".8"/>';
  FRAME_ART.an_ghoul = () => base() + lily(34, 104, 0.7) + lily(86, 106, 0.75) + lily(60, 113, 0.65) + eye;
  const fx = FRAME_FX.an_ghoul;
  FRAME_FX.an_ghoul = () => fx() + [[30, 0], [52, 1.3], [74, 2.2], [92, 0.7]].map(([x, d]) => `<ellipse class="fa-fall" style="animation-delay:${-d}s" cx="${x}" cy="62" rx="1.1" ry=".5" fill="#e0142c"/>`).join('');
}

/* ---------- Торадора!: слева выглядывает маленький тигрёнок, справа — дракончик ---------- */
{ const base = FRAME_ART.an_toradora;
  const tiger = (() => { const [x, y] = X6(56, 142); return `<g transform="translate(${x} ${y})"><g class="fa-bob" style="animation-duration:2.2s"><path d="M-6.4-4.6L-5.6-9.4-2.2-6.6ZM6.4-4.6L5.6-9.4 2.2-6.6Z" fill="#ff9a2a" stroke="#5a2a00" stroke-width=".6"/><circle r="7" fill="#ff9a2a" stroke="#5a2a00" stroke-width=".7"/>`
    + '<path d="M0-7V-4.4M-2.4-6.6L-1.6-4.4M2.4-6.6L1.6-4.4M-7-1H-4.6M7-1H4.6M-6.6 2.4L-4.4 1.6M6.6 2.4L4.4 1.6" stroke="#1a1208" stroke-width=".8" stroke-linecap="round"/><ellipse cy="3" rx="4" ry="3" fill="#fff4e0"/><circle cx="-2.6" cy="-1.4" r="1.1" fill="#1a1208"/><circle cx="2.6" cy="-1.4" r="1.1" fill="#1a1208"/><circle cx="-2.3" cy="-1.8" r=".35" fill="#fff"/><circle cx="2.9" cy="-1.8" r=".35" fill="#fff"/><path d="M-.8 1.6H.8L0 2.6Z" fill="#ff6a8a"/><path d="M0 2.6Q-1.2 4-2 3.2M0 2.6Q1.2 4 2 3.2" fill="none" stroke="#1a1208" stroke-width=".4"/></g></g>'; })();
  const dragon = (() => { const [x, y] = X6(56, 38); return `<g transform="translate(${x} ${y})"><g class="fa-bob" style="animation-duration:2.6s;animation-delay:-1s"><path d="M-4-5.6L-5.6-10.4-2-6.6ZM4-5.6L5.6-10.4 2-6.6Z" fill="#ffd25a" stroke="#6b4a0c" stroke-width=".5"/><path d="M-6.6-2L-9.4-4.4-7.4-.4ZM6.6-2L9.4-4.4 7.4-.4Z" fill="#38c4b8" stroke="#0a3a38" stroke-width=".5"/><circle r="7" fill="#1f8f8a" stroke="#0a3a38" stroke-width=".7"/>`
    + '<path d="M-4.4-4.2Q0-6 4.4-4.2" fill="none" stroke="#9ff3e6" stroke-width=".5" opacity=".8"/><ellipse cy="3" rx="4.2" ry="2.8" fill="#7fe8d8"/><circle cx="-1.4" cy="2.6" r=".5" fill="#0a3a38"/><circle cx="1.4" cy="2.6" r=".5" fill="#0a3a38"/><circle cx="-2.8" cy="-1.4" r="1.2" fill="#fff"/><circle cx="2.8" cy="-1.4" r="1.2" fill="#fff"/><circle cx="-2.6" cy="-1.2" r=".6" fill="#111"/><circle cx="2.6" cy="-1.2" r=".6" fill="#111"/><path d="M-4 3.6Q-8 4-9 7M4 3.6Q8 4 9 7" fill="none" stroke="#ffd25a" stroke-width=".5" stroke-linecap="round"/></g></g>'; })();
  FRAME_ART.an_toradora = () => base() + tiger + dragon;
}

/* ---------- Эта фарфоровая кукла: внизу пара кукол хина, справа вверху катушка ниток ---------- */
{ const base = FRAME_ART.an_bisque;
  const doll = (x, y, robe, robe2, hat) => `<g transform="translate(${x} ${y})"><path d="M-6 8L-3.2-1.2H3.2L6 8Z" fill="${robe}" stroke="#2a1a2a" stroke-width=".5"/><path d="M-4.6 8L-2.4 0H2.4L4.6 8Z" fill="${robe2}"/><path d="M-1.6-.4L0 4 1.6-.4" fill="none" stroke="#fff" stroke-width=".5"/><circle cy="-3.4" r="2.6" fill="#fff8f0" stroke="#c9b8a8" stroke-width=".4"/><path d="M-2.6-3.6Q-2.6-6.6 0-6.6T2.6-3.6Q1.6-5 0-5T-2.6-3.6Z" fill="#1a1a1a"/>${hat}<circle cx="-.9" cy="-3" r=".3" fill="#1a1a1a"/><circle cx=".9" cy="-3" r=".3" fill="#1a1a1a"/><circle cx="-1.4" cy="-2.2" r=".45" fill="#ff9aa8" opacity=".7"/><circle cx="1.4" cy="-2.2" r=".45" fill="#ff9aa8" opacity=".7"/></g>`;
  const dolls = doll(51, 109, '#1d2a5a', '#d8a83a', '<path d="M-.8-6.4L0-9.6.8-6.4Z" fill="#1a1a1a"/>') + doll(69, 109, '#c8102e', '#ff9ab8', '<path d="M-2-6.2L-1.2-7.8 0-6.6 1.2-7.8 2-6.2Z" fill="url(#fg-gold)"/>');
  const spool = '<g transform="translate(108 22) rotate(18)"><rect x="-4" y="-5.6" width="8" height="1.6" rx=".5" fill="#c89a5c" stroke="#6a4a20" stroke-width=".4"/><rect x="-4" y="4" width="8" height="1.6" rx=".5" fill="#c89a5c" stroke="#6a4a20" stroke-width=".4"/><rect x="-3" y="-4" width="6" height="8" fill="#ff4d8d"/><path d="M-3-2.6H3M-3-1H3M-3 .6H3M-3 2.2H3" stroke="#c8306a" stroke-width=".35"/></g>';
  FRAME_ART.an_bisque = () => base() + spool + dolls;
}
