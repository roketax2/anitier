'use strict';
/* Атака титанов (2026-11-18, по кадрам аниме): Колоссальный титан как в сериале — светлый костяной лоб с линией
   по центру, красные височные мышцы, тяжёлые надбровья, чёрные глазницы с горящими глазами, огромные красные
   щёки с волокнами в светлой окантовке, провал носа, ряд зубов без губ, пар. */
document.body.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<linearGradient id="fg-ctskin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3dcc0"/><stop offset=".6" stop-color="#e2bc98"/><stop offset="1" stop-color="#c89a78"/></linearGradient>
<linearGradient id="fg-ctred" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8483a"/><stop offset=".55" stop-color="#c0261c"/><stop offset="1" stop-color="#7a0e0a"/></linearGradient>
</defs></svg>`);
{ const prev = FRAME_ART.an_aot, M = (d) => d.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (m, x, y) => `${(120 - +x).toFixed(1)} ${y}`);
  const fib = (xs, y0, y1, bend) => xs.map((x, i) => `<path d="M${x} ${y0}Q${(x + bend).toFixed(1)} ${((y0 + y1) / 2).toFixed(1)} ${(x + bend * 0.3).toFixed(1)} ${y1}" fill="none" stroke="${i % 2 ? '#ff8a7a' : '#6a0c08'}" stroke-width="${i % 2 ? 0.3 : 0.4}" opacity=".85"/>`).join('');
  const temL = 'M46.4 1.6C46 -3.8 49.4 -8.4 55 -9.6C53.2 -6 52.8 -1.6 53.6 2.8Z';
  const cheekL = 'M47.4 8.8C50 8.2 54 8.8 56.4 10.6C56.9 13.8 56.5 16.4 55.6 18.4H49.6C48 15.6 47.2 12.2 47.4 8.8Z';
  const head = '<path d="M60 -10.4C69 -10.4 74.6 -5.2 75 2C75.4 8 74.6 12.2 73 16.2C71.4 21 67 24.6 60 24.8C53 24.6 48.6 21 47 16.2C45.4 12.2 44.6 8 45 2C45.4 -5.2 51 -10.4 60 -10.4Z" fill="url(#fg-ctskin)" stroke="#4a1a0e" stroke-width=".8"/>'
    // височные мышцы и линия по центру черепа
    + `<path d="${temL}" fill="url(#fg-ctred)" stroke="#4a0a06" stroke-width=".4"/><path d="${M(temL)}" fill="url(#fg-ctred)" stroke="#4a0a06" stroke-width=".4"/>`
    + fib([47.6, 49, 50.4, 51.8, 53], -6, 2, 0.6) + fib([72.4, 71, 69.6, 68.2, 67], -6, 2, -0.6)
    + '<path d="M60 -10V2.6" stroke="#9a6a4a" stroke-width=".6"/><path d="M57.4 -9.6Q58.6 -3 58.4 2.4M62.6 -9.6Q61.4 -3 61.6 2.4" fill="none" stroke="#c89a78" stroke-width=".35"/>'
    // надбровья и глазницы
    + '<path d="M46.6 3.6Q53.4 .4 59 3Q60 3.6 61 3Q66.6 .4 73.4 3.6L72.8 6.2Q66.6 4 61 5.8H59Q53.4 4 47.2 6.2Z" fill="#f6e2c8" stroke="#4a1a0e" stroke-width=".45"/>'
    + '<ellipse cx="53.4" cy="7.4" rx="4.4" ry="2.3" fill="#120402"/><ellipse cx="66.6" cy="7.4" rx="4.4" ry="2.3" fill="#120402"/>'
    + '<circle class="fa-glow" style="--g:#ff9a2a" cx="54.2" cy="7.5" r=".95" fill="#ffb23a"/><circle class="fa-glow" style="--g:#ff9a2a" cx="65.8" cy="7.5" r=".95" fill="#ffb23a"/>'
    // щёки: красные мышцы с волокнами в светлой окантовке
    + `<path d="${cheekL}" fill="url(#fg-ctred)" stroke="#4a0a06" stroke-width=".4"/><path d="${M(cheekL)}" fill="url(#fg-ctred)" stroke="#4a0a06" stroke-width=".4"/>`
    + fib([48.6, 49.8, 51, 52.2, 53.4, 54.6, 55.6], 9.4, 18, 0.5) + fib([71.4, 70.2, 69, 67.8, 66.6, 65.4, 64.4], 9.4, 18, -0.5)
    + '<path d="M47 8.4C46.4 12.6 47.4 16.6 49.4 19.8M56.9 10.2C57.5 13.4 57.1 16.6 56.1 18.8M73 8.4C73.6 12.6 72.6 16.6 70.6 19.8M63.1 10.2C62.5 13.4 62.9 16.6 63.9 18.8" fill="none" stroke="#f6e2c8" stroke-width="1.3" stroke-linecap="round"/>'
    // провал носа
    + '<path d="M58.7 10.6L60 8.8L61.3 10.6L60.9 13.6H59.1Z" fill="#3a0e06"/><path d="M60 8.8V13.4" stroke="#f6e2c8" stroke-width=".35"/>'
    // зубы без губ: дёсны, два ряда зубов
    + '<path d="M49.6 17.2Q60 16 70.4 17.2L70 22.4Q60 24 50 22.4Z" fill="#e6a890" stroke="#4a1a0e" stroke-width=".45"/>'
    + '<path d="M51 18H69V20H51Z" fill="#fbf4e8"/><path d="M51.4 20.2H68.6V21.9Q60 22.8 51.4 21.9Z" fill="#f3e8d6"/>'
    + Array.from({ length: 12 }, (_, i) => { const x = 52.4 + i * 1.5; return `<path d="M${x.toFixed(1)} 18V21.8" stroke="#8a5a48" stroke-width=".3"/>`; }).join('')
    + '<path d="M51 20.1H69" stroke="#5a2a18" stroke-width=".45"/><path d="M51 18H69M51.4 21.9Q60 22.8 68.6 21.9" fill="none" stroke="#a86a50" stroke-width=".4"/>'
    + '<path d="M54 23.4Q60 25.4 66 23.4" fill="none" stroke="#9a6a4a" stroke-width=".4"/>';
  const steam = [[48, -9, 0], [72, -7, 0.8], [60, -13, 1.6], [42, 2, 1.2], [78, 4, 2]].map(([x, y, d]) => `<circle class="fa-smoke" style="animation-delay:${-d}s" cx="${x}" cy="${y}" r="3.6" fill="#f4efe8"/>`).join('');
  const titan = fAt(-45, `<g mask="url(#fm-outbig)"><g class="fa-titan3">${head}${steam}</g></g>`);
  FRAME_ART.an_aot = () => { const s = prev(); return titan + s.slice(s.indexOf('<circle cx="60" cy="60" r="46.5"')); };
}
