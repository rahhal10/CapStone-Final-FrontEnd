import { useState, useEffect }  from 'react';
import { Link, useLocation }     from 'react-router-dom';
import Navbar                    from '../../components/layout/Navbar';
import Footer                    from '../../components/layout/Footer';
import { apiEstimate }           from '../../services/authApi';
import styles                    from './ResultsPage.module.css';

/* ── Helpers ──────────────────────────────────────────────────── */
const cap     = (s)  => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const fmtYr   = (yr) => yr?.includes('_') ? yr.replace('_', ' – ') : yr ?? '';
const fmtPrice = (n) =>
  n != null ? `$${Number(n).toFixed(2)}` : '—';

/** Exact model class → user-friendly display name */
const DAMAGE_LABELS = {
  'Front-Windscreen-Damage': 'Front Windscreen',
  'Headlight-Damage':        'Headlight',
  'Rear-windscreen-Damage':  'Rear Windscreen',
  'Sidemirror-Damage':       'Side Mirror',
  'Taillight-Damage':        'Taillight',
  'bonnet-dent':             'Bonnet',
  'boot-dent':               'Boot Lid',
  'doorouter-dent':          'Door (Outer)',
  'fender-dent':             'Fender',
  'front-bumper-dent':       'Front Bumper',
  'quaterpanel-dent':        'Quarter Panel',
  'rear-bumper-dent':        'Rear Bumper',
};
const damageLabel = (cls) =>
  DAMAGE_LABELS[cls] ?? cls.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

