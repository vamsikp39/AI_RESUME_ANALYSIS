import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import ResumeUploader from './components/ResumeUploader';
import AnalysisResults from './components/AnalysisResults';
import ResumeOptimizer from './components/ResumeOptimizer';
import MockInterview from './components/MockInterview';
import JobRecommendations from './components/JobRecommendations';
import IntegrationSettings from './components/IntegrationSettings';

import { authService, dbService } from './services/firebase';
import { aiService } from './services/gemini';
import { ShieldCheck, CloudLightning, LogIn } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Dashboard Navigation State
  const [activeTab, setActiveTab] = useState('analyser'); // analyser, optimizer, interview, jobs, settings
  
  // Resumes list & analysis focus
  const [resumes, setResumes] = useState([]);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [resumesLoading, setResumesLoading] = useState(false);
  
  // Theme Management
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('resumeai_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Track Firebase Auth Changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      
      if (firebaseUser) {
        setShowAuthModal(false);
        // Load past uploads
        loadUserResumes(firebaseUser.uid);
      } else {
        setResumes([]);
        setAnalysisResults(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Update HTML Theme Attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('resumeai_theme', theme);
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const loadUserResumes = async (userId) => {
    setResumesLoading(true);
    try {
      const data = await dbService.getResumes(userId);
      setResumes(data);
    } catch (err) {
      console.error('Failed to load resumes:', err);
    } finally {
      setResumesLoading(false);
    }
  };

  const handleAnalysisComplete = async (resumeText, targetJd) => {
    if (!user) return;
    
    try {
      // Trigger AI service
      const analysis = await aiService.analyzeResume(resumeText, targetJd);
      
      // Save parsed report details to database
      const resumeRecord = {
        id: 'res_' + Date.now(),
        createdAt: new Date().toISOString(),
        atsScore: analysis.atsScore,
        matchScore: analysis.matchScore,
        parsedData: analysis.parsedData,
        keywords: analysis.keywords,
        reviews: analysis.reviews
      };

      await dbService.saveResume(user.uid, resumeRecord);
      
      // Update local listing states
      setResumes(prev => [resumeRecord, ...prev]);
      setAnalysisResults(resumeRecord);
    } catch (err) {
      console.error('Analysis saving failure:', err);
      alert('An error occurred during analysis: ' + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.reload(); // Hard clean module hooks
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Content swapping dispatcher
  const renderTabContent = () => {
    switch (activeTab) {
      case 'analyser':
        if (analysisResults) {
          return (
            <AnalysisResults 
              results={analysisResults} 
              onReupload={() => setAnalysisResults(null)} 
            />
          );
        }
        return (
          <div style={styles.tabWrapper}>
            <ResumeUploader onAnalysisComplete={handleAnalysisComplete} />
            {resumes.length > 0 && (
              <div style={styles.historySection} className="anim-fade-in">
                <div style={styles.historyHeader}>
                  <ShieldCheck size={18} color="var(--color-purple)" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Your Scanned History</h3>
                </div>
                <div style={styles.historyList}>
                  {resumes.map(r => (
                    <div 
                      key={r.id} 
                      onClick={() => setAnalysisResults(r)} 
                      style={styles.historyCard}
                      className="glass-card"
                    >
                      <div style={styles.historyName}>
                        {r.parsedData.name || 'Resume Profile'}
                        <span style={styles.historyDate}>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div style={styles.historyScores}>
                        <span className="badge badge-success" style={{ background: 'hsla(145, 65%, 40%, 0.08)', color: 'var(--color-success)' }}>
                          ATS: {r.atsScore}
                        </span>
                        {r.matchScore !== null && (
                          <span className="badge badge-info" style={{ background: 'hsla(217, 91%, 50%, 0.08)', color: 'var(--color-info)' }}>
                            Match: {r.matchScore}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'optimizer':
        return <ResumeOptimizer />;
        
      case 'interview':
        return <MockInterview user={user} resumes={resumes} />;
        
      case 'jobs':
        return <JobRecommendations resumes={resumes} />;
        
      case 'settings':
        return <IntegrationSettings />;
        
      default:
        return <ResumeUploader onAnalysisComplete={handleAnalysisComplete} />;
    }
  };

  if (authLoading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingGlow} />
        <div style={styles.loadingContainer}>
          <CloudLightning size={52} color="var(--color-primary)" className="spin" style={{ position: 'relative', zIndex: 2 }} />
          <div style={styles.loadingRing} />
        </div>
        <h3 style={{ fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.02em', marginTop: '24px' }}>
          Initializing <span className="text-gradient">ResumeAI</span>
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '320px', textAlign: 'center', lineHeight: 1.5 }}>
          Securing client-side parser systems and virtualized workspace...
        </p>
      </div>
    );
  }

  // Render Landing Page if no user authenticated
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Navigation Navbar */}
        <nav style={styles.navbar} className="glass-card">
          <div style={styles.navLogo}>
            <CloudLightning size={20} color="var(--color-primary)" />
            <span style={{ fontWeight: '800', fontSize: '1.15rem' }} className="text-gradient">ResumeAI</span>
          </div>
          <button onClick={() => setShowAuthModal(true)} style={styles.loginNavBtn} className="btn-secondary">
            <LogIn size={14} /> Log In
          </button>
        </nav>

        <LandingPage onGetStarted={() => setShowAuthModal(true)} />

        {showAuthModal && (
          <AuthModal 
            onAuthSuccess={() => setShowAuthModal(false)} 
            onClose={() => setShowAuthModal(false)} 
          />
        )}
      </div>
    );
  }

  // Render Dashboard
  return (
    <Dashboard 
      user={user} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      theme={theme} 
      setTheme={setTheme}
      onLogout={handleLogout}
    >
      {renderTabContent()}
    </Dashboard>
  );
}

const styles = {
  loadingScreen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    position: 'relative',
    overflow: 'hidden',
  },
  loadingGlow: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, var(--color-primary-glow) 0%, transparent 70%)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  loadingContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100px',
    height: '100px',
  },
  loadingRing: {
    position: 'absolute',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    border: '2px dashed var(--color-primary)',
    opacity: 0.3,
    animation: 'spin 8s linear infinite',
  },
  navbar: {
    height: '70px',
    margin: '20px 20px 0 20px',
    padding: '0 30px',
    borderRadius: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--shadow-sm)',
    backdropFilter: 'blur(20px) saturate(180%)',
    zIndex: 10,
    transition: 'all 0.3s ease',
  },
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  loginNavBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '10px',
    border: '1px solid var(--glass-border)',
    background: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  tabWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  historySection: {
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  historyHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid var(--glass-border)',
    paddingBottom: '12px',
  },
  historyList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  historyCard: {
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    borderRadius: '14px',
  },
  historyName: {
    display: 'flex',
    flexDirection: 'column',
    fontWeight: '700',
    fontSize: '0.9rem',
    gap: '4px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    maxWidth: '70%',
  },
  historyDate: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  historyScores: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignItems: 'flex-end',
  }
};
