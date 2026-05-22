import React, { useState } from 'react';
import { 
  Database, 
  Key, 
  HelpCircle, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Trash2, 
  Info,
  ExternalLink 
} from 'lucide-react';
import { 
  getStoredFirebaseConfig, 
  reinitializeFirebase, 
  authService 
} from '../services/firebase';
import { 
  getStoredGeminiKey, 
  reinitializeGemini, 
  isGeminiLive 
} from '../services/gemini';

export default function IntegrationSettings() {
  // Firebase configuration states
  const savedFb = getStoredFirebaseConfig() || {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  };
  
  const [fbConfig, setFbConfig] = useState(savedFb);
  const [geminiKey, setGeminiKey] = useState(getStoredGeminiKey());
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSaveFirebase = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Basic validations
      if (!fbConfig.apiKey || !fbConfig.projectId || !fbConfig.appId) {
        throw new Error('Please fill in at least API Key, Project ID, and App ID.');
      }
      
      reinitializeFirebase(fbConfig);
      setSuccessMsg('Firebase credentials updated successfully! Reloading...');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save Firebase config.');
      setLoading(false);
    }
  };

  const handleClearFirebase = () => {
    if (window.confirm('Are you sure you want to disconnect Firebase and revert to Simulator?')) {
      reinitializeFirebase(null);
    }
  };

  const handleSaveGemini = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (!geminiKey || geminiKey.trim().length < 10) {
        throw new Error('Please enter a valid Gemini API Key.');
      }
      reinitializeGemini(geminiKey);
      setSuccessMsg('Gemini API key updated successfully! Reloading...');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save Gemini API key.');
      setLoading(false);
    }
  };

  const handleClearGemini = () => {
    if (window.confirm('Are you sure you want to remove your Gemini API key?')) {
      reinitializeGemini('');
    }
  };

  const isFbConnected = authService.isRealFirebase();
  const isGeminiConnected = isGeminiLive();

  return (
    <div style={styles.container} className="anim-fade-in">
      <div style={styles.header}>
        <h1 style={styles.title}>System <span className="text-gradient">Integrations</span></h1>
        <p style={styles.subtitle}>
          Configure your cloud databases and AI credentials. ResumeAI runs entirely in simulated mode by default, 
          but you can connect your own serverless databases to unlock permanent shared history and live AI engines.
        </p>
      </div>

      {successMsg && (
        <div style={styles.successAlert}>
          <CheckCircle size={18} color="var(--color-success)" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={styles.errorAlert}>
          <AlertCircle size={18} color="var(--color-danger)" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div style={styles.grid}>
        
        {/* Firebase Settings */}
        <div style={styles.card} className="glass-card">
          <div style={styles.cardHeader}>
            <div style={styles.iconContainerPurple}>
              <Database size={20} color="var(--color-primary)" />
            </div>
            <div>
              <h3 style={styles.cardTitle}>Cloud Database Setup</h3>
              <p style={styles.cardDesc}>Connect to your Google Firebase Firestore database.</p>
            </div>
          </div>

          <div style={styles.statusSection}>
            <div style={styles.statusLabel}>Connection Status:</div>
            {isFbConnected ? (
              <span className="badge badge-success" style={styles.badgeGlowSuccess}>
                <CheckCircle size={12} style={{ marginRight: '5px' }} />
                Active Cloud Firestore
              </span>
            ) : (
              <span className="badge badge-info" style={styles.badgeGlowInfo}>
                <Info size={12} style={{ marginRight: '5px' }} />
                Local Storage Simulator
              </span>
            )}
          </div>

          {!isFbConnected && (
            <div style={styles.infoBox}>
              <Info size={16} color="var(--color-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={styles.infoText}>
                <strong>Simulator Active:</strong> Resumes and interview history are currently saved locally to your browser's index storage. 
                They won't be synced in the cloud. Fill in the keys on the right to store them permanently.
              </p>
            </div>
          )}

          <form onSubmit={handleSaveFirebase} style={styles.form}>
            <div style={styles.inputGrid}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">API Key</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="AIzaSy..."
                  value={fbConfig.apiKey}
                  onChange={(e) => setFbConfig({ ...fbConfig, apiKey: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Project ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="my-resume-project"
                  value={fbConfig.projectId}
                  onChange={(e) => setFbConfig({ ...fbConfig, projectId: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Auth Domain</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="project-id.firebaseapp.com"
                  value={fbConfig.authDomain}
                  onChange={(e) => setFbConfig({ ...fbConfig, authDomain: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">App ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="1:123456:web:abcd"
                  value={fbConfig.appId}
                  onChange={(e) => setFbConfig({ ...fbConfig, appId: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div style={styles.actions}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={styles.saveBtn}
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? 'spin' : ''} />
                Save Config & Link Cloud
              </button>
              
              {isFbConnected && (
                <button
                  type="button"
                  onClick={handleClearFirebase}
                  className="btn btn-secondary"
                  style={styles.deleteBtn}
                  disabled={loading}
                >
                  <Trash2 size={14} />
                  Revert to Local Simulator
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Gemini Settings */}
        <div style={styles.card} className="glass-card">
          <div style={styles.cardHeader}>
            <div style={styles.iconContainerCyan}>
              <Key size={20} color="var(--color-secondary)" />
            </div>
            <div>
              <h3 style={styles.cardTitle}>Gemini AI Key</h3>
              <p style={styles.cardDesc}>Link your Google AI Studio Gemini API key to enable live analysis.</p>
            </div>
          </div>

          <div style={styles.statusSection}>
            <div style={styles.statusLabel}>Engine Status:</div>
            {isGeminiConnected ? (
              <span className="badge badge-success" style={styles.badgeGlowSuccess}>
                <CheckCircle size={12} style={{ marginRight: '5px' }} />
                Gemini 2.5 Live
              </span>
            ) : (
              <span className="badge badge-warning" style={styles.badgeGlowWarning}>
                <AlertCircle size={12} style={{ marginRight: '5px' }} />
                NLP Parser Simulation Mode
              </span>
            )}
          </div>

          <div style={styles.infoBox}>
            <HelpCircle size={16} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={styles.infoText}>
              <strong>Heuristics Active:</strong> Without a live API key, ResumeAI analyzes resumes and simulates interview chats 
              completely in-browser using rule-based metrics. It works incredibly well, but entering a Gemini key unlocks full contextual LLM capability.
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                rel="noreferrer" 
                style={styles.link}
              >
                Get a free key here <ExternalLink size={10} style={{ marginLeft: '2px' }} />
              </a>
            </p>
          </div>

          <form onSubmit={handleSaveGemini} style={styles.form}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Gemini API Key</label>
              <input
                type="password"
                className="form-input"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div style={styles.actions}>
              <button 
                type="submit" 
                className="btn btn-accent" 
                style={styles.saveBtn}
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? 'spin' : ''} />
                Link Gemini Key
              </button>

              {isGeminiConnected && (
                <button
                  type="button"
                  onClick={handleClearGemini}
                  className="btn btn-secondary"
                  style={styles.deleteBtn}
                  disabled={loading}
                >
                  <Trash2 size={14} />
                  Disable Live AI
                </button>
              )}
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: '900',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    lineHeight: '1.65',
    maxWidth: '850px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: '30px',
  },
  card: {
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  cardHeader: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  iconContainerPurple: {
    padding: '12px',
    borderRadius: '12px',
    background: 'var(--color-primary-glow)',
    border: '1px solid var(--glass-border)',
  },
  iconContainerCyan: {
    padding: '12px',
    borderRadius: '12px',
    background: 'var(--color-secondary-glow)',
    border: '1px solid var(--glass-border)',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
  },
  cardDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  statusSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '10px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--glass-border)',
  },
  statusLabel: {
    fontSize: '0.88rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  badgeGlowSuccess: {
    boxShadow: 'none',
  },
  badgeGlowInfo: {
    boxShadow: 'none',
  },
  badgeGlowWarning: {
    boxShadow: 'none',
  },
  infoBox: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    borderRadius: '12px',
    background: 'var(--bg-secondary)',
    borderLeft: '4px solid var(--color-secondary)',
  },
  infoText: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.55',
  },
  link: {
    color: 'var(--color-secondary)',
    fontWeight: '700',
    textDecoration: 'underline',
    display: 'inline-flex',
    alignItems: 'center',
    marginLeft: '6px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: '5px',
  },
  saveBtn: {
    flex: 2,
    padding: '12px',
    fontWeight: '700',
  },
  deleteBtn: {
    flex: 1,
    padding: '12px',
    borderColor: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--color-danger)',
    fontWeight: '600',
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px',
    borderRadius: '12px',
    background: 'var(--color-success-glow)',
    border: '1px solid hsla(145, 65%, 40%, 0.15)',
    color: 'var(--color-success)',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px',
    borderRadius: '12px',
    background: 'var(--color-danger-glow)',
    border: '1px solid hsla(0, 84%, 60%, 0.15)',
    color: 'var(--color-danger)',
    fontWeight: '600',
    fontSize: '0.9rem',
  }
};
