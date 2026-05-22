import React, { useState } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  Flame, 
  Award, 
  Gauge 
} from 'lucide-react';
import { aiService } from '../services/gemini';

export default function ResumeOptimizer() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [copiedId, setCopiedId] = useState('');

  const handleOptimize = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    setResults(null);
    setCopiedId('');

    try {
      const data = await aiService.optimizeBulletPoint(inputText);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  return (
    <div style={styles.container} className="anim-fade-in">
      <div style={styles.header}>
        <h1 style={styles.title}>Bullet <span className="text-gradient">Optimizer</span></h1>
        <p style={styles.subtitle}>
          Revitalize your resume bullet points. Paste a simple task statement (e.g., "wrote python code for an app") 
          to instantly generate three premium iterations focusing on active phrasing, bold verb selections, and quantified business metrics.
        </p>
      </div>

      <div style={styles.workspace}>
        {/* Input box */}
        <div style={styles.inputCard} className="glass-card">
          <form onSubmit={handleOptimize} style={styles.form}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Enter raw task bullet point</label>
              <textarea
                className="form-textarea"
                placeholder="e.g. I worked on a react team and helped build a fast dashboard for clients to manage their funds."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={loading}
                required
                style={{ minHeight: '100px' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={loading || !inputText.trim()}>
              <Sparkles size={16} />
              <span>{loading ? 'Re-engineering content...' : 'Optimize Accomplishment'}</span>
            </button>
          </form>
        </div>

        {/* Loading placeholder */}
        {loading && (
          <div style={styles.loadingCard} className="glass-card anim-pulse">
            <RefreshCw size={24} className="spin" color="var(--color-secondary)" />
            <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Restructuring text layers...
            </div>
          </div>
        )}

        {/* Results grid */}
        {results && (
          <div style={styles.resultsGrid} className="anim-fade-in">
            
            {/* Standard Polished */}
            <div style={styles.resultCard} className="glass-card">
              <div style={styles.resultHeader}>
                <div style={styles.badgeLabel}>
                  <Gauge size={14} color="var(--text-muted)" />
                  <span>Standard Polished</span>
                </div>
                <button 
                  onClick={() => handleCopy(results.standard, 'std')} 
                  style={styles.copyBtn}
                >
                  {copiedId === 'std' ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
                </button>
              </div>
              <p style={styles.resultText}>{results.standard}</p>
            </div>

            {/* Action Verb Focused */}
            <div style={{ ...styles.resultCard, borderLeft: '4px solid var(--color-primary)' }} className="glass-card">
              <div style={styles.resultHeader}>
                <div style={styles.badgeLabel}>
                  <Flame size={14} color="var(--color-primary)" />
                  <span style={{ color: 'var(--color-primary)', fontWeight: '700' }}>Active Action-Verb</span>
                </div>
                <button 
                  onClick={() => handleCopy(results.actionVerb, 'verb')} 
                  style={styles.copyBtn}
                >
                  {copiedId === 'verb' ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
                </button>
              </div>
              <p style={styles.resultText}>{results.actionVerb}</p>
            </div>

            {/* Quantified Metrics */}
            <div style={{ ...styles.resultCard, borderLeft: '4px solid var(--color-secondary)' }} className="glass-card">
              <div style={styles.resultHeader}>
                <div style={styles.badgeLabel}>
                  <Award size={14} color="var(--color-secondary)" />
                  <span style={{ color: 'var(--color-secondary)', fontWeight: '700' }}>Metrics & Quantified Impact</span>
                </div>
                <button 
                  onClick={() => handleCopy(results.metricsQuantified, 'metrics')} 
                  style={styles.copyBtn}
                >
                  {copiedId === 'metrics' ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
                </button>
              </div>
              <p style={styles.resultText}>{results.metricsQuantified}</p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '900px',
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
  },
  workspace: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  inputCard: {
    padding: '30px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  submitBtn: {
    padding: '12px 20px',
    fontWeight: '700',
    alignSelf: 'flex-start',
  },
  loadingCard: {
    padding: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
  },
  resultsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  resultCard: {
    padding: '20px 24px',
    background: 'var(--glass-bg)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.78rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
  },
  copyBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
  resultText: {
    fontSize: '0.88rem',
    color: 'var(--text-primary)',
    lineHeight: '1.55',
    fontWeight: '500',
  }
};
