import PublicNav from '../../components/PublicNav';
import PublicFooter from '../../components/PublicFooter';
import { Link } from 'react-router-dom';

const team = [
  { name: 'Saifullah', role: 'Founder & Lead Developer', icon: '👨‍💻', desc: 'Full-stack engineer specializing in AI-integrated agricultural platforms.' },
  { name: 'AI & ML Team', role: 'Deep Learning Engineers', icon: '🤖', desc: 'Trained and optimized disease detection and soil classification models.' },
  { name: 'Agronomist Council', role: '50+ Expert Advisors', icon: '🧑‍🔬', desc: 'Certified agronomists providing consultation and data validation.' },
  { name: 'Field Operations', role: 'Ground Truth Team', icon: '🌾', desc: 'On-the-ground team collecting real crop data across Bangladesh.' },
];

const milestones = [
  { year: 'Janurary 2026', title: 'Concept & Research', desc: 'Identified key pain points of Bangladeshi smallholder farmers through deep research and study.' },
  { year: 'Early March 2026', title: 'Platform Development', desc: 'Built core AI modules: disease detection, soil classification, and the marketplace.' },
  { year: 'Mid April 2026', title: 'Beta Launch', desc: 'Testing the platform with a select group of farmers to gather feedback and improve functionality.' },
  { year: 'Late April 2026', title: 'Full Launch', desc: 'Opened to all Bangladeshi farmers. Aiming to empower 10000+ farmers within 2026.' },
];

const values = [
  { icon: '🌿', title: 'Farmer-First', desc: 'Every feature is designed around real farmer needs — not tech for tech\'s sake.' },
  { icon: '🔬', title: 'Science-Backed', desc: 'All AI models are validated by certified agronomists before deployment.' },
  { icon: '🤝', title: 'Accessible', desc: 'Works on low-end smartphones, in Bengali, even with slow internet.' },
  { icon: '🔒', title: 'Trustworthy', desc: 'No data selling, transparent pricing, and full farmer data ownership.' },
];

export default function AboutPage() {
  return (
    <div style={{ fontFamily: 'Inter, Noto Sans Bengali, system-ui, sans-serif', background: '#0b1120', color: '#f1f5f9', minHeight: '100vh' }}>
      <PublicNav />

      {/* Hero */}
      <section style={{ padding: '120px 24px 80px', textAlign: 'center', background: 'linear-gradient(180deg,#06080f 0%,#0b1120 100%)' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', color: '#4ade80', textTransform: 'uppercase', marginBottom: 14 }}>ABOUT US</div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, margin: '0 0 20px', color: '#f1f5f9' }}>
          Built for Bangladesh's 16 Million Farmers
        </h1>
        <p style={{ color: '#94a3b8', maxWidth: 620, margin: '0 auto', lineHeight: 1.8, fontSize: '1.05rem' }}>
          SofolKrishok was founded with one mission: make cutting-edge agricultural technology accessible to every farmer in Bangladesh — regardless of education level, device, or internet speed.
        </p>
      </section>

      {/* Mission */}
      <section style={{ padding: '60px 24px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg,rgba(34,197,94,0.08),rgba(14,165,233,0.05))', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 24, padding: '40px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🌾</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 14 }}>Our Mission</h2>
          <p style={{ color: '#94a3b8', lineHeight: 1.85, fontSize: '1rem', maxWidth: 620, margin: '0 auto' }}>
            "To empower every Bangladeshi farmer with AI-driven insights, expert knowledge, and a fair digital marketplace — so they can grow more, earn more, and waste less."
          </p>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '60px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', marginBottom: 36, color: '#f1f5f9' }}>Our Values</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 18 }}>
          {values.map((v) => (
            <div key={v.title} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '24px 20px' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>{v.icon}</div>
              <h3 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>{v.title}</h3>
              <p style={{ margin: 0, fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.65 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section style={{ padding: '60px 24px', maxWidth: 860, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', marginBottom: 40, color: '#f1f5f9' }}>Our Journey</h2>
        <div style={{ display: 'grid', gap: 0 }}>
          {milestones.map((m, i) => (
            <div key={m.year} style={{ display: 'flex', gap: 24, paddingBottom: i < milestones.length - 1 ? 32 : 0 }}>
              {/* Line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#22c55e', border: '3px solid rgba(34,197,94,0.3)', flexShrink: 0, marginTop: 4 }} />
                {i < milestones.length - 1 && <div style={{ flex: 1, width: 2, background: 'rgba(34,197,94,0.15)', marginTop: 4 }} />}
              </div>
              <div style={{ paddingBottom: 0 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.08em', marginBottom: 4 }}>{m.year}</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f1f5f9', marginBottom: 6 }}>{m.title}</div>
                <div style={{ fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.65 }}>{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: '60px 24px 80px', maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', marginBottom: 36, color: '#f1f5f9' }}>The Team</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 18 }}>
          {team.map((t) => (
            <div key={t.name} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '28px 22px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.8rem', marginBottom: 14 }}>{t.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#f1f5f9', marginBottom: 4 }}>{t.name}</div>
              <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#22c55e', marginBottom: 10 }}>{t.role}</div>
              <p style={{ margin: 0, fontSize: '0.83rem', color: '#94a3b8', lineHeight: 1.6 }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(34,197,94,0.05)', borderTop: '1px solid rgba(34,197,94,0.12)' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 14px', color: '#f1f5f9' }}>Join the Movement</h2>
        <p style={{ color: '#94a3b8', marginBottom: 32 }}>Be part of Bangladesh's agricultural transformation.</p>
        <Link to="/register" style={{ padding: '13px 36px', borderRadius: 12, fontWeight: 700, background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', textDecoration: 'none' }}>
          🌾 Start Farming Smarter
        </Link>
      </section>

      <PublicFooter />
    </div>
  );
}
