import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height) {
  // Minimal PNG generator using zlib
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(6, 9); // color type 6: RGBA
  ihdr.writeUInt8(0, 10); // compression 0
  ihdr.writeUInt8(0, 11); // filter 0
  ihdr.writeUInt8(0, 12); // interlace 0

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    
    // CRC calculation
    let crc = -1;
    for (let i = 0; i < typeBuf.length; i++) {
      crc = updateCrc(crc, typeBuf[i]);
    }
    for (let i = 0; i < data.length; i++) {
      crc = updateCrc(crc, data[i]);
    }
    crcBuf.writeInt32BE(crc ^ -1, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // Precompute CRC table
  const crcTable = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }
  function updateCrc(crc, byte) {
    return crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  // Raw pixel data: each scanline starts with filter byte 0
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * scanlineLength);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.45;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter type None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Gradient background (Deep Slate to Midnight)
      const grad = y / height;
      let r = Math.floor(15 + grad * (2 - 15));
      let g = Math.floor(23 + grad * (6 - 23));
      let b = Math.floor(42 + grad * (23 - 42));
      let a = 255;

      // Microphone icon representation (Cyan & Emerald glow)
      if (Math.abs(dx) < width * 0.12 && y > height * 0.28 && y < height * 0.58) {
        // Mic capsule
        r = 6;
        g = 182;
        b = 212;
      } else if (dist < radius * 0.75 && dist > radius * 0.70) {
        // Outer sound ring
        r = 16;
        g = 185;
        b = 129;
      } else if (Math.abs(dx) < width * 0.22 && Math.abs(y - height * 0.58) < width * 0.02) {
        // Cradle arc base
        r = 248;
        g = 250;
        b = 252;
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const ihdrChunk = chunk('IHDR', ihdr);
  const idatChunk = chunk('IDAT', compressed);
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

if (!fs.existsSync('public')) fs.mkdirSync('public');

fs.writeFileSync('public/pwa-192x192.png', createPng(192, 192));
fs.writeFileSync('public/pwa-512x512.png', createPng(512, 512));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPng(512, 512));
fs.writeFileSync('public/apple-touch-icon.png', createPng(180, 180));
console.log('Successfully generated compliant PNG icons in /public!');
