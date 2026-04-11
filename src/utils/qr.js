const QR_SIZE = 29;

function createMatrix(size = QR_SIZE, fill = 0) {
  return Array.from({ length: size }, () => Array(size).fill(fill));
}

function setCell(matrix, reserved, x, y, value) {
  if (y < 0 || y >= matrix.length || x < 0 || x >= matrix.length) return;
  matrix[y][x] = value;
  reserved[y][x] = true;
}

function drawFinder(matrix, reserved, startX, startY) {
  for (let y = 0; y < 7; y += 1) {
    for (let x = 0; x < 7; x += 1) {
      const edge = x === 0 || x === 6 || y === 0 || y === 6;
      const center = x >= 2 && x <= 4 && y >= 2 && y <= 4;
      setCell(matrix, reserved, startX + x, startY + y, edge || center ? 1 : 0);
    }
  }

  for (let y = -1; y <= 7; y += 1) {
    for (let x = -1; x <= 7; x += 1) {
      const globalX = startX + x;
      const globalY = startY + y;
      if (globalX < 0 || globalY < 0 || globalX >= matrix.length || globalY >= matrix.length) continue;
      if (x >= 0 && x <= 6 && y >= 0 && y <= 6) continue;
      reserved[globalY][globalX] = true;
      matrix[globalY][globalX] = 0;
    }
  }
}

export function generateQrMatrix(value = 'KFUPM') {
  const matrix = createMatrix();
  const reserved = createMatrix(QR_SIZE, false);

  drawFinder(matrix, reserved, 0, 0);
  drawFinder(matrix, reserved, QR_SIZE - 7, 0);
  drawFinder(matrix, reserved, 0, QR_SIZE - 7);

  for (let i = 8; i < QR_SIZE - 8; i += 1) {
    const bit = i % 2 === 0 ? 1 : 0;
    setCell(matrix, reserved, 6, i, bit);
    setCell(matrix, reserved, i, 6, bit);
  }

  setCell(matrix, reserved, QR_SIZE - 8, 8, 1);

  const seed = value.split('').reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0) || 1;

  for (let y = 0; y < QR_SIZE; y += 1) {
    for (let x = 0; x < QR_SIZE; x += 1) {
      if (reserved[y][x]) continue;
      const bit = ((x * 17 + y * 31 + seed + (x ^ y) * 7) % 11) < 5 ? 1 : 0;
      matrix[y][x] = bit;
    }
  }

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
        `<rect x="${padding + x * moduleSize}" y="${padding + y * moduleSize}" width="${moduleSize}" height="${moduleSize}" rx="1.4" ry="1.4" />`
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
