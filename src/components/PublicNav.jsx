import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/features', label: 'Features' },
  { to: '/about', label: 'About' },
  { to: '/pricing', label: 'Pricing' },
];

export default function PublicNav() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: 'rgba(11,17,32,0.88)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '0 24px',
        height: 64,
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Brand */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#22c55e,#16a34a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', flexShrink: 0,
            }}>🌿</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#f1f5f9', lineHeight: 1.1 }}>SofolKrishok</div>
              <div style={{ fontSize: '0.65rem', color: '#4ade80', fontWeight: 600, letterSpacing: '0.06em' }}>SMART FARMING</div>
            </div>
          </Link>

          {/* Desktop links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="public-nav-links">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} style={{
                padding: '7px 14px', borderRadius: 8, fontWeight: 500, fontSize: '0.9rem',
                textDecoration: 'none',
                color: pathname === l.to ? '#4ade80' : '#94a3b8',
                background: pathname === l.to ? 'rgba(34,197,94,0.1)' : 'transparent',
                transition: 'all 0.15s',
              }}
                onMouseEnter={(e) => { if (pathname !== l.to) { e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; } }}
                onMouseLeave={(e) => { if (pathname !== l.to) { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; } }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/login" style={{
              padding: '8px 18px', borderRadius: 10, fontWeight: 600, fontSize: '0.88rem',
              color: '#94a3b8', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
              transition: 'all 0.15s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              Sign In
            </Link>
            <Link to="/register" style={{
              padding: '8px 18px', borderRadius: 10, fontWeight: 700, fontSize: '0.88rem',
              background: 'linear-gradient(135deg,#22c55e,#16a34a)',
              color: '#fff', textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(34,197,94,0.25)',
              transition: 'box-shadow 0.15s, transform 0.15s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(34,197,94,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(34,197,94,0.25)'; e.currentTarget.style.transform = ''; }}
            >
              🌾 Get Started
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="public-nav-hamburger"
              style={{
                display: 'none', background: 'none', border: 'none', cursor: 'pointer',
                color: '#94a3b8', fontSize: '1.4rem', padding: 4,
              }}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, zIndex: 199,
          background: 'rgba(11,17,32,0.97)', borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '16px 24px',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} style={{
              padding: '12px 16px', borderRadius: 10, fontWeight: 500, fontSize: '0.95rem',
              textDecoration: 'none',
              color: pathname === l.to ? '#4ade80' : '#94a3b8',
              background: pathname === l.to ? 'rgba(34,197,94,0.1)' : 'transparent',
            }}>
              {l.label}
            </Link>
          ))}
        </div>
      )}

      {/* Spacer */}
      <div style={{ height: 64 }} />

      <style>{`
        @media (max-width: 640px) {
          .public-nav-links { display: none !important; }
          .public-nav-hamburger { display: block !important; }
        }
        @media (max-width: 480px) {
          .features-row { grid-template-columns: 1fr !important; }
          .features-text, .features-visual { order: 0 !important; }
        }
      `}</style>
    </>
  );
}
