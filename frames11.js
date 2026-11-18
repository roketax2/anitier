'use strict';
/* Аля (2026-11-18, по картинкам персонажа): лента как у неё — тонкая красная со светлой кромкой, завязана на боковой
   пряди: две узкие вытянутые петли (вверх и вниз) и два длинных тонких хвоста, свисающих вдоль волос. */
{ const prev = FRAME_ART.an_alya, cut = `<g transform="translate(${X6(55.5, -128).join(' ')}) rotate(-38) scale(1.15)">`;
  const band = (d, w = 1.25) => `<path d="${d}" fill="none" stroke="#f0c070" stroke-width="${(w + 0.7).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#c8102e" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#ff6a7a" stroke-width=".3" stroke-linecap="round" opacity=".8"/>`;
  const [x, y] = X6(56.8, -152);
  // прядь у лица, которую перевязывает лента
  const lock = `<path d="M${x - 1.6} ${y - 14}C${x - 2.4} ${y - 4} ${x - 1.2} ${y + 10} ${x - 2.6} ${y + 30}L${x + 0.4} ${y + 31}C${x + 1.2} ${y + 12} ${x + 1.8} ${y - 4} ${x + 1.4} ${y - 14}Z" fill="url(#fg-hair)" stroke="#6e7894" stroke-width=".35"/><path d="M${x - 0.4} ${y - 13}C${x - 0.8} ${y} ${x - 0.2} ${y + 14} ${x - 1.2} ${y + 29}" fill="none" stroke="#fff" stroke-width=".4" opacity=".85"/>`;
  const ribbon = `<g transform="translate(${x} ${y}) scale(1.25)">`
    + band('M0 0C-3.4-2.6-5.2-8.6-2.8-11.4-.6-13.4 1.6-9 0 0') + band('M0 0C-4.2 1.6-7.4 5.6-5.6 8.2-4 9.8-1.2 6 0 0')
    + `<g class="fa-swing" style="animation-duration:3.6s">${band('M0 0C.8 5-.8 10 .4 15.4.9 18.6 0 21 .7 23.6', 1.1)}${band('M0 0C1.8 4.4 2.4 9.6 3.4 14 3.9 16.6 3.7 19 4.3 21', 1.1)}</g>`
    + '<ellipse rx="1.5" ry="1.25" fill="#c8102e" stroke="#f0c070" stroke-width=".45"/><path d="M-.7-.4Q0-.9.7-.4" fill="none" stroke="#ff9aa6" stroke-width=".35"/></g>';
  FRAME_ART.an_alya = () => { const s = prev(), i = s.lastIndexOf(cut); return (i >= 0 ? s.slice(0, i) : s) + lock + ribbon; };
}
