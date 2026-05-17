import { Link } from 'react-router-dom';
import logoPic from '../../assets/logo-Picsart-BackgroundRemover.png';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        <div className={styles.brand}>
          <Link to="/" className={styles.logoWrap}>
            <img src={logoPic} alt="" className={styles.logoImg} />
            <span className={styles.logoText}>AUTO_AI</span>
          </Link>
          <p className={styles.tagline}>
            AI-powered vehicle damage detection.<br />
            Smarter diagnostics, faster repairs.
          </p>
        </div>

        <p className={styles.copy}>
          © {new Date().getFullYear()} AUTO_AI. All rights reserved.
        </p>

      </div>
    </footer>
  );
}
