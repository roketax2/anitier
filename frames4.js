'use strict';
/* Рамки, четвёртая пачка (2026-11-17): исправления и движение для Солнца, Ветра, Земли, Воды, Энергии.
   Земля: снежные шапки больше не ложатся на аватарку, горы обрезаны кругом; Вода: волны не выходят за каплю. */
document.body.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<clipPath id="fc-drop" clipPathUnits="userSpaceOnUse"><path d="M60 -4C74 18 106 32 106 66A46 46 0 0 1 14 66C14 32 46 18 60 -4Z"/></clipPath>
<mask id="fm-earth" maskUnits="userSpaceOnUse" x="-10" y="-10" width="140" height="140"><circle cx="60" cy="60" r="60" fill="#fff"/><circle cx="60" cy="60" r="40.500" fill="#000"/></mask></defs></svg>`);

Object.assign(FRAME_ART, {
  earth: () => '<g mask="url(#fm-earth)"><path d="M0 92 10 78 18 84 28 70 38 80 48 72 58 82 70 68 82 80 92 72 104 82 112 76 120 90V120H0Z" fill="#6f8fb8" opacity=".75"/>'
    + '<path d="M0 100 14 76 22 84 34 62 44 78 52 68 60 82 70 64 80 78 88 66 100 82 108 72 120 100V120H0Z" fill="url(#fg-rock)" stroke="#2a1f18" stroke-width="1" stroke-linejoin="round"/>'
    + '<path d="M30 69 34 62 38 68ZM66 71 70 64 74 70ZM84 72 88 66 92 72ZM10 81 14 76 18 80Z" fill="#f4f1ea"/><path d="M0 106C24 100 40 110 60 106S96 100 120 106V120H0Z" fill="#3f7d34"/>'
    + [[8, 104], [16, 106], [104, 105], [112, 103], [24, 108], [96, 108]].map(([x, y]) => `<path d="M${x} ${y - 9}L${x - 3.5} ${y}H${x + 3.5}Z" fill="#2d6a2a" stroke="#1a3f18" stroke-width=".5"/>`).join('') + '</g>'
    + fRing(42.4, 3, 'url(#fg-rock)') + fRing(42.4, 0.7, '#d6c2a8', 'opacity=".7"'),
  water: () => { const drop = 'M60 -4C74 18 106 32 106 66A46 46 0 0 1 14 66C14 32 46 18 60 -4Z';
    return `<path d="${drop}" fill="url(#fg-water)" stroke="#0b4fb3" stroke-width="1.800" mask="url(#fm-out)"/>`
      + `<g clip-path="url(#fc-drop)"><g mask="url(#fm-out)">${[0, 1, 2].map((i) => `<path class="fa-sway" style="animation-delay:${-i * 1.3}s" d="${fWave(45 + i * 4.5, 1.3, 11 + i * 2, i)}" fill="none" stroke="#e6fbff" stroke-width="${1 - i * 0.2}" opacity="${0.75 - i * 0.15}"/>`).join('')}</g></g>`
      + `<path d="${drop}" fill="none" stroke="#e6fbff" stroke-width="1" opacity=".9"/><path d="M42 22C47 14 53 7 57.500 1" fill="none" stroke="#fff" stroke-width="2.600" stroke-linecap="round" opacity=".85"/>`
      + [[22, 108, 2.2], [32, 114, 1.5], [98, 110, 2], [88, 116, 1.3], [60, 116, 1.6]].map(([x, y, r], i) => `<circle class="fa-tw" style="animation-delay:${i * 0.3}s" cx="${x}" cy="${y}" r="${r}" fill="#8fd8ff" stroke="#0b4fb3" stroke-width=".5"/>`).join('') + fRing(41.2, 1.4, '#e6fbff'); },
});

Object.assign(FRAME_FX, {
  // солнце: корона дышит, искры летят наружу
  sun: () => '<circle class="fa-breath" cx="60" cy="60" r="47" fill="none" stroke="#ffd36b" stroke-width="3" opacity=".6"/>' + fFly(10, 131, 50, '#ffb020', 1, 1.8) + fTwinkles(5, 133, 52, 60, '#fff8d6', 0.5),
  // ветер: листья кружат, по кругу бегут потоки воздуха
  wind: () => fFly(10, 135, 48, '#e6fbff', 0.6, 1.2) + `<g class="fa-spin fast">${fSwoosh(55, -100, -40, 2.2, 'rgba(255,255,255,.75)')}</g><g class="fa-spin rev">${fSwoosh(50, 60, 120, 1.6, 'rgba(220,250,255,.7)')}</g>`,
  // земля: облака плывут над горами, птицы
  earth: () => '<g class="fa-cloud"><ellipse cx="20" cy="30" rx="9" ry="3.500" fill="#fff" opacity=".85"/><ellipse cx="26" cy="28" rx="6" ry="3" fill="#fff" opacity=".9"/></g><g class="fa-cloud" style="animation-delay:-6s"><ellipse cx="96" cy="22" rx="8" ry="3" fill="#fff" opacity=".8"/><ellipse cx="101" cy="20" rx="5" ry="2.600" fill="#fff" opacity=".85"/></g>'
    + '<g class="fa-cloud" style="animation-delay:-3s;animation-duration:9s"><path d="M100 40Q102 38 104 40Q106 38 108 40" fill="none" stroke="#2a1f18" stroke-width=".7"/></g>',
  // вода: пузырьки поднимаются внутри капли
  water: () => `<g clip-path="url(#fc-drop)">${[[30, 0, 1.6], [86, 0.8, 1.2], [50, 1.5, 1.8], [72, 2.1, 1.3]].map(([x, d, r]) => `<circle class="fa-rise" style="animation-delay:${d}s" cx="${x}" cy="100" r="${r}" fill="none" stroke="#e6fbff" stroke-width=".6"/>`).join('')}</g>`,
  // энергия: ток по дорожкам, пульс, сгустки по кругу и разряды
  energy: () => fRep(6, () => '<path class="fa-flow" style="animation-duration:.7s" d="M60 18V12H66L70 8" fill="none" stroke="#fff" stroke-width="1" stroke-dasharray="2 4"/>', 30)
    + '<circle class="fa-breath" cx="60" cy="60" r="44" fill="none" stroke="#7cf7ff" stroke-width="1.400"/>' + `<g class="fa-spin fast">${fDot(60, 4.5, 2, '#fff', 'fa-glow')}</g><g class="fa-spin rev">${fDot(60, 10, 1.4, '#ff4dd8')}</g>`
    + `<g class="fa-flicker">${fRep(3, () => `<path d="${fZig(-100, -60, 50, 2.5, 7, 6)}" fill="none" stroke="#7cf7ff" stroke-width=".9"/>`)}</g>`,
});

// чёрная дыра: джеты не должны проходить по аватарке
{ const bh = FRAME_ART.blackhole; FRAME_ART.blackhole = () => bh().split('fill="url(#fg-jet)"').join('fill="url(#fg-jet)" mask="url(#fm-out)"').split('<path class="fa-jet"').join('<path mask="url(#fm-out)" class="fa-jet"'); }
