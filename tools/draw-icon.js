// Рисует подробный аниме-глаз (приёмы современного аниме: толстое веко с зубчиками,
// радужка с ободком, зрачок-кольцо, лучики, цветные отражения, три блика).
//   node tools/draw-icon.js                 — icon.svg (значок, тёмный фон, цвета сайта) и logo.svg (живой глаз для шапки)
//   node tools/draw-icon.js dark-blue       — icon.svg в другом варианте (dark-site | dark-blue | skin-site)
//   node tools/draw-icon.js compare         — лист сравнения вариантов в tools/_preview.png
//   node tools/draw-icon.js frames          — кадры анимации logo.svg в tools/_preview.png
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const PLATE = {
  dark: { bg: ['#2d1c44', '#15111f', '#0e0d14'], radial: true, line: '#f4f1fb', hatch: '#aaa0d0', crease: '#f4f1fb', creaseOp: 0.45, white: ['#9a90c2', '#e4dff2', '#f7f5fc'] },
  skin: { bg: ['#fff4ea', '#fbe6d8', '#f3d6c4'], radial: false, line: '#34202e', hatch: '#f6dccb', crease: '#c98f7a', creaseOp: 0.9, white: ['#c9c3d6', '#f1eef6', '#ffffff'] },
};
const IRIS = {
  site: { out: '#2a0c3a', rim: '#6a3df0', disc: ['#b81f78', '#ff5f86', '#ff9aa6'], shade: '#2a0c3a', pStroke: '#4a148c', pFill: '#ffb9c9', pDot: '#5a1fb0', ray: '#ffe6ec', gold: '#ffd75e', blob: '#ffb07a', block: '#b79cff', glow: '#ff4d78' },
  blue: { out: '#172666', rim: '#3d63dc', disc: ['#2f86dc', '#5cc4f2', '#a6ecff'], shade: '#121c52', pStroke: '#27399c', pFill: '#bdeeff', pDot: '#3355c4', ray: '#eafcff', gold: '#fff08a', blob: '#ffb3c7', block: '#ff8fc0', glow: '#3f8cff' },
};

const CX = 272, CY = 282;            // центр радужки
const TOP = 'C140 240 210 202 290 200C350 200 410 226 434 268';   // нижний край века (от внутреннего уголка)
const EYE = `M92 304${TOP}C432 320 380 372 290 380C200 384 130 352 92 304Z`;
const ART = 'translate(256 256) scale(1.02) translate(-277 -262)';

