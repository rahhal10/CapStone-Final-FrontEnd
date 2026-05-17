import { useState, useEffect }              from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout                             from '../../components/layout/AuthLayout';
import FormInput                              from '../../components/ui/FormInput';
import ForgotPasswordModal                    from '../../components/ui/ForgotPasswordModal';
import { useAuth }                            from '../../context/AuthContext';
import { apiLogin }                           from '../../services/authApi';
import styles                                 from './LoginPage.module.css';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate                   = useNavigate();
  const [searchParams]             = useSearchParams();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const isExpired    = searchParams.get('reason') === 'expired';
  const isRegistered = searchParams.get('registered') === 'true';

  /* Redirect if already authenticated */
  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await apiLogin({ email: email.trim(), password });
      login(token, user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AuthLayout
        heading="Welcome back"
        subheading="Sign in to your AUTO_AI account to continue."
      >
        {isExpired && (
          <div className={`${styles.banner} ${styles.bannerWarn}`} role="alert">
            ⏱ Your session expired due to inactivity. Please sign in again.
          </div>
        )}
        {isRegistered && (
          <div className={`${styles.banner} ${styles.bannerSuccess}`} role="alert">
            ✓ Account created! You can now sign in.
          </div>
        )}
        {error && (
          <div className={`${styles.banner} ${styles.bannerError}`} role="alert">
            {error}
          </div>
        )}

        <form className={styles.form} noValidate onSubmit={handleSubmit} aria-label="Sign in form">

          <FormInput
            id="login-email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            icon={<IconMail />}
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <div className={styles.passwordField}>
            <FormInput
              id="login-password"
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              icon={<IconLock />}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <div className={styles.forgotRow}>
              <button
                type="button"
                className={styles.forgotLink}
                onClick={() => setForgotOpen(true)}
              >
                Forgot password?
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Signing in…' : <><span>Sign In</span> <IconArrow /></>}
          </button>

        </form>

        <div className={styles.divider} aria-hidden="true">
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>or continue with</span>
          <span className={styles.dividerLine} />
        </div>

        <button type="button" className={styles.googleBtn}>
          <IconGoogle /> Sign in with Google
        </button>

        <p className={styles.switchLink}>
          Don&rsquo;t have an account?{' '}
          <Link to="/sign-up" className={styles.link}>Create one</Link>
        </p>
      </AuthLayout>

      <ForgotPasswordModal
        isOpen={forgotOpen}
        onClose={() => setForgotOpen(false)}
      />
    </>
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
function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
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
function IconGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
