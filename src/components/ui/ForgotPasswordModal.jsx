import { useState, useEffect, useRef } from 'react';
import styles from './ForgotPasswordModal.module.css';

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef(null);

  /* reset state when modal re-opens */
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setSubmitted(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  /* close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Reset your password"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.modal}>
        {/* Close button */}
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          <IconX />
        </button>

        {/* Icon header */}
        <div className={styles.iconWrap} aria-hidden="true">
          <IconKey />
        </div>

        {!submitted ? (
          <>
            <h2 className={styles.heading}>Reset your password</h2>
            <p className={styles.sub}>
              Enter the email address linked to your account and we&rsquo;ll
              send you a reset link.
            </p>

            <form className={styles.form} noValidate onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label htmlFor="fp-email" className={styles.label}>
                  Email Address
                </label>
                <div className={styles.inputWrap}>
                  <span className={styles.iconLeft} aria-hidden="true">
                    <IconMail />
                  </span>
                  <input
                    ref={inputRef}
                    id="fp-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              <button type="submit" className={styles.submitBtn}>
                Send Reset Link <IconArrow />
              </button>
            </form>

            <button type="button" className={styles.backBtn} onClick={onClose}>
              ← Back to Sign In
            </button>
          </>
        ) : (
          <div className={styles.successState}>
            <div className={styles.successIcon} aria-hidden="true">
              <IconCheck />
            </div>
            <h2 className={styles.heading}>Check your inbox</h2>
            <p className={styles.sub}>
              We sent a password reset link to{' '}
              <span className={styles.emailHighlight}>{email}</span>. It may
              take a minute to arrive.
            </p>
            <button type="button" className={styles.submitBtn} onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function IconKey() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5"/>
      <path d="m21 2-9.6 9.6"/>
      <path d="m15.5 7.5 3 3L22 7l-3-3"/>
    </svg>
  );
}
function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  );
}
function IconX() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  );
}
