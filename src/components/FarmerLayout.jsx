import { useState } from 'react';
import { Outlet, Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import FarmerSidebar from './FarmerSidebar';
import NotificationCenter from './NotificationCenter';

const BOTTOM_NAV_ITEMS = [
  { to: '/dashboard', icon: '📊', label: 'Home' },
  { to: '/chat', icon: '🤖', label: 'AI Chat' },
  { to: '/lands', icon: '🌾', label: 'Lands' },
  { to: '/marketplace', icon: '🛒', label: 'Market' },
];

export default function FarmerLayout() {
  const { user, loading, logout } = useAuth();
  const { cartCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const { lang, toggleLang } = useLanguage();
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="loading-spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role && user.role !== 'farmer' && user.role !== 'site_engineer') {
    return <Navigate to="/staff" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleVoiceCommand = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Microphone API is not supported in this browser.');
      return;
    }

    let stream;
    setIsListening(true);
    setVoiceStatus('Listening... speak now');

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      const done = new Promise((resolve) => {
        recorder.onstop = resolve;
      });

      recorder.start();
      setTimeout(() => {
        if (recorder.state !== 'inactive') recorder.stop();
      }, 3500);

      await done;
      setVoiceStatus('Transcribing...');

      const blob = new Blob(chunks, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', blob, 'voice.webm');

      const { chatAPI } = await import('../services/api');
      const { data } = await chatAPI.voiceCommandAudio(formData);

      if (data.intent === 'NAVIGATE') {
        setVoiceStatus(data.voice_response);
        navigate(data.target);
      } else {
        setVoiceStatus(data.original_text ? `Heard: ${data.original_text}` : 'Command not recognized.');
      }
    } catch (err) {
      setVoiceStatus(err?.response?.data?.error || 'Voice processor failed.');
    } finally {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setIsListening(false);
      setTimeout(() => setVoiceStatus(''), 2500);
    }
  };

  const isActiveRoute = (path) => location.pathname === path;

  return (
    <div className="app-layout farmer-portal-layout">
      <FarmerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="app-main farmer-main" style={{ position: 'relative' }}>
        <header className="farmer-topbar">
          {/* Mobile hamburger */}
          <button
            className="mobile-hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <div className="farmer-topbar-brand">SofolKrishok</div>
          <div className="farmer-topbar-actions">
            <NotificationCenter />
            <button 
              className="topbar-btn cart-btn" 
              onClick={() => setCartOpen(true)} 
              style={{ 
                position: 'relative', 
                background: 'var(--primary-100)', 
                border: '1px solid var(--primary-300)', 
                cursor: 'pointer', 
                marginRight: '12px',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span className="material-icons" style={{ fontStyle: 'normal', fontSize: '1.4rem', color: 'var(--primary-600)' }}>🛒</span>
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  background: '#ef4444', color: 'white', fontSize: '0.75rem',
                  fontWeight: 800, padding: '2px 6px', borderRadius: '12px',
                  minWidth: '20px', textAlign: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {cartCount}
                </span>
              )}
            </button>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={toggleLang}
              style={{ fontWeight: 800, minWidth: '50px' }}
            >
              {lang === 'en' ? 'BN' : 'EN'}
            </button>
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme" />
            <Link to="/profile" className="btn btn-secondary btn-sm farmer-profile-btn">Profile</Link>
            <button className="btn btn-sm" onClick={handleLogout} style={{ background: 'transparent', color: '#64748b' }}>
              Logout
            </button>
          </div>
        </header>
        <div className="farmer-content-wrap">
          <Outlet />
        </div>
        
        {/* Floating Voice Assistant Button */}
        <button 
          onClick={handleVoiceCommand}
          className={`fab-voice ${isListening ? 'listening' : ''}`}
          title="Voice Assistant"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: isListening ? '#ef4444' : 'var(--primary-color)',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            fontSize: '1.3rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 150,
            transition: 'all 0.3s ease',
            animation: isListening ? 'pulse 1.5s infinite' : 'none'
          }}
        >
          {isListening ? '🎙️' : '🎤'}
        </button>
        {voiceStatus && (
          <div style={{
            position: 'fixed',
            bottom: '6.5rem',
            right: '2rem',
            padding: '10px 14px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            color: 'var(--text-primary)',
            backdropFilter: 'blur(12px)',
            zIndex: 150,
            maxWidth: '280px',
            fontSize: '0.82rem',
          }}>
            {voiceStatus}
          </div>
        )}

        {/* Mobile Bottom Navigation */}
        <nav className="mobile-bottom-nav">
          <div className="mobile-bottom-nav-items">
            {BOTTOM_NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`mobile-bottom-nav-item ${isActiveRoute(item.to) ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <button
              className={`mobile-bottom-nav-item ${sidebarOpen ? 'active' : ''}`}
              onClick={() => setSidebarOpen(true)}
            >
              <span className="nav-icon">☰</span>
              Menu
            </button>
          </div>
        </nav>
        <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      </main>
    </div>
  );
}
