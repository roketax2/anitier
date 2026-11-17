'use strict';
/* Рисованные рамки аватарки (2026-11-17). У каждой своя форма: поле 120×120, аватарка — круг
   радиуса 40 в центре, рисунок может выходить за её края (до радиуса ~58). Рамка кладётся
   поверх аватарки (achievements.js: framed). Простые цветные кольца остались на CSS (fr-*). */

const fP = (r, deg) => { const a = (deg * Math.PI) / 180; return `${(60 + r * Math.cos(a)).toFixed(1)} ${(60 + r * Math.sin(a)).toFixed(1)}`; };
const fArc = (r, a0, a1) => `M${fP(r, a0)}A${r} ${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${fP(r, a1)}`;
const fRing = (r, w, stroke, extra = '') => `<circle cx="60" cy="60" r="${r}" fill="none" stroke="${stroke}" stroke-width="${w}" ${extra}/>`;
const fRep = (n, fn, off = 0) => Array.from({ length: n }, (_, k) => `<g transform="rotate(${(off + (k * 360) / n).toFixed(1)} 60 60)">${fn(k)}</g>`).join('');
// объёмное кольцо: градиент металла, тёмные кромки, блик слева сверху
const fBevel = (g, r = 44, w = 7) => fRing(r, w, `url(#fg-${g})`) + fRing(r + w / 2 - 0.5, 1, '#000', 'opacity=".4"') + fRing(r - w / 2 + 0.5, 1, '#000', 'opacity=".3"')
  + `<path d="${fArc(r, 195, 290)}" fill="none" stroke="#fff" stroke-width="${(w * 0.28).toFixed(1)}" stroke-linecap="round" opacity=".7"/>`;
const fSpark = (x, y, s, fill = '#fff', delay = 0) => `<g transform="translate(${x} ${y}) scale(${s})"><path class="fa-tw" style="animation-delay:${delay}s" d="M0-8Q1.2-1.2 8 0 1.2 1.2 0 8-1.2 1.2-8 0-1.2-1.2 0-8Z" fill="${fill}"/></g>`;
const fHeart = (x, y, s, rot, delay = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path class="fa-beat" style="animation-delay:${delay}s" d="M0 4C-7-1-4-7.5 0-3.5 4-7.5 7-1 0 4Z" fill="url(#fg-pink)" stroke="#b3123f" stroke-width=".5"/></g>`;
const fFlower = (x, y, s) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="0" cy="${-s * 0.55}" rx="${s * 0.34}" ry="${s * 0.52}" fill="#ffd3e2" stroke="#ff8fb3" stroke-width=".5" transform="rotate(${r})"/>`).join('')}<circle r="${s * 0.2}" fill="#ff5c8a"/></g>`;
const fDot = (x, y, r, fill, cls = '', delay = 0) => `<circle class="${cls}" style="animation-delay:${delay}s" cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;