/* ── Component ────────────────────────────────────────────────── */
export default function ResultsPage() {
  const location = useLocation();
  const state    = location.state || {};

  const {
    make          = 'Unknown',
    model_name    = 'Unknown',
    year_range    = '',
    damaged_parts = [],
    image_url     = null,
    detections    = [],          // [{ class, confidence, bbox:{x1,y1,x2,y2} }]
  } = state;

  /* ── Price estimation state ─────────────────────────────────── */
  const [parts,   setParts]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  /* ── Image natural size (needed for bbox percentage calc) ────── */
  const [natural, setNatural] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!damaged_parts.length) return;
    setLoading(true);
    setError('');
    apiEstimate({ make, model_name, year_range, damaged_parts })
      .then(setParts)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Totals ─────────────────────────────────────────────────── */
  const totalLowest = parts.reduce((sum, p) => {
    return sum + Math.min(p.original_new, p.original_used, p.aftermarket);
  }, 0);

  const vehicleLabel = [cap(make), cap(model_name), fmtYr(year_range)]
    .filter(Boolean).join(' ');

  /* ── Bbox helper ─────────────────────────────────────────────── */
  function bboxStyle(bbox) {
    if (!natural.w || !natural.h) return {};
    return {
      left:   `${(bbox.x1 / natural.w) * 100}%`,
      top:    `${(bbox.y1 / natural.h) * 100}%`,
      width:  `${((bbox.x2 - bbox.x1) / natural.w) * 100}%`,
      height: `${((bbox.y2 - bbox.y1) / natural.h) * 100}%`,
    };
  }

  const knownDetections   = detections.filter(d => d.class !== 'unknown-damage');
  const unknownDetections = detections.filter(d => d.class === 'unknown-damage');

  return (
    <>
      <Navbar />
      <main className={styles.main}>

        {/* ── Page Header ── */}
        <section className={styles.headerSection}>
          <div className={styles.headerInner}>
            <div className={styles.headerLeft}>
              <p className={styles.eyebrow}>Diagnostic Sequence Finalised</p>
              <h1 className={styles.title}>Analysis Complete</h1>
            </div>
            <div className={styles.carChip}>
              <p className={styles.carChipLabel}>CAR IDENTIFIED</p>
              <p className={styles.carChipValue}>{vehicleLabel}</p>
            </div>
          </div>
        </section>

        {/* ── Canvas / uploaded image + bbox overlays ── */}
        <section className={styles.canvasSection}>
          <div className={styles.canvas}>

            {image_url ? (
              /* ── Real image wrapper: height adapts to image AR ── */
              <div className={styles.imgWrap}>
                <img
                  src={image_url}
                  alt="Scanned vehicle"
                  className={styles.scanImg}
                  onLoad={e => setNatural({
                    w: e.target.naturalWidth,
                    h: e.target.naturalHeight,
                  })}
                />

                {/* ── Gradient overlay (same as before) ── */}
                <div className={styles.canvasOverlay} />

                {/* ── Animated laser ── */}
                <div className={styles.laserLine} />

                {/* ── Classified damage boxes (orange) ── */}
                {natural.w > 0 && knownDetections.map((d, i) => (
                  <div
                    key={i}
                    className={styles.bbox}
                    style={bboxStyle(d.bbox)}
                  >
                    <span className={styles.bboxLabel}>
                      {damageLabel(d.class)}
                    </span>
                    <span className={styles.bboxConf}>
                      {Math.round(d.confidence * 100)}%
                    </span>
                  </div>
                ))}

                {/* ── Unknown-damage boxes (grey/muted) ── */}
                {natural.w > 0 && unknownDetections.map((d, i) => (
                  <div
                    key={`unk-${i}`}
                    className={`${styles.bbox} ${styles.bboxUnknown}`}
                    style={bboxStyle(d.bbox)}
                  >
                    <span className={styles.bboxLabel}>Unclassified</span>
                    <span className={styles.bboxConf}>
                      {Math.round(d.confidence * 100)}%
                    </span>
                  </div>
                ))}

                {/* ── HUD panel ── */}
                <div className={styles.hudPanel}>
                  <p className={styles.hudLabel}>AI SENSOR FEED</p>
                  <p className={styles.hudLog}>
                    [SYS_LOG]: {detections.length} detection
                    {detections.length !== 1 ? 's' : ''} on {vehicleLabel}.
                    {knownDetections.length > 0 &&
                      ` ${knownDetections.length} classified, ${unknownDetections.length} unclassified.`}
                  </p>
                </div>
              </div>

            ) : (
              /* ── No image placeholder ── */
              <div className={styles.canvasPlaceholder}>
                <div className={styles.canvasOverlay} />
                <div className={styles.laserLine} />
                <div className={styles.canvasPlaceholderInner}>
                  <IconCar />
                  <p>No image available</p>
                </div>
                <div className={styles.hudPanel}>
                  <p className={styles.hudLabel}>AI SENSOR FEED</p>
                  <p className={styles.hudLog}>
                    [SYS_LOG]: {damaged_parts.length} damage class
                    {damaged_parts.length !== 1 ? 'es' : ''} queued for price estimation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Recommendations Section ── */}
        <section className={styles.recsSection}>
          <div className={styles.recsContainer}>

            <header className={styles.recsHeader}>
              <h2 className={styles.recsTitle}>Replacement Recommendations</h2>
              <p className={styles.recsSub}>
                Live pricing for <strong>{vehicleLabel}</strong> — three
                sourcing tiers per damaged part.
              </p>
            </header>

            {loading && (
              <div className={styles.stateBox}>
                <span className={styles.spinner} />
                <p className={styles.stateText}>Fetching part prices…</p>
              </div>
            )}

            {error && !loading && (
              <div className={styles.errorBox} role="alert">
                <IconWarning />
                <div>
                  <p className={styles.errorTitle}>Estimation Failed</p>
                  <p className={styles.errorMsg}>{error}</p>
                </div>
                <Link to="/manual-entry" className={styles.retryBtn}>
                  ← Edit Details
                </Link>
              </div>
            )}

            {!loading && !error && damaged_parts.length === 0 && (
              <div className={styles.stateBox}>
                <IconShield />
                <p className={styles.stateText}>No damaged parts were specified.</p>
                <Link to="/manual-entry" className={styles.retryBtn}>← Go Back</Link>
              </div>
            )}

            {!loading && !error && parts.length > 0 && (
              <>
                <div className={styles.tableHead}>
                  <span className={styles.thPart}>Damaged Part</span>
                  <span className={`${styles.thPrice} ${styles.thOrig}`}>
                    <IconVerified /> Original New
                  </span>
                  <span className={`${styles.thPrice} ${styles.thUsed}`}>
                    <IconHistory /> Original Used
                  </span>
                  <span className={`${styles.thPrice} ${styles.thAfter}`}>
                    <IconFactory /> Aftermarket
                  </span>
                </div>

                <div className={styles.tableBody}>
                  {parts.map((p, i) => (
                    <div key={i} className={styles.partRow}>
                      <div className={styles.partName}>
                        <span className={styles.partIndex}>{String(i + 1).padStart(2, '0')}</span>
                        {damageLabel(p.part_name)}
                      </div>
                      <div className={`${styles.priceCell} ${styles.priceCellOrig}`}>
                        <p className={styles.priceTier}>Original New</p>
                        <p className={styles.priceValue}>{fmtPrice(p.original_new)}</p>
                      </div>
                      <div className={`${styles.priceCell} ${styles.priceCellUsed}`}>
                        <p className={styles.priceTier}>Original Used</p>
                        <p className={styles.priceValue}>{fmtPrice(p.original_used)}</p>
                      </div>
                      <div className={`${styles.priceCell} ${styles.priceCellAfter}`}>
                        <p className={styles.priceTier}>Aftermarket</p>
                        <p className={styles.priceValue}>{fmtPrice(p.aftermarket)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.totalBar}>
                  <div className={styles.totalLeft}>
                    <p className={styles.totalLabel}>Minimum Estimated Repair Cost</p>
                    <p className={styles.totalSub}>Using the lowest available tier per part</p>
                  </div>
                  <p className={styles.totalValue}>{fmtPrice(totalLowest)}</p>
                </div>
              </>
            )}

            {!loading && (
              <div className={styles.actions}>
                <Link to="/diagnostic" className={styles.btnPrimary}>
                  <IconScan /> New Scan
                </Link>
                <Link to="/manual-entry" className={styles.btnGhost}>
                  ← Edit Vehicle Details
                </Link>
              </div>
            )}

          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}

/* ── Icons ────────────────────────────────────────────────────── */
function IconVerified() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  );
}
function IconHistory() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
    </svg>
  );
}
function IconFactory() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 20h20v-8l-6-4V4l-4 3-4-3v8L2 12v8z"/>
    </svg>
  );
}
function IconWarning() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function IconScan() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
      <rect x="7" y="7" width="10" height="10" rx="1"/>
    </svg>
  );
}
function IconCar() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-4h12l2 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/>
      <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
    </svg>
  );
}
