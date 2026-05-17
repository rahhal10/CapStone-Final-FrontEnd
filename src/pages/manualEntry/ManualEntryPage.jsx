import { Link }   from 'react-router-dom';
import Navbar     from '../../components/layout/Navbar';
import Footer     from '../../components/layout/Footer';
import FormInput  from '../../components/ui/FormInput';
import schematic  from '../../assets/car-schematic.png';
import styles     from './ManualEntryPage.module.css';

const DAMAGE_ZONES = [
  { value: 'bumper',   label: 'Front Bumper'            },
  { value: 'hood',     label: 'Hood / Bonnet'           },
  { value: 'fender',   label: 'Front Fender (Left/Right)' },
  { value: 'door',     label: 'Side Door'               },
  { value: 'quarter',  label: 'Rear Quarter Panel'      },
  { value: 'trunk',    label: 'Trunk / Liftgate'        },
];

export default function ManualEntryPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>

          {/* ---- Page Header ---- */}
          <header className={styles.pageHeader}>
            <div className={styles.alertBadge}>
              <span className={styles.alertBadgeIcon}><IconAlert /></span>
              <span>System Alert: Identification Failed</span>
            </div>
            <h1 className={styles.pageTitle}>
              We couldn't identify<br />
              <em>your vehicle</em>
            </h1>
            <p className={styles.pageSubtitle}>
              Please provide your car details so we can find the right parts for
              you. Our AI needs these technical specifications to ensure 100%
              component compatibility.
            </p>
          </header>

          {/* ---- Bento Grid ---- */}
          <div className={styles.bentoGrid}>

            {/* ---- Left: Specifications Form ---- */}
            <section className={styles.formPanel} aria-label="Vehicle specifications">
              <div className={styles.formPanelDecor} aria-hidden="true" />

              <h2 className={styles.formPanelTitle}>
                Specifications
              </h2>

              <form className={styles.form} noValidate>

                <div className={styles.fieldRow}>
                  <FormInput
                    id="make"
                    label="Vehicle Make"
                    type="text"
                    placeholder="e.g. BMW"
                    autoComplete="off"
                  />
                  <FormInput
                    id="model"
                    label="Vehicle Model"
                    type="text"
                    placeholder="e.g. M3 Competition"
                    autoComplete="off"
                  />
                </div>

                <div className={styles.fieldRow}>
                  <FormInput
                    id="year"
                    label="Manufacturing Year"
                    type="number"
                    placeholder="2024"
                    autoComplete="off"
                  />
                  <FormInput
                    id="vin"
                    label="VIN (Optional)"
                    type="text"
                    placeholder="17-digit code"
                    autoComplete="off"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="damage-zone" className={styles.label}>
                    Damaged Area Selection
                  </label>
                  <div className={styles.selectWrap}>
                    <select id="damage-zone" className={styles.select} defaultValue="">
                      <option value="" disabled>Select the primary impact zone</option>
                      {DAMAGE_ZONES.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <span className={styles.selectArrow} aria-hidden="true">
                      <IconChevron />
                    </span>
                  </div>
                </div>

              </form>
            </section>

            {/* ---- Right: Guidance Panel ---- */}
            <aside className={styles.guidanceCol}>

              {/* Preview card */}
              <div className={styles.previewCard}>
                <div className={styles.previewImageWrap}>
                  <img src={schematic} alt="Vehicle schematic" className={styles.previewImage} />
                  <div className={styles.previewOverlay} />
                  <div className={styles.previewBadge}>
                    <span className={styles.pulseDot} />
                    <span>Live Engine Analysis</span>
                  </div>
                </div>
                <div className={styles.whySection}>
                  <p className={styles.whyTitle}>Why manual entry?</p>
                  <p className={styles.whyText}>
                    Standard AI scanning can sometimes be obstructed by severe
                    damage or lighting. Manual entry ensures our database
                    cross-references the exact OEM parts for your specific chassis.
                  </p>
                </div>
              </div>

              {/* OEM Verified chip */}
              <div className={styles.oemCard}>
                <span className={styles.oemIcon}><IconVerified /></span>
                <div>
                  <p className={styles.oemTitle}>OEM Verified</p>
                  <p className={styles.oemText}>
                    We only recommend parts that match your vehicle's factory
                    build sheet.
                  </p>
                </div>
              </div>

            </aside>
          </div>

          {/* ---- Action Buttons ---- */}
          <div className={styles.actions}>
            <button type="submit" className={styles.btnPrimary}>
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

/* ---- Icons ---- */
function IconAlert() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}
function IconCar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l3-4h10l3 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/>
      <circle cx="7.5" cy="17" r="2.5"/><circle cx="16.5" cy="17" r="2.5"/>
    </svg>
  );
}
function IconChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}
function IconVerified() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  );
}
