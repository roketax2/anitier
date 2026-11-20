// Сливает результаты yt-batch.json в AnimeTop/ost-yt.js и поднимает версию кэша sw.js
const fs = require('fs'); const R = 'C:/Users/Ivan/AnimeTop/';
const window = {}; eval(fs.readFileSync(R + 'ost-yt.js', 'utf8'));
const data = window.OS_YT, add = JSON.parse(fs.readFileSync(__dirname + '/yt-batch.json', 'utf8')).res;
let n = 0; for (const [k, v] of Object.entries(add)) if (!data[k]) { data[k] = v; n++; }
const head = fs.readFileSync(R + 'ost-yt.js', 'utf8').split('window.OS_YT =')[0];
fs.writeFileSync(R + 'ost-yt.js', head + 'window.OS_YT = {\n' + Object.entries(data).map(([k, v]) => JSON.stringify(k) + ':' + JSON.stringify(v)).join(',\n') + '\n};\n');
let sw = fs.readFileSync(R + 'sw.js', 'utf8'); const m = sw.match(/animetop-v(\d+)/); sw = sw.replace(m[0], 'animetop-v' + (+m[1] + 1)); fs.writeFileSync(R + 'sw.js', sw);
console.log('добавлено альбомов', n, 'всего', Object.keys(data).length, 'треков', Object.values(data).reduce((a, x) => a + Object.keys(x.v).length, 0), 'кэш v' + (+m[1] + 1), 'размер КБ', Math.round(fs.statSync(R + 'ost-yt.js').size / 1024));
