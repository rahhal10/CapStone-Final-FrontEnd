import styles from './StatsSection.module.css';
import damageImg from '../../../assets/damage-analysis.png';

const STATS = [
  { value: '98%',   colorMod: 'tertiary',  label: 'Detection Accuracy'    },
  { value: '<3s',   colorMod: 'secondary', label: 'Average Analysis Time' },
  { value: '50K+',  colorMod: 'green',     label: 'Vehicles Analyzed'     },
  { value: '120+',  colorMod: 'white',     label: 'Detectable Part Types' },
];

export default function StatsSection() {
  return (
    <section className={styles.section} aria-label="Platform statistics">
      <div className={styles.container}>

        {/* ---- Diagnostic Card ---- */}
        <div className={styles.cardWrapper}>
          <div className={styles.diagnosticCard}>
            <div className={styles.cardHeader}>
              <div className={styles.dots}>
                <span className={`${styles.dot} ${styles.dotRed}`}    />
                <span className={`${styles.dot} ${styles.dotOrange}`} />
                <span className={`${styles.dot} ${styles.dotGreen}`}  />
              </div>
              <span className={styles.cardLabel}>DAMAGE_SCAN.exe</span>
            </div>
            <div className={styles.imageWrapper}>
              <img src={damageImg} alt="Damage analysis" className={styles.image} />
              <span className={styles.badgeDamaged}>DAMAGE DETECTED</span>
              <div className={styles.badgeSeverity}>
                <p className={styles.severityLine}>SEVERITY SCORE</p>
                <p className={styles.severityLine}>74 / 100</p>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Copy & Stats ---- */}
        <div className={styles.copyWrapper}>
          <h2 className={styles.title}>
            Precision you can<br />count on.
          </h2>

          <div className={styles.statsGrid}>
            {STATS.map(({ value, colorMod, label }) => (
              <div key={label} className={styles.statItem}>
                <p className={`${styles.statValue} ${styles[`statValue--${colorMod}`]}`}>
                  {value}
                </p>
                <p className={styles.statLabel}>{label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
