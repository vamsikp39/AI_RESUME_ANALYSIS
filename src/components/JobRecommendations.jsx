import React, { useState } from 'react';
import { 
  TrendingUp, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  ShieldCheck, 
  ChevronRight, 
  Layers,
  Sparkles,
  Info,
  ExternalLink
} from 'lucide-react';

export default function JobRecommendations({ resumes = [] }) {
  const [selectedResumeId, setSelectedResumeId] = useState('');

  // Handle default selection
  React.useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  const activeResume = resumes.find(r => r.id === selectedResumeId);
  const skills = activeResume?.parsedData?.skills || ['React', 'JavaScript', 'HTML5', 'CSS3', 'Git'];

  // Static careers list mapping skills to roles
  const mockJobs = [
    {
      id: 'job_1',
      role: 'Senior React Developer',
      company: 'Digital Horizon Systems',
      location: 'San Francisco, CA (Hybrid)',
      salary: '$135,000 - $160,000',
      matchScore: 92,
      primarySkills: ['React', 'TypeScript', 'Redux', 'REST API'],
      applyUrl: 'https://linkedin.com/jobs'
    },
    {
      id: 'job_2',
      role: 'Full Stack Software Engineer',
      company: 'Nova AI Labs',
      location: 'Remote (USA / Canada)',
      salary: '$120,000 - $145,000',
      matchScore: 84,
      primarySkills: ['React', 'Node.js', 'Express', 'SQL'],
      applyUrl: 'https://linkedin.com/jobs'
    },
    {
      id: 'job_3',
      role: 'Frontend Architect',
      company: 'Starlight Fintech',
      location: 'New York, NY (Onsite)',
      salary: '$165,000 - $190,000',
      matchScore: 78,
      primarySkills: ['TypeScript', 'Vue', 'Docker', 'System Design'],
      applyUrl: 'https://linkedin.com/jobs'
    },
    {
      id: 'job_4',
      role: 'Developer Relations Engineer',
      company: 'SaaSify Global',
      location: 'Remote (Worldwide)',
      salary: '$110,000 - $130,000',
      matchScore: 65,
      primarySkills: ['JavaScript', 'HTML5', 'CSS3', 'Technical Writing'],
      applyUrl: 'https://linkedin.com/jobs'
    }
  ];

  // Dynamic overlap metrics calculation
  const getJobCompatibility = (jobSkills) => {
    let matched = 0;
    jobSkills.forEach(s => {
      if (skills.some(resumeSkill => resumeSkill.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(resumeSkill.toLowerCase()))) {
        matched++;
      }
    });
    const base = Math.round((matched / jobSkills.length) * 100);
    return Math.min(Math.max(base, 25), 98);
  };

  const dynamicJobs = mockJobs.map(job => ({
    ...job,
    matchScore: activeResume ? getJobCompatibility(job.primarySkills) : job.matchScore
  })).sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div style={styles.container} className="anim-fade-in">
      <div style={styles.header}>
        <h1 style={styles.title}>Job <span className="text-gradient">Recommendations</span></h1>
        <p style={styles.subtitle}>
          Match your parsed resume skills against modern career listings. We map your density profile 
          to calculate compatibility percentages and help you target roles you are highly qualified for.
        </p>
      </div>

      {resumes.length === 0 ? (
        <div style={styles.warningCard} className="glass-card">
          <Info size={36} color="var(--color-secondary)" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>No resume data available</h3>
          <p style={styles.warningText}>
            Please upload a resume in the **Resume Analyser** tab first so we can parse your skills and recommend matched opportunities!
          </p>
        </div>
      ) : (
        <div style={styles.workspace}>
          
          {/* Selector */}
          <div style={styles.selectorRow}>
            <span style={styles.selectorLabel}>Evaluating Skills Profile for:</span>
            <select
              className="form-input"
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              style={{ maxWidth: '320px', padding: '8px 12px', fontSize: '0.85rem' }}
            >
              {resumes.map(r => (
                <option key={r.id} value={r.id}>
                  {r.parsedData.name || 'Resume Profile'} ({new Date(r.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div style={styles.mainGrid}>
            
            {/* Jobs list */}
            <div style={styles.listSection}>
              <h3 style={styles.sectionTitle}>
                <Briefcase size={16} color="var(--color-primary)" />
                Compatible Job Listings
              </h3>

              <div style={styles.jobsList}>
                {dynamicJobs.map(job => (
                  <div key={job.id} style={styles.jobCard} className="glass-card">
                    <div style={styles.jobHeader}>
                      <div>
                        <h4 style={styles.jobRole}>{job.role}</h4>
                        <span style={styles.jobCompany}>{job.company}</span>
                      </div>
                      
                      {/* Match Score Bubble */}
                      <div 
                        style={{
                          ...styles.scoreBadge,
                          background: job.matchScore >= 80 ? 'var(--color-success-glow)' : job.matchScore >= 60 ? 'var(--color-warning-glow)' : 'var(--color-danger-glow)',
                          borderColor: job.matchScore >= 80 ? 'hsla(145, 65%, 40%, 0.15)' : job.matchScore >= 60 ? 'hsla(38, 92%, 50%, 0.15)' : 'hsla(0, 84%, 60%, 0.15)',
                          color: job.matchScore >= 80 ? 'var(--color-success)' : job.matchScore >= 60 ? 'var(--color-warning)' : 'var(--color-danger)'
                        }}
                      >
                        <span style={{ fontSize: '1rem', fontWeight: '800' }}>{job.matchScore}%</span>
                        <span style={{ fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase' }}>Match</span>
                      </div>
                    </div>

                    <div style={styles.jobMeta}>
                      <span style={styles.metaItem}>
                        <MapPin size={12} color="var(--text-muted)" />
                        {job.location}
                      </span>
                      <span style={styles.metaItem}>
                        <DollarSign size={12} color="var(--text-muted)" />
                        {job.salary}
                      </span>
                    </div>

                    <div style={styles.requiredSkills}>
                      <span style={styles.skillsLabel}>Required stack:</span>
                      <div style={styles.skillsWrap}>
                        {job.primarySkills.map(s => {
                          const isMatched = skills.some(userSkill => userSkill.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(userSkill.toLowerCase()));
                          return (
                            <span 
                              key={s} 
                              style={{
                                ...styles.skillBadge,
                                background: isMatched ? 'var(--color-success-glow)' : 'rgba(255,255,255,0.02)',
                                borderColor: isMatched ? 'hsla(145, 65%, 40%, 0.15)' : 'var(--glass-border)',
                                color: isMatched ? 'var(--color-success)' : 'var(--text-secondary)'
                              }}
                            >
                              {s}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <a 
                      href={job.applyUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn btn-secondary" 
                      style={styles.applyBtn}
                    >
                      <span>Apply on LinkedIn</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar summary stats card */}
            <div style={styles.summaryCard} className="glass-card">
              <div style={styles.summaryHeader}>
                <TrendingUp size={18} color="var(--color-secondary)" />
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Skills Overlap Analysis</h4>
              </div>

              <div style={styles.radarInfoBox}>
                <span style={styles.radarLabel}>Active Candidate Profile Technical Density</span>
                <div style={styles.skillsBlock}>
                  {skills.slice(0, 12).map(s => (
                    <span key={s} style={styles.inspectorSkillBadge}>{s}</span>
                  ))}
                  {skills.length > 12 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>+ {skills.length - 12} more</span>}
                </div>
              </div>

              <div style={styles.compatibilityRatingBox}>
                <div style={styles.compatibilityTitle}>Compatibility Verdict</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginTop: '6px' }}>
                  Based on your parsed stack ({skills.length} tools detected), you are highly competitive for **Frontend** and **Full Stack React** roles. 
                  Consider optimizing your resume with terms like **System Design** or **Docker** to unlock higher compatibility on enterprise backend engineering listings.
                </p>
              </div>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1150px',
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
  warningCard: {
    padding: '40px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '600px',
    margin: '30px auto',
  },
  warningText: {
    fontSize: '0.88rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    maxWidth: '450px',
  },
  workspace: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  selectorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  selectorLabel: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1.6fr 1fr',
    gap: '30px',
    alignItems: 'flex-start',
  },
  listSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid var(--glass-border)',
    paddingBottom: '10px',
  },
  jobsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  jobCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  jobHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  jobRole: {
    fontSize: '1.1rem',
    fontWeight: '800',
  },
  jobCompany: {
    fontSize: '0.85rem',
    color: 'var(--color-primary)',
    fontWeight: '700',
    marginTop: '2px',
    display: 'block',
  },
  scoreBadge: {
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid transparent',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    lineHeight: '1.1',
  },
  jobMeta: {
    display: 'flex',
    gap: '20px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
  requiredSkills: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  skillsLabel: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  skillsWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  skillBadge: {
    padding: '4px 10px',
    borderRadius: '4px',
    border: '1px solid transparent',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  applyBtn: {
    alignSelf: 'flex-start',
    padding: '8px 16px',
    fontSize: '0.85rem',
    display: 'inline-flex',
    gap: '6px',
  },
  summaryCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  summaryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '1px solid var(--glass-border)',
    paddingBottom: '12px',
  },
  radarInfoBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  radarLabel: {
    fontSize: '0.78rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
  },
  skillsBlock: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    background: 'var(--bg-secondary)',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid var(--glass-border)',
  },
  inspectorSkillBadge: {
    padding: '4px 10px',
    borderRadius: '4px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-secondary)',
    fontSize: '0.75rem',
  },
  compatibilityRatingBox: {
    padding: '16px',
    borderRadius: '12px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--glass-border)',
  },
  compatibilityTitle: {
    fontSize: '0.85rem',
    fontWeight: '800',
  }
};
