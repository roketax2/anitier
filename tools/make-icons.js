// Рисует icon-192.png и icon-512.png (градиент + звезда) без сторонних библиотек.
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const STAR = [[256, 92], [302, 196], [415, 207], [330, 283], [355, 394], [256, 336], [157, 394], [182, 283], [97, 207], [210, 196]];
function inPoly(x, y, pts) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function make(size, file) {
  const S = 4; // сглаживание 4×4
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0;
      for (let sy = 0; sy < S; sy++) for (let sx = 0; sx < S; sx++) {
        const u = ((x + (sx + 0.5) / S) / size) * 512, v = ((y + (sy + 0.5) / S) / size) * 512;
        if (inPoly(u, v, STAR)) { r += 255; g += 255; b += 255; }
        else { const t = (u + v) / 1024; r += 255 + (139 - 255) * t; g += 92 + (123 - 92) * t; b += 138 + (255 - 138) * t; }
      }
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = r / S / S; raw[o + 1] = g / S / S; raw[o + 2] = b / S / S; raw[o + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
  fs.writeFileSync(path.join(__dirname, '..', file), png);
}
make(192, 'icon-192.png');
make(512, 'icon-512.png');
console.log('ok');
