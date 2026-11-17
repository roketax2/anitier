// Делает PNG-иконки из icon.svg через Edge/Chrome без окна (сторонних библиотек не нужно).
//   node tools/make-icons.js            — icon-192.png, icon-512.png, icon-maskable-512.png
//   node tools/make-icons.js preview    — ещё и лист-превью в tools/_preview.png (в git не идёт)
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BROWSERS = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
];
const exe = BROWSERS.find(p => fs.existsSync(p));
if (!exe) { console.error('Не найден Edge или Chrome'); process.exit(1); }

const svg = fs.readFileSync(path.join(ROOT, 'icon.svg'), 'utf8');
// Для PNG фон на весь квадрат: углы скругляет сама система.
const square = svg.replace('rx="112"', 'rx="0"');
// «Маскируемая» иконка: рисунок меньше, чтобы его не обрезал круг на Android.
const maskable = square.replace('<g id="art"', '<g transform="translate(256 256) scale(0.82) translate(-256 -256)"><g id="art"').replace('</svg>', '</g></svg>');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'animetop-icons-'));
function shot(html, w, h, out) {
  const page = path.join(tmp, 'page.html');
  fs.writeFileSync(page, `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;overflow:hidden;background:#0e0d14}svg{display:block}</style>${html}`);
  execFileSync(exe, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    `--user-data-dir=${path.join(tmp, 'profile')}`, `--window-size=${w},${h}`, `--screenshot=${out}`,
    'file:///' + page.replace(/\\/g, '/')], { stdio: 'ignore' });
}
const sized = (code, px) => code.replace('<svg ', `<svg width="${px}" height="${px}" `);

shot(sized(square, 192), 192, 192, path.join(ROOT, 'icon-192.png'));
shot(sized(square, 512), 512, 512, path.join(ROOT, 'icon-512.png'));
shot(sized(maskable, 512), 512, 512, path.join(ROOT, 'icon-maskable-512.png'));

if (process.argv[2] === 'preview') {
  const cell = (code, px, extra = '') => `<div style="display:inline-block;margin:16px;vertical-align:bottom;${extra}">${sized(code, px)}</div>`;
  const round = 'border-radius:50%;overflow:hidden;';
  shot(`<div style="background:#22202c;padding:8px">${cell(svg, 320)}${cell(svg, 96)}${cell(svg, 48)}${cell(svg, 30)}${cell(svg, 16)}${cell(maskable, 160, round)}</div>`,
    900, 380, path.join(__dirname, '_preview.png'));
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log('ok');
