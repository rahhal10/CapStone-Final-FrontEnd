import { useState, useEffect } from 'react';
import { useAuth }             from '../../context/AuthContext';
import { apiUpdateMe }         from '../../services/authApi';
import styles                  from './UpdateProfileModal.module.css';

export default function UpdateProfileModal({ isOpen, onClose }) {
  const { user, token, updateUser } = useAuth();

  const [username,        setUsername]        = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showNewPw,       setShowNewPw]       = useState(false);
  const [showCurPw,       setShowCurPw]       = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUsername(user?.username ?? '');
      setNewPassword('');
      setCurrentPassword('');
      setError('');
      setSuccess(false);
      setShowNewPw(false);
      setShowCurPw(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const hasUsernameChanged = username.trim() !== (user?.username ?? '').trim();
  const hasNewPassword     = newPassword.length > 0;
  const canSubmit          = (hasUsernameChanged || hasNewPassword) && !loading;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!hasUsernameChanged && !hasNewPassword) {
      setError('No changes to save.');
      return;
    }
    if (hasNewPassword && !currentPassword) {
      setError('Current password is required to set a new one.');
      return;
    }

    const payload = {};
    if (hasUsernameChanged) payload.username = username.trim();
    if (hasNewPassword) {
      payload.password         = newPassword;
      payload.current_password = currentPassword;
    }

    setLoading(true);
    try {
      const res = await apiUpdateMe(payload, token);
      updateUser(res.user);
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="update-profile-title"
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <IconUser />
            <h2 className={styles.title} id="update-profile-title">Update Profile</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <IconX />
          </button>
        </div>

        {/* Success state */}
        {success ? (
          <div className={styles.successState}>
            <IconCheck />
            <p>Profile updated successfully!</p>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>

            {/* Username */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="upd-username">Username</label>
              <input
                id="upd-username"
                type="text"
                className={styles.input}
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                disabled={loading}
              />
            </div>

            {/* New password */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="upd-new-pw">
                New Password <span className={styles.optional}>(optional)</span>
              </label>
              <div className={styles.inputWrap}>
                <input
                  id="upd-new-pw"
                  type={showNewPw ? 'text' : 'password'}
                  className={styles.input}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Leave blank to keep current"
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowNewPw(v => !v)}
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showNewPw ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            {/* Current password — only shown when a new password is being set */}
            {hasNewPassword && (
              <div className={styles.field}>
                <label className={styles.label} htmlFor="upd-cur-pw">Current Password</label>
                <div className={styles.inputWrap}>
                  <input
                    id="upd-cur-pw"
                    type={showCurPw ? 'text' : 'password'}
                    className={styles.input}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowCurPw(v => !v)}
                    tabIndex={-1}
                    aria-label="Toggle password visibility"
                  >
                    {showCurPw ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p className={styles.errorMsg} role="alert">{error}</p>
            )}

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={!canSubmit}
              >
                {loading ? <span className={styles.spinner} /> : 'Save Changes'}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}

/* ── Icons ─────────────────────────────────────────────────────── */
function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function IconX() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}
function IconEye() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function IconEyeOff() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}
