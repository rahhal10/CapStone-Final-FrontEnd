import { useState, useEffect, useRef } from 'react';
import { Link }                        from 'react-router-dom';
import { useAuth }                     from '../../context/AuthContext';
import AuthGateModal                   from '../ui/AuthGateModal';
import logoPic                         from '../../assets/logo-Picsart-BackgroundRemover.png';
import styles                          from './Navbar.module.css';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [scrolled, setScrolled]         = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [gateOpen, setGateOpen]         = useState(false);
  const dropdownRef                     = useRef(null);

  /* Scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close dropdown when clicking outside */
  useEffect(() => {
    if (!dropdownOpen) return;
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  /* Avatar initial — first letter of username or email */
  const initial = (user?.username ?? user?.email ?? '?')[0].toUpperCase();
  const displayName = user?.username ?? user?.email ?? '';

  function handleLogout() {
    setDropdownOpen(false);
    logout('manual');
  }

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <nav className={styles.nav} aria-label="Main navigation">

        <Link to="/" className={styles.logoWrap} aria-label="AUTO_AI Home">
          <img src={logoPic} alt="" className={styles.logoImg} />
          <span className={styles.logoText}>AUTO_AI</span>
        </Link>

        <div className={styles.actions}>
          {isAuthenticated ? (
            /* ── Logged in: history link + user chip ── */
            <>
              <Link to="/history" className={styles.historyLink} title="Scan History">
                <IconHistory />
                <span>History</span>
              </Link>
              <div className={styles.userChipWrap} ref={dropdownRef}>
                <button
                  type="button"
                  className={styles.userChip}
                  onClick={() => setDropdownOpen((v) => !v)}
                  aria-expanded={dropdownOpen}
                  aria-label="Account menu"
                >
                  <span className={styles.avatar}>{initial}</span>
                  <span className={styles.username}>{displayName}</span>
                  <IconChevron isOpen={dropdownOpen} />
                </button>

                {dropdownOpen && (
                  <div className={styles.dropdown} role="menu">
                    <button
                      type="button"
                      className={styles.dropdownItem}
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      <IconLogout /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ── Guest: Sign In link + Get Started opens auth gate ── */
            <>
              <Link to="/login" className={styles.btnLogin}>Sign In</Link>
              <button
                type="button"
                className={styles.btnSignUp}
                onClick={() => setGateOpen(true)}
              >
                Get Started
              </button>
            </>
          )}
        </div>

        <AuthGateModal isOpen={gateOpen} onClose={() => setGateOpen(false)} />

      </nav>
    </header>
  );
}

function IconChevron({ isOpen }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: 'transform 0.2s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
function IconHistory() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
      <polyline points="12 7 12 12 15 14"/>
    </svg>
  );
}
function IconLogout() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
