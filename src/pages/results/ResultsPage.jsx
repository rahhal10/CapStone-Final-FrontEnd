import { useState } from 'react';
import { Link }      from 'react-router-dom';
import Navbar        from '../../components/layout/Navbar';
import Footer        from '../../components/layout/Footer';
import bmwCanvas     from '../../assets/bmw-canvas.png';
import carPart       from '../../assets/car-part.png';
import styles        from './ResultsPage.module.css';

/* ------------------------------------------------------------------ */
/*  DATA                                                                */
/* ------------------------------------------------------------------ */
const DAMAGE_HOTSPOTS = [
  {
    id: 1,
    top: '65%',
    left: '45%',
    size: 'sm',
    tooltip: 'STRUCTURAL FRACTURE DETECTED',
  },
  {
    id: 2,
    top: '60%',
    left: '56%',
    size: 'lg',
    tooltip: 'CRACKED FRONT BUMPER ASSEMBLY',
  },
];

const PART_CATEGORIES = [
  {
    id: 'new-original',
    label: 'New Original',
    accent: 'tertiary',
    icon: <IconVerified />,
    part: {
      name:   'M-Sport Bumper',
      partNo: 'P/N: 51-11-8-092-719',
      price:  '$1,245.00',
      stock:  { label: 'IN STOCK', mod: 'green' },
      btnMod: 'primary',
    },
  },
  {
    id: 'used-original',
    label: 'Used Original',
    accent: 'muted',
    icon: <IconHistory />,
    part: {
      name:   'Grade-A Bumper',
      partNo: 'S/N: U-8092-719-22',
      price:  '$640.00',
      stock:  { label: '2 LEFT', mod: 'blue' },
      btnMod: 'ghost',
    },
  },
  {
    id: 'new-non-original',
    label: 'New Non-Original',
    accent: 'muted',
    icon: <IconFactory />,
    part: {
      name:   'Aftermarket Cap',
      partNo: 'REP-B092719',
      price:  '$415.00',
      stock:  { label: 'IN STOCK', mod: 'green' },
      btnMod: 'ghost',
    },
  },
  {
    id: 'used-non-original',
    label: 'Used Non-Original',
    accent: 'orange',
    icon: <IconRecycle />,
    part: {
      name:   'Salvage Direct',
      partNo: 'SLV-AM-B3',
      price:  '$195.00',
      stock:  { label: 'LOW STOCK', mod: 'orange' },
      btnMod: 'ghost',
    },
  },
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                           */
/* ------------------------------------------------------------------ */
export default function ResultsPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>

        {/* ---- Header ---- */}
        <section className={styles.headerSection}>
          <div className={styles.headerInner}>
            <div className={styles.headerLeft}>
              <p className={styles.eyebrow}>Diagnostic Sequence Finalized</p>
              <h1 className={styles.title}>Analysis Complete</h1>
            </div>
            <div className={styles.carChip}>
              <p className={styles.carChipLabel}>CAR IDENTIFIED</p>
              <p className={styles.carChipValue}>2022 BMW 3 Series</p>
            </div>
          </div>
        </section>

        {/* ---- Diagnostic Canvas ---- */}
        <section className={styles.canvasSection}>
          <div className={styles.canvas}>

            {/* Background image */}
            <img src={bmwCanvas} alt="Vehicle diagnostic scan" className={styles.canvasBg} />
            <div className={styles.canvasOverlay} />

            {/* Animated laser line */}
            <div className={styles.laserLine} />

            {/* Damage hotspots */}
            {DAMAGE_HOTSPOTS.map((spot) => (
              <Hotspot key={spot.id} {...spot} />
            ))}

            {/* HUD Panel */}
            <div className={styles.hudPanel}>
              <p className={styles.hudLabel}>AI SENSOR FEED</p>
              <p className={styles.hudLog}>
                [SYS_LOG]: Surface scan identifies multiple stress fractures in
                polycarbonate shell. Proximity sensors recalibrated. 2 Critical
                impact points found.
              </p>
            </div>

          </div>
        </section>

        {/* ---- Replacement Recommendations ---- */}
        <section className={styles.recsSection}>
          <div className={styles.recsContainer}>

            <header className={styles.recsHeader}>
              <h2 className={styles.recsTitle}>Replacement Recommendations</h2>
              <p className={styles.recsSub}>
                Sourced and verified part alternatives based on precision compatibility.
              </p>
            </header>

            <div className={styles.partsGrid}>
              {PART_CATEGORIES.map((cat) => (
                <PartColumn key={cat.id} {...cat} />
              ))}
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  HOTSPOT                                                             */
/* ------------------------------------------------------------------ */
function Hotspot({ top, left, size, tooltip }) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={`${styles.hotspot} ${styles[`hotspot--${size}`]}`}
      style={{ top, left }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      role="button"
      tabIndex={0}
      aria-label={tooltip}
    >
      <span className={styles.hotspotRing} />
      <IconWarning />
      {visible && (
        <div className={styles.hotspotTooltip}>{tooltip}</div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PART COLUMN                                                         */
/* ------------------------------------------------------------------ */
function PartColumn({ label, accent, icon, part }) {
  return (
    <div className={styles.partCol}>

      {/* Category header */}
      <div className={`${styles.catHeader} ${styles[`catHeader--${accent}`]}`}>
        <span className={styles.catIcon}>{icon}</span>
        <span className={styles.catLabel}>{label}</span>
      </div>

      {/* Card */}
      <div className={`${styles.partCard} ${styles[`partCard--${accent}`]}`}>

        {/* Part image */}
        <div className={styles.partImageWrap}>
          <img src={carPart} alt={part.name} className={styles.partImage} />
        </div>

        {/* Meta */}
        <div className={styles.partMeta}>
          <p className={styles.partName}>{part.name}</p>
          <p className={styles.partNo}>{part.partNo}</p>
        </div>

        {/* Price + stock */}
        <div className={styles.partPriceRow}>
          <div>
            <p className={styles.priceLabel}>PRICE</p>
            <p className={styles.priceValue}>{part.price}</p>
          </div>
          <span className={`${styles.stockBadge} ${styles[`stockBadge--${part.stock.mod}`]}`}>
            {part.stock.label}
          </span>
        </div>

      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ICONS                                                               */
/* ------------------------------------------------------------------ */
function IconWarning() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>
  );
}
function IconVerified() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  );
}
function IconHistory() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
    </svg>
  );
}
function IconFactory() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20h20v-8l-6-4V4l-4 3-4-3v8L2 12v8z"/>
    </svg>
  );
}
function IconRecycle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1.5 8.5 1.5 3.5 6.5 3.5"/>
      <path d="M1.5 3.5L7 9"/>
      <polyline points="22.5 15.5 22.5 20.5 17.5 20.5"/>
      <path d="M22.5 20.5L17 15"/>
      <path d="M6.5 20.5H3a1 1 0 0 1-1-1V16"/>
      <path d="M21 8.5V5a1 1 0 0 0-1-1h-3.5"/>
      <path d="M9 3.5l2.5 2.5L9 8.5"/>
      <path d="M15 20.5l-2.5-2.5 2.5-2.5"/>
    </svg>
  );
}
