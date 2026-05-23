import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import styles from './ManualEntryPage.module.css';

/* ── AI damage class catalogue (12 YOLO classes — exact model keys) ── */
const ALL_DAMAGE_CLASSES = [
  'Front-Windscreen-Damage',
  'Headlight-Damage',
  'Rear-windscreen-Damage',
  'Sidemirror-Damage',
  'Taillight-Damage',
  'bonnet-dent',
  'boot-dent',
  'doorouter-dent',
  'fender-dent',
  'front-bumper-dent',
  'quaterpanel-dent',
  'rear-bumper-dent',
];

/**
 * Human-readable labels for each damage class.
 * Keys MUST match ALL_DAMAGE_CLASSES exactly.
 * The model always receives the key; the user always sees the label.
 */
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

/** Display label for a damage class — uses DAMAGE_LABELS, falls back gracefully */
const damageLabel = (cls) => DAMAGE_LABELS[cls] ?? cls.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

/* One fixed model per make — must match price_encoders/model.json exactly */
const MODEL_MAP = {
  ford:       'fusion',
  changan:    'estar',
  volkswagen: 'id4',
};

/* Year ranges — must match price_encoders/year_range.json exactly */
const YEAR_RANGES = {
  ford:       ['2010_2012', '2013_2016', '2017', '2018_2020'],
  changan:    ['2020_2026'],
  volkswagen: ['2020_2026'],
};

const fmt = (yr) => yr.includes('_') ? yr.replace('_', ' – ') : yr;
const cap = (s)  => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/* Format a YOLO class name into readable title-case */
const formatName = (cls) =>
  cls
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

