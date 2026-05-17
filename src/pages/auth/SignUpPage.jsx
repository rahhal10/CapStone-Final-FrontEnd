import { useState }           from 'react';
import { Link, useNavigate }  from 'react-router-dom';
import AuthLayout              from '../../components/layout/AuthLayout';
import FormInput               from '../../components/ui/FormInput';
import { apiSignup }           from '../../services/authApi';
import styles                  from './SignUpPage.module.css';

export default function SignUpPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName:  '',
    username:  '',
    email:     '',
    password:  '',
    confirm:   '',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  /* Helper to update a single field */
  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const { firstName, lastName, username, email, password, confirm } = form;

    /* ── Client-side validation ── */
    if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim() || !password || !confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      /* Backend expects full_name as one field */
      await apiSignup({
        email:     email.trim(),
        username:  username.trim(),
        password,
        full_name: `${firstName.trim()} ${lastName.trim()}`,
      });
      /* Signup doesn't return a token — redirect to login with success banner */
      navigate('/login?registered=true', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      heading="Create your account"
      subheading="Start detecting vehicle damage in seconds — free to try."
    >
      {error && (
        <div className={`${styles.banner} ${styles.bannerError}`} role="alert">
          {error}
        </div>
      )}

      <form className={styles.form} noValidate onSubmit={handleSubmit} aria-label="Sign up form">

        <div className={styles.nameRow}>
          <FormInput
            id="signup-first"
            label="First Name"
            type="text"
            placeholder="John"
            autoComplete="given-name"
            required
            icon={<IconUser />}
            value={form.firstName}
            onChange={set('firstName')}
          />
          <FormInput
            id="signup-last"
            label="Last Name"
            type="text"
            placeholder="Doe"
            autoComplete="family-name"
            required
            value={form.lastName}
            onChange={set('lastName')}
          />
        </div>

        <FormInput
          id="signup-username"
          label="Username"
          type="text"
          placeholder="john_doe"
          autoComplete="username"
          required
          icon={<IconAt />}
          value={form.username}
          onChange={set('username')}
        />

        <FormInput
          id="signup-email"
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          icon={<IconMail />}
          value={form.email}
          onChange={set('email')}
        />

        <FormInput
          id="signup-password"
          label="Password"
          type="password"
          placeholder="Min. 8 characters"
          autoComplete="new-password"
          required
          icon={<IconLock />}
          value={form.password}
          onChange={set('password')}
        />

        <FormInput
          id="signup-confirm"
          label="Confirm Password"
          type="password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          required
          icon={<IconLock />}
          value={form.confirm}
          onChange={set('confirm')}
        />

        <p className={styles.terms}>
          By creating an account you agree to our{' '}
          <a href="#" className={styles.termsLink}>Terms of Service</a>
          {' '}and{' '}
          <a href="#" className={styles.termsLink}>Privacy Policy</a>.
        </p>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Creating account…' : <><span>Create Account</span> <IconArrow /></>}
        </button>

      </form>

      <div className={styles.divider} aria-hidden="true">
        <span className={styles.dividerLine} />
        <span className={styles.dividerText}>or continue with</span>
        <span className={styles.dividerLine} />
      </div>

      <button type="button" className={styles.googleBtn}>
        <IconGoogle /> Sign up with Google
      </button>

      <p className={styles.switchLink}>
        Already have an account?{' '}
        <Link to="/login" className={styles.link}>Sign in</Link>
      </p>
    </AuthLayout>
  );
}

function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function IconAt() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
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
