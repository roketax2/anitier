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

/* ---------- «Ювелирные» рамки (2026-11-17): тонкий металл, гравировка, камни ----------
   Автору рисованные показались мультяшными — эти заменяют одноимённые выше (записи ниже
   перекрывают их). Рисованными оставлены для разнообразия: sakura, heart, fire, retro, moon, glitch.
   Правило: ничего не заходит на аватарку (всё не ближе радиуса 41). */
const fTicks = (n, r1, r2, stroke, w = 0.7, off = 0, op = 0.5) => fRep(n, () => `<path d="M60 ${60 - r2}V${60 - r1}" stroke="${stroke}" stroke-width="${w}" opacity="${op}"/>`, off);
const fDiamond = (x, y, s, fill = '#f4fbff', stroke = '#6b4a0c') => `<path d="M${x} ${y - s}L${x + s * 0.72} ${y}L${x} ${y + s}L${x - s * 0.72} ${y}Z" fill="${fill}" stroke="${stroke}" stroke-width=".5" stroke-linejoin="round"/><path d="M${x - s * 0.72} ${y}H${x + s * 0.72}" stroke="${stroke}" stroke-width=".35" opacity=".55"/>`;
const fPave = (n, r, s, fill, stroke, off = 0) => fRep(n, () => fDiamond(60, 60 - r, s, fill, stroke), off);
const fBezel = (r, s, gem, metal = 'gold', edge = '#6b4a0c') => `<circle cx="60" cy="${60 - r}" r="${s + 1.5}" fill="url(#fg-${metal})" stroke="${edge}" stroke-width=".8"/>` + fGem(60, 60 - r, s, gem, edge);
const fAt = (deg, html) => `<g transform="rotate(${deg} 60 60)">${html}</g>`;
const fScallops = (n, r, h, stroke, w = 1) => fRep(n, () => { const a = 180 / n, [x1, y1] = fXY(r, -90 - a), [x2, y2] = fXY(r, -90 + a); return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}Q60 ${(60 - r - h * 2).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round"/>`; });
// гранёный кристалл остриём наружу: светлая и тёмная грани
const fCrystal = (r, len, w, deg, light, dark, edge) => fAt(deg, `<path d="M60 ${60 - r}L${60 - w} ${60 - r - len * 0.35}L60 ${60 - r - len}Z" fill="${light}"/><path d="M60 ${60 - r}L${60 + w} ${60 - r - len * 0.35}L60 ${60 - r - len}Z" fill="${dark}"/><path d="M60 ${60 - r}L${60 - w} ${60 - r - len * 0.35}L60 ${60 - r - len}L${60 + w} ${60 - r - len * 0.35}Z" fill="none" stroke="${edge}" stroke-width=".5" stroke-linejoin="round"/>`);

Object.assign(FRAME_ART, {
  // росток: тонкое золотое кольцо, три «листа»-хризолита сверху и изумруд снизу
  // росток: тонкое золотое кольцо, вокруг вьётся лоза с маленькими листьями и бутонами
  sprout: () => {
    const leaves = Array.from({ length: 22 }, (_, i) => {
      const a = i * (360 / 22) + 4, r = 48 + 2.2 * Math.sin(((9 * a) * Math.PI) / 180), [x, y] = fXY(r, a);
      const side = i % 2 ? 1 : -1, len = 5.2 + (i % 3) * 0.9;
      return fLeaf(x, y, a + 90 + side * 55, len, 2, i % 3 ? 'url(#fg-green)' : '#b6f09a', '#0f6b3c', false);
    }).join('');
    const buds = [30, 150, 260].map((a) => { const [x, y] = fXY(51.5, a); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.500" fill="#fff0f5" stroke="#e86a98" stroke-width=".5"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r=".6" fill="#ffd75e"/>`; }).join('');
    return fRing(43.6, 1.6, 'url(#fg-gold)') + fRing(41.6, 0.6, '#c9a24a', 'opacity=".8"')
      + `<path d="${fWave(48, 2.2, 9, 0)}" fill="none" stroke="#0f6b3c" stroke-width="1.900"/><path d="${fWave(48, 2.2, 9, 0)}" fill="none" stroke="#3fcf85" stroke-width="1"/>` + leaves + buds;
  },
  // бронза: широкое кольцо с двумя рядами гравировки и заклёпками
  bronze: () => fRing(50.3, 1.2, 'url(#fg-bronze)') + fBevel('bronze', 44, 7.4) + fTicks(48, 41.3, 43.2, '#3d2610', 0.6, 0, 0.55) + fTicks(48, 44.8, 46.7, '#3d2610', 0.6, 3.75, 0.55)
    + fRep(4, () => '<circle cx="60" cy="16" r="2.600" fill="url(#fg-bronze)" stroke="#3d2610" stroke-width=".8"/><circle cx="59.300" cy="15.300" r=".8" fill="#fff" opacity=".8"/>', 45),
  // золото: кольцо с россыпью бриллиантов, кружевной кант и два камня
  gold: () => fScallops(20, 48, 2.4, 'url(#fg-gold)', 1.2) + fRep(20, () => '<circle cx="60" cy="12" r="1.100" fill="url(#fg-gold)" stroke="#7a5310" stroke-width=".4"/>', 9)
    + fBevel('gold', 44, 6) + fPave(20, 44, 1.5, '#fffbe6', '#7a5310', 9) + fBezel(52, 2.6, '#eaf6ff') + fAt(180, fBezel(52, 2.6, '#ff4d78')),
  // корона: кольцо и тиара из пяти тонких арок с бриллиантами
  crown: () => fBevel('gold', 44, 5.6) + fPave(24, 44, 1.2, '#fffbe6', '#7a5310', 7.5)
    + [[0, 10.5, 2.5], [-22, 8, 2], [22, 8, 2], [-42, 5.5, 1.6], [42, 5.5, 1.6]].map(([a, h, s]) => fAt(a, `<path d="M53.500 13.400Q59.200 11.200 60 ${13.4 - h}Q60.800 11.200 66.500 13.400" fill="none" stroke="#6b4a0c" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"/><path d="M53.500 13.400Q59.200 11.200 60 ${13.4 - h}Q60.800 11.200 66.500 13.400" fill="none" stroke="url(#fg-gold)" stroke-width="1.600" stroke-linecap="round" stroke-linejoin="round"/>${fDiamond(60, 13.4 - h - s * 0.6, s, '#eaf6ff', '#6b4a0c')}`)).join('')
    + [-11, 11, -32, 32].map((a) => fAt(a, '<circle cx="60" cy="12.800" r="1.300" fill="#fff8e0" stroke="#6b4a0c" stroke-width=".5"/>')).join('') + fAt(180, fBezel(46, 2.2, '#ff4d78')),
  // легенда: радужное кольцо в восьмиконечной золотой звезде с камнями
  legend: () => `<g class="fa-spin slow"><polygon points="${Array.from({ length: 16 }, (_, i) => fP(i % 2 ? 49 : 57, i * 22.5)).join(' ')}" fill="none" stroke="#6b4a0c" stroke-width="2.400" stroke-linejoin="round"/><polygon points="${Array.from({ length: 16 }, (_, i) => fP(i % 2 ? 49 : 57, i * 22.5)).join(' ')}" fill="none" stroke="url(#fg-gold)" stroke-width="1.400" stroke-linejoin="round"/>${fRep(8, () => fDiamond(60, 6.2, 1.9, '#eaf6ff', '#6b4a0c'))}</g>`
    + fBevel('rainbow', 44, 6.2) + fRep(4, () => fBezel(44, 2.3, '#7fe9ff')) + fRep(4, () => fDiamond(60, 16, 1.7, '#fffbe6', '#6b4a0c'), 45) + fSpark(96, 22, 0.5, '#fff', 0.4) + fSpark(24, 98, 0.45, '#fff', 1.2),
  // звёздная: тонкое двойное кольцо и лучи компаса
  // компас: роза ветров из 16 лучей (двухцветные грани), шкала градусов и красная метка севера
  compass: () => fRep(16, (k) => { const len = k % 4 === 0 ? 10.5 : k % 2 === 0 ? 7 : 4, w = k % 4 === 0 ? 1.9 : 1.3; return `<path d="M60 12.600L${60 - w} 12.600L60 ${12.6 - len}Z" fill="#fff2b8" stroke="#7a5310" stroke-width=".45" stroke-linejoin="round"/><path d="M60 12.600L${60 + w} 12.600L60 ${12.6 - len}Z" fill="#c9952a" stroke="#7a5310" stroke-width=".45" stroke-linejoin="round"/>`; }, 0).replace('fill="#fff2b8"', 'fill="#ff5a6e"').replace('fill="#c9952a"', 'fill="#b3123f"')
    + fRing(44.6, 3.4, 'url(#fg-gold)') + fRing(46.6, 0.6, '#6b4a0c', 'opacity=".7"') + fRing(42.6, 0.6, '#6b4a0c', 'opacity=".7"')
    + fTicks(72, 43.1, 44.5, '#5a3d0a', 0.45, 0, 0.75) + fTicks(8, 42.8, 46.2, '#5a3d0a', 0.8, 0, 0.9)
    + `<text x="60" y="18.300" text-anchor="middle" font-size="3.400" font-weight="800" fill="#b3123f" font-family="Unbounded,Onest,sans-serif">N</text>`
    + fRep(4, () => '<circle cx="60" cy="16.200" r=".9" fill="#fff6c8"/>', 45),
  // звёздная: ночное эмалевое кольцо, по нему созвездие из золотых звёзд разной величины
  star: () => {
    const pts = [[-80, 7], [-48, 4.2], [-20, 5.6], [18, 3.6], [52, 6.4], [96, 4], [140, 5.4], [175, 3.4], [212, 6], [248, 4.4]];
    const xy = pts.map(([a]) => fXY(46, a));
    return fBevel('night', 46, 9) + fRing(51, 1.1, 'url(#fg-gold)') + fRing(41, 1.1, 'url(#fg-gold)')
      + `<path d="M${xy.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}" fill="none" stroke="#ffe38a" stroke-width=".45" stroke-dasharray="1 1.400" opacity=".75"/>`
      + Array.from({ length: 26 }, (_, i) => { const r = fRand(i + 3); const [x, y] = fXY(43 + r() * 6, i * 13.8 + r() * 6); return fDot(x.toFixed(1), y.toFixed(1), (0.25 + r() * 0.35).toFixed(2), '#fff', i % 3 ? '' : 'fa-tw', (i % 5) * 0.3); }).join('')
      + pts.map(([a, R], i) => { const [x, y] = fXY(46, a); return `<g class="${i % 3 === 0 ? 'fa-tw' : ''}" style="animation-delay:${i * 0.3}s">${fStar5(+x.toFixed(1), +y.toFixed(1), R, a + 90)}<circle cx="${(x - R * 0.15).toFixed(1)}" cy="${(y - R * 0.2).toFixed(1)}" r="${(R * 0.14).toFixed(2)}" fill="#fff"/></g>`; }).join('');
  },
  // корона: массивное кольцо, бархатный обод с жемчугом и королевская корона с зубцами-лилиями
  crown: () => {
    const lily = (deg, h) => fAt(deg, `<path d="M57.200 ${14 - h * 0.35}C55 ${13 - h * 0.6} 55.400 ${12 - h} 60 ${12.5 - h * 1.25}C64.600 ${12 - h} 65 ${13 - h * 0.6} 62.800 ${14 - h * 0.35}L61.500 14H58.500Z" fill="url(#fg-gold)" stroke="#5a3d0a" stroke-width=".7" stroke-linejoin="round"/><path d="M60 ${12.5 - h * 1.25}V${13 - h * 0.4}" stroke="#fff8d6" stroke-width=".5" opacity=".8"/><circle cx="60" cy="${12.3 - h * 1.25}" r="1.400" fill="#fff8e6" stroke="#5a3d0a" stroke-width=".5"/>`);
    return fRing(51, 4.2, '#7a0f2b') + fRing(51, 4.2, 'url(#fg-heart)', 'opacity=".55"') + fRing(53.2, 0.7, 'url(#fg-gold)') + fRing(48.8, 0.7, 'url(#fg-gold)')
      + fRep(30, () => '<circle cx="60" cy="9" r=".95" fill="#fff4e0" stroke="#a88a55" stroke-width=".3"/>', 6)
      + fBevel('gold', 44, 6.6) + fRep(16, (k) => fBezel(44, 1.2, k % 2 ? '#3f6cff' : '#ff3d6e'), 11.25)
      + [[0, 9], [-20, 7], [20, 7], [-39, 5.5], [39, 5.5]].map(([a, h]) => lily(a, h)).join('')
      + fAt(180, fBezel(46.5, 2.6, '#ff3d6e'))
      + `<g class="fa-tw">${fSpark(60, -1.5, 0.45, '#fff', 0)}</g>`;
  },
  // пламя: раскалённое кольцо, мягкий жар вокруг и десятки тонких языков огня в три слоя
  fire: () => {
    const tongue = (seed, scale, fill, speed) => { const rnd = fRand(seed); return Array.from({ length: 22 }, (_, i) => {
      const a = i * (360 / 22) + rnd() * 8, up = Math.cos((((a + 90) % 360 > 180 ? (a + 90) % 360 - 360 : (a + 90) % 360) * Math.PI) / 360) ** 2;
      const h = scale * (5 + rnd() * 4 + up * 7), lean = (rnd() * 2 - 1) * 2.4, w = 1.6 + rnd() * 1.4;
      return fAt(a + 90, `<path class="fa-flick" style="animation-delay:${-(rnd() * 0.8).toFixed(2)}s;animation-duration:${(0.55 + rnd() * 0.5).toFixed(2)}s" d="M${60 - w} 13C${60 - w} ${13 - h * 0.45} ${60 + lean - w * 0.4} ${13 - h * 0.7} ${60 + lean} ${13 - h}C${60 + lean + w * 0.2} ${13 - h * 0.6} ${60 + w} ${13 - h * 0.4} ${60 + w} 13Z" fill="${fill}"/>`);
    }).join(''); };
    return fRing(47, 12, '#ff5a00', 'opacity=".12"') + tongue(3, 1.15, '#b3170a', 0) + tongue(5, 0.95, 'url(#fg-fire)', 0) + tongue(9, 0.55, '#ffe9a3', 0)
      + fBevel('fire', 44, 5.6) + fRing(41.6, 0.8, '#fff3b0', 'opacity=".75"')
      + [[30, 0], [80, 0.6], [128, 1.3], [200, 0.3], [250, 1], [320, 1.7]].map(([a, d]) => { const [x, y] = fXY(56, a - 90); return fDot(x.toFixed(1), y.toFixed(1), 1.1, '#ffd75e', 'fa-rise', d); }).join('');
  },
  // сакура: розовое золото с гравировкой и две цветущие ветви (сверху слева и снизу справа)
  sakura: () => {
    const bloom = (x, y, s, rot) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot}) scale(${s / 10})">${[0, 72, 144, 216, 288].map((r) => `<path transform="rotate(${r})" d="M0-1.200C-3.200-2.600-3.900-6.800-1.500-9.200L0-8L1.500-9.200C3.900-6.800 3.200-2.600 0-1.200Z" fill="url(#fg-petal)" stroke="#d9608c" stroke-width=".45" stroke-linejoin="round"/><path transform="rotate(${r})" d="M0-1.500V-5.200" stroke="#ff8fb3" stroke-width=".5" stroke-linecap="round"/>`).join('')}<circle r="1.300" fill="#ffd75e" stroke="#e8a21f" stroke-width=".3"/></g>`;
    const branch = (a0, a1, r) => {
      const twigs = [0.25, 0.55, 0.85].map((t) => { const a = a0 + (a1 - a0) * t; return `<path d="M${fP(r, a)}L${fP(r + 5.5, a + 4)}" stroke="#5a3428" stroke-width=".9" stroke-linecap="round"/>`; }).join('');
      const flowers = [0.08, 0.3, 0.5, 0.72, 0.92].map((t, i) => { const a = a0 + (a1 - a0) * t, [x, y] = fXY(r + (i % 2 ? 4.5 : -0.5), a); return bloom(x, y, i % 2 ? 4.6 : 5.6, a * 2 + i * 17); }).join('');
      const buds = [0.4, 0.82].map((t) => { const [x, y] = fXY(r + 6.5, a0 + (a1 - a0) * t + 4); return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="1.300" ry="1.900" fill="#ff9dbd" stroke="#d9608c" stroke-width=".4" transform="rotate(${a0 + (a1 - a0) * t + 94} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; }).join('');
      return `<path d="${fArc(r, a0, a1)}" fill="none" stroke="#5a3428" stroke-width="1.700" stroke-linecap="round"/>` + twigs + buds + flowers;
    };
    return fBevel('petal', 44, 4.4) + fRing(46.6, 0.6, '#c9708f', 'opacity=".7"') + fTicks(60, 42.6, 43.6, '#c9708f', 0.4, 0, 0.6)
      + branch(195, 265, 49) + branch(15, 85, 49)
      + [[96, 12, 0], [104, 30, 1.1], [20, 96, 2]].map(([x, y, d]) => `<g transform="translate(${x} ${y})"><path class="fa-fall" style="animation-delay:${d}s" d="M0-3C-2.200-1.300-1.700 2.200 0 3 1.700 2.200 2.200-1.300 0-3Z" fill="#ffc2d6" stroke="#d9608c" stroke-width=".35"/></g>`).join('');
  },
  // S-тир: розовое золото, медальон с буквой S и бриллианты
  stier: () => fBevel('pink', 44, 6) + fRing(48.6, 0.8, '#ffb3c4', 'opacity=".9"') + [0, 16, -16].map((a) => fAt(a, fDiamond(60, 16, 1.5, '#fff', '#5e0820'))).join('')
    + fAt(158, fDiamond(60, 13, 2, '#fff', '#5e0820')) + fAt(202, fDiamond(60, 13, 2, '#fff', '#5e0820'))
    + '<circle cx="60" cy="105.500" r="8.200" fill="url(#fg-pink)" stroke="#5e0820" stroke-width="1"/><circle cx="60" cy="105.500" r="6.400" fill="none" stroke="#fff" stroke-width=".6" opacity=".7"/>'
    + '<text x="60" y="109.300" text-anchor="middle" font-size="10" font-weight="800" fill="#fff" stroke="#5e0820" stroke-width=".4" paint-order="stroke" font-family="Unbounded,Onest,sans-serif">S</text>',
  // лёд: кольцо и гранёные кристаллы аквамарина
  ice: () => Array.from({ length: 12 }, (_, k) => fCrystal(45.6, k % 2 ? 6.5 : 11, k % 2 ? 2.2 : 3.1, k * 30, '#f2fdff', '#5db6ff', '#1f66b8')).join('') + fBevel('ice', 43.6, 4.6) + fSpark(98, 20, 0.5, '#fff', 0.5) + fSpark(22, 100, 0.4, '#fff', 1.3),
  // страж: стальное кольцо из восьми сегментов, сапфиры и болты
  shield: () => fRing(50.4, 1.1, 'url(#fg-steel)') + fBevel('steel', 44, 7.4) + fTicks(8, 40.6, 47.4, '#1c2336', 1, 22.5, 0.6) + fTicks(32, 44.8, 46.8, '#1c2336', 0.6, 5.6, 0.4)
    + fRep(4, () => fBezel(44, 2.7, '#3f8cff', 'steel', '#1c2336')) + fRep(4, () => '<circle cx="60" cy="16" r="2.200" fill="url(#fg-steel)" stroke="#1c2336" stroke-width=".7"/><path d="M58.700 16H61.300" stroke="#1c2336" stroke-width=".7"/>', 45),
  // молния: зубчатая светящаяся трубка
  lightning: () => `<g class="fa-flicker">${fTube('polygon', `points="${Array.from({ length: 24 }, (_, i) => fP(i % 2 ? 44 : 53, i * 15)).join(' ')}" stroke-linejoin="miter"`, '#ffe93b', 2.4)}</g>`
    + `<polygon points="${Array.from({ length: 24 }, (_, i) => fP(i % 2 ? 42.5 : 47.5, i * 15 + 7.5)).join(' ')}" fill="none" stroke="#4dd2ff" stroke-width="1.100" opacity=".9"/>` + fSpark(100, 16, 0.5, '#fff', 0.3) + fSpark(18, 102, 0.45, '#bff2ff', 1.1),
  // свиток: кольцо цвета пергамента с золотыми кромками, насечками и рубином
  paper: () => fRing(44, 5, 'url(#fg-paper)') + fRing(46.7, 0.9, '#a8873f') + fRing(41.3, 0.9, '#a8873f') + fTicks(24, 42.6, 45.4, '#8f7443', 0.7, 7.5, 0.7)
    + fRep(24, () => '<circle cx="60" cy="16" r=".7" fill="#8f7443"/>') + fAt(180, fBezel(44, 2.5, '#c9163f')) + fDiamond(60, 16, 2, '#fffbe6', '#7a5310'),
});

/* ---------- Вторая волна аккуратных рамок (2026-11-17, просьба автора «обнови их и молнию») ----------
   Цепь, Луна, Пепел, Глитч, Сияние, Ретро, Галактика, Молния: у каждой своя идея, без наклеек,
   ничего ближе радиуса 41. */
const fRand = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
// ломаная «разряд» вдоль дуги
const fZig = (a0, a1, r, amp, seed, steps = 12) => { const rnd = fRand(seed); return 'M' + Array.from({ length: steps + 1 }, (_, i) => fP(i === 0 || i === steps ? r : r + (rnd() * 2 - 1) * amp, a0 + ((a1 - a0) * i) / steps)).join('L'); };
// волна вокруг центра: радиус колеблется n раз за круг
const fWave = (r, amp, n, ph) => 'M' + Array.from({ length: 121 }, (_, i) => { const a = i * 3; return fP(r + amp * Math.sin(((n * a) * Math.PI) / 180 + ph), a); }).join('L') + 'Z';
// трещина поперёк кольца от r0 к r1
const fCrack = (a, r0, r1, seed) => { const rnd = fRand(seed); return 'M' + Array.from({ length: 5 }, (_, i) => fP(r0 + ((r1 - r0) * i) / 4, a + (i ? (rnd() * 2 - 1) * 3.2 : 0))).join('L'); };
document.body.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<linearGradient id="fg-obsidian" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#26262f"/><stop offset=".5" stop-color="#0c0c11"/><stop offset="1" stop-color="#2c2c36"/></linearGradient>
<linearGradient id="fg-nebula" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a0f3d"/><stop offset=".4" stop-color="#5b3fd6"/><stop offset=".62" stop-color="#c04bd8"/><stop offset="1" stop-color="#0f2a5c"/></linearGradient>
<linearGradient id="fg-silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8d96b8"/><stop offset=".45" stop-color="#f4f6ff"/><stop offset="1" stop-color="#6b7396"/></linearGradient>
<clipPath id="fc-phase" clipPathUnits="userSpaceOnUse"><circle cx="60" cy="14.800" r="2.700"/></clipPath><clipPath id="fc-gl1" clipPathUnits="userSpaceOnUse"><rect x="0" y="24" width="120" height="7"/></clipPath><clipPath id="fc-gl2" clipPathUnits="userSpaceOnUse"><rect x="0" y="52" width="120" height="4"/></clipPath><clipPath id="fc-gl3" clipPathUnits="userSpaceOnUse"><rect x="0" y="71" width="120" height="6"/></clipPath><clipPath id="fc-gl4" clipPathUnits="userSpaceOnUse"><rect x="0" y="95" width="120" height="5"/></clipPath></defs></svg>`);

Object.assign(FRAME_ART, {
  // неон: настоящая неоновая вывеска — две стеклянные трубки с электродами, крепления и мигающий участок
  neon: () => {
    const tube = (r, a0, a1, c, w, cls = '') => `<path d="${fArc(r, a0, a1)}" fill="none" stroke="${c}" stroke-width="${w + 7}" stroke-linecap="round" opacity=".16" class="${cls}"/>` + fTube('path', `d="${fArc(r, a0, a1)}"`, c, w, cls);
    const cap = (r, a) => { const [x, y] = fXY(r, a); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.900" fill="#5a5f73" stroke="#23252f" stroke-width=".6"/>`; };
    const clip = (a) => fAt(a, '<rect x="58.300" y="6.800" width="3.400" height="11.200" rx="1.200" fill="#3a3e4c" stroke="#15161d" stroke-width=".6"/><path d="M59 8V17" stroke="#8b90a6" stroke-width=".6"/>');
    const outer = [[-75, 30], [42, 150], [162, 268]], inner = [[-20, 160], [172, 328]];
    return outer.map(([a0, a1], i) => tube(51, a0, a1, '#ff3df0', 2.6, i === 1 ? 'fa-flicker' : '')).join('') + inner.map(([a0, a1]) => tube(45.5, a0, a1, '#2bf0ff', 2)).join('')
      + outer.flatMap(([a0, a1]) => [cap(51, a0 - 3), cap(51, a1 + 3)]).join('') + inner.flatMap(([a0, a1]) => [cap(45.5, a0 - 3.5), cap(45.5, a1 + 3.5)]).join('')
      + [0, 90, 180, 270].map(clip).join('');
  },
  // легенда: вращающиеся золотые лучи, радужная эмаль, двойная оправа и восемь камней всех цветов
  legend: () => `<g class="fa-spin slow">${fRep(32, (k) => { const l = k % 2 ? 5 : 9.5, w = k % 2 ? 0.9 : 1.5; return `<path d="M${60 - w} 9.600L60 ${9.6 - l}L${60 + w} 9.600Z" fill="url(#fg-gold)" stroke="#6b4a0c" stroke-width=".4" stroke-linejoin="round"/>`; })}</g>`
    + fRing(50.6, 1.4, 'url(#fg-gold)') + fRing(51.6, 0.5, '#6b4a0c', 'opacity=".7"')
    + fBevel('rainbow', 45, 7.4) + fRing(41.3, 1.2, 'url(#fg-gold)') + fRing(48.9, 0.9, 'url(#fg-gold)')
    + ['#ff4d78', '#ffa257', '#ffd75e', '#5fd99a', '#4dd2ff', '#3f6cff', '#8b5cf6', '#ff7ab8'].map((c, k) => fAt(k * 45 + 22.5, fBezel(45, 2.2, c))).join('')
    + `<g class="fa-glow" style="--g:#fff6c8">${fBezel(45, 3.3, '#eaf6ff')}</g>` + fAt(180, fBezel(45, 2.8, '#eaf6ff'))
    + fSpark(98, 18, 0.6, '#fff', 0.2) + fSpark(20, 100, 0.5, '#fff', 1) + fSpark(104, 88, 0.4, '#fff6c8', 1.6),
  // золото: массивное кольцо с витой гравировкой, филигрань из завитков, жемчуг и рубин в ореоле бриллиантов
  gold: () => {
    const scroll = '<path d="M60 9.800C56.300 9.800 54.300 7.600 55.600 5.900 56.800 4.400 58.800 5.400 58.200 6.700" fill="none" stroke="#6b4a0c" stroke-width="2.100" stroke-linecap="round"/><path d="M60 9.800C63.700 9.800 65.700 7.600 64.400 5.900 63.200 4.400 61.200 5.400 61.800 6.700" fill="none" stroke="#6b4a0c" stroke-width="2.100" stroke-linecap="round"/>'
      + '<path d="M60 9.800C56.300 9.800 54.300 7.600 55.600 5.900 56.800 4.400 58.800 5.400 58.200 6.700" fill="none" stroke="url(#fg-gold)" stroke-width="1.200" stroke-linecap="round"/><path d="M60 9.800C63.700 9.800 65.700 7.600 64.400 5.900 63.200 4.400 61.200 5.400 61.800 6.700" fill="none" stroke="url(#fg-gold)" stroke-width="1.200" stroke-linecap="round"/><path d="M60 9.800V12.600" stroke="url(#fg-gold)" stroke-width="1.100"/>';
    const pearl = '<circle cx="60" cy="9.400" r="1.500" fill="#fff4e0" stroke="#a88a55" stroke-width=".4"/><circle cx="59.500" cy="8.900" r=".55" fill="#fff"/>';
    const halo = Array.from({ length: 10 }, (_, i) => { const a = (i * 36 * Math.PI) / 180; return fDiamond(+(60 + 5.2 * Math.sin(a)).toFixed(1), +(8.6 - 5.2 * Math.cos(a)).toFixed(1), 0.95, '#fffbe6', '#7a5310'); }).join('');
    return fRep(12, () => scroll, 15) + fRep(12, () => pearl, 0).replace(/<g transform="rotate\(0\.0 60 60\)">.*?<\/g>/, '')
      + fRing(48.2, 1, 'url(#fg-gold)') + fBevel('gold', 44, 6.6) + fRep(48, () => '<path d="M58.600 17.900L61.400 14.100" stroke="#6b4a0c" stroke-width=".55" opacity=".45"/>')
      + `<circle cx="60" cy="8.600" r="7" fill="url(#fg-gold)" stroke="#6b4a0c" stroke-width=".8"/>` + halo + fGem(60, 8.6, 3, '#ff3d6e', '#6b0a22');
  },
  // лёд: толстое ледяное кольцо с трещинами внутри и морозные узоры-дендриты, растущие наружу
  ice: () => {
    const rnd = fRand(11);
    const cracks = Array.from({ length: 9 }, () => { const a = rnd() * 360; return `<path d="M${fP(41.8, a)}L${fP(44.5, a + (rnd() * 2 - 1) * 4)}L${fP(46.8, a + (rnd() * 2 - 1) * 6)}" fill="none" stroke="#fff" stroke-width=".45" opacity=".75"/>`; }).join('');
    const dendrite = (len) => { const top = 13 - len; let s = `<path d="M60 13V${top}" stroke-width="1"/>`; for (let i = 1; i <= 3; i++) { const y = 13 - (len * i) / 4, b = len * (0.32 - i * 0.06); s += `<path d="M60 ${y}L${(60 - b * 0.87).toFixed(2)} ${(y - b * 0.5).toFixed(2)}M60 ${y}L${(60 + b * 0.87).toFixed(2)} ${(y - b * 0.5).toFixed(2)}" stroke-width=".6"/>`; } return s; };
    return `<g fill="none" stroke="#e6faff" stroke-linecap="round" class="fa-glow" style="--g:#7fd4ff">${fRep(12, (k) => dendrite(k % 2 ? 4.8 : 8.5))}</g>`
      + fRing(45, 7.6, 'url(#fg-ice)') + fRing(45, 7.6, '#ffffff', 'opacity=".18"') + fRing(48.6, 0.8, '#1f66b8', 'opacity=".5"') + fRing(41.4, 0.8, '#1f66b8', 'opacity=".55"')
      + `<path d="${fArc(45, 195, 285)}" fill="none" stroke="#fff" stroke-width="2.200" stroke-linecap="round" opacity=".8"/><path d="${fArc(46.8, 20, 60)}" fill="none" stroke="#fff" stroke-width=".9" stroke-linecap="round" opacity=".5"/>`
      + cracks + fRep(6, () => '<polygon points="60,42.200 61.400,43 61.400,44.600 60,45.400 58.600,44.600 58.600,43" fill="#fff" opacity=".85" transform="translate(0 -28)"/>', 30)
      + fSpark(100, 18, 0.55, '#fff', 0.4) + fSpark(18, 100, 0.45, '#fff', 1.2);
  },
  // страж: кольцо из восьми кованых пластин внахлёст с заклёпками, золотая кайма и четыре геральдических щита
  shield: () => {
    const plate = fAt(0, `<path d="${fArc(48.2, -21, 21)}L${fP(41.6, 21)}${fArc(41.6, 21, -21).replace('M', 'L')}Z" fill="url(#fg-steel)" stroke="#1c2336" stroke-width=".8" stroke-linejoin="round"/><path d="${fArc(47, -17, 17)}" fill="none" stroke="#fff" stroke-width=".8" opacity=".55"/><path d="${fArc(42.6, -17, 17)}" fill="none" stroke="#000" stroke-width=".8" opacity=".3"/>`)
      + [-15, 15].map((d) => { const [x, y] = fXY(44.9, -90 + d); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1" fill="#eef3ff" stroke="#1c2336" stroke-width=".5"/>`; }).join('');
    const crest = '<path d="M54 5.200H66V11.500C66 15.400 63.300 17.900 60 19 56.700 17.900 54 15.400 54 11.500Z" fill="#1f3f9e" stroke="#6b4a0c" stroke-width="1.400" stroke-linejoin="round"/><path d="M54 5.200H66V11.500C66 15.400 63.300 17.900 60 19 56.700 17.900 54 15.400 54 11.500Z" fill="none" stroke="url(#fg-gold)" stroke-width=".8" stroke-linejoin="round"/>'
      + '<path d="M60 7.200V16.600M56.400 10.600H63.600" stroke="url(#fg-gold)" stroke-width="1.300" stroke-linecap="round"/><path d="M55.600 6.400H58.400" stroke="#fff" stroke-width=".7" stroke-linecap="round" opacity=".6"/>';
    return fRing(49.3, 1.4, 'url(#fg-gold)') + fRing(40.9, 1.2, 'url(#fg-gold)') + fRep(8, () => plate, 22.5) + fRep(8, () => plate.replace('opacity=".55"', 'opacity=".35"'), 0)
      + fRep(4, () => crest, 45);
  },
  // изумруд: камень ступенчатой огранки (три ряда граней), золотая оправа и крапаны по углам
  emerald: () => {
    const oct = (r, k, d = 0) => fP(r, k * 45 - 22.5 + d);
    const shade = (k, row) => { const light = Math.cos(((k * 45 - 225) * Math.PI) / 180); const l = Math.round(26 + row * 6 + light * 16); return `hsl(158 72% ${l}%)`; };
    const rows = [[44, 47.2], [47.2, 50.6], [50.6, 54.4]];
    const facets = rows.map(([r1, r2], row) => [0, 1, 2, 3, 4, 5, 6, 7].map((k) => `<polygon points="${oct(r1, k)} ${oct(r1, k + 1)} ${oct(r2, k + 1)} ${oct(r2, k)}" fill="${shade(k, row)}" stroke="#043d2b" stroke-width=".45" stroke-linejoin="round"/>`).join('')).join('');
    const edges = rows.map(([, r2]) => `<polygon points="${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => oct(r2, k)).join(' ')}" fill="none" stroke="#c9ffe9" stroke-width=".35" opacity=".55"/>`).join('');
    const prong = (deg) => fAt(deg, '<path d="M57.600 6.400Q60 3.600 62.400 6.400L61.400 11H58.600Z" fill="url(#fg-gold)" stroke="#6b4a0c" stroke-width=".6" stroke-linejoin="round"/><circle cx="59.300" cy="5.600" r=".6" fill="#fff" opacity=".9"/>');
    return facets + edges + `<polygon points="${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => oct(55.2, k)).join(' ')}" fill="none" stroke="url(#fg-gold)" stroke-width="1.600" stroke-linejoin="round"/>`
      + fRing(42.6, 2.400, 'url(#fg-gold)') + fRing(41.3, 0.5, '#6b4a0c', 'opacity=".7"')
      + `<path d="M${oct(52.5, 5, 6)}L${oct(52.5, 6, -6)}" stroke="#fff" stroke-width="1.300" stroke-linecap="round" opacity=".75"/>`
      + [22.5, 112.5, 202.5, 292.5].map(prong).join('') + fSpark(26, 20, 0.6, '#fff', 0.3) + fSpark(96, 100, 0.45, '#fff', 1.2);
  },
  // цепь: тонкая ювелирная цепочка из 40 звеньев и застёжка снизу
  chain: () => fRing(41.6, 0.9, 'url(#fg-gold)') + fRing(49.6, 0.6, '#c9a24a', 'opacity=".55"')
    + `<g class="fa-spin slow">${fRep(40, (k) => (k % 2
      ? '<ellipse cx="60" cy="14.500" rx="1" ry="2.900" fill="none" stroke="#6b4a0c" stroke-width="1.800"/><ellipse cx="60" cy="14.500" rx="1" ry="2.900" fill="none" stroke="url(#fg-gold)" stroke-width="1"/>'
      : '<ellipse cx="60" cy="14.500" rx="3.200" ry="2" fill="none" stroke="#6b4a0c" stroke-width="2"/><ellipse cx="60" cy="14.500" rx="3.200" ry="2" fill="none" stroke="url(#fg-gold)" stroke-width="1.200"/><path d="M57.900 13.300Q60 12.400 62.100 13.300" fill="none" stroke="#fff8d6" stroke-width=".5" opacity=".9"/>'))}</g>`
    + fAt(180, '<circle cx="60" cy="9.200" r="2.600" fill="none" stroke="#6b4a0c" stroke-width="1.900"/><circle cx="60" cy="9.200" r="2.600" fill="none" stroke="url(#fg-gold)" stroke-width="1.100"/><rect x="57.600" y="11.200" width="4.800" height="6.600" rx="2.400" fill="url(#fg-gold)" stroke="#6b4a0c" stroke-width=".7"/>'),
  // луна: эмалевое ночное кольцо с серебряной кромкой и восемью фазами луны
  moon: () => fBevel('night', 45, 6.6) + fRing(49.6, 0.8, 'url(#fg-silver)') + fRing(41.5, 0.8, 'url(#fg-silver)')
    + fRep(16, () => '<circle cx="60" cy="10.800" r=".45" fill="#e6e9ff" opacity=".8"/>', 11.25)
    + fRep(8, (k) => {
      const off = [null, 0.55, 1.1, 1.65, 0, -1.65, -1.1, -0.55][k], R = 2.7, lit = '#fff4cc';
      const dark = off === null ? '' : `<circle cx="${(60 + off * R * (off === 0 ? 0 : 1) + (off === 0 ? 0 : 0)).toFixed(2)}" cy="14.800" r="${R}" fill="#1b1f4a" clip-path="url(#fc-phase)"/>`;
      return `<circle cx="60" cy="14.800" r="${R + 0.6}" fill="#0f1230" stroke="url(#fg-silver)" stroke-width=".6"/><circle cx="60" cy="14.800" r="${R}" fill="${lit}"/>${dark}`;
    }) + `<g class="fa-glow" style="--g:#fff4cc">${fAt(0, '<circle cx="60" cy="14.800" r="2.700" fill="#fff4cc"/>')}</g>`,
  // пепел: обсидиановое кольцо, расколотое и склеенное раскалённым золотом (кинцуги)
  ash: () => fRing(45, 8.2, 'url(#fg-obsidian)') + fRing(49.2, 0.9, '#000', 'opacity=".6"') + fRing(40.9, 0.9, '#000', 'opacity=".6"') + fRing(48.4, 0.6, '#fff', 'opacity=".22"')
    + `<path d="${fArc(45, 200, 260)}" fill="none" stroke="#fff" stroke-width="1.400" stroke-linecap="round" opacity=".18"/>`
    + [[12, 1], [63, 2], [118, 3], [171, 4], [224, 5], [278, 6], [322, 7]].map(([a, s]) => `<path class="fa-ember" style="animation-delay:${-s * 0.4}s" d="${fCrack(a, 41.4, 48.8, s)}" fill="none" stroke="#ff8a1f" stroke-width="1.600" stroke-linecap="round" stroke-linejoin="round"/><path d="${fCrack(a, 41.4, 48.8, s)}" fill="none" stroke="#ffe0a3" stroke-width=".55" stroke-linecap="round" stroke-linejoin="round"/>`).join('')
    + [[50, 104, 0], [72, 106, 0.9], [92, 96, 1.7]].map(([x, y, d]) => fDot(x, y, 1.3, '#ffb03a', 'fa-rise', d)).join(''),
  // глитч: кольцо с разъехавшимися цветовыми каналами, видоискатель по углам и «битые» сегменты
  // глитч: кольцо «ломается» — каналы цвета разъезжаются, полосы кадра сдвигаются рывками, вспыхивает шум
  glitch: () => {
    const ring = (c, w) => fRing(45, w, c);
    // полосы-срезы кольца: каждая сдвигается вбок в свой момент (fa-gs1…4)
    const bands = [[24, 7, 1], [52, 4, 2], [71, 6, 3], [95, 5, 4]];
    const rnd = fRand(7);
    const noise = Array.from({ length: 14 }, (_, i) => { const [x, y] = fXY(47 + rnd() * 8, rnd() * 360), w = 2 + rnd() * 7, h = 0.8 + rnd() * 1.8; return `<rect class="fa-gn" style="animation-delay:${-(rnd() * 2.6).toFixed(2)}s;animation-duration:${(1.6 + rnd() * 1.6).toFixed(2)}s" x="${(x - w / 2).toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${['#2bf0ff', '#ff2bd1', '#fff', '#fff36b', '#5fff7a'][i % 5]}"/>`; }).join('');
    return `<g class="fa-gflick">`
      + `<g class="fa-ga" style="mix-blend-mode:screen">${ring('#ff2bd1', 3)}</g><g class="fa-gb" style="mix-blend-mode:screen">${ring('#2bf0ff', 3)}</g><g class="fa-gc" style="mix-blend-mode:screen">${ring('#fff36b', 1.6)}</g>` + ring('#fff', 1.2)
      + bands.map(([y, h, k]) => `<g clip-path="url(#fc-gl${k})"><g class="fa-gs${k}">${ring('#fff', 3.4)}${fRing(45, 3.4, k % 2 ? '#2bf0ff' : '#ff2bd1', 'opacity=".75" transform="translate(2 0)"')}</g></g>`).join('')
      + `<g opacity=".5">${Array.from({ length: 18 }, (_, i) => `<path d="M10 ${10 + i * 5.8}H110" stroke="#000" stroke-width=".9" mask="url(#fm-out)"/>`).join('')}</g>`
      + ['M13 27V13H27', 'M93 13H107V27', 'M107 93V107H93', 'M27 107H13V93'].map((d, i) => `<g class="${['fa-ga', 'fa-gb', 'fa-gc', 'fa-ga'][i]}"><path d="${d}" fill="none" stroke="#2bf0ff" stroke-width="2" stroke-linecap="square" transform="translate(-1.2 .8)"/><path d="${d}" fill="none" stroke="#ff2bd1" stroke-width="2" stroke-linecap="square" transform="translate(1.2 -.8)"/><path d="${d}" fill="none" stroke="#fff" stroke-width="1.200" stroke-linecap="square"/></g>`).join('')
      + noise + '</g>';
  },
  // сияние: три переливающиеся ленты-волны вокруг кольца
  aurora: () => fRing(44, 2, '#0b3036') + `<g class="fa-spin slow"><g class="fa-hue">${[[48, 3, 6, 0, '#3ee6b0', 2.8], [47.5, 2.6, 5, 1.6, '#4dd2ff', 2], [49, 2.2, 7, 3.1, '#ff7ab8', 1.3]].map(([r, amp, n, ph, c, w]) => `<path d="${fWave(r, amp, n, ph)}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" opacity=".9" class="fa-glow" style="--g:${c}"/>`).join('')}</g></g>`
    + fRing(44, 0.8, '#bff2ff', 'opacity=".7"') + fSpark(103, 16, 0.5, '#fff', 0.2) + fSpark(16, 104, 0.45, '#fff', 1.1),
  // ретро: пиксельное 8-битное кольцо с объёмом и четырьмя «рубинами»
  retro: () => {
    let s = '';
    for (let x = 0; x < 120; x += 3) for (let y = 0; y < 120; y += 3) {
      const dx = x + 1.5 - 60, dy = y + 1.5 - 60, d = Math.hypot(dx, dy);
      if (d < 42 || d > 50.5) continue;
      const light = (-dx - dy) / (d * Math.SQRT2);
      const c = d < 43.6 || d > 49 ? '#15121f' : light > 0.55 ? '#fff3b0' : light < -0.45 ? '#c98a12' : '#ffd75e';
      s += `<rect x="${x}" y="${y}" width="3.050" height="3.050" fill="${c}"/>`;
    }
    const gem = (gx, gy) => `<g class="fa-tw"><rect x="${gx - 3}" y="${gy - 3}" width="6" height="6" fill="#ff3d6e"/><rect x="${gx - 3}" y="${gy - 3}" width="3" height="3" fill="#ff9ab3"/><rect x="${gx}" y="${gy}" width="3" height="3" fill="#a8103a"/></g>`;
    return `<g shape-rendering="crispEdges">${s}${gem(60, 13.5)}${gem(106.5, 60)}${gem(60, 106.5)}${gem(13.5, 60)}</g>`;
  },
  // галактика: кольцо-туманность со звёздами и тонкая наклонная орбита со спутником
  galaxy: () => {
    const rnd = fRand(42);
    const stars = Array.from({ length: 34 }, (_, i) => { const [x, y] = fXY(42.6 + rnd() * 5, rnd() * 360), r = 0.25 + rnd() * 0.55; return fDot(x.toFixed(1), y.toFixed(1), r.toFixed(2), i % 5 ? '#fff' : '#bfe6ff', i % 4 ? '' : 'fa-tw', (i % 7) * 0.3); }).join('');
    return fRing(45, 6.6, 'url(#fg-nebula)') + stars + fRing(48.6, 0.7, '#c9b8ff', 'opacity=".75"') + fRing(41.6, 0.7, '#000', 'opacity=".5"')
      + `<g transform="rotate(-20 60 60)"><ellipse cx="60" cy="60" rx="57" ry="13.500" fill="none" stroke="url(#fg-violet)" stroke-width="1.600" opacity=".95" mask="url(#fm-out)"/><path d="M3 60A57 13.500 0 0 0 117 60" fill="none" stroke="url(#fg-violet)" stroke-width="1.600" stroke-linecap="round"/><circle cx="114.500" cy="56" r="3.300" fill="#ffd9a8" stroke="#6a3df0" stroke-width=".6"/><circle cx="113.500" cy="55" r="1" fill="#fff" opacity=".85"/></g>`
      + fSpark(100, 13, 0.55, '#fff', 0) + fSpark(16, 22, 0.45, '#d9d3ff', 0.8);
  },
  // молния: стальное кольцо, по которому бегут электрические разряды
  lightning: () => fBevel('steel', 44, 5) + fRing(48.8, 0.7, '#4dd2ff', 'opacity=".55"')
    + `<g class="fa-flicker">${[[-85, -5, 1], [15, 95, 2], [115, 190, 3], [210, 280, 4]].map(([a0, a1, sd]) => fTube('path', `d="${fZig(a0, a1, 49.5, 3, sd)}"`, '#5fe3ff', 1.5)).join('')}</g>`
    + `<g class="fa-flicker" style="animation-delay:-1.100s">${[[-40, 40, 5], [150, 235, 6]].map(([a0, a1, sd]) => fTube('path', `d="${fZig(a0, a1, 52, 2.4, sd, 10)}"`, '#fff36b', 1.1)).join('')}</g>`
    + fRep(4, () => fBezel(44, 1.9, '#bff2ff', 'steel', '#1c2336'), 45),
});

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