function rays(angles, r1, r2, color, w) {
  return angles.map(a => {
    const c = Math.cos(a * Math.PI / 180), s = Math.sin(a * Math.PI / 180);
    const f = n => n.toFixed(1);
    return `<path d="M${f(CX + c * r1)} ${f(CY + 4 + s * r1)}L${f(CX + c * r2)} ${f(CY + 4 + s * r2)}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
  }).join('');
}

// Градиенты одной расцветки радужки; k — суффикс, чтобы две расцветки жили в одном файле.
const irisDefs = (c, k, glowOp) => `
    <radialGradient id="glow${k}" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${c.glow}" stop-opacity="${glowOp}"/><stop offset="1" stop-color="${c.glow}" stop-opacity="0"/></radialGradient>
    <linearGradient id="disc${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0.1" stop-color="${c.disc[0]}"/><stop offset="0.55" stop-color="${c.disc[1]}"/><stop offset="1" stop-color="${c.disc[2]}"/></linearGradient>`;

// Всё цветное внутри глаза: радужка, отражения, лучики, зрачок.
const irisLayers = (c, k) => `
      <circle cx="${CX}" cy="${CY}" r="104" fill="${c.out}"/>
      <circle cx="${CX}" cy="${CY}" r="97" fill="${c.rim}"/>
      <circle cx="${CX}" cy="${CY}" r="83" fill="url(#disc${k})"/>
      <g clip-path="url(#irisClip)">
        <path fill="${c.shade}" opacity="0.5" d="M160 170H390V246Q330 222 272 222Q214 222 160 248Z"/>
        <g fill="${c.block}" opacity="0.92">
          <rect x="300" y="204" width="19" height="36" rx="3" transform="rotate(16 309 222)"/>
          <rect x="326" y="212" width="17" height="42" rx="3" transform="rotate(16 334 233)"/>
          <rect x="349" y="232" width="11" height="26" rx="3" transform="rotate(16 354 245)"/>
        </g>
        <ellipse cx="${CX}" cy="${CY + 68}" rx="48" ry="18" fill="${c.blob}" opacity="0.8"/>
        <g fill="none">
          ${rays([165, 180, 195], 48, 66, c.ray, 5)}
          ${rays([-15, 0, 15], 48, 66, c.ray, 5)}
          ${rays([62, 78, 102, 118], 58, 74, c.gold, 5)}
        </g>
      </g>
      <circle cx="${CX}" cy="${CY + 4}" r="30" fill="${c.pFill}" stroke="${c.pStroke}" stroke-width="7"/>
      <circle cx="${CX}" cy="${CY + 4}" r="12" fill="${c.pDot}"/>`;

const HATCH = [[168, 224], [194, 208], [220, 197], [246, 190], [272, 185], [298, 183], [324, 184], [392, 206], [412, 222]]
  .map(([x, y]) => `M${x - 5} ${y + 7}L${x + 5} ${y - 7}`).join('');
const lids = p => `
    <path fill="${p.line}" d="M70 300C120 220 200 168 290 164L340 166L360 140L364 171C396 180 418 194 438 212L482 208L452 234L486 254L450 260L468 294L434 268C410 226 350 200 290 200C210 202 140 240 92 304Z"/>
    <path fill="none" stroke="${p.hatch}" stroke-width="4" stroke-linecap="round" d="${HATCH}"/>
    <path fill="none" stroke="${p.line}" stroke-width="7" stroke-linecap="round" d="M190 380Q272 397 356 382"/>`;
const crease = p => `<path fill="none" stroke="${p.crease}" stroke-width="5" stroke-linecap="round" opacity="${p.creaseOp}" d="M150 170C220 124 330 118 418 160"/>`;
const whiteDef = p => `<linearGradient id="white" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.white[0]}"/><stop offset="0.45" stop-color="${p.white[1]}"/><stop offset="1" stop-color="${p.white[2]}"/></linearGradient>`;
const CLIPS = `<clipPath id="eye"><path d="${EYE}"/></clipPath>
    <clipPath id="irisClip"><circle cx="${CX}" cy="${CY}" r="97"/></clipPath>`;

// Неподвижный значок.
function draw(name) {
  const [pn, inm] = name.split('-');
  const p = PLATE[pn], c = IRIS[inm];
  const bg = p.radial
    ? `<radialGradient id="bg" cx="0.5" cy="0.5" r="0.75"><stop offset="0" stop-color="${p.bg[0]}"/><stop offset="0.6" stop-color="${p.bg[1]}"/><stop offset="1" stop-color="${p.bg[2]}"/></radialGradient>`
    : `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.bg[0]}"/><stop offset="0.5" stop-color="${p.bg[1]}"/><stop offset="1" stop-color="${p.bg[2]}"/></linearGradient>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    ${bg}${irisDefs(c, '', p.radial ? 0.45 : 0)}
    ${whiteDef(p)}
    ${CLIPS}
  </defs>

  <rect id="plate" width="512" height="512" rx="112" fill="url(#bg)"/>

  <g id="art" transform="${ART}">
    <circle cx="${CX}" cy="${CY}" r="190" fill="url(#glow)"/>
    ${crease(p)}
    <path fill="url(#white)" d="${EYE}"/>
    <g clip-path="url(#eye)">${irisLayers(c, '')}
      <circle cx="214" cy="228" r="17" fill="#fff"/>
      <circle cx="258" cy="216" r="7" fill="#fff"/>
      <circle cx="236" cy="252" r="4" fill="#fff"/>
      <ellipse cx="346" cy="340" rx="21" ry="13" fill="#fff" transform="rotate(-22 346 340)"/>
    </g>${lids(p)}
  </g>
</svg>
`;
}

// Живой глаз для шапки сайта: без плашки, блестит и переливается из цветов сайта в голубой.
function drawLogo() {
  const p = PLATE.dark, a = IRIS.site, b = IRIS.blue;
  const star = (x, y, r) => `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="30 100 454 310">
  <style>
    .alt{animation:shift 12s ease-in-out infinite}
    @keyframes shift{0%,36%{opacity:0}48%,86%{opacity:1}98%,100%{opacity:0}}
    .tw{transform-box:fill-box;transform-origin:center;animation:tw 2.4s ease-in-out infinite}
    .tw2{animation-delay:-1.2s}
    @keyframes tw{0%,100%{transform:scale(1)}50%{transform:scale(1.25)}}
    .glint{animation:glint 4s ease-in-out infinite}
    @keyframes glint{0%,52%{transform:translateX(-200px)}86%,100%{transform:translateX(200px)}}
    .sp{opacity:0;transform-box:fill-box;transform-origin:center;animation:sp 4s ease-in-out infinite}
    .sp2{animation-delay:-2s}
    @keyframes sp{0%,58%,100%{opacity:0;transform:scale(.2) rotate(0deg)}76%{opacity:1;transform:scale(1) rotate(45deg)}92%{opacity:0;transform:scale(.3) rotate(90deg)}}
    @media (prefers-reduced-motion:reduce){*{animation:none!important}}
  </style>
  <defs>${irisDefs(a, 'A', 0.5)}${irisDefs(b, 'B', 0.55)}
    ${whiteDef(p)}
    ${CLIPS}
  </defs>

  <g transform="${ART}">
    <circle cx="${CX}" cy="${CY}" r="128" fill="url(#glowA)"/>
    <circle class="alt" cx="${CX}" cy="${CY}" r="128" fill="url(#glowB)"/>
    ${crease(p)}
    <path fill="url(#white)" d="${EYE}"/>
    <g clip-path="url(#eye)">${irisLayers(a, 'A')}
      <g class="alt">${irisLayers(b, 'B')}
      </g>
      <g clip-path="url(#irisClip)"><g class="glint" fill="#fff">
        <path opacity="0.5" d="M262 160L296 160L270 410L236 410Z"/>
        <path opacity="0.3" d="M310 160L320 160L294 410L284 410Z"/>
      </g></g>
      <circle class="tw" cx="214" cy="228" r="17" fill="#fff"/>
      <circle class="tw tw2" cx="258" cy="216" r="7" fill="#fff"/>
      <circle cx="236" cy="252" r="4" fill="#fff"/>
      <ellipse cx="346" cy="340" rx="21" ry="13" fill="#fff" transform="rotate(-22 346 340)"/>
    </g>${lids(p)}
    <path class="sp" fill="#fff" d="${star(424, 158, 30)}"/>
    <path class="sp sp2" fill="#fff" d="${star(124, 356, 22)}"/>
  </g>
</svg>
`;
}

const ROOT = path.join(__dirname, '..');
const VARIANTS = ['dark-site', 'dark-blue', 'skin-site'];
const mode = process.argv[2] || 'dark-site';

function sheet(cells, w, h) {
  const exe = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find(f => fs.existsSync(f));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'animetop-icons-'));
  const page = path.join(tmp, 'page.html');
  fs.writeFileSync(page, `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#0e0d14}svg{display:block}</style>${cells}`);
  execFileSync(exe, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', `--user-data-dir=${path.join(tmp, 'profile')}`,
    `--window-size=${w},${h}`, `--screenshot=${path.join(__dirname, '_preview.png')}`, 'file:///' + page.replace(/\\/g, '/')], { stdio: 'ignore' });
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('preview ok');
}
const uniq = (s, n) => s.replace(/id="(\w+)"/g, 'id="$1-' + n + '"').replace(/url\(#(\w+)\)/g, 'url(#$1-' + n + ')');
const sized = (code, w, h) => code.replace('<svg ', `<svg width="${w}" height="${h}" `);

if (mode === 'compare') {
  const row = n => {
    const s = uniq(draw(n), n);
    const cell = px => `<div style="display:inline-block;margin:12px;vertical-align:bottom">${sized(s, px, px)}</div>`;
    return `<div style="background:#22202c">${cell(300)}${cell(96)}${cell(48)}${cell(30)}${cell(16)}</div>`;
  };
  sheet(VARIANTS.map(row).join(''), 620, VARIANTS.length * 326 + 8);
} else if (mode === 'frames') {
  // Кадры в разные моменты: анимации заморожены на отметке t секунд.
  const frame = t => {
    // Каждый кадр — отдельная картинка: стили внутри SVG иначе общие на всю страницу.
    const s = drawLogo().replace('</style>', `*{animation-play-state:paused!important;animation-delay:-${t}s!important}</style>`);
    const src = 'data:image/svg+xml;base64,' + Buffer.from(s).toString('base64');
    return `<div style="display:inline-block;margin:10px;color:#aaa;font:14px sans-serif"><img src="${src}" width="380" height="260"><div>t = ${t} с</div></div>`;
  };
  sheet([0, 2.9, 3.1, 5, 6.5, 7.05].map(frame).join(''), 820, 890);
} else {
  fs.writeFileSync(path.join(ROOT, 'icon.svg'), draw(mode));
  fs.writeFileSync(path.join(ROOT, 'logo.svg'), drawLogo());
  console.log('icon.svg:', mode, '+ logo.svg');
}
