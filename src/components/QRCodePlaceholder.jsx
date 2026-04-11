import { qrSvgMarkup } from '../utils/qr';

export default function QRCodePlaceholder({ value = 'KFUPM', size = 340, className = '' }) {
  return (
    <div
      className={`qr-box ${className}`.trim()}
      aria-label="QR code"
      dangerouslySetInnerHTML={{ __html: qrSvgMarkup(value, { moduleSize: Math.max(Math.round(size / 40), 8), padding: 18 }) }}
    />
  );
}
