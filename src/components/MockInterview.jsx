import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  User, 
  Bot, 
  Award, 
  CheckCircle, 
  ShieldAlert, 
  Cpu, 
  RefreshCw, 
  Briefcase,
  Play
} from 'lucide-react';
import { aiService } from '../services/gemini';
import { dbService } from '../services/firebase';

export default function MockInterview({ user, resumes = [] }) {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [targetJd, setTargetJd] = useState('');
  
  // Chat States
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [botThinking, setBotThinking] = useState(false);
  const [latestFeedback, setLatestFeedback] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [sessionRecordId, setSessionRecordId] = useState('');

  const chatEndRef = useRef(null);

  useEffect(() => {
    // Select first resume by default if available
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, botThinking]);

  const handleStartInterview = async (e) => {
    e.preventDefault();
    if (!selectedResumeId) return;

    const chosenResume = resumes.find(r => r.id === selectedResumeId);
    if (!chosenResume) return;

    setBotThinking(true);
    setSessionStarted(true);
    setLatestFeedback('');
    setEvaluation(null);

    const initialHistory = [];
    const jobRole = targetJd || chosenResume.matchScore ? 'Target Job Position' : 'Software Engineering Position';

    try {
      // Trigger welcome message + 1st question
      const result = await aiService.mockInterviewStep(
        initialHistory, 
        '', 
        chosenResume.parsedData, 
        jobRole
      );

      const welcomeMessage = {
        role: 'model',
        content: result.aiResponse,
        timestamp: new Date().toISOString()
      };

      setChatHistory([welcomeMessage]);
      
      // Save session to Db
      const sessionData = {
        id: 'chat_' + Date.now(),
        resumeId: selectedResumeId,
        targetJd: jobRole,
        history: [welcomeMessage],
        evaluation: null
      };

      const savedSession = await dbService.saveChatSession(user.uid, sessionData);
      setSessionRecordId(savedSession.id);
    } catch (err) {
      console.error(err);
    } finally {
      setBotThinking(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || botThinking) return;

    const chosenResume = resumes.find(r => r.id === selectedResumeId);
    const userMsg = {
      role: 'user',
      content: userInput,
      timestamp: new Date().toISOString()
    };

    const nextHistory = [...chatHistory, userMsg];
    setChatHistory(nextHistory);
    setUserInput('');
    setBotThinking(true);

    try {
      // Call AI coach
      const response = await aiService.mockInterviewStep(
        chatHistory, 
        userInput, 
        chosenResume?.parsedData || {}, 
        targetJd || 'Software Position'
      );

      const botMsg = {
        role: 'model',
        content: response.aiResponse,
        timestamp: new Date().toISOString()
      };

      const updatedHistory = [...nextHistory, botMsg];
      setChatHistory(updatedHistory);
      
      if (response.feedback) {
        setLatestFeedback(response.feedback);
      }

      if (response.evaluation) {
        setEvaluation(response.evaluation);
      }

      // Update Database
      const sessionData = {
        id: sessionRecordId,
        resumeId: selectedResumeId,
        targetJd: targetJd || 'Software Position',
        history: updatedHistory,
        evaluation: response.evaluation || null
      };
      await dbService.saveChatSession(user.uid, sessionData);

    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setBotThinking(false);
    }
  };

  const handleReset = () => {
    setSessionStarted(false);
    setChatHistory([]);
    setLatestFeedback('');
    setEvaluation(null);
  };

  return (
    <div style={styles.container} className="anim-fade-in">
      
      {/* Sidebar headers */}
      <div style={styles.header}>
        <h1 style={styles.title}>Interview <span className="text-gradient">Coach</span></h1>
        <p style={styles.subtitle}>
          Hone your technical interview presence. Our AI Recruiter reviews your uploaded projects and core skills, 
          conducts a dynamic interview, and details a final performance evaluation scorecard.
        </p>
      </div>

      {resumes.length === 0 ? (
        // No Resumes warning
        <div style={styles.warningCard} className="glass-card">
          <ShieldAlert size={36} color="var(--color-warning)" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>No parsed resumes found</h3>
          <p style={styles.warningText}>
            You must parse at least one resume in the **Resume Analyser** tab before you can conduct a technical mock interview!
          </p>
        </div>
      ) : !sessionStarted ? (
        
        // Start interview settings form
        <div style={styles.setupCard} className="glass-card">
          <div style={styles.setupHeader}>
            <Cpu size={24} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Interview Sandbox Configuration</h3>
          </div>
          
          <form onSubmit={handleStartInterview} style={styles.setupForm}>
            <div className="form-group">
              <label className="form-label">Select Source Resume Profiles</label>
              <select
                className="form-input"
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                required
              >
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.parsedData.name || 'Unnamed Applicant'} — {r.parsedData.skills.slice(0, 4).join(', ')} ({new Date(r.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Role Description (Paste Job Requirements)</label>
              <textarea
                className="form-textarea"
                placeholder="Paste the target job description or simply enter a title (e.g. 'Senior Frontend Architect'). The Recruiter AI will dynamically custom-tailor interview questions based on this."
                value={targetJd}
                onChange={(e) => setTargetJd(e.target.value)}
                style={{ minHeight: '110px' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={styles.startBtn}>
              <Play size={14} fill="#ffffff" /> Initiate Technical Round
            </button>
          </form>
        </div>

      ) : (
        
        // Chat workspace
        <div style={styles.chatWorkspace}>
          <div style={styles.chatSplit}>
            
            {/* Chat panels */}
            <div style={styles.chatCard} className="glass-card">
              <div style={styles.chatHeader}>
                <div style={styles.botProfile}>
                  <div style={styles.botAvatar}>
                    <Bot size={18} color="var(--color-secondary)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700' }}>AIRecruiter Coach</h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Technical Hiring Director</span>
                  </div>
                </div>

                <button onClick={handleReset} style={styles.resetBtn} className="btn btn-secondary">
                  Exit Interview
                </button>
              </div>

              {/* Chat messages box */}
              <div style={styles.messagesBox}>
                {chatHistory.map((msg, i) => (
                  <div 
                    key={i} 
                    style={{
                      ...styles.msgRow,
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    {msg.role !== 'user' && (
                      <div style={styles.msgAvatarBot}>
                        <Bot size={14} color="var(--color-secondary)" />
                      </div>
                    )}
                    
                    <div 
                      style={{
                        ...styles.bubble,
                        background: msg.role === 'user' ? 'var(--color-primary)' : 'var(--bg-tertiary)',
                        color: msg.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                        borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                        border: msg.role === 'user' ? 'none' : '1px solid var(--glass-border)'
                      }}
                    >
                      <div style={styles.bubbleContent}>{msg.content}</div>
                    </div>

                    {msg.role === 'user' && (
                      <div style={styles.msgAvatarUser}>
                        <User size={14} color="var(--color-primary)" />
                      </div>
                    )}
                  </div>
                ))}

                {botThinking && (
                  <div style={styles.msgRow}>
                    <div style={styles.msgAvatarBot}>
                      <Bot size={14} color="var(--color-secondary)" />
                    </div>
                    <div style={styles.thinkingBubble} className="glass-card">
                      <div style={styles.waveContainer}>
                        <div style={{ ...styles.waveBar, animationDelay: '0.1s' }} />
                        <div style={{ ...styles.waveBar, animationDelay: '0.2s' }} />
                        <div style={{ ...styles.waveBar, animationDelay: '0.3s' }} />
                        <div style={{ ...styles.waveBar, animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Chat input form */}
              {!evaluation && (
                <form onSubmit={handleSendMessage} style={styles.chatForm}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Formulate your professional response..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    disabled={botThinking}
                    style={{ borderRadius: '10px 0 0 10px', height: '48px' }}
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={botThinking || !userInput.trim()}
                    style={{ borderRadius: '0 10px 10px 0', width: '60px', height: '48px', padding: 0 }}
                  >
                    <Send size={16} />
                  </button>
                </form>
              )}
            </div>

            {/* Side metrics panel */}
            <div style={styles.sidePanel}>
              
              {/* Real-time Response Helper */}
              {latestFeedback && !evaluation && (
                <div style={styles.feedbackCard} className="glass-card anim-fade-in">
                  <h4 style={styles.feedbackTitle}>
                    <Cpu size={14} color="var(--color-secondary)" />
                    Real-time AI Interview Feedback
                  </h4>
                  <p style={styles.feedbackText}>{latestFeedback}</p>
                </div>
              )}

              {/* Final Score Report card */}
              {evaluation && (
                <div style={styles.evaluationCard} className="glass-card anim-fade-in">
                  <div style={styles.evalHeader}>
                    <Award size={20} color="var(--color-warning)" />
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Hiring Manager Scorecard</h4>
                  </div>

                  <div style={styles.evalScoreRow}>
                    <div style={styles.evalCircle}>
                      <span style={styles.evalScoreNum}>{evaluation.score}</span>
                      <span style={styles.evalScoreLabel}>/100</span>
                    </div>
                    <div style={styles.evalVerdict}>
                      <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Verdict:</span>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>
                        {evaluation.score >= 85 
                          ? 'Outstanding performance. Highly qualified. Moving to final decision rounds.' 
                          : evaluation.score >= 70 
                          ? 'Solid technical capability. Decent details, with some communication adjustments.' 
                          : 'Needs refinement. Work on structuring key accomplishments using metrics.'}
                      </p>
                    </div>
                  </div>

                  <div style={styles.evalSection}>
                    <div style={styles.evalSubTitle}>Core Performance Strengths</div>
                    <div style={styles.evalList}>
                      {evaluation.strengths.map((str, i) => (
                        <div key={i} style={styles.evalListItem}>
                          <CheckCircle size={14} color="var(--color-success)" style={{ flexShrink: 0 }} />
                          <span>{str}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ ...styles.evalSection, border: 'none', padding: 0 }}>
                    <div style={styles.evalSubTitle}>Recommended Growth Items</div>
                    <div style={styles.evalList}>
                      {evaluation.improvements.map((imp, i) => (
                        <div key={i} style={styles.evalListItem}>
                          <ShieldAlert size={14} color="var(--color-warning)" style={{ flexShrink: 0 }} />
                          <span>{imp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button onClick={handleReset} className="btn btn-primary" style={{ width: '100%', marginTop: '15px' }}>
                    <RefreshCw size={14} /> Restart Mock Round
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>

      )}
    </div>
  );
}const styles = {
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
  setupCard: {
    padding: '35px',
    maxWidth: '680px',
    margin: '0 auto',
    width: '100%',
  },
  setupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid var(--glass-border)',
    paddingBottom: '15px',
    marginBottom: '25px',
  },
  setupForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  startBtn: {
    padding: '12px 24px',
    fontWeight: '700',
    alignSelf: 'flex-start',
  },
  chatWorkspace: {
    width: '100%',
  },
  chatSplit: {
    display: 'grid',
    gridTemplateColumns: '1.6fr 1fr',
    gap: '30px',
    alignItems: 'flex-start',
  },
  chatCard: {
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    height: '600px',
    overflow: 'hidden',
  },
  chatHeader: {
    padding: '16px 20px',
    background: 'rgba(255,255,255,0.01)',
    borderBottom: '1px solid var(--glass-border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  botProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  botAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'var(--color-secondary-glow)',
    border: '1px solid var(--glass-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtn: {
    padding: '6px 12px',
    fontSize: '0.78rem',
  },
  messagesBox: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    background: 'var(--bg-secondary)',
  },
  msgRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '10px',
    width: '100%',
  },
  msgAvatarBot: {
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    background: 'var(--color-secondary-glow)',
    border: '1px solid var(--glass-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  msgAvatarUser: {
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    background: 'var(--color-primary-glow)',
    border: '1px solid var(--glass-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '80%',
    padding: '14px 18px',
    boxShadow: 'var(--shadow-sm)',
  },
  bubbleContent: {
    fontSize: '0.85rem',
    lineHeight: '1.55',
    whiteSpace: 'pre-wrap',
  },
  thinkingBubble: {
    padding: '14px 20px',
    borderRadius: '12px 12px 12px 2px',
    display: 'flex',
    alignItems: 'center',
  },
  waveContainer: {
    display: 'flex',
    gap: '4px',
    height: '14px',
    alignItems: 'center',
  },
  waveBar: {
    width: '3px',
    height: '8px',
    borderRadius: '1px',
    background: 'var(--color-secondary)',
    animation: 'wave 1s infinite alternate ease-in-out',
  },
  chatForm: {
    display: 'flex',
    padding: '15px 24px',
    background: 'rgba(255,255,255,0.01)',
    borderTop: '1px solid var(--glass-border)',
  },
  sidePanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  feedbackCard: {
    padding: '20px 24px',
    borderLeft: '4px solid var(--color-secondary)',
  },
  feedbackTitle: {
    fontSize: '0.88rem',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
    color: 'var(--color-secondary)',
  },
  feedbackText: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  evaluationCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  evalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '1px solid var(--glass-border)',
    paddingBottom: '12px',
  },
  evalScoreRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  evalCircle: {
    width: '74px',
    height: '74px',
    borderRadius: '50%',
    border: '4px solid var(--color-warning)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-warning-glow)',
    boxShadow: 'none',
  },
  evalScoreNum: {
    fontSize: '1.45rem',
    fontWeight: '900',
    color: 'var(--color-warning)',
  },
  evalScoreLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    fontWeight: '700',
  },
  evalVerdict: {
    flex: 1,
  },
  evalSection: {
    borderBottom: '1px solid var(--glass-border)',
    paddingBottom: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  evalSubTitle: {
    fontSize: '0.82rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
  },
  evalList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  evalListItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.45',
  }
};

// Add standard wave animations injection
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes wave {
      0% { height: 4px; }
      100% { height: 16px; }
    }
  `;
  document.head.appendChild(style);
}
