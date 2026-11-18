// Выложить сайт на Cloudflare Pages (anitierapp.pages.dev), 2026-11-18.
// Берёт только файлы сайта из git (без worker/, tools/ и служебных), копирует во временную папку и отдаёт wrangler.
// Запуск: node tools/pages-deploy.js
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WRANGLER = 'C:/Users/Ivan/StalZone Calc/workers/presence/node_modules/.bin/wrangler';
const SKIP = /^(worker\/|tools\/|\.gitignore$|README\.md$|\.claude\/)/;

const files = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter((f) => f && !SKIP.test(f));
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'anitier-pages-'));
for (const f of files) {
  const to = path.join(out, f);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(path.join(ROOT, f), to);
}
console.log(`файлов: ${files.length} → ${out}`);
execFileSync(`"${WRANGLER}"`, ['pages', 'deploy', `"${out}"`, '--project-name', 'anitierapp', '--branch', 'master', '--commit-dirty=true'], { cwd: ROOT, stdio: 'inherit', shell: true });
fs.rmSync(out, { recursive: true, force: true });