const FRAME_ART = {
  // росток: тонкое кольцо, два листа снизу и побег сверху
  sprout: () => fRing(43, 3.5, 'url(#fg-green)')
    + '<path d="M60 105C47 105 37 99 33 88 46 86 56 93 60 105Z" fill="#3fcf85" stroke="#1d8a52" stroke-width=".8"/><path d="M60 105C73 105 83 99 87 88 74 86 64 93 60 105Z" fill="#8fe6a8" stroke="#1d8a52" stroke-width=".8"/>'
    + '<path d="M60 18V7" stroke="#2fbf71" stroke-width="2.4" stroke-linecap="round"/><path d="M60 11C60 5 55 2 50 3 50 8 54 11 60 11Z" fill="#3fcf85"/><path d="M60 8C60 3 64 0 69 1 69 6 65 8 60 8Z" fill="#b6f09a"/>',
  // бронза: объёмное кольцо с заклёпками
  bronze: () => fBevel('bronze', 44, 8) + fRep(8, () => '<circle cx="60" cy="16" r="2.3" fill="#f7d7b0" stroke="#5a3a1a" stroke-width=".8"/>', 22.5),
  // золото: объёмное кольцо и лавровый венок
  gold: () => fBevel('gold', 44, 6)
    + [104, 121, 138, 155, 172, 189, 206].map((a, i) => `<ellipse cx="60" cy="7.5" rx="${3.4 - i * 0.15}" ry="${7.6 - i * 0.3}" transform="rotate(${a + 90} 60 60) rotate(38 60 7.5)" fill="url(#fg-gold)" stroke="#7a5310" stroke-width=".6"/><ellipse cx="60" cy="7.5" rx="${3.4 - i * 0.15}" ry="${7.6 - i * 0.3}" transform="rotate(${270 - a} 60 60) rotate(-38 60 7.5)" fill="url(#fg-gold)" stroke="#7a5310" stroke-width=".6"/>`).join('')
    + '<circle cx="60" cy="107" r="4.2" fill="#ff4d78" stroke="#7a5310" stroke-width="1"/><circle cx="58.8" cy="105.8" r="1.2" fill="#fff" opacity=".8"/>',
  // неон: светящийся шестиугольник, медленно вращается
  neon: () => `<g class="fa-spin"><polygon points="${[0, 60, 120, 180, 240, 300].map((a) => fP(53, a)).join(' ')}" fill="none" stroke="#ff4df0" stroke-width="3" stroke-linejoin="round" class="fa-glow" style="--g:#ff4df0"/></g>`
    + `<g class="fa-spin rev"><polygon points="${[30, 90, 150, 210, 270, 330].map((a) => fP(50, a)).join(' ')}" fill="none" stroke="#3ef0ff" stroke-width="1.8" stroke-linejoin="round" stroke-dasharray="14 6" class="fa-glow" style="--g:#3ef0ff"/></g>`,
  // корона: золотое кольцо и корона сверху
  crown: () => fBevel('gold', 44, 6)
    + '<path d="M38 23 33 3 47 13 60 0 73 13 87 3 82 23Z" fill="url(#fg-gold)" stroke="#7a5310" stroke-width="1.2" stroke-linejoin="round"/><path d="M38 23H82" stroke="#7a5310" stroke-width="1.2"/>'
    + '<circle cx="60" cy="15" r="3.4" fill="#ff4d78" stroke="#7a5310" stroke-width=".8"/><circle cx="47" cy="18" r="2.2" fill="#4dd2ff" stroke="#7a5310" stroke-width=".7"/><circle cx="73" cy="18" r="2.2" fill="#4dd2ff" stroke="#7a5310" stroke-width=".7"/>'
    + fDot(33, 3, 2.2, '#fff6c8') + fDot(60, 0.5, 2.4, '#fff6c8') + fDot(87, 3, 2.2, '#fff6c8') + fSpark(98, 22, 0.7, '#fff', 0.4) + fSpark(20, 26, 0.55, '#fff', 1.1),
  // изумруд: огранка восьмиугольником
  emerald: () => ['#0f9d6b', '#0b7a54', '#0a6b4a', '#0f9d6b', '#35d49a', '#c4ffe6', '#7ff0c0', '#35d49a'].map((c, k) => `<polygon points="${fP(55, k * 45 - 22.5)} ${fP(55, k * 45 + 22.5)} ${fP(44.5, k * 45 + 22.5)} ${fP(44.5, k * 45 - 22.5)}" fill="${c}" stroke="#064a34" stroke-width=".7" stroke-linejoin="round"/>`).join('')
    + `<polygon points="${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => fP(44.5, k * 45 + 22.5)).join(' ')}" fill="none" stroke="#d6ffe9" stroke-width=".9" opacity=".8"/>` + fSpark(26, 24, 0.7, '#fff', 0.3),
  // пламя: языки огня вокруг, выше сверху
  fire: () => fRing(43, 3.5, 'url(#fg-fire)') + fRep(14, (k) => {
    const a = (k * 360) / 14, s = 0.55 + 0.75 * Math.cos(((a > 180 ? a - 360 : a) * Math.PI) / 360) ** 2;
    return `<g transform="translate(60 19) scale(${s.toFixed(2)}) translate(-60 -19)"><path class="fa-flick" style="animation-delay:${-(k * 0.17).toFixed(2)}s" d="M60 19C52 14 55 7 60 0 65 7 68 14 60 19Z" fill="url(#fg-fire)"/><path class="fa-flick" style="animation-delay:${-(k * 0.17 + 0.3).toFixed(2)}s" d="M60 19C56.5 16 58 12 60 8 62 12 63.5 16 60 19Z" fill="#fff3b0"/></g>`;
  }),
  // легенда: радужное кольцо, крылья и звезда
  legend: () => {
    const wing = '<g class="fa-flap"><path d="M24 52C14 46 6 36 3 22 14 26 24 36 28 48Z"/><path d="M22 60C10 58 2 50 0 40 10 42 20 48 25 56Z"/><path d="M22 68C12 70 4 66 1 58 10 58 18 60 24 64Z"/><path d="M24 76C16 80 9 78 6 73 13 71 20 71 26 73Z"/></g>';
    return `<g fill="url(#fg-wing)" stroke="#c9952a" stroke-width=".8" stroke-linejoin="round">${wing}<g transform="translate(120 0) scale(-1 1)">${wing}</g></g>`
      + fBevel('rainbow', 44, 6) + fSpark(60, 8, 1.25, '#fff6c8', 0) + fSpark(60, 8, 0.6, '#ffd75e', 0) + fDot(60, 110, 3.2, '#7fe9ff') + fDot(59, 109, 1, '#fff');
  },
  // звёздная: тонкое кольцо и звёзды вокруг
  star: () => fRing(43, 3, 'url(#fg-gold)') + [[60, 7, 1.2], [104, 34, 0.8], [96, 92, 0.95], [22, 90, 0.75], [15, 36, 1]].map(([x, y, s], k) => fSpark(x, y, s, k % 2 ? '#fff' : '#ffe38a', k * 0.35)).join(''),
  // S-тир: кольцо и лента с буквой S
  stier: () => fBevel('pink', 44, 6)
    + '<path d="M34 92 26 96 31 101 26 106 36 106Z" fill="#b3123f"/><path d="M86 92 94 96 89 101 94 106 84 106Z" fill="#b3123f"/><rect x="34" y="90" width="52" height="16" rx="3" fill="url(#fg-pink)" stroke="#7a0d2c" stroke-width=".9"/>'
    + '<text x="60" y="102.6" text-anchor="middle" font-size="12" font-weight="800" fill="#fff" font-family="Unbounded,Onest,sans-serif">S</text>',
  // лёд: кристаллы-осколки
  ice: () => fRing(43, 4, 'url(#fg-ice)') + fRep(12, (k) => { const h = [2, 9, 5, 11, 3, 8, 6, 10, 4, 9, 2, 7][k], w = k % 2 ? 4 : 5.5; return `<path d="M${60 - w} 20 60 ${h} 60 20Z" fill="#e9fbff"/><path d="M60 20 60 ${h} ${60 + w} 20Z" fill="#6cc4ff"/><path d="M${60 - w} 20 60 ${h} ${60 + w} 20" fill="none" stroke="#2a78c8" stroke-width=".5"/>`; }) + fSpark(100, 20, 0.6, '#fff', 0.5),
  // сердце: кольцо и бьющиеся сердечки
  heart: () => fRing(43, 4.5, 'url(#fg-pink)') + fRing(40.6, 0.8, '#fff', 'opacity=".5"') + fHeart(95, 24, 2.3, 18, 0) + fHeart(108, 47, 1.25, 28, 0.2) + fHeart(81, 9, 1.05, 5, 0.4) + fHeart(21, 97, 1.7, -18, 0.6) + fHeart(10, 78, 0.95, -28, 0.8),
  // страж: стальное кольцо с пластинами и болтами
  shield: () => fBevel('steel', 44, 7) + fRep(4, () => '<path d="M51 11 60 3 69 11 67 22 60 26 53 22Z" fill="url(#fg-steel)" stroke="#232b40" stroke-width="1" stroke-linejoin="round"/><path d="M60 3V26" stroke="#232b40" stroke-width=".7" opacity=".6"/>')
    + fRep(4, () => '<circle cx="60" cy="16" r="2.4" fill="#eef3ff" stroke="#232b40" stroke-width=".8"/>', 45),
  // молния: зубчатое кольцо и разряд
  lightning: () => `<polygon class="fa-flicker fa-glow" style="--g:#6ec8ff" points="${Array.from({ length: 24 }, (_, i) => fP(i % 2 ? 43.5 : 52, i * 15)).join(' ')}" fill="none" stroke="#fff36b" stroke-width="2.4" stroke-linejoin="miter"/>`
    + `<polygon points="${Array.from({ length: 24 }, (_, i) => fP(i % 2 ? 42.5 : 47, i * 15 + 7.5)).join(' ')}" fill="none" stroke="#4dd2ff" stroke-width="1.2" opacity=".85"/>`
    + '<path class="fa-flicker" style="animation-delay:-.8s" d="M101 4 91 19H98L93 31 107 14H100Z" fill="#fff36b" stroke="#c98a00" stroke-width=".7" stroke-linejoin="round"/>',
  // сакура: ветка с цветами и падающие лепестки
  sakura: () => fRing(43, 3, '#ffb7cf') + `<path d="${fArc(49, 100, 205)}" fill="none" stroke="#7a4a3a" stroke-width="2.6" stroke-linecap="round"/>`
    + fFlower(30, 99, 10) + fFlower(12, 66, 8) + fFlower(52, 108, 6.5) + fFlower(15, 40, 5.5)
    + [[88, 14, 0], [102, 30, 0.9], [76, 6, 1.8]].map(([x, y, d]) => `<g transform="translate(${x} ${y})"><ellipse class="fa-fall" style="animation-delay:${d}s" rx="2.2" ry="3.6" fill="#ffc2d6"/></g>`).join(''),
  // сияние: два наклонных овальных кольца, проходят за аватаркой
  aurora: () => `<g class="fa-hue">${[[-28, 3.4, 1], [28, 2.4, 0.85]].map(([rot, w, op]) => `<g transform="rotate(${rot} 60 60)" opacity="${op}"><ellipse cx="60" cy="60" rx="57" ry="24" fill="none" stroke="url(#fg-aurora)" stroke-width="${w}" mask="url(#fm-out)"/><path d="M3 60A57 24 0 0 0 117 60" fill="none" stroke="url(#fg-aurora)" stroke-width="${w}" stroke-linecap="round"/></g>`).join('')}</g>` + fSpark(104, 16, 0.6, '#fff', 0.2) + fSpark(14, 100, 0.5, '#fff', 1),
  // ретро: пиксельные квадраты по кругу
  retro: () => fRing(43, 2, '#f3e6c8') + `<g class="fa-step">${fRep(16, (k) => `<rect x="56.4" y="5.5" width="7.2" height="7.2" rx="1" fill="${['#ffd75e', '#ff6b8f', '#62c2ff', '#5fd99a'][k % 4]}" stroke="#1b1828" stroke-width=".8"/>`)}</g>`,
  // галактика: кольцо как у Сатурна и звёзды
  galaxy: () => fRing(42.5, 2, '#4a35a8') + `<g transform="rotate(-18 60 60)"><ellipse cx="60" cy="60" rx="58" ry="15" fill="none" stroke="url(#fg-violet)" stroke-width="5" mask="url(#fm-out)"/><ellipse cx="60" cy="60" rx="50" ry="11.5" fill="none" stroke="#e6d9ff" stroke-width="1.2" opacity=".7" mask="url(#fm-out)"/><path d="M2 60A58 15 0 0 0 118 60" fill="none" stroke="url(#fg-violet)" stroke-width="5" stroke-linecap="round"/><path d="M10 60A50 11.5 0 0 0 110 60" fill="none" stroke="#e6d9ff" stroke-width="1.2" opacity=".7"/></g>`
    + fSpark(98, 14, 0.7, '#fff', 0) + fSpark(18, 22, 0.5, '#d9d3ff', 0.7) + fSpark(104, 96, 0.45, '#fff', 1.3) + fDot(30, 104, 1.2, '#fff', 'fa-tw', 0.4),
  // цепь: звенья по кругу
  chain: () => `<g class="fa-spin slow">${fRep(18, (k) => (k % 2 ? '<rect x="54.8" y="11.6" width="10.4" height="3.8" rx="1.9" fill="url(#fg-gold)" stroke="#7a5310" stroke-width=".6"/>' : '<ellipse cx="60" cy="13.5" rx="7.4" ry="4.4" fill="none" stroke="url(#fg-gold)" stroke-width="2.6"/><ellipse cx="60" cy="13.5" rx="8.7" ry="5.7" fill="none" stroke="#7a5310" stroke-width=".5"/>'))}</g>`,
  // луна: тёмное кольцо, месяц и звёзды
  moon: () => fRing(43, 3.5, 'url(#fg-night)') + '<path class="fa-glow" style="--g:#ffe9a8" d="M97 6A21 21 0 1 0 114 40 16 16 0 1 1 97 6Z" fill="#ffe9a8" stroke="#c9a24a" stroke-width=".7"/>'
    + fSpark(20, 18, 0.8, '#fff', 0) + fSpark(8, 44, 0.5, '#d9d3ff', 0.6) + fSpark(34, 6, 0.45, '#fff', 1.2) + fSpark(22, 100, 0.55, '#d9d3ff', 0.9),
  // пепел: разбитое каменное кольцо и угольки
  ash: () => [0, 1, 2, 3, 4, 5].map((k) => `<path d="${fArc(44.5, k * 60 + 5, k * 60 + 49)}" fill="none" stroke="#3b3b46" stroke-width="8"/><path d="${fArc(47.2, k * 60 + 7, k * 60 + 47)}" fill="none" stroke="#7a7a88" stroke-width="1.3" opacity=".8"/><path d="M${fP(41, k * 60 + 22)}L${fP(46, k * 60 + 27)}L${fP(48.5, k * 60 + 24)}" fill="none" stroke="#17171d" stroke-width="1"/>`).join('')
    + [[38, 100, 0], [55, 106, 0.7], [72, 103, 1.4], [86, 95, 0.3], [27, 89, 1.1], [97, 82, 1.8]].map(([x, y, d]) => fDot(x, y, 1.7, '#ff9a3a', 'fa-rise', d)).join(''),
  // свиток: пунктирное кольцо и свиток снизу
  paper: () => fRing(44, 1.6, '#f3e6c8', 'stroke-dasharray="2 4.5" stroke-linecap="round"') + '<rect x="31" y="89" width="58" height="17" rx="2" fill="url(#fg-paper)" stroke="#a88a55" stroke-width=".9"/>'
    + '<path d="M40 94.5H80M40 98.5H80M40 102.5H66" stroke="#a88a55" stroke-width="1.1" stroke-linecap="round" opacity=".8"/><circle cx="31" cy="97.5" r="5.6" fill="#e9d6ab" stroke="#a88a55" stroke-width=".9"/><circle cx="89" cy="97.5" r="5.6" fill="#e9d6ab" stroke="#a88a55" stroke-width=".9"/><circle cx="31" cy="97.5" r="2" fill="#a88a55"/><circle cx="89" cy="97.5" r="2" fill="#a88a55"/>',
  // глитч: два скруглённых квадрата расходятся рывками
  glitch: () => '<rect class="fa-ga" x="13" y="13" width="94" height="94" rx="27" fill="none" stroke="#ff2bd1" stroke-width="3"/><rect class="fa-gb" x="13" y="13" width="94" height="94" rx="27" fill="none" stroke="#2bf0ff" stroke-width="3" style="mix-blend-mode:screen"/>'
    + '<rect class="fa-gb" x="4" y="34" width="13" height="3.5" fill="#2bf0ff"/><rect class="fa-ga" x="103" y="70" width="14" height="3.5" fill="#ff2bd1"/><rect class="fa-gb" x="99" y="24" width="9" height="2.5" fill="#fff"/><rect class="fa-ga" x="8" y="86" width="10" height="2.5" fill="#fff"/>',
};

