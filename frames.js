'use strict';
/* Рисованные рамки аватарки (2026-11-17). У каждой своя форма: поле 120×120, аватарка — круг
   радиуса 40 в центре, рисунок может выходить за её края (до радиуса ~58). Рамка кладётся
   поверх аватарки (achievements.js: framed). Простые цветные кольца остались на CSS (fr-*).
   Приёмы: объёмные кольца (градиент металла + кромки + блик), контур у каждой детали,
   «трубки» неона (цветное свечение + белая сердцевина), общая тень под рисунком (CSS). */

const fXY = (r, deg) => { const a = (deg * Math.PI) / 180; return [60 + r * Math.cos(a), 60 + r * Math.sin(a)]; };
const fP = (r, deg) => fXY(r, deg).map((n) => n.toFixed(1)).join(' ');
const fArc = (r, a0, a1) => `M${fP(r, a0)}A${r} ${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${fP(r, a1)}`;
const fRing = (r, w, stroke, extra = '') => `<circle cx="60" cy="60" r="${r}" fill="none" stroke="${stroke}" stroke-width="${w}" ${extra}/>`;
const fRep = (n, fn, off = 0) => Array.from({ length: n }, (_, k) => `<g transform="rotate(${(off + (k * 360) / n).toFixed(1)} 60 60)">${fn(k)}</g>`).join('');
// объёмное кольцо: градиент металла, тёмные кромки, тонкая светлая фаска и блик слева сверху
const fBevel = (g, r = 44, w = 7) => fRing(r, w, `url(#fg-${g})`) + fRing(r + w / 2 - 0.5, 1, '#000', 'opacity=".45"') + fRing(r - w / 2 + 0.5, 1, '#000', 'opacity=".35"')
  + fRing(r + w / 2 - 1.6, 0.7, '#fff', 'opacity=".35"')
  + `<path d="${fArc(r, 198, 288)}" fill="none" stroke="#fff" stroke-width="${(w * 0.3).toFixed(1)}" stroke-linecap="round" opacity=".75"/><path d="${fArc(r, 20, 70)}" fill="none" stroke="#fff" stroke-width="${(w * 0.16).toFixed(1)}" stroke-linecap="round" opacity=".35"/>`;
