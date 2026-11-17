import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { TextField } from '../components/ui/Field';
import { validateLogin } from '../utils/validation';
import type { FieldErrors } from '../types';
import './Login.css';

export function Login() {
  const { user, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { pushToast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const runValidation = (u = username, p = password) => {
    const next = validateLogin(u, p);
    setErrors(next);
    return next;
  };

  const onUsername = (v: string) => {
    setUsername(v);
    if (touched.username) runValidation(v, password);
  };

  const onPassword = (v: string) => {
    setPassword(v);
    if (touched.password) runValidation(username, v);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched({ username: true, password: true });
    const next = runValidation();
    if (Object.keys(next).length) {
      pushToast({ type: 'error', title: 'Check your form', message: 'Fix the highlighted fields to continue.' });
      return;
    }
    setSubmitting(true);
    const result = login(username, password);
    setSubmitting(false);
    if (!result.ok) {
      setErrors({ password: result.error });
      pushToast({ type: 'error', title: 'Login failed', message: result.error });
      return;
    }
    pushToast({ type: 'success', title: 'Welcome back', message: 'Signed in as administrator.' });
    navigate('/');
  };

  return (
    <div className="login-page">
      <button type="button" className="login-theme btn btn--icon btn--ghost" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <motion.div
        className="login-card panel"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      >
        <div className="login-card__brand">
          <div className="sidebar__logo" aria-hidden>
            <span /><span /><span /><span />
          </div>
          <div>
            <h1>POS STUDIO OS</h1>
            <p>Administrator sign-in</p>
          </div>
        </div>

        <form className="login-form" onSubmit={onSubmit} noValidate>
          <TextField
            label="Username"
            name="username"
            autoComplete="username"
            value={username}
            touched={!!touched.username}
            error={errors.username}
            hint="Use the admin account from the README"
            onChange={(e) => onUsername(e.target.value)}
            onBlur={() => {
              setTouched((t) => ({ ...t, username: true }));
              runValidation();
            }}
          />

          <div className="login-pass">
            <TextField
              label="Password"
              name="password"
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              touched={!!touched.password}
              error={errors.password}
              onChange={(e) => onPassword(e.target.value)}
              onBlur={() => {
                setTouched((t) => ({ ...t, password: true }));
                runValidation();
              }}
            />
            <button
              type="button"
              className="login-pass__toggle"
              onClick={() => setShowPass((v) => !v)}
              aria-label={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button type="submit" className="btn btn--primary login-submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="login-hint panel--accent">
          <strong>Demo admin</strong>
          <span>Username <code>admin</code> · Password <code>Admin@123</code></span>
        </div>
      </motion.div>
    </div>
  );
}
