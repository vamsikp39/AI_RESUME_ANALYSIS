import React, { useState } from 'react';
import { 
  FileText, 
  Cpu, 
  MessageSquare, 
  TrendingUp, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  ChevronLeft,
  User,
  Sparkles,
  Database,
  CloudLightning
} from 'lucide-react';
import { authService } from '../services/firebase';

export default function Dashboard({ 
  user, 
  activeTab, 
  setActiveTab, 
  theme, 
  setTheme, 
  onLogout,
  children 
}) {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: 'analyser', label: 'Resume Analyser', icon: FileText },
    { id: 'optimizer', label: 'Bullet Optimizer', icon: Sparkles },
    { id: 'interview', label: 'Mock Interview Coach', icon: MessageSquare },
    { id: 'jobs', label: 'Job Recommender', icon: TrendingUp },
    { id: 'settings', label: 'Integrations Panel', icon: Settings },
  ];

  const handleThemeToggle = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const isRealCloud = authService.isRealFirebase();

  return (
    <div style={styles.container}>
      
      {/* Sidebar Navigation */}
      <aside 
        style={{ 
          ...styles.sidebar, 
          width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' 
        }}
        className="glass-card"
      >
        <div style={styles.sidebarHeader}>
          {!collapsed && (
            <div style={styles.logoText}>
              <CloudLightning size={22} color="var(--color-primary)" />
              <span className="text-gradient" style={{ fontWeight: '800', fontSize: '1.25rem' }}>ResumeAI</span>
            </div>
          )}
          {collapsed && (
            <div style={styles.logoTextCollapsed}>
              <CloudLightning size={22} color="var(--color-primary)" />
            </div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            style={styles.collapseBtn}
            className="btn btn-secondary"
          >
            {collapsed ? <ChevronLeft size={14} style={{ transform: 'rotate(180deg)' }} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav style={styles.nav}>
          <div style={styles.navGroup}>
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    ...styles.navItem,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    background: isActive ? 'var(--color-primary-glow)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    borderColor: isActive ? 'hsla(var(--primary-hue), 84%, 54%, 0.15)' : 'transparent'
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={18} color={isActive ? 'var(--color-primary)' : 'var(--text-secondary)'} style={{ flexShrink: 0 }} />
                  {!collapsed && <span style={styles.navLabel}>{item.label}</span>}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer User Details */}
        <div style={styles.sidebarFooter}>
          <div style={{ ...styles.userCard, justifyContent: collapsed ? 'center' : 'flex-start' }}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" style={styles.avatar} />
            ) : (
              <div style={styles.avatarPlaceholder}>
                <User size={16} color="var(--color-primary)" />
              </div>
            )}
            {!collapsed && (
              <div style={styles.userInfo}>
                <div style={styles.userName}>{user?.displayName || 'Developer Account'}</div>
                <div style={styles.userEmail}>{user?.email || 'guest@resumeai.io'}</div>
              </div>
            )}
          </div>
          
          <button 
            onClick={onLogout} 
            style={{ ...styles.logoutBtn, justifyContent: collapsed ? 'center' : 'flex-start' }}
            title="Log Out"
          >
            <LogOut size={16} color="#ef4444" style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ color: '#ef4444', fontWeight: '500' }}>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div 
        style={{ 
          ...styles.mainShell, 
          marginLeft: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' 
        }}
      >
        {/* Header bar */}
        <header style={styles.header} className="glass-card">
          <div style={styles.headerLeft}>
            <h2 style={styles.headerTitle}>
              {menuItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
            </h2>
          </div>

          <div style={styles.headerRight}>
            
            {/* Connection badge */}
            <div style={styles.connectionBadgeContainer}>
              {isRealCloud ? (
                <div style={styles.badgeCloud} title="Connected to Google Firebase Cloud Storage">
                  <Database size={13} color="#34d399" />
                  <span>Cloud Active</span>
                </div>
              ) : (
                <div style={styles.badgeSim} title="Running in simulated offline localstorage sandbox">
                  <Database size={13} color="#06B6D4" />
                  <span>Simulator</span>
                </div>
              )}
            </div>

            {/* Dark/Light Toggler */}
            <button onClick={handleThemeToggle} style={styles.themeBtn} className="btn btn-secondary">
              {theme === 'dark' ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#64748b" />}
            </button>

          </div>
        </header>

        {/* Content render body */}
        <main style={styles.contentBody}>
          {children}
        </main>
      </div>

    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    width: '100vw',
    position: 'relative',
    overflow: 'hidden',
  },
  sidebar: {
    position: 'fixed',
    top: '20px',
    left: '20px',
    bottom: '20px',
    height: 'calc(100vh - 40px)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    borderRadius: '16px',
    overflow: 'hidden',
    padding: '24px 12px',
    transition: 'width var(--transition-speed) cubic-bezier(0.16, 1, 0.3, 1)',
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 8px 25px 8px',
    borderBottom: '1px solid var(--glass-border)',
    position: 'relative',
  },
  logoText: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoTextCollapsed: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  collapseBtn: {
    padding: '6px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-tertiary)',
    cursor: 'pointer',
    position: 'absolute',
    right: '-16px',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10,
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--glass-border)',
  },
  nav: {
    flex: 1,
    paddingTop: '25px',
    overflowY: 'auto',
  },
  navGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid transparent',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  navLabel: {
    fontSize: '0.88rem',
    fontWeight: '600',
  },
  sidebarFooter: {
    borderTop: '1px solid var(--glass-border)',
    paddingTop: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.01)',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '1px solid var(--glass-border)',
  },
  avatarPlaceholder: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'var(--color-primary-glow)',
    border: '1px solid hsla(var(--primary-hue), 84%, 54%, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  userName: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  userEmail: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '12px',
    border: 'none',
    background: 'rgba(239, 68, 68, 0.05)',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: 'all 0.3s ease',
  },
  mainShell: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    position: 'relative',
    transition: 'margin-left var(--transition-speed) cubic-bezier(0.16, 1, 0.3, 1)',
  },
  header: {
    height: 'var(--header-height)',
    margin: '20px 20px 0 20px',
    borderRadius: '16px',
    padding: '0 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--shadow-sm)',
    backdropFilter: 'blur(20px) saturate(180%)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: '1.35rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  connectionBadgeContainer: {
    display: 'flex',
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
    fontSize: '0.78rem',
    fontWeight: '700',
    letterSpacing: '0.01em',
  },
  badgeSim: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '8px',
    background: 'var(--color-secondary-glow)',
    border: '1px solid hsla(var(--secondary-hue), 90%, 45%, 0.15)',
    color: 'var(--color-secondary)',
    fontSize: '0.78rem',
    fontWeight: '700',
    letterSpacing: '0.01em',
  },
  themeBtn: {
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  contentBody: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    position: 'relative',
  }
};