// общие градиенты и маска «вне аватарки» — один раз на страницу
document.body.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${
  Object.entries({
    gold: ['#8a5f14', '#ffd75e 35%', '#fff6c8 50%', '#e0a92e 65%', '#8a5f14'], bronze: ['#5a3a1a', '#c98a52 35%', '#f7d7b0 50%', '#b0753c 65%', '#5a3a1a'],
    steel: ['#3a4763', '#aebcd6 35%', '#eef3ff 50%', '#8494b5 65%', '#3a4763'], green: ['#2fbf71', '#c8f08f'], ice: ['#e9fbff', '#7fd4ff', '#3f8cff'], pink: ['#ff4d78', '#ffa257'],
    rainbow: ['#ffd75e', '#ff4d78', '#8b5cf6', '#4dd2ff', '#5fd99a'], aurora: ['#3ee6b0', '#4dd2ff', '#8b5cf6', '#ff7ab8'], violet: ['#c9a8ff', '#6a3df0', '#ff7ab8'],
    night: ['#1b1f4a', '#6a5acd'], paper: ['#fff6dc', '#e9d6ab'], wing: ['#ffffff', '#ffe9a8', '#ffc94a'],
  }).map(([k, st]) => `<linearGradient id="fg-${k}" x1="0" y1="0" x2="1" y2="1">${st.map((c, i) => { const [col, off] = c.split(' '); return `<stop offset="${off || `${Math.round((i / (st.length - 1)) * 100)}%`}" stop-color="${col}"/>`; }).join('')}</linearGradient>`).join('')
}<linearGradient id="fg-fire" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff3d00"/><stop offset=".55" stop-color="#ff9a1f"/><stop offset="1" stop-color="#ffe38a"/></linearGradient>
<mask id="fm-out" maskUnits="userSpaceOnUse" x="-10" y="-10" width="140" height="140"><rect x="-10" y="-10" width="140" height="140" fill="#fff"/><circle cx="60" cy="60" r="40.5" fill="#000"/></mask></defs></svg>`);

const frameArtCache = {};
function frameArt(id) {
  return (frameArtCache[id] ||= `<svg class="fr-art" viewBox="0 0 120 120" aria-hidden="true">${FRAME_ART[id]()}</svg>`);
}
