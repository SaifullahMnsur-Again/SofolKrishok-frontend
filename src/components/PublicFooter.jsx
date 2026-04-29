import { Link } from 'react-router-dom';

export default function PublicFooter() {
  const year = new Date().getFullYear();

  const links = {
    Platform: [
      { label: 'Features', to: '/features' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'AI Disease Detection', to: '/features' },
      { label: 'Marketplace', to: '/features' },
      { label: 'Expert Consultation', to: '/features' },
    ],
    Company: [
      { label: 'About Us', to: '/about' },
      { label: 'Our Mission', to: '/about' },
      { label: 'Careers', to: '/about' },
      { label: 'Blog', to: '/about' },
    ],
    Account: [
      { label: 'Sign In', to: '/login' },
      { label: 'Create Account', to: '/register' },
      { label: 'Farmer Dashboard', to: '/dashboard' },
      { label: 'Staff Portal', to: '/staff' },
    ],
  };

  return (
    <footer style={{
      background: '#060a14',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      padding: '60px 24px 30px',
      color: '#94a3b8',
      fontFamily: 'Inter, Noto Sans Bengali, system-ui, sans-serif',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Top: Brand + Links */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 50 }} className="footer-grid">

          {/* Brand */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#22c55e,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🌿</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f1f5f9' }}>SofolKrishok</div>
                <div style={{ fontSize: '0.65rem', color: '#4ade80', fontWeight: 600, letterSpacing: '0.06em' }}>SMART FARMING PLATFORM</div>
              </div>
            </Link>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.75, maxWidth: 280, margin: '0 0 20px' }}>
              Bangladesh's leading AI-powered agricultural platform — helping farmers grow smarter since 2024.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['🌐 Web', '📱 Mobile-Ready', '🇧🇩 Bengali'].map((tag) => (
                <span key={tag} style={{ padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b' }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', color: '#f1f5f9', textTransform: 'uppercase', marginBottom: 14 }}>{section}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 9 }}>
                {items.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} style={{ fontSize: '0.86rem', color: '#64748b', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#94a3b8'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: '0.82rem', color: '#475569' }}>
            © {year} SofolKrishok. All rights reserved. Built for Bangladesh 🇧🇩
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy Policy', 'Terms of Service', 'Contact'].map((item) => (
              <Link key={item} to="/" style={{ fontSize: '0.82rem', color: '#475569', textDecoration: 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#94a3b8'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
