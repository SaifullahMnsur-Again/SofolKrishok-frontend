import { useState } from 'react';
import { Outlet, Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import FarmerSidebar from './FarmerSidebar';
import NotificationCenter from './NotificationCenter';

export default function FarmerLayout() {
  const { user, loading, logout } = useAuth();
  const { lang, toggleLang } = useLanguage();
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');

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

  return (
    <div className="app-layout farmer-portal-layout">
      <FarmerSidebar />
      <main className="app-main farmer-main" style={{ position: 'relative' }}>
        <header className="farmer-topbar">
          <div className="farmer-topbar-brand">SofolKrishok</div>
          <div className="farmer-topbar-actions">
            <NotificationCenter />
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
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: isListening ? '#ef4444' : 'var(--primary-color)',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            fontSize: '1.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
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
            zIndex: 1000,
            maxWidth: '280px',
            fontSize: '0.82rem',
          }}>
            {voiceStatus}
          </div>
        )}
      </main>
    </div>
  );
}
