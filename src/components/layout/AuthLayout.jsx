import { Link } from 'react-router-dom';
import authBg  from '../../assets/auth-bg.png';
import logoPic from '../../assets/logo-Picsart-BackgroundRemover.png';
import styles  from './AuthLayout.module.css';

const FEATURES = [
  {
    icon: <IconScan />,
    label: 'AI Damage Detection',
    desc: 'Computer vision trained on millions of vehicle images.',
  },
  {
    icon: <IconParts />,
    label: 'Instant Part Matching',
    desc: 'Exact OEM and aftermarket parts matched to your car.',
  },
  {
    icon: <IconShield />,
    label: 'Secure & Private',
    desc: 'Your vehicle data is encrypted and never shared.',
  },
];

export default function AuthLayout({ children, heading, subheading }) {
  return (
    <div className={styles.page}>

      {/* ---- Left Panel ---- */}
      <aside className={styles.leftPanel} aria-hidden="true">
        <img src={authBg} alt="" className={styles.bgImage} />
        <div className={styles.bgOverlay} />
        <div className={styles.leftContent}>

          <Link to="/" className={styles.logoWrap}>
            <img src={logoPic} alt="" className={styles.logoImg} />
            <span className={styles.logoText}>AUTO_AI</span>
          </Link>

          <div className={styles.brandBlock}>
            <p className={styles.brandEyebrow}>AI-Powered Diagnostics</p>
            <h2 className={styles.brandHeadline}>
              Your car knows<br />
              something's wrong.<br />
              <em className={styles.brandAccent}>So do we.</em>
            </h2>
          </div>

          <ul className={styles.featureList} role="list">
            {FEATURES.map(({ icon, label, desc }) => (
              <li key={label} className={styles.featureItem}>
                <span className={styles.featureIcon}>{icon}</span>
                <div>
                  <p className={styles.featureLabel}>{label}</p>
                  <p className={styles.featureDesc}>{desc}</p>
                </div>
              </li>
            ))}
          </ul>

        </div>
      </aside>

      {/* ---- Right Panel ---- */}
      <main className={styles.rightPanel}>
        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <Link to="/" className={styles.logoWrapMobile}>
              <img src={logoPic} alt="" className={styles.logoImg} />
              <span className={styles.logoText}>AUTO_AI</span>
            </Link>
            <h1 className={styles.formHeading}>{heading}</h1>
            <p className={styles.formSubheading}>{subheading}</p>
          </div>
          {children}
        </div>
      </main>

    </div>
  );
}

function IconScan() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
      <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
      <rect x="7" y="7" width="10" height="10" rx="1"/>
    </svg>
  );
}
function IconParts() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
