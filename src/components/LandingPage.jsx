import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  FileText, 
  Cpu, 
  MessageSquare, 
  Zap, 
  TrendingUp,
  Database,
  ArrowUpRight
} from 'lucide-react';

export default function LandingPage({ onGetStarted }) {
  const [demoState, setDemoState] = useState('idle'); // idle -> parsing -> parsed
  const [parsingProgress, setParsingProgress] = useState(0);

  const startDemoParsing = () => {
    setDemoState('parsing');
    setParsingProgress(0);
    const interval = setInterval(() => {
      setParsingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDemoState('parsed');
          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  return (
    <div style={styles.container} className="anim-fade-in">
      
      {/* Background Orbs */}
      <div style={styles.glowOrb1} />
      <div style={styles.glowOrb2} />

      {/* Hero Section */}
      <header style={styles.hero}>
        <div style={styles.badgeContainer}>
          <div style={styles.sparkleBadge} className="anim-pulse">
            <Sparkles size={12} color="var(--color-secondary)" style={{ marginRight: '6px' }} />
            <span>AI-Powered ATS Optimizations</span>
          </div>
        </div>
        
        <h1 style={styles.heroTitle}>
          Land more interviews with <br />
          <span className="text-gradient" style={{ fontWeight: '900' }}>AI Resume Analytics</span>
        </h1>
        
        <p style={styles.heroSubtitle}>
          ResumeAI automatically parses your resume in-browser, computes accurate ATS scoring, 
          detects keyword gaps against target descriptions, and prepares you for mock recruiter interviews.
        </p>

        <div style={styles.ctaGroup}>
          <button onClick={onGetStarted} className="btn btn-primary" style={styles.ctaMain}>
            Start Analysing For Free
            <ArrowRight size={16} />
          </button>
          <a href="#features" className="btn btn-secondary" style={styles.ctaSec}>
            Explore Features
          </a>
        </div>
      </header>

      {/* Interactive Showcase Mockup Card */}
      <section style={styles.showcase}>
        <div style={styles.mockupContainer} className="glass-card anim-float">
          <div style={styles.mockupHeader}>
            <div style={styles.dots}>
              <div style={{ ...styles.dot, backgroundColor: '#ef4444' }} />
              <div style={{ ...styles.dot, backgroundColor: '#f59e0b' }} />
              <div style={{ ...styles.dot, backgroundColor: '#10b981' }} />
            </div>
            <div style={styles.mockupTitle}>ATS Scanner Sandbox</div>
            <div style={{ width: '40px' }} />
          </div>

          <div style={styles.mockupBody}>
            {demoState === 'idle' && (
              <div style={styles.demoIdle}>
                <FileText size={48} color="var(--color-primary)" style={{ marginBottom: '16px' }} />
                <h4 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '8px' }}>Test the AI Engine instantly</h4>
                <p style={styles.demoText}>
                  Experience how the in-browser PDF parser maps skills and calculates ATS scoring in real time.
                </p>
                <button onClick={startDemoParsing} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                  <Zap size={14} /> Run Interactive Demo
                </button>
              </div>
            )}

            {demoState === 'parsing' && (
              <div style={styles.demoParsing}>
                <Cpu size={36} color="var(--color-secondary)" className="spin" style={{ marginBottom: '16px' }} />
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                  Extracting elements & scanning keyword gaps...
                </div>
                <div style={styles.progressBarBg}>
                  <div style={{ ...styles.progressBarFill, width: `${parsingProgress}%` }} />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{parsingProgress}% completed</div>
              </div>
            )}

            {demoState === 'parsed' && (
              <div style={styles.demoParsed} className="anim-fade-in">
                <div style={styles.parsedHeader}>
                  <div style={styles.parsedUser}>
                    <div style={styles.avatar}>JD</div>
                    <div>
                      <h5 style={{ fontSize: '1rem', fontWeight: '800' }}>Jane Doe</h5>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Senior React Engineer</span>
                    </div>
                  </div>
                  <div style={styles.parsedScore} className="anim-pulse">
                    <div style={styles.scoreText}>85</div>
                    <span style={{ fontSize: '0.6rem', color: 'var(--color-success)', fontWeight: '800', letterSpacing: '0.05em' }}>ATS SCORE</span>
                  </div>
                </div>

                <div style={styles.parsedDetails}>
                  <div style={styles.detailBlock}>
                    <span style={styles.detailTitle}>Identified Core Skills</span>
                    <div style={styles.skillsList}>
                      {['React', 'TypeScript', 'Node.js', 'Redux', 'Git'].map(s => (
                        <span key={s} style={styles.miniSkillBadge}>{s}</span>
                      ))}
                    </div>
                  </div>

                  <div style={styles.detailBlock}>
                    <span style={styles.detailTitle}>Detected Keyword Gaps</span>
                    <div style={styles.gapsList}>
                      <span style={styles.gapItem}><Zap size={12} color="var(--color-warning)" /> System Design</span>
                      <span style={styles.gapItem}><Zap size={12} color="var(--color-warning)" /> Docker</span>
                    </div>
                  </div>
                </div>

                <button onClick={() => setDemoState('idle')} style={styles.resetBtn}>
                  Reset Demo sandbox
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" style={styles.featuresSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Everything you need to <span className="text-gradient">succeed</span></h2>
          <p style={styles.sectionSubtitle}>
            Our application wraps advanced parser code, structured NLP algorithms, and custom mock interviews into one powerful platform.
          </p>
        </div>

        <div style={styles.featureGrid}>
          
          <div style={styles.featureCard} className="glass-card">
            <div style={styles.featureIconContainerPurple}>
              <FileText size={20} color="var(--color-primary)" />
            </div>
            <h4 style={styles.featureTitle}>In-Browser PDF Parsing</h4>
            <p style={styles.featureDesc}>
              No server-side uploads required. We parse your PDF text directly in the sandbox for absolute privacy.
            </p>
          </div>

          <div style={styles.featureCard} className="glass-card">
            <div style={styles.featureIconContainerCyan}>
              <Cpu size={20} color="var(--color-secondary)" />
            </div>
            <h4 style={styles.featureTitle}>Job Description Matcher</h4>
            <p style={styles.featureDesc}>
              Paste a target job description to instantly calculate overlap metrics and identify exactly which keywords you are missing.
            </p>
          </div>

          <div style={styles.featureCard} className="glass-card">
            <div style={styles.featureIconContainerPurple}>
              <MessageSquare size={20} color="var(--color-primary)" />
            </div>
            <h4 style={styles.featureTitle}>Mock Recruiter Interviews</h4>
            <p style={styles.featureDesc}>
              Conduct live, interactive mock interviews with our AIRecruiter coach based on your resume achievements and target JD.
            </p>
          </div>

          <div style={styles.featureCard} className="glass-card">
            <div style={styles.featureIconContainerCyan}>
              <TrendingUp size={20} color="var(--color-secondary)" />
            </div>
            <h4 style={styles.featureTitle}>ATS Score Audit</h4>
            <p style={styles.featureDesc}>
              Receive specific audits on action verbs, metric quantification, passive sentences, and page length guidelines.
            </p>
          </div>

        </div>
      </section>

      {/* Footer CTA */}
      <section style={styles.footerCTA}>
        <div style={styles.footerGlass} className="glass-card anim-pulse">
          <h3 style={styles.footerCTATitle}>Ready to optimize your application?</h3>
          <p style={styles.footerCTASub}>
            Connect your own Firebase credentials and Google Gemini Key to launch a permanent, cloud-powered job search workspace.
          </p>
          <button onClick={onGetStarted} className="btn btn-accent" style={styles.ctaAccent}>
            Launch Dashboard <ArrowUpRight size={16} />
          </button>
        </div>
      </section>

      <footer style={styles.footerBottom}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          © 2026 ResumeAI. Engineered with Vanilla CSS, Firebase Cloud Firestore, and Google Gemini.
        </p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    padding: '0 20px',
    maxWidth: '1200px',
    margin: '0 auto',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  glowOrb1: {
    position: 'absolute',
    top: '100px',
    left: '-200px',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--color-primary-glow) 0%, transparent 70%)',
    zIndex: -1,
  },
  glowOrb2: {
    position: 'absolute',
    top: '400px',
    right: '-200px',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--color-secondary-glow) 0%, transparent 70%)',
    zIndex: -1,
  },
  hero: {
    textAlign: 'center',
    padding: '120px 10px 50px 10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '800px',
    gap: '24px',
  },
  badgeContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  sparkleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 16px',
    borderRadius: '9999px',
    background: 'var(--color-primary-glow)',
    border: '1px solid hsla(var(--primary-hue), 90%, 60%, 0.15)',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    boxShadow: 'var(--shadow-sm)',
  },
  heroTitle: {
    fontSize: '3.6rem',
    fontWeight: '900',
    lineHeight: '1.15',
    letterSpacing: '-0.03em',
  },
  heroSubtitle: {
    fontSize: '1.15rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.65',
    maxWidth: '700px',
  },
  ctaGroup: {
    display: 'flex',
    gap: '16px',
    marginTop: '15px',
  },
  ctaMain: {
    padding: '14px 28px',
    fontSize: '1rem',
  },
  ctaSec: {
    padding: '14px 28px',
    fontSize: '1rem',
  },
  showcase: {
    width: '100%',
    maxWidth: '560px',
    margin: '40px 0 80px 0',
  },
  mockupContainer: {
    padding: '0',
    overflow: 'hidden',
    border: '1px solid var(--glass-border)',
  },
  mockupHeader: {
    padding: '14px 24px',
    background: 'rgba(255,255,255,0.01)',
    borderBottom: '1px solid var(--glass-border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dots: {
    display: 'flex',
    gap: '6px',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  mockupTitle: {
    fontSize: '0.78rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  mockupBody: {
    padding: '30px',
    minHeight: '270px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-secondary)',
  },
  demoIdle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '10px',
    maxWidth: '320px',
  },
  demoText: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.45',
    marginBottom: '10px',
  },
  demoParsing: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '14px',
    width: '100%',
  },
  progressBarBg: {
    width: '80%',
    height: '6px',
    borderRadius: '3px',
    background: 'var(--bg-tertiary)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
    transition: 'width 0.1s linear',
  },
  demoParsed: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  parsedHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--glass-border)',
    paddingBottom: '14px',
  },
  parsedUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'var(--color-primary-glow)',
    border: '1px solid hsla(var(--primary-hue), 84%, 54%, 0.15)',
    color: 'var(--color-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '0.85rem',
  },
  parsedScore: {
    textAlign: 'center',
    background: 'hsla(145, 65%, 40%, 0.08)',
    border: '1px solid hsla(145, 65%, 40%, 0.15)',
    borderRadius: '12px',
    padding: '6px 12px',
  },
  scoreText: {
    fontSize: '1.25rem',
    fontWeight: '900',
    color: 'var(--color-success)',
    lineHeight: '1',
  },
  parsedDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  detailBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  detailTitle: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  skillsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  miniSkillBadge: {
    padding: '4px 10px',
    borderRadius: '6px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--glass-border)',
    fontSize: '0.72rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  gapsList: {
    display: 'flex',
    gap: '16px',
  },
  gapItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  resetBtn: {
    alignSelf: 'center',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  featuresSection: {
    width: '100%',
    padding: '60px 0 80px 0',
    borderTop: '1px solid var(--glass-border)',
  },
  sectionHeader: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '60px',
  },
  sectionTitle: {
    fontSize: '2.2rem',
    fontWeight: '900',
    letterSpacing: '-0.02em',
  },
  sectionSubtitle: {
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    maxWidth: '650px',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px',
  },
  featureCard: {
    padding: '30px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  featureIconContainerPurple: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'var(--color-primary-glow)',
    border: '1px solid hsla(var(--primary-hue), 84%, 54%, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconContainerCyan: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'var(--color-secondary-glow)',
    border: '1px solid hsla(var(--secondary-hue), 90%, 45%, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: '1.05rem',
    fontWeight: '800',
  },
  featureDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.55',
  },
  footerCTA: {
    width: '100%',
    paddingBottom: '80px',
  },
  footerGlass: {
    padding: '60px 40px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  footerCTATitle: {
    fontSize: '1.85rem',
    fontWeight: '900',
    letterSpacing: '-0.02em',
  },
  footerCTASub: {
    color: 'var(--text-secondary)',
    fontSize: '0.98rem',
    maxWidth: '600px',
    lineHeight: '1.55',
    marginBottom: '8px',
  },
  ctaAccent: {
    padding: '12px 24px',
    fontSize: '0.95rem',
  },
  footerBottom: {
    padding: '30px 0',
    borderTop: '1px solid var(--glass-border)',
    width: '100%',
    textAlign: 'center',
  }
};