/* ── Component ────────────────────────────────────────────────── */
export default function ManualEntryPage() {
  const location = useLocation();
  const navigate  = useNavigate();
  const aiState   = location.state || {};
  const { damage, vehicle } = aiState;

  /* ── Derive locked parts from AI detections ───────────── */
  const detections    = damage?.detections ?? [];
  const knownParts    = detections.filter(d => d.class !== 'unknown-damage'); // full objects
  const knownClasses  = knownParts.map(d => d.class);
  const totalDetected = detections.length;
  const unknownSlots  = totalDetected - knownParts.length;

  /* ── Seed state from AI response ──────────────────────────── */
  const initMake = MODEL_MAP[vehicle?.make] !== undefined
    ? vehicle.make
    : 'ford';

  const initYr = YEAR_RANGES[initMake]?.includes(vehicle?.year_range)
    ? vehicle.year_range
    : YEAR_RANGES[initMake]?.[0] ?? '';

  const [make, setMake]           = useState(initMake);
  const [yearRange, setYearRange] = useState(initYr);
  const [addedParts, setAddedParts] = useState([]);
  const [ddOpen, setDdOpen]       = useState(false);
  const ddRef                     = useRef(null);

  /* ── Derived ──────────────────────────────────────────────── */
  const modelName      = MODEL_MAP[make] ?? make;
  const availableYears = YEAR_RANGES[make] ?? [];
  const allParts       = [...knownClasses, ...addedParts];
  const canAdd         = addedParts.length < unknownSlots;
  const toAdd          = ALL_DAMAGE_CLASSES.filter(c => !allParts.includes(c));
  const supported      = vehicle?.supported_makes ?? Object.keys(MODEL_MAP);
  const remaining      = unknownSlots - addedParts.length;

  /* Reset year when make changes */
  useEffect(() => {
    const ranges = YEAR_RANGES[make] ?? [];
    setYearRange(ranges[0] ?? '');
  }, [make]);

  /* Close dropdown on outside click */
  useEffect(() => {
    const fn = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) setDdOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  function addPart(cls) {
    if (!canAdd) return;
    setAddedParts(p => [...p, cls]);
    setDdOpen(false);
  }

  function removePart(cls) {
    setAddedParts(p => p.filter(x => x !== cls));
  }

  function handleSubmit() {
    navigate('/results', {
      state: {
        make,
        model_name:    modelName,
        year_range:    yearRange,
        damaged_parts: allParts,
        image_url:     aiState.image_url        ?? null,
        history_id:    aiState.history_id       ?? null,
        detections:    aiState.damage?.detections ?? [],   // bbox data for overlay
      },
    });
  }

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <>
      <Navbar />
      <main className={styles.main}>

        <div className={styles.container}>

          {/* ── Page header ── */}
          <header className={styles.header}>
            <div className={styles.identBadge}>
              <span className={styles.identDot} />
              Vehicle Identified
            </div>
            <h1 className={styles.title}>
              Confirm <em>Vehicle Details</em>
            </h1>
            <p className={styles.subtitle}>
              Our AI has analysed your vehicle. Verify the fields below and
              classify any unidentified damage before generating your recommendations.
            </p>
          </header>

          {/* ── Main grid ── */}
          <div className={styles.layout}>

            {/* ─── LEFT: Form ─── */}
            <section className={styles.formPanel}>
              <h2 className={styles.panelTitle}>Specifications</h2>

              {/* Make + Model */}
              <div className={styles.row}>

                {/* Make — editable, limited to supported makes */}
                <div className={styles.field}>
                  <label className={styles.label}>Vehicle Make</label>
                  <div className={styles.selWrap}>
                    <select
                      className={styles.select}
                      value={make}
                      onChange={e => setMake(e.target.value)}
                    >
                      {supported.map(m => (
                        <option key={m} value={m}>{cap(m)}</option>
                      ))}
                    </select>
                    <span className={styles.selArrow} aria-hidden="true"><IconChevron /></span>
                  </div>
                </div>

                {/* Model — read-only, auto-resolved from make */}
                <div className={styles.field}>
                  <label className={styles.label}>Vehicle Model</label>
                  <div className={styles.readOnly}>
                    <span className={styles.readOnlyVal}>{modelName}</span>
                    <span className={styles.lockBadge}><IconLock /> AUTO</span>
                  </div>
                </div>
              </div>

              {/* Year range — dropdown scoped to selected make */}
              <div className={styles.field}>
                <label className={styles.label}>Year Range</label>
                <div className={styles.selWrap}>
                  <select
                    className={styles.select}
                    value={yearRange}
                    onChange={e => setYearRange(e.target.value)}
                  >
                    {availableYears.map(yr => (
                      <option key={yr} value={yr}>{fmt(yr)}</option>
                    ))}
                  </select>
                  <span className={styles.selArrow} aria-hidden="true"><IconChevron /></span>
                </div>
              </div>

              {/* ── Damage parts ── */}
              <div className={styles.field}>
                <label className={styles.label}>
                  Detected Damage
                  {totalDetected > 0 && (
                    <span className={styles.partCount}>{allParts.length} / {totalDetected}</span>
                  )}
                </label>

                {/* Damage list — one row per part */}
                {allParts.length > 0 && (
                  <ul className={styles.damageList}>
                    {knownParts.map(d => (
                      <li key={d.class} className={styles.damageRow} data-source="ai">
                        <span className={styles.damageName}>{damageLabel(d.class)}</span>
                        <span className={styles.damageLock} title="Confirmed by AI"><IconLock /></span>
                      </li>
                    ))}
                    {addedParts.map(p => (
                      <li key={p} className={styles.damageRow} data-source="manual">
                        <span className={styles.damageName}>{damageLabel(p)}</span>
                        <button
                          type="button"
                          className={styles.damageRemove}
                          onClick={() => removePart(p)}
                          aria-label={`Remove ${damageLabel(p)}`}
                        >
                          <IconTrash />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Unknown-damage notice + add button */}
                {unknownSlots > 0 && (
                  <div className={styles.unknownBar}>
                    <div className={styles.unknownInfo}>
                      <IconAlert />
                      <span>
                        {remaining > 0
                          ? `${remaining} unclassified hit${remaining !== 1 ? 's' : ''} — add from list`
                          : 'All unclassified hits identified'}
                      </span>
                    </div>

                    <div className={styles.ddWrap} ref={ddRef}>
                      <button
                        type="button"
                        className={`${styles.addBtn} ${!canAdd ? styles.addBtnDis : ''}`}
                        onClick={() => canAdd && setDdOpen(v => !v)}
                        disabled={!canAdd}
                        aria-expanded={ddOpen}
                        aria-haspopup="listbox"
                      >
                        <IconPlus />
                        {canAdd ? 'Add damage' : 'Limit reached'}
                      </button>

                      {ddOpen && canAdd && (
                        <ul className={styles.ddList} role="listbox" aria-label="Select damage class">
                          {toAdd.length === 0 ? (
                            <li className={styles.ddEmpty}>All classes already added</li>
                          ) : (
                            toAdd.map(cls => (
                              <li key={cls} role="option">
                                <button
                                  type="button"
                                  className={styles.ddItem}
                                  onClick={() => addPart(cls)}
                                >
                                  {damageLabel(cls)}
                                </button>
                              </li>
                            ))
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </section>

            {/* ─── RIGHT: Confidence + OEM ─── */}
            <aside className={styles.aside}>

              {/* AI confidence bars */}
              {vehicle?.confidence && (
                <div className={styles.confCard}>
                  <p className={styles.confTitle}>
                    <IconScan /> Model Confidence
                  </p>
                  {Object.entries(vehicle.confidence).map(([key, val]) => (
                    <div key={key} className={styles.confRow}>
                      <span className={styles.confKey}>{key.replace('_', ' ')}</span>
                      <div className={styles.confTrack}>
                        <div
                          className={styles.confFill}
                          style={{ width: `${Math.min(val, 100)}%` }}
                        />
                      </div>
                      <span className={styles.confVal}>{val.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              )}

              {/* OEM verified info card */}
              <div className={styles.oemCard}>
                <span className={styles.oemIcon}><IconVerified /></span>
                <div>
                  <p className={styles.oemTitle}>OEM Verified Parts</p>
                  <p className={styles.oemText}>
                    Every recommendation is matched to your vehicle's exact factory build sheet.
                  </p>
                </div>
              </div>

            </aside>
          </div>

          {/* ── Action buttons ── */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleSubmit}
            >
              Get Recommendations
            </button>
            <Link to="/diagnostic" className={styles.btnGhost}>
              Return to Scanner
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}

/* ── Icons ────────────────────────────────────────────────────── */
function IconChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}
function IconLock() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}
function IconAlert() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}
function IconScan() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
      <rect x="7" y="7" width="10" height="10" rx="1"/>
    </svg>
  );
}
function IconVerified() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  );
}
function IconTrash() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}
