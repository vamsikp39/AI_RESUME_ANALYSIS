import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  ShieldCheck, 
  Layers, 
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Mail,
  Phone
} from 'lucide-react';

const Github = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);


export default function AnalysisResults({ results, onReupload }) {
  const { parsedData, atsScore, atsBreakdown, matchScore, keywords, reviews } = results;
  
  const breakdown = atsBreakdown || {
    formatting: Math.round(atsScore * 1.05 > 98 ? 98 : atsScore * 1.05),
    keywords: Math.round(atsScore * 0.95 < 20 ? 20 : atsScore * 0.95),
    impact: Math.round(atsScore * 0.9 < 20 ? 20 : atsScore * 0.9)
  };
  const [animatedAts, setAnimatedAts] = useState(0);
  const [activeInspectorTab, setActiveInspectorTab] = useState('skills');

  // Smooth count-up animation for the score gauge
  useEffect(() => {
    setAnimatedAts(0);
    const duration = 1200; // ms
    const steps = 60;
    const stepTime = duration / steps;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      // Easing out quadratic
      const easeProgress = progress * (2 - progress);
      const nextVal = Math.round(easeProgress * atsScore);
      
      if (currentStep >= steps) {
        setAnimatedAts(atsScore);
        clearInterval(timer);
      } else {
        setAnimatedAts(nextVal);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [atsScore]);

  // Compute circular gauge constants
  const strokeRadius = 70;
  const strokeCircumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = strokeCircumference - (animatedAts / 100) * strokeCircumference;

  // Determine score colors
  const getScoreColor = (score) => {
    if (score < 50) return 'var(--color-danger)'; // Red
    if (score < 75) return 'var(--color-warning)'; // Amber
    return 'var(--color-success)'; // Green
  };

  const scoreColor = getScoreColor(atsScore);

  return (
    <div style={styles.container} className="anim-fade-in">
      
      {/* Header Panel */}
      <div style={styles.header}>
        <div>
          <button onClick={onReupload} style={styles.backBtn}>
            <RotateCcw size={13} /> Return to Scanner
          </button>
          <h1 style={styles.title}>Scan <span className="text-gradient">Report</span></h1>
        </div>
        <div style={styles.badgeCloud}>
          <ShieldCheck size={14} color="var(--color-success)" />
          <span>ATS Audited</span>
        </div>
      </div>

      {/* Main Scoring Grid */}
      <div style={styles.scoringGrid}>
        
        {/* ATS Score Radial Card */}
        <div style={styles.scoreCard} className="glass-card">
          <h3 style={styles.cardLabel}>General ATS Compliance</h3>
          
          <div style={styles.radialContainer}>
            <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background circle */}
              <circle
                cx="90"
                cy="90"
                r={strokeRadius}
                fill="transparent"
                stroke="var(--glass-border)"
                strokeWidth="10"
              />
              {/* Foreground circle */}
              <circle
                cx="90"
                cy="90"
                r={strokeRadius}
                fill="transparent"
                stroke={scoreColor}
                strokeWidth="12"
                strokeDasharray={strokeCircumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
              />
            </svg>
            <div style={styles.radialLabelContainer}>
              <span style={{ ...styles.radialNumber, color: scoreColor }}>{animatedAts}</span>
              <span style={styles.radialPercent}>/ 100</span>
            </div>
          </div>
          
          {/* Detailed Subscore Breakdown Audit */}
          <div style={styles.breakdownContainer}>
            <div style={styles.breakdownItem}>
              <div style={styles.breakdownHeader}>
                <span style={styles.breakdownLabel}>Layout & Parsing Safety</span>
                <span style={{ ...styles.breakdownVal, color: getScoreColor(breakdown.formatting) }}>{breakdown.formatting}%</span>
              </div>
              <div style={styles.breakdownBarBg}>
                <div style={{ ...styles.breakdownBarFill, width: `${breakdown.formatting}%`, background: getScoreColor(breakdown.formatting) }} />
              </div>
            </div>
            <div style={styles.breakdownItem}>
              <div style={styles.breakdownHeader}>
                <span style={styles.breakdownLabel}>Keyword Density & Alignment</span>
                <span style={{ ...styles.breakdownVal, color: getScoreColor(breakdown.keywords) }}>{breakdown.keywords}%</span>
              </div>
              <div style={styles.breakdownBarBg}>
                <div style={{ ...styles.breakdownBarFill, width: `${breakdown.keywords}%`, background: getScoreColor(breakdown.keywords) }} />
              </div>
            </div>
            <div style={styles.breakdownItem}>
              <div style={styles.breakdownHeader}>
                <span style={styles.breakdownLabel}>Accomplishment Impact Metrics</span>
                <span style={{ ...styles.breakdownVal, color: getScoreColor(breakdown.impact) }}>{breakdown.impact}%</span>
              </div>
              <div style={styles.breakdownBarBg}>
                <div style={{ ...styles.breakdownBarFill, width: `${breakdown.impact}%`, background: getScoreColor(breakdown.impact) }} />
              </div>
            </div>
          </div>

          <div style={styles.scoreVerdict}>
            {atsScore < 50 ? (
              <p style={{ color: '#f87171' }}>⚠️ High risk of ATS rejection. Major revisions needed.</p>
            ) : atsScore < 75 ? (
              <p style={{ color: '#fbbf24' }}>⚡ Average compliance. Key keyword and structure optimizations recommended.</p>
            ) : (
              <p style={{ color: '#34d399' }}>✨ Strong ATS compatibility. Excellent format and structure.</p>
            )}
          </div>
        </div>

        {/* Job Matching Card */}
        <div style={styles.scoreCard} className="glass-card">
          <h3 style={styles.cardLabel}>Job Description Alignment</h3>
          
          {matchScore !== null ? (
            <div style={styles.matchContainer}>
              <div style={styles.matchMetrics}>
                <div style={styles.matchScoreLabel}>Match Rate</div>
                <div style={{ ...styles.matchScoreNumber, color: getScoreColor(matchScore) }}>{matchScore}%</div>
              </div>

              <div style={styles.matchBarBg}>
                <div 
                  style={{ 
                    ...styles.matchBarFill, 
                    width: `${matchScore}%`,
                    background: `linear-gradient(90deg, var(--color-purple), ${getScoreColor(matchScore)})`
                  }} 
                />
              </div>

              <div style={styles.jdInsight}>
                {matchScore < 50 ? (
                  <p style={styles.insightText}>
                    <strong>Low overlap:</strong> Your resume lacks key technical keywords found in this JD. Check the keyword gaps checklist to boost alignment.
                  </p>
                ) : matchScore < 75 ? (
                  <p style={styles.insightText}>
                    <strong>Moderate overlap:</strong> You possess the primary tech stack, but secondary skills or methodologies should be added.
                  </p>
                ) : (
                  <p style={styles.insightText}>
                    <strong>High overlap:</strong> Highly compatible! Your resume aligns very well with the technical stack of this listing.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div style={styles.noJdBox}>
              <Briefcase size={28} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
                No Job Description uploaded
              </div>
              <p style={styles.noJdText}>
                Paste a target job description during upload to calculate specific alignment and unlock full keyword gaps.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Keywords Checklists */}
      <div style={styles.keywordCard} className="glass-card">
        <h3 style={styles.sectionTitleSmall}>
          <Layers size={16} color="var(--color-primary)" />
          Keyword Match & Skills Density Check
        </h3>
        
        <div style={styles.keywordGrid}>
          <div>
            <div style={{ ...styles.keywordColumnTitle, color: 'var(--color-success)' }}>
              ✓ Matched Domain Keywords ({keywords.matched.length})
            </div>
            <div style={styles.badgeWrap}>
              {keywords.matched.map(kw => (
                <span key={kw} style={styles.matchedBadge}>{kw}</span>
              ))}
              {keywords.matched.length === 0 && (
                <span style={styles.emptyText}>No domain keyword matches found.</span>
              )}
            </div>
          </div>

          <div>
            <div style={{ ...styles.keywordColumnTitle, color: 'var(--color-warning)' }}>
              ⚠ Missing Target Keywords ({keywords.missing.length})
            </div>
            <div style={styles.badgeWrap}>
              {keywords.missing.map(kw => (
                <span key={kw} style={styles.missingBadge}>{kw}</span>
              ))}
              {keywords.missing.length === 0 && (
                <span style={styles.emptyText}>No missing target keywords. Great job!</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Checklists */}
      <div style={styles.reviewsGrid}>
        
        {/* Formatting Audit */}
        <div style={styles.auditBlock} className="glass-card">
          <h4 style={styles.auditTitle}>Formatting & Structural Audit</h4>
          <div style={styles.auditList}>
            {reviews.formatting.map((rev, i) => (
              <div key={i} style={styles.auditItem}>
                {rev.status === 'pass' && <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0 }} />}
                {rev.status === 'warning' && <AlertTriangle size={16} color="var(--color-warning)" style={{ flexShrink: 0 }} />}
                {rev.status === 'danger' && <XCircle size={16} color="var(--color-danger)" style={{ flexShrink: 0 }} />}
                <span style={styles.auditText}>{rev.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Impact & Accomplishments Audit */}
        <div style={styles.auditBlock} className="glass-card">
          <h4 style={styles.auditTitle}>Impact & Phrasing Audit</h4>
          <div style={styles.auditList}>
            {reviews.impact.map((rev, i) => (
              <div key={i} style={styles.auditItem}>
                {rev.status === 'pass' && <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0 }} />}
                {rev.status === 'warning' && <AlertTriangle size={16} color="var(--color-warning)" style={{ flexShrink: 0 }} />}
                {rev.status === 'danger' && <XCircle size={16} color="var(--color-danger)" style={{ flexShrink: 0 }} />}
                <span style={styles.auditText}>{rev.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Language Audit */}
        <div style={styles.auditBlock} className="glass-card">
          <h4 style={styles.auditTitle}>Vocabulary Density Audit</h4>
          <div style={styles.auditList}>
            {reviews.language.map((rev, i) => (
              <div key={i} style={styles.auditItem}>
                {rev.status === 'pass' && <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0 }} />}
                {rev.status === 'warning' && <AlertTriangle size={16} color="var(--color-warning)" style={{ flexShrink: 0 }} />}
                {rev.status === 'danger' && <XCircle size={16} color="var(--color-danger)" style={{ flexShrink: 0 }} />}
                <span style={styles.auditText}>{rev.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ATS Parser Inspector (Verifying extracted data blocks) */}
      <div style={styles.inspectorCard} className="glass-card">
        <div style={styles.inspectorHeader}>
          <div style={styles.inspectorTitleLeft}>
            <FileText size={18} color="var(--color-secondary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>ATS Parser Inspector</h3>
          </div>
          <p style={styles.inspectorDesc}>
            Check exactly how standard parser databases structured your resume details. Ensure details aren't garbled.
          </p>
        </div>

        {/* Tabs */}
        <div style={styles.inspectorTabs}>
          <button 
            onClick={() => setActiveInspectorTab('skills')} 
            style={{ 
              ...styles.tabBtn, 
              borderBottomColor: activeInspectorTab === 'skills' ? 'var(--color-primary)' : 'transparent',
              color: activeInspectorTab === 'skills' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
          >
            Parsed Skills
          </button>
          <button 
            onClick={() => setActiveInspectorTab('experience')} 
            style={{ 
              ...styles.tabBtn, 
              borderBottomColor: activeInspectorTab === 'experience' ? 'var(--color-primary)' : 'transparent',
              color: activeInspectorTab === 'experience' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
          >
            Parsed Experience
          </button>
          <button 
            onClick={() => setActiveInspectorTab('profile')} 
            style={{ 
              ...styles.tabBtn, 
              borderBottomColor: activeInspectorTab === 'profile' ? 'var(--color-primary)' : 'transparent',
              color: activeInspectorTab === 'profile' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
          >
            Parsed Profile Schema
          </button>
        </div>

        <div style={styles.tabContent}>
          {activeInspectorTab === 'skills' && (
            <div style={styles.skillsInspectorWrap} className="anim-fade-in">
              {parsedData.skills.map(s => (
                <span key={s} style={styles.inspectorSkillBadge}>{s}</span>
              ))}
              {parsedData.skills.length === 0 && <span style={styles.emptyText}>No technical skills detected in plain text.</span>}
            </div>
          )}

          {activeInspectorTab === 'experience' && (
            <div style={styles.expInspectorWrap} className="anim-fade-in">
              {parsedData.experience && parsedData.experience.map((exp, i) => (
                <div key={i} style={styles.expItem}>
                  <div style={styles.expHeader}>
                    <div>
                      <h5 style={styles.expRole}>{exp.role}</h5>
                      <span style={styles.expCompany}>{exp.company}</span>
                    </div>
                    <span style={styles.expDuration}>{exp.duration}</span>
                  </div>
                  <ul style={styles.expBullets}>
                    {exp.bullets.map((b, idx) => (
                      <li key={idx} style={styles.expBullet}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {activeInspectorTab === 'profile' && (
            <div style={styles.profileInspectorWrap} className="anim-fade-in">
              <div style={styles.profileMetaGrid}>
                <div style={styles.profileMetaItem}>
                  <span style={styles.metaLabel}>Extracted Name</span>
                  <div style={styles.metaValue}>{parsedData.name || 'Not Found'}</div>
                </div>
                <div style={styles.profileMetaItem}>
                  <span style={styles.metaLabel}>Contact Email</span>
                  <div style={styles.metaValue}>
                    <Mail size={12} style={{ marginRight: '6px' }} />
                    {parsedData.contact?.email || 'Not Found'}
                  </div>
                </div>
                <div style={styles.profileMetaItem}>
                  <span style={styles.metaLabel}>Contact Phone</span>
                  <div style={styles.metaValue}>
                    <Phone size={12} style={{ marginRight: '6px' }} />
                    {parsedData.contact?.phone || 'Not Found'}
                  </div>
                </div>
                {parsedData.contact?.github && (
                  <div style={styles.profileMetaItem}>
                    <span style={styles.metaLabel}>GitHub Account</span>
                    <a href={parsedData.contact.github} target="_blank" rel="noreferrer" style={styles.metaLink}>
                      <Github size={12} style={{ marginRight: '6px' }} />
                      {parsedData.contact.github}
                    </a>
                  </div>
                )}
                {parsedData.contact?.linkedin && (
                  <div style={styles.profileMetaItem}>
                    <span style={styles.metaLabel}>LinkedIn Portfolio</span>
                    <a href={parsedData.contact.linkedin} target="_blank" rel="noreferrer" style={styles.metaLink}>
                      <Linkedin size={12} style={{ marginRight: '6px' }} />
                      {parsedData.contact.linkedin}
                    </a>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '20px' }}>
                <span style={styles.metaLabel}>Extracted Executive Summary</span>
                <p style={styles.summaryValue}>{parsedData.summary}</p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    marginBottom: '8px',
    padding: 0,
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: '900',
    letterSpacing: '-0.02em',
  },
  badgeCloud: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '8px',
    background: 'hsla(145, 65%, 40%, 0.08)',
    border: '1px solid hsla(145, 65%, 40%, 0.15)',
    color: 'var(--color-success)',
    fontSize: '0.8rem',
    fontWeight: '700',
  },
  scoringGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '30px',
  },
  scoreCard: {
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '20px',
  },
  cardLabel: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: 'var(--text-secondary)',
    alignSelf: 'flex-start',
  },
  radialContainer: {
    position: 'relative',
    width: '180px',
    height: '180px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radialLabelContainer: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  radialNumber: {
    fontSize: '3rem',
    fontWeight: '900',
  },
  radialPercent: {
    fontSize: '1rem',
    color: 'var(--text-muted)',
    marginLeft: '2px',
    fontWeight: '700',
  },
  scoreVerdict: {
    fontSize: '0.88rem',
    fontWeight: '600',
    lineHeight: '1.4',
    padding: '12px 16px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--glass-border)',
    width: '100%',
  },
  matchContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: '16px',
    flex: 1,
    justifyContent: 'center',
  },
  matchMetrics: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchScoreLabel: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
  },
  matchScoreNumber: {
    fontSize: '2rem',
    fontWeight: '900',
  },
  matchBarBg: {
    width: '100%',
    height: '12px',
    borderRadius: '6px',
    background: 'var(--bg-tertiary)',
    overflow: 'hidden',
  },
  matchBarFill: {
    height: '100%',
    borderRadius: '6px',
    transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  jdInsight: {
    padding: '14px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--glass-border)',
    textAlign: 'left',
  },
  insightText: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.55',
  },
  noJdBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px 20px',
    background: 'var(--bg-secondary)',
    border: '1px dashed var(--glass-border)',
    borderRadius: '14px',
    width: '100%',
    flex: 1,
  },
  noJdText: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    lineHeight: '1.45',
    maxWidth: '280px',
    marginTop: '6px',
  },
  keywordCard: {
    padding: '30px',
  },
  sectionTitleSmall: {
    fontSize: '1.15rem',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    borderBottom: '1px solid var(--glass-border)',
    paddingBottom: '12px',
  },
  keywordGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '35px',
  },
  keywordColumnTitle: {
    fontSize: '0.85rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '15px',
  },
  badgeWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  matchedBadge: {
    padding: '5px 12px',
    borderRadius: '6px',
    background: 'hsla(145, 65%, 40%, 0.08)',
    border: '1px solid hsla(145, 65%, 40%, 0.15)',
    color: 'var(--color-success)',
    fontSize: '0.8rem',
    fontWeight: '700',
  },
  missingBadge: {
    padding: '5px 12px',
    borderRadius: '6px',
    background: 'var(--color-warning-glow)',
    border: '1px solid hsla(38, 92%, 50%, 0.2)',
    color: 'var(--color-warning)',
    fontSize: '0.8rem',
    fontWeight: '700',
    boxShadow: '0 0 10px hsla(38, 92%, 50%, 0.03)',
  },
  emptyText: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  reviewsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },
  auditBlock: {
    padding: '24px',
  },
  auditTitle: {
    fontSize: '1rem',
    fontWeight: '800',
    marginBottom: '16px',
    borderBottom: '1px solid var(--glass-border)',
    paddingBottom: '10px',
  },
  auditList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  auditItem: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  auditText: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.45',
  },
  inspectorCard: {
    padding: '30px',
  },
  inspectorHeader: {
    marginBottom: '20px',
  },
  inspectorTitleLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  inspectorDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    marginTop: '6px',
  },
  inspectorTabs: {
    display: 'flex',
    borderBottom: '1px solid var(--glass-border)',
    gap: '15px',
    marginBottom: '20px',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '8px 12px 10px 12px',
    cursor: 'pointer',
    fontSize: '0.88rem',
    fontWeight: '700',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  tabContent: {
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid var(--glass-border)',
  },
  skillsInspectorWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  inspectorSkillBadge: {
    padding: '5px 12px',
    borderRadius: '6px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-secondary)',
    fontSize: '0.82rem',
    fontWeight: '500',
  },
  expInspectorWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  expItem: {
    borderBottom: '1px solid var(--glass-border)',
    paddingBottom: '16px',
  },
  expHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
  },
  expRole: {
    fontSize: '0.98rem',
    fontWeight: '800',
  },
  expCompany: {
    fontSize: '0.82rem',
    color: 'var(--color-primary)',
    fontWeight: '700',
    display: 'block',
    marginTop: '2px',
  },
  expDuration: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
  },
  expBullets: {
    paddingLeft: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  expBullet: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.45',
  },
  profileInspectorWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  profileMetaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  profileMetaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  metaLabel: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  metaValue: {
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
  },
  metaLink: {
    fontSize: '0.85rem',
    color: 'var(--color-secondary)',
    fontWeight: '700',
    textDecoration: 'underline',
    display: 'flex',
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.65',
    background: 'var(--bg-tertiary)',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid var(--glass-border)',
    marginTop: '6px',
  },
  breakdownContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginTop: '10px',
  },
  breakdownItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    textAlign: 'left',
  },
  breakdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  breakdownVal: {
    fontSize: '0.8rem',
    fontWeight: '700',
  },
  breakdownBarBg: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    background: 'var(--bg-tertiary)',
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
  }
};