const fSpark = (x, y, s, fill = '#fff', delay = 0) => `<g transform="translate(${x} ${y}) scale(${s})"><path class="fa-tw" style="animation-delay:${delay}s" d="M0-8Q1.2-1.2 8 0 1.2 1.2 0 8-1.2 1.2-8 0-1.2-1.2 0-8Z" fill="${fill}"/></g>`;
const fDot = (x, y, r, fill, cls = '', delay = 0) => `<circle class="${cls}" style="animation-delay:${delay}s" cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
// лист/перо остриём вверх от точки (x, y); rot — поворот, len — длина, w — полуширина
const fLeaf = (x, y, rot, len, w, fill, stroke, vein = true) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)})"><path d="M0 0C${-w} ${-len * 0.3} ${-w * 0.7} ${-len * 0.8} 0 ${-len}C${w * 0.7} ${-len * 0.8} ${w} ${-len * 0.3} 0 0Z" fill="${fill}" stroke="${stroke}" stroke-width=".6" stroke-linejoin="round"/>${vein ? `<path d="M0-1V${-len * 0.78}" stroke="${stroke}" stroke-width=".5" opacity=".6"/>` : ''}</g>`;
// огранённый камень с бликом
const fGem = (x, y, r, c, edge = '#3a2a10') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${edge}" stroke-width=".8"/><path d="M${x - r * 0.7} ${y + r * 0.2}A${r * 0.75} ${r * 0.75} 0 0 0 ${x + r * 0.7} ${y + r * 0.2}" fill="none" stroke="#000" stroke-width="${r * 0.3}" opacity=".25"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.28}" fill="#fff" opacity=".9"/>`;
// пятиконечная звезда
const fStar5 = (x, y, R, rot = 0, fill = 'url(#fg-gold)', stroke = '#7a5310') => `<polygon points="${Array.from({ length: 10 }, (_, i) => { const a = ((rot - 90 + i * 36) * Math.PI) / 180, r = i % 2 ? R * 0.42 : R; return `${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`; }).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width=".7" stroke-linejoin="round"/>`;
// неоновая трубка: цветное свечение и белая сердцевина
const fTube = (tag, attrs, color, w = 3, cls = '') => `<${tag} ${attrs} class="fa-glow ${cls}" style="--g:${color}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/><${tag} ${attrs} class="${cls}" fill="none" stroke="#fff" stroke-width="${(w * 0.34).toFixed(1)}" stroke-linejoin="round" stroke-linecap="round" opacity=".92"/>`;
const fHeart = (x, y, s, rot, delay = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><g class="fa-beat" style="animation-delay:${delay}s"><path d="M0 4C-7-1-4-7.5 0-3.5 4-7.5 7-1 0 4Z" fill="url(#fg-heart)" stroke="#8f0f33" stroke-width=".55" stroke-linejoin="round"/><path d="M-3.4-3.6C-2.6-4.6-1.4-4.6-.8-3.8" fill="none" stroke="#fff" stroke-width=".8" stroke-linecap="round" opacity=".85"/></g></g>`;
// цветок сакуры: пять лепестков с выемкой
const fFlower = (x, y, s, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s / 10})">${[0, 72, 144, 216, 288].map((r) => `<path transform="rotate(${r})" d="M0-1C-3.6-3-4-7.4-1.4-9.6L0-8.4 1.4-9.6C4-7.4 3.6-3 0-1Z" fill="url(#fg-petal)" stroke="#e86a98" stroke-width=".5" stroke-linejoin="round"/>`).join('')}<circle r="1.7" fill="#ff5c8a"/>${[0, 72, 144, 216, 288].map((r) => `<circle transform="rotate(${r + 36})" cx="0" cy="-2.9" r=".55" fill="#ffd75e"/>`).join('')}</g>`;
const fFlame = 'M60 21C50 16 53 9 57 5 56.5 9 60 10 60 0 66 7 70 15 60 21Z';
const fFlames = (n, off, scale, fill, speed) => fRep(n, (k) => {
  const a = (((off + (k * 360) / n) % 360) + 360) % 360, s = scale * (0.55 + 0.75 * Math.cos(((a > 180 ? a - 360 : a) * Math.PI) / 360) ** 2);
  return `<g transform="translate(60 21) scale(${s.toFixed(2)}) translate(-60 -21)"><path class="fa-flick" style="animation-delay:${-(k * speed).toFixed(2)}s" d="${fFlame}" fill="${fill}"/></g>`;
}, off);

const FRAME_ART = {
  // росток: лоза с листьями по кругу и побег сверху
  sprout: () => fRing(43.5, 2.6, 'url(#fg-green)') + fRing(44.8, 0.6, '#0f6b3c', 'opacity=".6"')
    + Array.from({ length: 11 }, (_, i) => { const a = -60 + i * 30 + 30, [x, y] = fXY(44, a); return fLeaf(x, y, a + (i % 2 ? 150 : 60), i % 2 ? 9 : 7, 3, i % 2 ? '#3fcf85' : '#a5ec9d', '#147a45'); }).join('')
    + '<path d="M60 18C60 13 59 9 61 5" fill="none" stroke="#1d9a5a" stroke-width="2.2" stroke-linecap="round"/>' + fLeaf(60.4, 11, -58, 10, 3.6, '#3fcf85', '#147a45') + fLeaf(60.8, 8, 52, 9, 3.2, '#b6f09a', '#147a45') + fDot(61.2, 4.2, 1.8, '#ffe38a'),
  // бронза: объёмное кольцо с насечками и заклёпками
  bronze: () => fRing(50.2, 1.4, 'url(#fg-bronze)') + fBevel('bronze', 44, 8)
    + fRep(24, () => '<path d="M60 12.6V19.4" stroke="#3d2610" stroke-width=".8" opacity=".45"/>', 7.5)
    + fRep(4, () => '<circle cx="60" cy="16" r="3.4" fill="url(#fg-bronze)" stroke="#3d2610" stroke-width=".9"/><circle cx="59" cy="15" r="1.1" fill="#fff" opacity=".8"/>'),
  // золото: объёмное кольцо в лавровом венке с бантом
  gold: () => {
    const side = Array.from({ length: 8 }, (_, i) => { const a = 100 + i * 15.5, [x, y] = fXY(46.5, a), k = 1 - i * 0.045; return fLeaf(x, y, a + 132, 10.5 * k, 3.5 * k, 'url(#fg-gold)', '#7a5310') + fLeaf(x, y, a + 212, 7.5 * k, 2.8 * k, '#f0c24a', '#7a5310'); }).join('');
    return fBevel('gold', 44, 6) + side + `<g transform="translate(120 0) scale(-1 1)">${side}</g>`
      + '<path d="M60 105 51 111 53 104ZM60 105 69 111 67 104Z" fill="#c9163f" stroke="#6b0a22" stroke-width=".6" stroke-linejoin="round"/>' + fGem(60, 104.5, 4, '#ff4d78') + fStar5(60, 7.5, 5.2);
  },
  // неон: светящиеся шестиугольные трубки вращаются навстречу
  neon: () => `<g class="fa-spin">${fTube('polygon', `points="${[0, 60, 120, 180, 240, 300].map((a) => fP(54, a)).join(' ')}"`, '#ff3df0', 3.4)}${[0, 60, 120, 180, 240, 300].map((a) => { const [x, y] = fXY(54, a); return fDot(x.toFixed(1), y.toFixed(1), 2.3, '#fff'); }).join('')}</g>`
    + `<g class="fa-spin rev">${fTube('polygon', `points="${[30, 90, 150, 210, 270, 330].map((a) => fP(49.5, a)).join(' ')}" stroke-dasharray="15 7"`, '#2bf0ff', 2.2)}</g>` + fRing(42.2, 1.2, '#ff3df0', 'opacity=".7"'),
  // корона: золотое кольцо и корона с жемчугом и камнями
  crown: () => fBevel('gold', 44, 6)
    + '<path d="M36 24 31 5 46 15 60 1 74 15 89 5 84 24Q60 17 36 24Z" fill="url(#fg-gold)" stroke="#6b4a0c" stroke-width="1.1" stroke-linejoin="round"/>'
    + '<path d="M38.5 20 35 9.5M60 16.5V6M81.5 20 85 9.5" stroke="#fff" stroke-width="1.1" stroke-linecap="round" opacity=".55"/>'
    + '<path d="M36 24Q60 17 84 24L83.2 29.5Q60 22.500 36.800 29.500Z" fill="#e0a92e" stroke="#6b4a0c" stroke-width="1" stroke-linejoin="round"/><path d="M38 25.800Q60 19.200 82 25.800" fill="none" stroke="#fff6c8" stroke-width=".7" opacity=".8"/>'
    + fGem(60, 24, 3, '#ff4d78') + fGem(48, 25.6, 2.1, '#4dd2ff') + fGem(72, 25.6, 2.1, '#4dd2ff')
    + [[31, 5], [46, 15], [60, 1.5], [74, 15], [89, 5]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.7" fill="#fff8e0" stroke="#6b4a0c" stroke-width=".7"/><circle cx="${x - 0.8}" cy="${y - 0.8}" r=".8" fill="#fff"/>`).join('')
    + fSpark(101, 24, 0.7, '#fff', 0.4) + fSpark(18, 28, 0.55, '#fff', 1.1),
  // изумруд: двухъярусная огранка восьмиугольником
  emerald: () => {
    const outer = ['#0f9d6b', '#0b7a54', '#085c40', '#0d8a5e', '#2fcf96', '#d2ffec', '#8ff5cc', '#3ddba0'], inner = ['#35d49a', '#0f9d6b', '#0b7a54', '#18b07a', '#7ff0c0', '#ffffff', '#c4ffe6', '#6be8b6'];
    const row = (cols, r1, r2) => cols.map((c, k) => `<polygon points="${fP(r1, k * 45 - 22.5)} ${fP(r1, k * 45 + 22.5)} ${fP(r2, k * 45 + 22.5)} ${fP(r2, k * 45 - 22.5)}" fill="${c}" stroke="#064a34" stroke-width=".6" stroke-linejoin="round"/>`).join('');
    return row(outer, 56, 49.5) + row(inner, 49.5, 44.5) + `<polygon points="${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => fP(44.5, k * 45 + 22.5)).join(' ')}" fill="none" stroke="#eafff5" stroke-width=".8" opacity=".85"/>`
      + fSpark(24, 22, 0.85, '#fff', 0.3) + fSpark(97, 94, 0.5, '#fff', 1.2);
  },
  // пламя: три слоя языков огня и искры
  fire: () => fFlames(12, 0, 1.2, '#c21807', 0.19) + fFlames(12, 15, 1, 'url(#fg-fire)', 0.15) + fRing(43, 3.6, 'url(#fg-fire)') + fRing(41.4, 0.8, '#fff3b0', 'opacity=".7"') + fFlames(12, 0, 0.55, '#fff3b0', 0.11)
    + [[38, 8, 0], [84, 12, 0.8], [60, -1, 1.5], [22, 26, 0.4]].map(([x, y, d]) => fDot(x, y + 8, 1.4, '#ffd75e', 'fa-rise', d)).join(''),
  // легенда: радужное кольцо, крылья в два ряда перьев и звезда
  legend: () => {
    const long = [[250, 31], [233, 32], [216, 30], [199, 26], [182, 21], [165, 15]].map(([a, l]) => fLeaf(25, 62, a + 90, l, 5.2, 'url(#fg-wing)', '#b88422')).join('');
    const short = [[244, 17], [226, 18], [208, 16], [190, 13]].map(([a, l]) => fLeaf(26, 62, a + 90, l, 4.2, '#ffffff', '#c9a24a')).join('');
    const wing = `<g class="fa-flap">${long}${short}<circle cx="25.5" cy="62" r="3.2" fill="url(#fg-gold)" stroke="#7a5310" stroke-width=".7"/></g>`;
    return wing + `<g transform="translate(120 0) scale(-1 1)">${wing}</g>` + fBevel('rainbow', 44, 6.4)
      + `<g class="fa-glow" style="--g:#ffe38a">${fStar5(60, 9, 8.5)}</g>` + fDot(58.6, 7.6, 1.2, '#fff') + fGem(60, 109, 3.6, '#7fe9ff', '#1d5a78');
  },
  // звёздная: кольцо с орбитой и пять золотых звёзд
  star: () => fRing(43, 3, 'url(#fg-gold)') + fRing(41.2, 0.7, '#fff6c8', 'opacity=".8"') + fRing(51, 0.8, '#ffe38a', 'stroke-dasharray="1.5 5" stroke-linecap="round" opacity=".7"')
    + [[60, 8.5, 7.5, 0], [103, 36, 5.2, 14], [94, 96, 6, -10], [24, 94, 5, 8], [16, 34, 6.4, -14]].map(([x, y, r, rot], k) => `<g class="fa-tw" style="animation-delay:${k * 0.38}s">${fStar5(x, y, r, rot)}<circle cx="${x - r * 0.2}" cy="${y - r * 0.25}" r="${r * 0.16}" fill="#fff"/></g>`).join('')
    + fSpark(84, 12, 0.45, '#fff', 0.9) + fSpark(10, 62, 0.4, '#fff', 0.2) + fSpark(60, 111, 0.45, '#fff', 1.4),
  // S-тир: объёмное кольцо и лента с буквой S
  stier: () => fBevel('pink', 44, 6.4)
    + '<path d="M33 93 23 96 29 101.500 23 107 35 107Z" fill="#a8103a" stroke="#5e0820" stroke-width=".7" stroke-linejoin="round"/><path d="M87 93 97 96 91 101.500 97 107 85 107Z" fill="#a8103a" stroke="#5e0820" stroke-width=".7" stroke-linejoin="round"/>'
    + '<rect x="33" y="89.500" width="54" height="17.500" rx="3.200" fill="url(#fg-pink)" stroke="#5e0820" stroke-width=".9"/><path d="M36 92.300H84" stroke="#fff" stroke-width=".8" opacity=".5"/><path d="M36 104.400H84" stroke="#5e0820" stroke-width=".7" stroke-dasharray="2 2" opacity=".5"/>'
    + '<text x="60" y="103" text-anchor="middle" font-size="12.500" font-weight="800" fill="#fff" stroke="#5e0820" stroke-width=".5" paint-order="stroke" font-family="Unbounded,Onest,sans-serif">S</text>'
    + fStar5(42, 98.3, 3, 0, '#ffe38a', '#7a5310') + fStar5(78, 98.3, 3, 0, '#ffe38a', '#7a5310'),
  // лёд: гранёные кристаллы разной высоты
  ice: () => fRep(12, (k) => {
    const h = [1, 10, 5, 12, 3, 9, 6, 11, 2, 10, 4, 8][k], w = k % 2 ? 4.2 : 6.2;
    return `<path d="M${60 - w} 21 ${60 - w * 0.45} ${h + 5} 60 ${h}V21Z" fill="#f2fdff"/><path d="M60 21V${h}L${60 + w * 0.45} ${h + 5} ${60 + w} 21Z" fill="#5db6ff"/><path d="M${60 - w * 0.45} ${h + 5}L60 ${h + 9}L${60 + w * 0.45} ${h + 5}" fill="none" stroke="#fff" stroke-width=".5" opacity=".8"/><path d="M${60 - w} 21 ${60 - w * 0.45} ${h + 5} 60 ${h} ${60 + w * 0.45} ${h + 5} ${60 + w} 21" fill="none" stroke="#1f66b8" stroke-width=".6" stroke-linejoin="round"/>`;
  }) + fBevel('ice', 43.5, 5) + fSpark(101, 19, 0.7, '#fff', 0.5) + fSpark(20, 98, 0.5, '#fff', 1.3),
  // сердце: объёмное кольцо и бьющиеся сердечки
  heart: () => fBevel('pink', 43.5, 5) + fHeart(96, 23, 2.5, 18, 0) + fHeart(109, 48, 1.35, 28, 0.2) + fHeart(81, 8.5, 1.15, 5, 0.4) + fHeart(21, 98, 1.9, -18, 0.6) + fHeart(9, 78, 1.05, -28, 0.8)
    + fSpark(38, 106, 0.4, '#fff', 0.3) + fSpark(104, 66, 0.4, '#fff', 1),
  // страж: стальное кольцо с гербовыми пластинами и болтами
  shield: () => fBevel('steel', 44, 7.4) + fRep(24, () => '<path d="M60 13.2V18.800" stroke="#1c2336" stroke-width=".7" opacity=".4"/>', 7.5)
    + fRep(4, () => '<path d="M50.500 10.500 60 2 69.500 10.500 67.500 22.500 60 27 52.500 22.500Z" fill="url(#fg-steel)" stroke="#1c2336" stroke-width="1" stroke-linejoin="round"/><path d="M53.300 11.800 60 5.800 66.700 11.800 65.200 21 60 24 54.800 21Z" fill="none" stroke="#fff" stroke-width=".6" opacity=".6"/><path d="M60 5.800V24" stroke="#1c2336" stroke-width=".7" opacity=".55"/><circle cx="60" cy="14.500" r="2" fill="#4dd2ff" stroke="#1c2336" stroke-width=".6"/>')
    + fRep(4, () => '<circle cx="60" cy="16" r="2.800" fill="url(#fg-steel)" stroke="#1c2336" stroke-width=".8"/><path d="M58.300 16H61.700" stroke="#1c2336" stroke-width=".8"/>', 45),
  // молния: зубчатая светящаяся трубка и разряды
  lightning: () => `<g class="fa-flicker">${fTube('polygon', `points="${Array.from({ length: 24 }, (_, i) => fP(i % 2 ? 43.5 : 52.5, i * 15)).join(' ')}" stroke-linejoin="miter"`, '#ffe93b', 2.6)}</g>`
    + `<polygon points="${Array.from({ length: 24 }, (_, i) => fP(i % 2 ? 42.5 : 47.5, i * 15 + 7.5)).join(' ')}" fill="none" stroke="#4dd2ff" stroke-width="1.2" opacity=".9"/>`
    + '<path class="fa-flicker fa-glow" style="animation-delay:-.8s;--g:#ffe93b" d="M102 2 91 18H98.500L92.500 31 108 13H100.500Z" fill="#fff36b" stroke="#b37a00" stroke-width=".7" stroke-linejoin="round"/>'
    + '<path class="fa-flicker fa-glow" style="animation-delay:-1.700s;--g:#4dd2ff" d="M22 88 13.500 100H19L14.500 110 26 96.500H20.500Z" fill="#bff2ff" stroke="#1f66b8" stroke-width=".6" stroke-linejoin="round"/>',
  // сакура: ветка с цветами, бутонами и падающими лепестками
  sakura: () => fRing(43.2, 2.6, 'url(#fg-petal)') + fRing(44.6, 0.6, '#e86a98', 'opacity=".7"')
    + `<path d="${fArc(49.5, 96, 212)}" fill="none" stroke="#6b3f30" stroke-width="2.800" stroke-linecap="round"/><path d="M${fP(49.5, 150)}L${fP(57, 158)}M${fP(49.5, 190)}L${fP(56, 183)}M${fP(49.5, 118)}L${fP(56.500, 112)}" stroke="#6b3f30" stroke-width="1.600" stroke-linecap="round"/>`
    + fFlower(29, 100, 11, 10) + fFlower(10, 68, 9, 40) + fFlower(53, 109, 7.5, -20) + fFlower(14, 38, 6.5, 0)
    + fDot(...fXY(57, 158).map((n) => n.toFixed(1)), 2.2, '#ff8fb3') + fDot(...fXY(56.5, 112).map((n) => n.toFixed(1)), 2, '#ff8fb3') + fDot(...fXY(56, 183).map((n) => n.toFixed(1)), 1.8, '#ffc2d6')
    + [[88, 12, 0], [103, 30, 0.9], [76, 5, 1.8], [108, 54, 2.4]].map(([x, y, d]) => `<g transform="translate(${x} ${y})"><path class="fa-fall" style="animation-delay:${d}s" d="M0-3.6C-2.600-1.500-2 2.600 0 3.600 2 2.600 2.600-1.500 0-3.600Z" fill="#ffc2d6" stroke="#e86a98" stroke-width=".4"/></g>`).join(''),
  // сияние: три наклонные ленты-овала, проходят за аватаркой
  aurora: () => `<g class="fa-hue">${[[-30, 4, 1, 57, 23], [26, 2.8, 0.9, 56, 26], [-4, 1.6, 0.7, 58, 17]].map(([rot, w, op, rx, ry]) => `<g transform="rotate(${rot} 60 60)" opacity="${op}"><ellipse cx="60" cy="60" rx="${rx}" ry="${ry}" fill="none" stroke="url(#fg-aurora)" stroke-width="${w}" mask="url(#fm-out)" class="fa-glow" style="--g:#3ee6b0"/><path d="M${60 - rx} 60A${rx} ${ry} 0 0 0 ${60 + rx} 60" fill="none" stroke="url(#fg-aurora)" stroke-width="${w}" stroke-linecap="round"/><path d="M${60 - rx} 60A${rx} ${ry} 0 0 0 ${60 + rx} 60" fill="none" stroke="#fff" stroke-width="${(w * 0.25).toFixed(1)}" stroke-linecap="round" opacity=".6"/></g>`).join('')}</g>`
    + fSpark(105, 15, 0.7, '#fff', 0.2) + fSpark(13, 101, 0.55, '#fff', 1) + fSpark(18, 16, 0.4, '#bff2ff', 1.6),
  // ретро: два ряда пикселей шагают по кругу
  retro: () => fRing(42.6, 1.6, '#f3e6c8') + `<g class="fa-step">${fRep(16, (k) => `<rect x="56.2" y="4.500" width="7.600" height="7.600" rx=".8" fill="${['#ffd75e', '#ff6b8f', '#62c2ff', '#5fd99a'][k % 4]}" stroke="#15121f" stroke-width=".9"/><rect x="57.300" y="5.600" width="2.400" height="2.400" fill="#fff" opacity=".65"/>`)}</g>`
    + `<g class="fa-step rev">${fRep(16, (k) => `<rect x="57.800" y="13.600" width="4.400" height="4.400" fill="${k % 2 ? '#f3e6c8' : '#2c283a'}" stroke="#15121f" stroke-width=".6"/>`, 11.25)}</g>`,
  // галактика: кольца как у Сатурна, спутник и звёзды
  galaxy: () => fRing(42.4, 2, '#4a35a8') + `<g transform="rotate(-18 60 60)">${[[58, 15, 5.5, 'url(#fg-violet)', 1], [50.5, 12, 1.6, '#f0e6ff', 0.75], [45, 9.5, 2.4, '#8b6cff', 0.8]].map(([rx, ry, w, c, op]) => `<ellipse cx="60" cy="60" rx="${rx}" ry="${ry}" fill="none" stroke="${c}" stroke-width="${w}" opacity="${op}" mask="url(#fm-out)"/><path d="M${60 - rx} 60A${rx} ${ry} 0 0 0 ${60 + rx} 60" fill="none" stroke="${c}" stroke-width="${w}" opacity="${op}" stroke-linecap="round"/>`).join('')}<path d="M2 60A58 15 0 0 0 118 60" fill="none" stroke="#fff" stroke-width="1" opacity=".5"/><circle cx="111" cy="52" r="4.200" fill="#ffd9a8" stroke="#6a3df0" stroke-width=".7"/><circle cx="109.800" cy="50.800" r="1.300" fill="#fff" opacity=".8"/></g>`
    + fSpark(98, 13, 0.75, '#fff', 0) + fSpark(17, 21, 0.55, '#d9d3ff', 0.7) + fSpark(105, 97, 0.5, '#fff', 1.3) + fDot(30, 105, 1.2, '#fff', 'fa-tw', 0.4) + fDot(84, 6, 1, '#fff', 'fa-tw', 1),
  // цепь: объёмные звенья по кругу
  chain: () => `<g class="fa-spin slow">${fRep(18, (k) => (k % 2
    ? '<rect x="54.400" y="11.200" width="11.200" height="4.600" rx="2.300" fill="url(#fg-gold)" stroke="#6b4a0c" stroke-width=".7"/><path d="M56.500 12.400H63.500" stroke="#fff" stroke-width=".8" stroke-linecap="round" opacity=".7"/>'
    : '<ellipse cx="60" cy="13.500" rx="7.600" ry="4.700" fill="none" stroke="#6b4a0c" stroke-width="4"/><ellipse cx="60" cy="13.500" rx="7.600" ry="4.700" fill="none" stroke="url(#fg-gold)" stroke-width="2.800"/><path d="M54.500 10.800A7.600 4.700 0 0 1 63 9.200" fill="none" stroke="#fff" stroke-width=".8" stroke-linecap="round" opacity=".8"/>'))}</g>`,
  // луна: ночное кольцо, месяц с кратерами и созвездие
  moon: () => fBevel('night', 43.5, 4.6) + '<g class="fa-glow" style="--g:#ffe9a8"><path d="M97 4A22 22 0 1 0 115 40 17 17 0 1 1 97 4Z" fill="url(#fg-moon)" stroke="#b8923a" stroke-width=".8" stroke-linejoin="round"/></g>'
    + '<circle cx="87" cy="22" r="2.400" fill="#e6c877" opacity=".8"/><circle cx="92.500" cy="33" r="1.600" fill="#e6c877" opacity=".8"/><circle cx="84.500" cy="31.500" r="1" fill="#e6c877" opacity=".8"/>'
    + '<path d="M20 18 9 43 23 99" fill="none" stroke="#d9d3ff" stroke-width=".6" stroke-dasharray="1.500 2.500" opacity=".7"/>'
    + fSpark(20, 18, 0.85, '#fff', 0) + fSpark(9, 43, 0.55, '#d9d3ff', 0.6) + fSpark(34, 6, 0.45, '#fff', 1.2) + fSpark(23, 99, 0.6, '#d9d3ff', 0.9) + fSpark(104, 64, 0.4, '#fff', 1.5),
  // пепел: разбитое каменное кольцо с тлеющими трещинами и угольками
  ash: () => [0, 1, 2, 3, 4, 5].map((k) => `<path d="${fArc(44.5, k * 60 + 4, k * 60 + 50)}" fill="none" stroke="#1c1c22" stroke-width="9.600"/><path d="${fArc(44.5, k * 60 + 5, k * 60 + 49)}" fill="none" stroke="url(#fg-stone)" stroke-width="8"/><path d="${fArc(47.4, k * 60 + 7, k * 60 + 47)}" fill="none" stroke="#9a9aa8" stroke-width="1.100" opacity=".7"/>`
      + `<path class="fa-ember" style="animation-delay:${-(k * 0.5)}s" d="M${fP(41, k * 60 + 20)}L${fP(44.5, k * 60 + 26)}L${fP(43, k * 60 + 31)}L${fP(48.5, k * 60 + 35)}" fill="none" stroke="#ff7a1f" stroke-width="1.200" stroke-linecap="round" stroke-linejoin="round"/>`).join('')
    + [[38, 100, 0], [55, 107, 0.7], [72, 104, 1.4], [86, 96, 0.3], [27, 89, 1.1], [97, 82, 1.8]].map(([x, y, d]) => fDot(x, y, 1.8, '#ffb03a', 'fa-rise', d)).join(''),
  // свиток: пунктирное кольцо, свиток с завитками и сургучная печать
  paper: () => fRing(44, 1.6, '#f3e6c8', 'stroke-dasharray="2 4.500" stroke-linecap="round"') + fRing(47.4, 0.6, '#c9b384', 'opacity=".6"')
    + '<rect x="29" y="88.500" width="62" height="18" rx="1.500" fill="url(#fg-paper)" stroke="#8f7443" stroke-width=".9"/><path d="M38 93.500H82M38 97.500H82M38 101.500H55M66 101.500H78" stroke="#8f7443" stroke-width="1" stroke-linecap="round" opacity=".65"/>'
    + [29, 91].map((x) => `<rect x="${x - 4}" y="86.500" width="8" height="22" rx="4" fill="#e4cf9f" stroke="#8f7443" stroke-width=".9"/><path d="M${x - 1.5} 88.500V106.500" stroke="#fff" stroke-width="1" opacity=".5"/><circle cx="${x}" cy="86.500" r="2" fill="#8f7443"/><circle cx="${x}" cy="108.500" r="2" fill="#8f7443"/>`).join('')
    + '<circle cx="60" cy="106.500" r="5.200" fill="#c9163f" stroke="#6b0a22" stroke-width=".8"/>' + fStar5(60, 106.5, 3, 0, '#ff8fa8', '#6b0a22'),
  // глитч: скруглённые квадраты расходятся рывками, цветные полосы и помехи
  glitch: () => '<rect class="fa-ga" x="12.500" y="12.500" width="95" height="95" rx="28" fill="none" stroke="#ff2bd1" stroke-width="3.400"/><rect class="fa-gb" x="12.500" y="12.500" width="95" height="95" rx="28" fill="none" stroke="#2bf0ff" stroke-width="3.400" style="mix-blend-mode:screen"/><rect x="12.500" y="12.500" width="95" height="95" rx="28" fill="none" stroke="#fff" stroke-width="1" opacity=".85"/>'
    + '<rect class="fa-gb" x="2" y="33" width="16" height="4" fill="#2bf0ff"/><rect class="fa-ga" x="101" y="69" width="17" height="4" fill="#ff2bd1"/><rect class="fa-gb" x="98" y="23" width="11" height="2.600" fill="#fff"/><rect class="fa-ga" x="6" y="86" width="12" height="2.600" fill="#fff"/><rect class="fa-ga" x="44" y="3" width="20" height="2.400" fill="#fff36b"/><rect class="fa-gb" x="58" y="114" width="24" height="2.400" fill="#5fd99a"/>'
    + '<path d="M19 50H27M19 54H24M93 78H101M96 82H101" stroke="#fff" stroke-width="1" opacity=".6"/>',
};

// общие градиенты и маска «вне аватарки» — один раз на страницу
document.body.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${
  Object.entries({
    gold: ['#7a5310', '#ffd75e 32%', '#fff8d6 50%', '#e0a92e 68%', '#7a5310'], bronze: ['#4a2f14', '#c98a52 32%', '#fbe0bd 50%', '#b0753c 68%', '#4a2f14'],
    steel: ['#2c3852', '#aebcd6 32%', '#f4f7ff 50%', '#8494b5 68%', '#2c3852'], green: ['#1d9a5a', '#8fe6a8', '#c8f08f'], ice: ['#f2fdff', '#8fdcff 45%', '#3f8cff'], pink: ['#ff2e63', '#ff7a8f 45%', '#ffb057'],
    rainbow: ['#ffd75e', '#ff4d78', '#8b5cf6', '#4dd2ff', '#5fd99a'], aurora: ['#3ee6b0', '#4dd2ff', '#8b5cf6', '#ff7ab8'], violet: ['#d9c2ff', '#6a3df0 55%', '#ff7ab8'],
    night: ['#141838', '#6a5acd 50%', '#1b1f4a'], paper: ['#fff8e3', '#ecdcb4'], wing: ['#ffffff', '#fff3cf 55%', '#ffc94a'], heart: ['#ff6b8f', '#ff2e63 55%', '#c9163f'],
    petal: ['#fff0f5', '#ffc2d6 60%', '#ff9dbd'], moon: ['#fff8dc', '#ffe9a8 55%', '#e6c877'], stone: ['#55555f', '#2f2f38 55%', '#44444e'],
  }).map(([k, st]) => `<linearGradient id="fg-${k}" x1="0" y1="0" x2="1" y2="1">${st.map((c, i) => { const [col, off] = c.split(' '); return `<stop offset="${off || `${Math.round((i / (st.length - 1)) * 100)}%`}" stop-color="${col}"/>`; }).join('')}</linearGradient>`).join('')
}<linearGradient id="fg-fire" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff3d00"/><stop offset=".55" stop-color="#ff9a1f"/><stop offset="1" stop-color="#ffe38a"/></linearGradient>
<mask id="fm-out" maskUnits="userSpaceOnUse" x="-10" y="-10" width="140" height="140"><rect x="-10" y="-10" width="140" height="140" fill="#fff"/><circle cx="60" cy="60" r="40.5" fill="#000"/></mask></defs></svg>`);

const frameArtCache = {};
function frameArt(id) {
  // последним слоем — тонкая тень у края аватарки, чтобы рамка «сидела» на ней
  return (frameArtCache[id] ||= `<svg class="fr-art" viewBox="0 0 120 120" aria-hidden="true">${FRAME_ART[id]()}${id === 'glitch' ? '' : fRing(40.4, 1.4, '#000', 'opacity=".4"')}</svg>`);
}
