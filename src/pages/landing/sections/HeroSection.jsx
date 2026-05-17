import { useState }      from 'react';
import { Link }          from 'react-router-dom';
import { useAuth }       from '../../../context/AuthContext';
import AuthGateModal     from '../../../components/ui/AuthGateModal';
import heroImg           from '../../../assets/hero-car.png';
import styles            from './HeroSection.module.css';

export default function HeroSection() {
  const { isAuthenticated } = useAuth();
  const [gateOpen, setGateOpen] = useState(false);

  return (
    <section className={styles.hero} aria-label="Hero">

      {/* Full-bleed background */}
      <div className={styles.backdrop} aria-hidden="true">
        <img src={heroImg} alt="" className={styles.backdropImg} />
        <div className={styles.backdropGradient} />
      </div>

      {/* Animated scan line */}
      <div className={styles.scanLine} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.content}>

          <span className={styles.badge}>AI-Powered · Real-Time · Precise</span>

          <h1 className={styles.headline}>
            Detect Every Dent.<br />
            <span className={styles.headlineAccent}>Fix What Matters.</span>
          </h1>

          <p className={styles.subtext}>
            Upload a photo of your vehicle and our neural network instantly
            identifies body damage, flags affected parts, and delivers a
            transparent repair cost estimate — in seconds.
          </p>

          <div className={styles.cta}>
            {isAuthenticated ? (
              /* Logged in → go straight to upload */
              <Link to="/diagnostic" className={styles.ctaPrimary}>
                Analyze Your Car
              </Link>
            ) : (
              /* Guest → open auth gate modal */
              <button
                type="button"
                className={styles.ctaPrimary}
                onClick={() => setGateOpen(true)}
              >
                Analyze Your Car
              </button>
            )}

            <a href="#how-it-works" className={styles.ctaSecondary}>
              See How It Works
            </a>
          </div>

        </div>
      </div>

      <AuthGateModal isOpen={gateOpen} onClose={() => setGateOpen(false)} />
    </section>
  );
}
