import { useState } from 'react';
import styles from './FormInput.module.css';

export default function FormInput({
  id,
  label,
  type = 'text',
  placeholder,
  icon,
  required = false,
  autoComplete,
  value,
  onChange,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <div className={styles.inputWrap}>
        {icon && (
          <span className={styles.iconLeft} aria-hidden="true">{icon}</span>
        )}
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          className={[
            styles.input,
            icon        ? styles.inputWithIcon   : '',
            isPassword  ? styles.inputWithToggle : '',
          ].join(' ')}
          {...(isPassword && {
            onCopy:  (e) => e.preventDefault(),
            onCut:   (e) => e.preventDefault(),
            style:   { userSelect: 'none', WebkitUserSelect: 'none' },
          })}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <IconEyeOff /> : <IconEye />}
          </button>
        )}
      </div>
    </div>
  );
}

function IconEye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function IconEyeOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}
