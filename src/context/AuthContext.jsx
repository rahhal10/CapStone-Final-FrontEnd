import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

/* ── Constants ────────────────────────────────────────────────────────────── */
const INACTIVITY_MS = 1000_000;           // 1 minute of no activity → logout 60_000
const COOKIE_DAYS = 7;                // cookie max-age (JWT expiry wins first)
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

/* ── Cookie helpers ───────────────────────────────────────────────────────── */
function setCookie(name, value, days) {
  const exp = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${exp}; path=/; SameSite=Strict`;
}
function getCookie(name) {
  const match = document.cookie.split('; ').find(r => r.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}
function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict`;
}

/* ── Context ──────────────────────────────────────────────────────────────── */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Rehydrate from cookies so a page refresh doesn't log the user out
  const [user, setUser] = useState(() => {
    try { return JSON.parse(getCookie(USER_KEY)); } catch { return null; }
  });
  const [token, setToken] = useState(() => getCookie(TOKEN_KEY));
  const timerRef = useRef(null);

  /* ── Logout (manual or inactivity) ───────────────────────────────────── */
  const logout = useCallback((reason = 'manual') => {
    clearTimeout(timerRef.current);
    deleteCookie(TOKEN_KEY);
    deleteCookie(USER_KEY);
    setUser(null);
    setToken(null);
    const dest = reason === 'inactive' ? '/login?reason=expired' : '/login';
    window.location.replace(dest);
  }, []);

  /* ── Inactivity timer ─────────────────────────────────────────────────── */
  const resetTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => logout('inactive'), INACTIVITY_MS);
  }, [logout]);

  useEffect(() => {
    if (!user) return;                          // not logged in — no timer needed
    resetTimer();                               // start the countdown
    ACTIVITY_EVENTS.forEach(ev =>
      window.addEventListener(ev, resetTimer, { passive: true })
    );
    return () => {
      clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach(ev =>
        window.removeEventListener(ev, resetTimer)
      );
    };
  }, [user, resetTimer]);

  /* ── Login ────────────────────────────────────────────────────────────── */
  const login = useCallback((newToken, newUser) => {
    // Derive cookie expiry from the JWT's own `exp` claim so they always stay
    // in sync, regardless of what the backend sets for JWT_EXPIRES_IN.
    let expDays = COOKIE_DAYS; // fallback if decoding fails
    try {
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      if (payload.exp) {
        // exp is Unix seconds; convert the remaining lifetime to days
        expDays = (payload.exp * 1000 - Date.now()) / 864e5;
      }
    } catch { /* malformed token — use fallback */ }

    setCookie(TOKEN_KEY, newToken, expDays);
    setCookie(USER_KEY, JSON.stringify(newUser), expDays);
    setToken(newToken);
    setUser(newUser);
  }, []);

  /* ── Update user (profile changes, token unchanged) ──────────────────── */
  const updateUser = useCallback((updatedUser) => {
    setCookie(USER_KEY, JSON.stringify(updatedUser), COOKIE_DAYS);
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
