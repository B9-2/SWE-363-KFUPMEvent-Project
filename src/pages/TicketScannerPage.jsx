import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDate, formatTime } from '../utils/helpers';

const extractTicketCode = (value) => {
  const text = String(value || '').trim();
  const match = text.match(/TKT-[A-Z0-9-]+/i);
  return (match?.[0] || text).toUpperCase();
};

export default function TicketScannerPage() {
  const { eventId } = useParams();
  const {
    bookings,
    currentUser,
    events,
    organizerEvents,
    scanTicket,
    users
  } = useApp();
  const { eventText, language, t } = useLanguage();
  const videoRef = useRef(null);
  const detectorRef = useRef(null);
  const intervalRef = useRef(null);
  const streamRef = useRef(null);
  const lastScanRef = useRef({ code: '', time: 0 });

  const availableEvents = useMemo(() => {
    if (currentUser?.role === 'admin') return events;
    return organizerEvents;
  }, [currentUser, events, organizerEvents]);

  const initialEventId = availableEvents.some((event) => event.id === eventId) ? eventId : 'all';
  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);

  const scopedEventId = selectedEventId === 'all' ? '' : selectedEventId;
  const selectedEvent = events.find((event) => event.id === selectedEventId);
  const eligibleBookings = useMemo(() => {
    const allowedEventIds = new Set(availableEvents.map((event) => event.id));
    return bookings
      .filter((booking) => booking.status === 'confirmed' && allowedEventIds.has(booking.eventId))
      .filter((booking) => !scopedEventId || booking.eventId === scopedEventId)
      .slice(0, 5);
  }, [availableEvents, bookings, scopedEventId]);

  const stopCamera = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  useEffect(() => stopCamera, []);

  const pushRecentScan = (result) => {
    setRecentScans((prev) => [result, ...prev].slice(0, 6));
  };

  const handleScanValue = (value, source = 'manual') => {
    const code = extractTicketCode(value);
    const now = Date.now();

    if (!code) {
      const result = { ok: false, reason: 'empty', code, source, scannedAt: new Date().toISOString() };
      setScanResult(result);
      pushRecentScan(result);
      return;
    }

    if (source === 'camera' && lastScanRef.current.code === code && now - lastScanRef.current.time < 2500) return;
    lastScanRef.current = { code, time: now };

    const result = {
      ...scanTicket(code, scopedEventId),
      code,
      source,
      scannedAt: new Date().toISOString()
    };

    setScanResult(result);
    pushRecentScan(result);
    setManualCode('');
  };

  const detectFromCamera = async () => {
    if (!detectorRef.current || !videoRef.current || videoRef.current.readyState < 2) return;

    try {
      const codes = await detectorRef.current.detect(videoRef.current);
      const rawValue = codes[0]?.rawValue;
      if (rawValue) handleScanValue(rawValue, 'camera');
    } catch {
      setCameraError(t('scannerCameraReadError'));
      stopCamera();
    }
  };

  const startCamera = async () => {
    setCameraError('');

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(t('cameraNotSupported'));
      return;
    }

    if (!window.BarcodeDetector) {
      setCameraError(t('barcodeNotSupported'));
      return;
    }

    try {
      const Detector = window.BarcodeDetector;
      const supportedFormats = Detector.getSupportedFormats ? await Detector.getSupportedFormats() : [];
      const preferredFormats = ['qr_code', 'code_128', 'data_matrix'].filter((format) => supportedFormats.includes(format));
      detectorRef.current = preferredFormats.length ? new Detector({ formats: preferredFormats }) : new Detector();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraActive(true);
      intervalRef.current = window.setInterval(detectFromCamera, 650);
    } catch {
      setCameraError(t('cameraPermissionDenied'));
      stopCamera();
    }
  };

  const resultTone = scanResult?.checkedInNow ? 'success' : scanResult?.ok ? 'info' : 'danger';
  const resultTitle = getResultTitle(scanResult, t);

  return (
    <section className="shell page-section">
      <div className="scanner-page-head split-heading">
        <div>
          <h1>{t('ticketScanner')}</h1>
          <p className="muted strong">{t('ticketScannerSubtitle')}</p>
        </div>
        <Link className="btn btn-outline" to="/organizer/dashboard">
          {t('dashboard')}
        </Link>
      </div>

      <div className="scanner-layout">
        <div className="card scanner-panel">
          <label className="scanner-event-select">
            {t('scannerEvent')}
            <select value={selectedEventId} onChange={(event) => setSelectedEventId(event.target.value)}>
              <option value="all">{currentUser?.role === 'admin' ? t('allManagedEvents') : t('allOrganizerEvents')}</option>
              {availableEvents.map((event) => (
                <option key={event.id} value={event.id}>{eventText(event, 'title')}</option>
              ))}
            </select>
          </label>

          <div className={`scanner-camera ${cameraActive ? 'active' : ''}`}>
            <video ref={videoRef} muted playsInline />
            {!cameraActive && (
              <div className="scanner-camera-placeholder">
                <span />
                <strong>{t('scanReady')}</strong>
                <p>{t('scanReadyHint')}</p>
              </div>
            )}
            <div className="scanner-target-frame" aria-hidden="true" />
          </div>

          <div className="scanner-actions">
            <button className="btn btn-primary" type="button" onClick={startCamera} disabled={cameraActive}>
              {t('startCamera')}
            </button>
            <button className="btn btn-outline" type="button" onClick={stopCamera} disabled={!cameraActive}>
              {t('stopCamera')}
            </button>
          </div>

          {cameraError && <div className="alert alert-danger">{cameraError}</div>}

          <form className="scanner-manual" onSubmit={(event) => {
            event.preventDefault();
            handleScanValue(manualCode, 'manual');
          }}>
            <label>
              {t('manualTicketCode')}
              <input
                value={manualCode}
                onChange={(event) => setManualCode(event.target.value)}
                placeholder={t('manualTicketPlaceholder')}
              />
            </label>
            <button className="btn btn-primary" type="submit">
              {t('verifyAndCheckIn')}
            </button>
          </form>

          {eligibleBookings.length > 0 && (
            <div className="scanner-demo-codes">
              <span>{t('demoTicketCodes')}</span>
              <div>
                {eligibleBookings.map((booking) => (
                  <button key={booking.id} type="button" onClick={() => setManualCode(booking.ticketCode)}>
                    {booking.ticketCode}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="card scanner-result-panel">
          <div className={`scanner-result scanner-result-${resultTone}`}>
            <span>{scanResult ? resultTitle : t('waitingForScan')}</span>
            <strong>{scanResult?.code || '--'}</strong>
            {scanResult && <p>{getReasonText(scanResult, t)}</p>}
          </div>

          {scanResult?.booking && (
            <TicketScanDetails
              booking={scanResult.booking}
              event={scanResult.event || selectedEvent}
              attendee={scanResult.attendee || users.find((user) => user.id === scanResult.booking.userId)}
              eventText={eventText}
              language={language}
              t={t}
            />
          )}

          <div className="recent-scans">
            <h3>{t('recentScans')}</h3>
            {recentScans.length === 0 ? (
              <p className="muted">{t('noScansYet')}</p>
            ) : (
              <ul>
                {recentScans.map((item) => (
                  <li key={`${item.code}-${item.scannedAt}`}>
                    <span className={`scan-dot ${item.checkedInNow ? 'success' : item.ok ? 'info' : 'danger'}`} />
                    <div>
                      <strong>{item.code || t('emptyTicketCode')}</strong>
                      <small>{getReasonText(item, t)}</small>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function TicketScanDetails({ booking, event, attendee, eventText, language, t }) {
  if (!event) return null;

  return (
    <div className="scanner-ticket-details">
      <h3>{t('ticketDetails')}</h3>
      <dl>
        <div>
          <dt>{t('attendee')}</dt>
          <dd>{attendee?.name || '-'}</dd>
        </div>
        <div>
          <dt>{t('event')}</dt>
          <dd>{eventText(event, 'title')}</dd>
        </div>
        <div>
          <dt>{t('date')}</dt>
          <dd>{formatDate(event.date, language)} {t('at')} {formatTime(event.time, language)}</dd>
        </div>
        <div>
          <dt>{t('ticket')}</dt>
          <dd>{booking.quantity} {booking.quantity > 1 ? t('tickets') : t('ticket')}</dd>
        </div>
        <div>
          <dt>{t('status')}</dt>
          <dd>{booking.checkedIn ? t('checkedIn') : t('notIn')}</dd>
        </div>
      </dl>
    </div>
  );
}

function getResultTitle(result, t) {
  if (!result) return t('scanTicket');
  if (result.checkedInNow) return t('checkedInNow');
  if (result.reason === 'alreadyCheckedIn') return t('alreadyCheckedIn');
  if (result.ok) return t('validTicket');
  return t('invalidTicket');
}

function getReasonText(result, t) {
  const messages = {
    empty: t('emptyTicketCode'),
    notFound: t('ticketNotFoundScan'),
    eventMissing: t('eventNotFound'),
    notAllowed: t('ticketNotAllowed'),
    wrongEvent: t('wrongEventTicket'),
    cancelled: t('cancelledTicketScan'),
    alreadyCheckedIn: t('ticketAlreadyCheckedIn'),
    manual: t('scanSourceManual'),
    camera: t('scanSourceCamera')
  };

  if (result?.checkedInNow) return t('checkedInSuccess');
  if (result?.ok) return result.source === 'camera' ? t('scanSourceCamera') : t('scanSourceManual');
  return messages[result?.reason] || t('ticketScanInvalid');
}
