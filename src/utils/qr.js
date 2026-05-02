const QR_VERSION = 4;
const QR_SIZE = 21 + (QR_VERSION - 1) * 4;
const DATA_CODEWORDS = 80;
const EC_CODEWORDS = 20;
const FORMAT_MASK = 0x5412;
const FORMAT_GENERATOR = 0x537;

const createMatrix = (size = QR_SIZE, fill = 0) => Array.from({ length: size }, () => Array(size).fill(fill));

const EXP = Array(512).fill(0);
const LOG = Array(256).fill(0);

let gfValue = 1;
for (let i = 0; i < 255; i += 1) {
  EXP[i] = gfValue;
  LOG[gfValue] = i;
  gfValue <<= 1;
  if (gfValue & 0x100) gfValue ^= 0x11d;
}
for (let i = 255; i < EXP.length; i += 1) {
  EXP[i] = EXP[i - 255];
}

const gfMultiply = (a, b) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);

const appendBits = (bits, value, length) => {
  for (let i = length - 1; i >= 0; i -= 1) {
    bits.push((value >>> i) & 1);
  }
};

const reedSolomonGenerator = (degree) => {
  let result = [1];
  for (let i = 0; i < degree; i += 1) {
    const next = Array(result.length + 1).fill(0);
    result.forEach((coefficient, index) => {
      next[index] ^= coefficient;
      next[index + 1] ^= gfMultiply(coefficient, EXP[i]);
    });
    result = next;
  }
  return result;
};

const reedSolomonRemainder = (data) => {
  const generator = reedSolomonGenerator(EC_CODEWORDS);
  const result = Array(EC_CODEWORDS).fill(0);

  data.forEach((byte) => {
    const factor = byte ^ result.shift();
    result.push(0);
    for (let i = 0; i < result.length; i += 1) {
      result[i] ^= gfMultiply(generator[i + 1], factor);
    }
  });

  return result;
};

const encodeCodewords = (value) => {
  const bytes = Array.from(new TextEncoder().encode(String(value))).slice(0, 78);
  const bits = [];
  appendBits(bits, 0b0100, 4);
  appendBits(bits, bytes.length, 8);
  bytes.forEach((byte) => appendBits(bits, byte, 8));

  const capacity = DATA_CODEWORDS * 8;
  appendBits(bits, 0, Math.min(4, capacity - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);

  const data = [];
  for (let i = 0; i < bits.length; i += 8) {
    data.push(bits.slice(i, i + 8).reduce((sum, bit) => (sum << 1) | bit, 0));
  }

  for (let pad = 0; data.length < DATA_CODEWORDS; pad += 1) {
    data.push(pad % 2 === 0 ? 0xec : 0x11);
  }

  return [...data, ...reedSolomonRemainder(data)];
};

const setFunctionModule = (matrix, reserved, x, y, value) => {
  if (x < 0 || y < 0 || x >= matrix.length || y >= matrix.length) return;
  matrix[y][x] = value ? 1 : 0;
  reserved[y][x] = true;
};

const drawFinder = (matrix, reserved, x, y) => {
  for (let dy = -1; dy <= 7; dy += 1) {
    for (let dx = -1; dx <= 7; dx += 1) {
      const xx = x + dx;
      const yy = y + dy;
      const inFinder = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6;
      const edge = dx === 0 || dx === 6 || dy === 0 || dy === 6;
      const center = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
      setFunctionModule(matrix, reserved, xx, yy, inFinder && (edge || center));
    }
  }
};

const drawAlignment = (matrix, reserved, centerX, centerY) => {
  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      setFunctionModule(matrix, reserved, centerX + dx, centerY + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  }
};

const drawTiming = (matrix, reserved) => {
  for (let i = 8; i < QR_SIZE - 8; i += 1) {
    setFunctionModule(matrix, reserved, 6, i, i % 2 === 0);
    setFunctionModule(matrix, reserved, i, 6, i % 2 === 0);
  }
};

const getFormatBits = () => {
  const data = 1 << 3;
  let remainder = data;
  for (let i = 0; i < 10; i += 1) {
    remainder = (remainder << 1) ^ (((remainder >>> 9) & 1) ? FORMAT_GENERATOR : 0);
  }
  return ((data << 10) | remainder) ^ FORMAT_MASK;
};

const drawFormatBits = (matrix, reserved) => {
  const bits = getFormatBits();
  const bit = (index) => ((bits >>> index) & 1) !== 0;

  for (let i = 0; i <= 5; i += 1) setFunctionModule(matrix, reserved, 8, i, bit(i));
  setFunctionModule(matrix, reserved, 8, 7, bit(6));
  setFunctionModule(matrix, reserved, 8, 8, bit(7));
  setFunctionModule(matrix, reserved, 7, 8, bit(8));
  for (let i = 9; i < 15; i += 1) setFunctionModule(matrix, reserved, 14 - i, 8, bit(i));

  for (let i = 0; i < 8; i += 1) setFunctionModule(matrix, reserved, QR_SIZE - 1 - i, 8, bit(i));
  for (let i = 8; i < 15; i += 1) setFunctionModule(matrix, reserved, 8, QR_SIZE - 15 + i, bit(i));
  setFunctionModule(matrix, reserved, 8, QR_SIZE - 8, true);
};

const placeData = (matrix, reserved, codewords) => {
  const bits = [];
  codewords.forEach((codeword) => appendBits(bits, codeword, 8));

  let bitIndex = 0;
  let upward = true;

  for (let right = QR_SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right -= 1;

    for (let vertical = 0; vertical < QR_SIZE; vertical += 1) {
      const y = upward ? QR_SIZE - 1 - vertical : vertical;

      for (let offset = 0; offset < 2; offset += 1) {
        const x = right - offset;
        if (reserved[y][x]) continue;

        let value = bits[bitIndex] || 0;
        bitIndex += 1;
        if ((x + y) % 2 === 0) value ^= 1;
        matrix[y][x] = value;
      }
    }

    upward = !upward;
  }
};

export function generateQrMatrix(value = 'KFUPM') {
  const matrix = createMatrix();
  const reserved = createMatrix(QR_SIZE, false);

  drawFinder(matrix, reserved, 0, 0);
  drawFinder(matrix, reserved, QR_SIZE - 7, 0);
  drawFinder(matrix, reserved, 0, QR_SIZE - 7);
  drawAlignment(matrix, reserved, 26, 26);
  drawTiming(matrix, reserved);
  drawFormatBits(matrix, reserved);
  placeData(matrix, reserved, encodeCodewords(value));
  drawFormatBits(matrix, reserved);

  return matrix;
}

export function qrSvgMarkup(value, options = {}) {
  const matrix = generateQrMatrix(value);
  const moduleSize = options.moduleSize || 10;
  const padding = options.padding || 18;
  const size = matrix.length * moduleSize + padding * 2;

  const rects = [];
  for (let y = 0; y < matrix.length; y += 1) {
    for (let x = 0; x < matrix.length; x += 1) {
      if (!matrix[y][x]) continue;
      rects.push(
        `<rect x="${padding + x * moduleSize}" y="${padding + y * moduleSize}" width="${moduleSize}" height="${moduleSize}" rx="1.2" ry="1.2" />`
      );
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="QR code">
      <rect width="100%" height="100%" fill="#ffffff" rx="22" ry="22"/>
      <g fill="#000000">${rects.join('')}</g>
    </svg>
  `.trim();
}

export function qrDataUri(value, options = {}) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvgMarkup(value, options))}`;
}
