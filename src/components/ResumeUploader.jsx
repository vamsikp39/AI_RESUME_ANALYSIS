import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  AlertCircle, 
  CheckCircle, 
  Plus, 
  Text,
  FileUp,
  Briefcase,
  Cpu
} from 'lucide-react';
import { parsePdf } from '../services/pdfParser';

export default function ResumeUploader({ onAnalysisComplete }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [textMode, setTextMode] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  
  const [parsing, setParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      setError('Only PDF resume uploads are supported at this time.');
      return;
    }
    
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit.');
      return;
    }

    setFile(selectedFile);
    setTextMode(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const triggerAnalysis = async (e) => {
    e.preventDefault();
    setError('');
    
    let resumeText;
    
    if (textMode) {
      if (pastedText.trim().length < 150) {
        setError('Pasted resume text is too short. Please include full sections.');
        return;
      }
      resumeText = pastedText;
    } else {
      if (!file) {
        setError('Please upload a PDF resume file first.');
        return;
      }
      
      setParsing(true);
      setParseProgress(5);
      
      try {
        resumeText = await parsePdf(file, (progress) => {
          // Sync parse progress
          setParseProgress(Math.max(5, progress));
        });
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to parse PDF resume.');
        setParsing(false);
        return;
      }
    }

    // Call parsing success callback
    onAnalysisComplete(resumeText, jobDescription);
    setParsing(false);
  };

  return (
    <div style={styles.container} className="anim-fade-in">
      <div style={styles.header}>
        <h1 style={styles.title}>Resume <span className="text-gradient">Scanner</span></h1>
        <p style={styles.subtitle}>
          Upload your resume in PDF format or paste its content to run a full ATS compliance check and match keyword gaps against target descriptions.
        </p>
      </div>

      <div style={styles.workspace}>
        <div style={styles.formPanel} className="glass-card">
          <form onSubmit={triggerAnalysis} style={styles.form}>
            
            {/* Toggle Modes */}
            <div style={styles.modeToggle}>
              <button
                type="button"
                onClick={() => { setTextMode(false); setError(''); }}
                style={{
                  ...styles.toggleBtn,
                  background: !textMode ? 'var(--color-primary)' : 'transparent',
                  color: !textMode ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                <FileUp size={14} />
                <span>PDF Document</span>
              </button>
              <button
                type="button"
                onClick={() => { setTextMode(true); setError(''); }}
                style={{
                  ...styles.toggleBtn,
                  background: textMode ? 'var(--color-primary)' : 'transparent',
                  color: textMode ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                <Text size={14} />
                <span>Paste Plain Text</span>
              </button>
            </div>

            {error && (
              <div style={styles.errorBox}>
                <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                <span style={styles.errorText}>{error}</span>
              </div>
            )}

            {/* Document Uploader Area */}
            {!textMode ? (
              <div 
                style={{
                  ...styles.dropzone,
                  borderColor: dragActive ? 'var(--color-primary)' : 'var(--glass-border)',
                  background: dragActive ? 'var(--color-primary-glow)' : 'rgba(0,0,0,0.1)'
                }}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: 'none' }}
                  accept=".pdf"
                  onChange={handleChange}
                />
                
                {file ? (
                  <div style={styles.fileSelected}>
                    <div style={styles.fileIconContainer}>
                      <FileText size={32} color="var(--color-success)" />
                    </div>
                    <div style={styles.fileInfo}>
                      <div style={styles.fileName}>{file.name}</div>
                      <div style={styles.fileSize}>{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setFile(null)} 
                      style={styles.removeBtn}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div style={styles.uploadPrompt} onClick={handleUploadClick}>
                    <UploadCloud size={48} color="var(--text-muted)" style={{ marginBottom: '10px' }} />
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '4px' }}>
                      Drag and drop your resume PDF
                    </h4>
                    <p style={styles.promptSub}>
                      or click to browse local files (Max size: 5MB)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Paste Text Mode
              <div className="form-group">
                <label className="form-label">Resume Text Content</label>
                <textarea
                  className="form-textarea"
                  placeholder="Paste the plain text of your resume here... Include contact info, skills, experience bullet points, and education details."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  style={{ minHeight: '180px' }}
                />
              </div>
            )}

            {/* Job Description Matching Section */}
            <div style={styles.jdSection}>
              <div style={styles.jdHeader}>
                <Briefcase size={16} color="var(--color-secondary)" />
                <h4 style={styles.jdTitle}>Target Job Description <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 'normal' }}>(Optional)</span></h4>
              </div>
              <textarea
                className="form-textarea"
                placeholder="Paste the target job listing description here. ResumeAI will analyze the exact keyword gaps, skill requirements, and compatibility scoring for this specific job."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                style={{ minHeight: '110px' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={styles.submitBtn}
              disabled={parsing}
            >
              <Sparkles size={16} />
              <span>{parsing ? 'Parsing PDF Text...' : 'Analyze My Resume'}</span>
            </button>

          </form>
        </div>

        {/* Loading Overlay */}
        {parsing && (
          <div style={styles.overlay}>
            <div style={styles.loaderCard} className="glass-card anim-pulse">
              <Cpu size={36} color="var(--color-secondary)" className="spin" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>Parsing Document Elements</h3>
              <p style={styles.loaderText}>Extracting text layout, parsing contact schemas, and compiling section records client-side.</p>
              
              <div style={styles.progressBg}>
                <div style={{ ...styles.progressFill, width: `${parseProgress}%` }} />
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{parseProgress}% completed</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
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
    lineHeight: '1.6',
  },
  workspace: {
    position: 'relative',
  },
  formPanel: {
    padding: '35px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  modeToggle: {
    display: 'flex',
    gap: '4px',
    padding: '4px',
    background: 'var(--bg-tertiary)',
    borderRadius: '10px',
    border: '1px solid var(--glass-border)',
    alignSelf: 'flex-start',
  },
  toggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '7px',
    border: 'none',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '10px',
    background: 'rgba(239, 68, 68, 0.04)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
  },
  errorText: {
    fontSize: '0.85rem',
    color: '#dc2626',
    fontWeight: '600',
  },
  dropzone: {
    border: '2px dashed var(--glass-border)',
    borderRadius: '14px',
    padding: '40px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '180px',
  },
  uploadPrompt: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
  },
  promptSub: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    marginTop: '4px',
  },
  fileSelected: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '460px',
  },
  fileIconContainer: {
    padding: '10px',
    background: 'hsla(145, 65%, 40%, 0.08)',
    borderRadius: '8px',
  },
  fileInfo: {
    flex: 1,
    textAlign: 'left',
    overflow: 'hidden',
  },
  fileName: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  fileSize: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    fontSize: '0.78rem',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  jdSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    borderTop: '1px solid var(--glass-border)',
    paddingTop: '20px',
  },
  jdHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  jdTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
  },
  submitBtn: {
    padding: '14px',
    fontSize: '1rem',
    fontWeight: '700',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(248, 250, 252, 0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '16px',
    zIndex: 10,
  },
  loaderCard: {
    maxWidth: '380px',
    padding: '30px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  loaderText: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.55',
    marginBottom: '16px',
  },
  progressBg: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    background: 'var(--bg-tertiary)',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
    transition: 'width 0.15s ease-out',
  }
};
