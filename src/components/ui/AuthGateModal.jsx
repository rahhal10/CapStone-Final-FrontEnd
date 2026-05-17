import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './AuthGateModal.module.css';

export default function AuthGateModal({ isOpen, onClose }) {
  /* Close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Authentication required"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.modal}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          <IconX />
        </button>

        <div className={styles.iconWrap} aria-hidden="true">
          <IconLock />
        </div>

        <h2 className={styles.heading}>Sign in to continue</h2>
        <p className={styles.sub}>
          You need an account to analyze your vehicle. It&rsquo;s free and
          takes less than a minute to get started.
        </p>

        <div className={styles.buttons}>
          <Link to="/login" className={styles.btnPrimary} onClick={onClose}>Sign In</Link>
          <Link to="/sign-up" className={styles.btnSecondary} onClick={onClose}>Create Account</Link>
        </div>
      </div>
    </div>
  );
}

function IconLock() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function IconX() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
