'use strict';
/* Рамки за секретные коды (2026-11-18): Золотой ключ, Подарок, Билет, Разработчик. Достижениями не открываются — только кодом (promo.js). */
document.body.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<linearGradient id="fg-pkgold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset=".45" stop-color="#e8b53e"/><stop offset="1" stop-color="#8a5a12"/></linearGradient>
<linearGradient id="fg-pkband" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a0c"/><stop offset="1" stop-color="#1a1206"/></linearGradient>
<linearGradient id="fg-gift" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7aa2"/><stop offset="1" stop-color="#c2185b"/></linearGradient>
<linearGradient id="fg-ribbon" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffe38a"/><stop offset=".5" stop-color="#fff6d0"/><stop offset="1" stop-color="#e2b23a"/></linearGradient>
<linearGradient id="fg-ticket" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3d6"/><stop offset="1" stop-color="#e9cf98"/></linearGradient>
<path id="fp-ring48" d="M60 12a48 48 0 1 1-.01 0"/>
<path id="fp-ring47" d="M60 13a47 47 0 1 1-.01 0"/>
</defs></svg>`);
{
  const spin = (dur, rev = false) => `<animateTransform attributeName="transform" type="rotate" from="${rev ? 360 : 0} 60 60" to="${rev ? 0 : 360} 60 60" dur="${dur}s" repeatCount="indefinite"/>`;
  const twinkle = (x, y, s, c, delay) => `<path d="M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z" fill="${c}"><animate attributeName="opacity" values="0;1;0" dur="2.4s" begin="${delay}s" repeatCount="indefinite"/></path>`;

  /* Золотой ключ: тёмная лента с золотыми кантами, бусины, четыре ключика и большой ключ снизу */
  const key = (s, w = 1.6) => `<g transform="scale(${s})"><circle cx="-4.6" r="3" fill="none" stroke="url(#fg-pkgold)" stroke-width="${w}"/><circle cx="-4.6" r="1" fill="url(#fg-pkgold)"/><path d="M-1.6 0H6.4M3.6 0v2.6M5.8 0v1.9" fill="none" stroke="url(#fg-pkgold)" stroke-width="${w}" stroke-linecap="round"/></g>`;
  const keyArt = () => fRing(48, 9.5, 'url(#fg-pkband)')
    + fRing(43.4, 1.7, 'url(#fg-pkgold)') + fRing(52.6, 1.7, 'url(#fg-pkgold)')
    + fRep(36, (k) => (k % 9 ? `<circle cx="60" cy="12" r="${k % 3 ? 0.8 : 1.3}" fill="#ffe08a" opacity=".85"/>` : ''))
    + [45, 135, 225, 315].map((d) => fAt(d, `<g transform="translate(60 12) rotate(-${d} 0 0)">${key(0.9)}</g>`)).join('')
    + `<g transform="translate(60 108)"><circle r="7.5" fill="#1a1206" stroke="url(#fg-pkgold)" stroke-width="1.4"/>${key(1.25, 1.5)}</g>`
    + `<g>${spin(18)}${twinkle(60, 4.5, 2.6, '#fff4c2', 0)}${twinkle(110, 40, 2, '#ffe08a', 0.8)}${twinkle(14, 78, 2.2, '#fff4c2', 1.6)}</g>`;

  /* Подарок: розовая обёртка в горошек, золотая лента крест-накрест и бант сверху; конфетти кружится */
  const giftArt = () => fRing(48, 10, 'url(#fg-gift)')
    + fRep(30, (k) => `<circle cx="60" cy="${k % 2 ? 15 : 9}" r="1.05" fill="#fff" opacity=".55"/>`, 6)
    + [90, 270, 180].map((d) => fAt(d, `<rect x="56.8" y="7" width="6.4" height="10" fill="url(#fg-ribbon)"/><path d="M56.8 7v10M63.2 7v10" stroke="#c99a2e" stroke-width=".5"/>`)).join('')
    + fRing(43.1, 0.8, '#ffd1e0', 'opacity=".7"') + fRing(52.9, 0.8, '#ffd1e0', 'opacity=".7"')
    + `<g transform="translate(60 9)"><path d="M0 2C-5-6-15-5-13 1-11 6-4 5 0 2Z" fill="url(#fg-ribbon)" stroke="#c99a2e" stroke-width=".6"/><path d="M0 2C5-6 15-5 13 1 11 6 4 5 0 2Z" fill="url(#fg-ribbon)" stroke="#c99a2e" stroke-width=".6"/>`
    + `<path d="M-1.5 3-6 12M1.5 3 6 12" stroke="url(#fg-ribbon)" stroke-width="2.4" stroke-linecap="round"/><circle cy="2" r="2.6" fill="#ffe38a" stroke="#c99a2e" stroke-width=".6"/></g>`
    + `<g>${spin(24, true)}${fRep(10, (k) => `<rect x="59" y="${k % 2 ? 2.5 : 115}" width="2.2" height="1.3" rx=".4" fill="${['#4dd2ff', '#ffe38a', '#a64dff', '#3ee6b0', '#fff'][k % 5]}" transform="rotate(${k * 23} 60 ${k % 2 ? 3 : 115.5})"/>`, 12)}</g>`;

  /* Билет: бумажная лента с перфорацией, вырезы по бокам, надпись по кругу и красная печать */
  const ticketArt = () => fRing(48, 11, 'url(#fg-ticket)')
    + fRing(43.6, 0.7, '#b9925a', 'stroke-dasharray="1.4 1.6"') + fRing(52.4, 0.7, '#b9925a', 'stroke-dasharray="1.4 1.6"')
    + `<g>${spin(40)}<text font-family="Onest,system-ui,sans-serif" font-size="5" font-weight="700" letter-spacing=".9" fill="#7a2a3a"><textPath href="#fp-ring47" startOffset="0">ANITIER ✦ SECRET CODE ✦ ADMIT ONE ✦ ANITIER ✦ SECRET CODE ✦ ADMIT ONE ✦</textPath></text></g>`
    + `<circle cx="6.5" cy="60" r="4.2" fill="#0c0b11"/><circle cx="113.5" cy="60" r="4.2" fill="#0c0b11"/>`
    + `<g transform="translate(92 98) rotate(-18)"><circle r="8.5" fill="#d23a4e" opacity=".92"/><circle r="6.6" fill="none" stroke="#ffd7dc" stroke-width=".6" stroke-dasharray="1 1"/><path d="m0-4 1.2 2.6 2.8.3-2.1 1.9.6 2.8L0 2.2l-2.5 1.4.6-2.8-2.1-1.9 2.8-.3Z" fill="#fff"/></g>`;

  /* Разработчик: тёмный терминал, двоичный код бежит по кругу, бегущая полоса сканера и </> сверху */
  const devArt = () => fRing(48, 10.5, '#06140c')
    + fRing(43, 0.9, '#3ee68a', 'opacity=".75"') + fRing(53, 0.9, '#3ee68a', 'opacity=".75"')
    + `<g>${spin(30, true)}<text font-family="ui-monospace,Consolas,monospace" font-size="4.6" fill="#3ee68a" opacity=".75" letter-spacing=".25"><textPath href="#fp-ring48">01000001 01001110 01001001 01010100 01001001 01000101 01010010 00100000 01000100 01000101 01010110</textPath></text></g>`
    + `<g>${spin(3.2)}<circle cx="60" cy="60" r="48" fill="none" stroke="#8dffbf" stroke-width="10.5" stroke-dasharray="14 288" opacity=".22"/></g>`
    + `<g transform="translate(60 11)"><rect x="-11" y="-6" width="22" height="12" rx="3.5" fill="#06140c" stroke="#3ee68a" stroke-width="1.2"/><text y="2.3" text-anchor="middle" font-family="ui-monospace,Consolas,monospace" font-size="7.4" font-weight="700" fill="#3ee68a">&lt;/&gt;</text></g>`
    + `<rect x="66" y="105" width="3.4" height="6" fill="#3ee68a"><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;.5;.5;1" dur="1.1s" repeatCount="indefinite"/></rect>`
    + `<text x="44" y="111" font-family="ui-monospace,Consolas,monospace" font-size="6.4" font-weight="700" fill="#3ee68a">dev</text>`;

  Object.assign(FRAME_ART, { pr_key: keyArt, pr_gift: giftArt, pr_ticket: ticketArt, pr_dev: devArt });
}
