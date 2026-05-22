import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ShieldAlert, Sparkles, Database } from 'lucide-react';
import { authService } from '../services/firebase';

export default function AuthModal({ onAuthSuccess, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !displayName)) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await authService.login(email, password);
      } else {
        await authService.signup(email, password, displayName);
      }
      onAuthSuccess();
    } catch (err) {
      console.error(err);
      // Clean up standard Firebase error strings to look professional
      let msg = err.message || 'An error occurred during authentication.';
      if (msg.includes('auth/invalid-credential') || msg.includes('password incorrect')) {
        msg = 'Incorrect email or password. Please try again.';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'This email is already registered. Try logging in instead!';
      } else if (msg.includes('auth/weak-password')) {
        msg = 'Password should be at least 6 characters.';
      } else if (msg.includes('auth/invalid-email')) {
        msg = 'Please enter a valid email address.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      // Sign in as virtual guest developer
      await authService.login('guest@resumeai.io', 'guest1234');
      onAuthSuccess();
    } catch (err) {
      // If guest user doesn't exist in simulator, create them
      try {
        await authService.signup('guest@resumeai.io', 'guest1234', 'Guest Developer');
        onAuthSuccess();
      } catch (signupErr) {
        setError('Failed to initiate guest developer mode. Please try a manual signup.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card} className="glass-card anim-fade-in anim-pulse">
        
        {/* Glow Header Accent */}
        <div style={styles.cardGlow} />

        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <Sparkles size={24} color="var(--color-primary)" />
          </div>
          <h2 style={styles.title}>
            {isLogin ? 'Welcome back to ' : 'Get started with '}
            <span className="text-gradient" style={{ fontWeight: '800' }}>ResumeAI</span>
          </h2>
          <p style={styles.subtitle}>
            {isLogin 
              ? 'Log in to access your analyzed resumes and career tracking.' 
              : 'Create an account to securely save and track your ATS optimizations.'}
          </p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <ShieldAlert size={18} color="#ef4444" style={{ flexShrink: 0 }} />
            <span style={styles.errorText}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" style={styles.label}>
                <User size={14} style={{ marginRight: '6px' }} /> Full Name
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" style={styles.label}>
              <Mail size={14} style={{ marginRight: '6px' }} /> Email Address
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={styles.label}>
              <Lock size={14} style={{ marginRight: '6px' }} /> Password
            </label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                style={{ paddingRight: '45px' }}
              />
              <button
                type="button"
                style={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={loading}>
            {loading ? (
              <div style={styles.spinner} />
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>OR TEST DRIVE INSTANTLY</span>
          <div style={styles.dividerLine} />
        </div>

        <button 
          onClick={handleGuestSignIn} 
          className="btn btn-secondary" 
          style={styles.guestBtn}
          disabled={loading}
        >
          <Database size={16} color="#06B6D4" />
          <span>Launch Demo Mode (No Registration)</span>
        </button>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              style={styles.toggleBtn}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
          {onClose && (
            <button onClick={onClose} style={styles.closeBtn}>
              Back to Home
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 250, 252, 0.85)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    padding: '40px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  cardGlow: {
    position: 'absolute',
    top: '-80px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '200px',
    height: '100px',
    background: 'radial-gradient(ellipse, var(--color-primary-glow) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  header: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  iconContainer: {
    padding: '12px',
    borderRadius: '14px',
    background: 'var(--color-primary-glow)',
    border: '1px solid hsla(var(--primary-hue), 84%, 54%, 0.15)',
    marginBottom: '8px',
  },
  title: {
    fontSize: '1.65rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '0.88rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '10px',
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
  },
  errorText: {
    fontSize: '0.82rem',
    color: '#dc2626',
    fontWeight: '500',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    color: 'var(--text-secondary)',
    marginBottom: '2px',
  },
  passwordWrapper: {
    position: 'relative',
    width: '100%',
  },
  eyeBtn: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    marginTop: '5px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    margin: '10px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'var(--glass-border)',
  },
  dividerText: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    letterSpacing: '0.1em',
  },
  guestBtn: {
    width: '100%',
    padding: '12px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '0.9rem',
    background: 'var(--bg-tertiary)',
    borderColor: 'hsla(var(--secondary-hue), 90%, 45%, 0.25)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    borderRadius: '10px',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    marginTop: '10px',
  },
  footerText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-primary)',
    fontWeight: '600',
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'underline',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    cursor: 'pointer',
    marginTop: '5px',
    textDecoration: 'none',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  }
};

// Add standard spin keyframes dynamic injection for robustness
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
