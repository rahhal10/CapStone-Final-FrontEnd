import { useState, useEffect } from 'react';
import { Link }                from 'react-router-dom';
import Navbar                  from '../../components/layout/Navbar';
import Footer                  from '../../components/layout/Footer';
import { useAuth }             from '../../context/AuthContext';
import { apiGetHistory }       from '../../services/authApi';
import styles                  from './HistoryPage.module.css';

/* ── Helpers ─────────────────────────────────────────────────────── */
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

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

function statusColor(status) {
  if (status === 'damage_detected') return 'detected';
  if (status === 'no_damage')       return 'clean';
  return 'pending';
}
function statusLabel(status) {
  if (status === 'damage_detected') return 'Damage Detected';
  if (status === 'no_damage')       return 'No Damage';
  return status.replace(/_/g, ' ');
}

/* ── Component ───────────────────────────────────────────────────── */
export default function HistoryPage() {
  const { user, token } = useAuth();

  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState('');
  const [search,  setSearch]    = useState('');
  const [selected, setSelected] = useState(null); // full-screen report entry
  const [page,     setPage]     = useState(1);
  const PER_PAGE = 5;

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    apiGetHistory(token)
      .then(rows => setHistory(rows))
      .catch(err  => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  /* ── Derived ──────────────────────────────────────────────────── */
  const displayName = user?.username ?? user?.email ?? 'User';
  const initial     = displayName[0]?.toUpperCase() ?? '?';

  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const fmtYr = (yr) => yr?.includes('_') ? yr.replace('_', ' – ') : yr ?? '';
  const fmtPrice = (n) => n != null ? `$${Number(n).toFixed(2)}` : '—';

  const filtered = history.filter(h => {
    if (!search) return true;
    const q = search.toLowerCase();
    const parts = Array.isArray(h.damaged_parts) ? h.damaged_parts : [];
    return (
      h.make?.toLowerCase().includes(q) ||
      h.model?.toLowerCase().includes(q) ||
      h.status?.toLowerCase().includes(q) ||
      parts.some(p => damageLabel(p).toLowerCase().includes(q)) ||
      fmtDate(h.created_at).toLowerCase().includes(q)
    );
  });

  const totalDamages = history.reduce((s, h) => {
    const parts = Array.isArray(h.damaged_parts) ? h.damaged_parts : [];
    return s + parts.length;
  }, 0);

  // Reset to page 1 whenever the search query changes
  useEffect(() => { setPage(1); }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  /* ── Report modal ─────────────────────────────────────────────── */
  if (selected) {
    return <ReportModal entry={selected} onClose={() => setSelected(null)} />;
  }

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.layout}>

          {/* ── LEFT: User profile card ── */}
          <aside className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.profileAvatar}>{initial}</div>
              <div>
                <p className={styles.profileName}>{displayName}</p>
                <p className={styles.profileRole}>Diagnostic User</p>
              </div>
            </div>

            <div className={styles.profileFields}>
              <div className={styles.profileField}>
                <label className={styles.profileFieldLabel}>Full Name</label>
                <div className={styles.profileFieldValue}>
                  {user?.full_name ?? displayName}
                </div>
              </div>
              <div className={styles.profileField}>
                <label className={styles.profileFieldLabel}>Email Address</label>
                <div className={styles.profileFieldValue}>
                  {user?.email ?? '—'}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className={styles.profileStats}>
              <div className={styles.profileStat}>
                <p className={styles.profileStatVal}>{history.length}</p>
                <p className={styles.profileStatLabel}>Total Scans</p>
              </div>
              <div className={styles.profileStat}>
                <p className={styles.profileStatVal}>{totalDamages}</p>
                <p className={styles.profileStatLabel}>Damages Found</p>
              </div>
            </div>

            <Link to="/diagnostic" className={styles.newScanBtn}>
              <IconScan /> New Scan
            </Link>
          </aside>

          {/* ── RIGHT: History list ── */}
          <section className={styles.historyPanel}>

            {/* Panel header */}
            <div className={styles.panelHeader}>
              <div className={styles.panelHeaderLeft}>
                <IconHistory />
                <h1 className={styles.panelTitle}>Scan History</h1>
              </div>

              {/* Search */}
              <div className={styles.searchWrap}>
                <IconSearch />
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search by damage or date…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  aria-label="Search history"
                />
                {search && (
                  <button className={styles.searchClear} onClick={() => setSearch('')} aria-label="Clear">
                    <IconX />
                  </button>
                )}
              </div>
            </div>

            {/* States */}
            {loading && (
              <div className={styles.stateBox}>
                <span className={styles.spinner} />
                <p className={styles.stateText}>Loading your scan history…</p>
              </div>
            )}

            {error && !loading && (
              <div className={styles.errorBox} role="alert">
                <IconWarning />
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && history.length === 0 && (
              <div className={styles.stateBox}>
                <IconClock />
                <p className={styles.stateTitle}>No scans yet</p>
                <p className={styles.stateText}>Run your first diagnostic to see it here.</p>
                <Link to="/diagnostic" className={styles.emptyBtn}><IconScan /> Start a Scan</Link>
              </div>
            )}

            {!loading && !error && history.length > 0 && filtered.length === 0 && (
              <div className={styles.stateBox}>
                <p className={styles.stateTitle}>No results</p>
                <p className={styles.stateText}>Try a different search term.</p>
              </div>
            )}

            {/* Entry list */}
            <div className={styles.entryList}>
              {paginated.map(entry => {
                const dets         = Array.isArray(entry.detections)    ? entry.detections    : [];
                const knownParts   = Array.isArray(entry.damaged_parts) ? entry.damaged_parts : [];
                const unknown      = dets.filter(d => d.class === 'unknown-damage');
                const vehicleName  = [cap(entry.make), cap(entry.model), fmtYr(entry.year_range)].filter(Boolean).join(' ');
                const minEstimate  = entry.pricing?.totals
                  ? Math.min(entry.pricing.totals.original_new, entry.pricing.totals.original_used, entry.pricing.totals.aftermarket)
                  : null;

                return (
                  <div key={entry.id} className={styles.entryCard}>

                    {/* Thumbnail */}
                    <div className={styles.entryThumb}>
                      <img
                        src={entry.image_url}
                        alt="Scanned vehicle"
                        className={styles.entryImg}
                        loading="lazy"
                      />
                    </div>

                    {/* Info */}
                    <div className={styles.entryInfo}>
                      <div className={styles.entryTopRow}>
                        <span className={`${styles.statusBadge} ${styles[`status--${statusColor(entry.status)}`]}`}>
                          {statusLabel(entry.status)}
                        </span>
                        {entry.estimate_status === 'completed' && (
                          <span className={styles.estimatedBadge}>Estimated</span>
                        )}
                      </div>

                      {vehicleName && (
                        <p className={styles.entryVehicle}>{vehicleName}</p>
                      )}

                      <div className={styles.entryMeta}>
                        <span className={styles.entryMetaItem}>
                          <IconClock /> {fmtDate(entry.created_at)} · {fmtTime(entry.created_at)}
                        </span>
                        <span className={styles.entryMetaItem}>
                          <IconDamage /> {knownParts.length} damage{knownParts.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Damage tags */}
                      {knownParts.length > 0 && (
                        <div className={styles.entryTags}>
                          {knownParts.slice(0, 3).map((p, i) => (
                            <span key={i} className={styles.entryTag}>{damageLabel(p)}</span>
                          ))}
                          {knownParts.length > 3 && (
                            <span className={styles.entryTagMore}>+{knownParts.length - 3}</span>
                          )}
                          {unknown.length > 0 && (
                            <span className={styles.entryTagUnknown}>{unknown.length} unclassified</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Min estimate + View Report */}
                    <div className={styles.entryAction}>
                      {minEstimate !== null && (
                        <p className={styles.entryMinCost}>{fmtPrice(minEstimate)}</p>
                      )}
                      <button
                        type="button"
                        className={styles.viewReportBtn}
                        onClick={() => setSelected(entry)}
                      >
                        View Report
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  <IconChevronLeft />
                </button>

                <div className={styles.pageNums}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      className={`${styles.pageNum} ${n === page ? styles.pageNumActive : ''}`}
                      onClick={() => setPage(n)}
                      aria-label={`Page ${n}`}
                      aria-current={n === page ? 'page' : undefined}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                <button
                  className={styles.pageBtn}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  <IconChevronRight />
                </button>
              </div>
            )}

          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   REPORT MODAL — full-screen detail view for a single entry
   ══════════════════════════════════════════════════════════════════ */
function ReportModal({ entry, onClose }) {
  const cap      = (s)  => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const fmtYr    = (yr) => yr?.includes('_') ? yr.replace('_', ' – ') : yr ?? '';
  const fmtPrice = (n)  => n != null ? `$${Number(n).toFixed(2)}` : '—';

  const dets        = Array.isArray(entry.detections)    ? entry.detections    : [];
  const knownParts  = Array.isArray(entry.damaged_parts) ? entry.damaged_parts : [];
  const unknown     = dets.filter(d => d.class === 'unknown-damage');
  const vehicleName = [cap(entry.make), cap(entry.model), fmtYr(entry.year_range)].filter(Boolean).join(' ');
  const hasPricing  = entry.estimate_status === 'completed' && entry.pricing?.parts?.length > 0;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>

        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <span className={styles.modalHeaderLabel}>DIAGNOSTIC REPORT</span>
            <p className={styles.modalHeaderDate}>
              {vehicleName || 'Vehicle'} &middot; {fmtDate(entry.created_at)} · {fmtTime(entry.created_at)}
            </p>
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close report">
            <IconX />
          </button>
        </div>

        <div className={styles.modalBody}>

          {/* Image */}
          <div className={styles.modalImgWrap}>
            <img src={entry.image_url} alt="Scanned vehicle" className={styles.modalImg} />
            <div className={styles.modalImgOverlay} />
            <span className={`${styles.modalStatusBadge} ${styles[`status--${statusColor(entry.status)}`]}`}>
              {statusLabel(entry.status)}
            </span>
          </div>

          {/* Detected damage (classification + confidence) */}
          <div className={styles.modalSection}>
            <p className={styles.modalSectionTitle}>
              <IconDamage /> Detected Damage ({knownParts.length})
            </p>
            {knownParts.length === 0 ? (
              <p className={styles.modalEmpty}>No classified damage detected.</p>
            ) : (
              <div className={styles.modalDetList}>
                {knownParts.map((p, i) => {
                  // find confidence from detections if available
                  const det  = dets.find(d => d.class === p);
                  const conf = det ? Math.round(det.confidence * 100) : null;
                  return (
                    <div key={i} className={styles.modalDetRow}>
                      <span className={styles.modalDetIndex}>{String(i + 1).padStart(2, '0')}</span>
                      <span className={styles.modalDetName}>{damageLabel(p)}</span>
                      {conf !== null ? (
                        <>
                          <div className={styles.modalConfTrack}>
                            <div className={styles.modalConfFill} style={{ width: `${conf}%` }} />
                          </div>
                          <span className={styles.modalConfVal}>{conf}%</span>
                        </>
                      ) : (
                        <span className={styles.modalConfVal} style={{ gridColumn: 'span 2' }}>Manual</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pricing table — only when estimate was completed */}
          {hasPricing && (
            <div className={styles.modalSection}>
              <p className={styles.modalSectionTitle}>
                <IconPrice /> Part Price Estimates
              </p>
              <div className={styles.modalPriceTable}>
                <div className={styles.modalPriceHead}>
                  <span>Part</span>
                  <span>Orig. New</span>
                  <span>Orig. Used</span>
                  <span>Aftermarket</span>
                </div>
                {entry.pricing.parts.map((p, i) => (
                  <div key={i} className={styles.modalPriceRow}>
                    <span className={styles.modalPricePart}>{damageLabel(p.part_name)}</span>
                    <span className={styles.modalPriceOrig}>{fmtPrice(p.original_new)}</span>
                    <span className={styles.modalPriceUsed}>{fmtPrice(p.original_used)}</span>
                    <span className={styles.modalPriceAfter}>{fmtPrice(p.aftermarket)}</span>
                  </div>
                ))}
                {entry.pricing.totals && (
                  <div className={styles.modalPriceTotals}>
                    <span>Total</span>
                    <span>{fmtPrice(entry.pricing.totals.original_new)}</span>
                    <span>{fmtPrice(entry.pricing.totals.original_used)}</span>
                    <span>{fmtPrice(entry.pricing.totals.aftermarket)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Unknown damage */}
          {unknown.length > 0 && (
            <div className={styles.modalSection}>
              <p className={styles.modalSectionTitle}>
                <IconWarning /> Unclassified Hits ({unknown.length})
              </p>
              <p className={styles.modalEmpty}>
                {unknown.length} area{unknown.length !== 1 ? 's' : ''} detected but could not be classified.
                These were excluded from pricing estimates.
              </p>
            </div>
          )}

          {/* Note: show only when pricing not yet done */}
          {!hasPricing && (
            <div className={styles.modalNote}>
              <IconInfo />
              <p>
                No pricing estimate for this scan yet. Go to{' '}
                <Link to="/manual-entry" className={styles.modalNoteLink}>Manual Entry</Link>{' '}
                and submit the form to generate one.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ── Icons ──────────────────────────────────────────────────────── */
function IconScan() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
      <rect x="7" y="7" width="10" height="10" rx="1"/>
    </svg>
  );
}
function IconHistory() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
      <polyline points="12 7 12 12 15 14"/>
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  );
}
function IconX() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}
function IconClock() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
function IconDamage() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}
function IconWarning() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}
function IconInfo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  );
}
function IconPrice() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );
}
function IconChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}
function IconChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}
