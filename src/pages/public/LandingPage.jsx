import { Link } from 'react-router-dom';
import PublicNav from '../../components/PublicNav';
import PublicFooter from '../../components/PublicFooter';

const stats = [
  { value: '10,000+', label: 'Active Farmers', icon: '👨‍🌾' },
  { value: '98%', label: 'Detection Accuracy', icon: '🎯' },
  { value: '50+', label: 'Expert Agronomists', icon: '🧑‍🔬' },
  { value: '৳2.4Cr+', label: 'Market Volume', icon: '💰' },
];

const features = [
  {
    icon: '🔬',
    title: 'AI Disease Detection',
    desc: 'Upload a photo of your crop — our deep learning model identifies diseases with 98% accuracy and suggests treatment instantly.',
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.08)',
  },
  {
    icon: '🌱',
    title: 'Soil Classification',
    desc: 'Classify soil type from images using AI. Get crop recommendations and fertilizer plans tailored to your land.',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
  },
  {
    icon: '🤖',
    title: 'AI Farming Assistant',
    desc: 'Chat with Gemini AI in Bengali or English. Ask anything — planting schedules, pest control, weather guidance.',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
  },
  {
    icon: '🌦️',
    title: 'Hyperlocal Weather',
    desc: 'Real-time weather data and 7-day forecasts with farming-specific advice for irrigation, spraying, and harvesting.',
    color: '#0ea5e9',
    bg: 'rgba(14,165,233,0.08)',
  },
  {
    icon: '🛒',
    title: 'Agricultural Marketplace',
    desc: 'Buy seeds, fertilizers, pesticides, and equipment from verified vendors at fair prices, delivered to your door.',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
  },
  {
    icon: '🩺',
    title: 'Expert Consultation',
    desc: 'Book video or text consultations with certified agronomists. Get professional advice for your specific problems.',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
  },
];

const steps = [
  { step: '01', title: 'Create Your Account', desc: 'Register as a farmer in minutes. Choose your zone and preferred language — Bengali or English.' },
  { step: '02', title: 'Add Your Land Parcels', desc: 'Record your land plots with area, soil type, and GPS location. Track multiple parcels from one dashboard.' },
  { step: '03', title: 'Use AI Tools', desc: 'Scan crops for diseases, classify soil, get weather alerts, and chat with the AI assistant.' },
  { step: '04', title: 'Buy, Sell & Consult', desc: 'Shop the marketplace, track orders, book expert consultations, and monitor your profit & loss.' },
];

const testimonials = [
  {
    name: 'Rahim Mia',
    role: 'Rice Farmer, Sylhet',
    avatar: '👨‍🌾',
    text: 'Disease detection saved my entire paddy crop last season. The AI identified rice blast two weeks before it spread.',
  },
  {
    name: 'Fatema Begum',
    role: 'Vegetable Grower, Comilla',
    avatar: '👩‍🌾',
    text: 'The AI assistant answers my questions in Bengali at any hour. Feels like having a personal agronomist.',
  },
  {
    name: 'Karim Hossain',
    role: 'Mango Orchard Owner, Rajshahi',
    avatar: '🧑‍🌾',
    text: 'Bought all my fertilizers at 15% lower cost through the marketplace. The delivery was on time.',
  },
];

export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'Inter, Noto Sans Bengali, system-ui, sans-serif', background: '#0b1120', color: '#f1f5f9', minHeight: '100vh' }}>
      <PublicNav />

      {/* ══════════════════════════════════════════════
          HERO
         ══════════════════════════════════════════════ */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, #06080f 0%, #0d1b1a 40%, #0b1829 100%)',
        padding: '120px 24px 80px',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: '15%', left: '8%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.14) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', right: '25%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)', filter: 'blur(35px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 860, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 999, padding: '6px 18px', marginBottom: 28,
            fontSize: '0.8rem', fontWeight: 600, color: '#4ade80',
            letterSpacing: '0.05em',
          }}>
            🌿 Bangladesh's Leading Smart Farming Platform
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', fontWeight: 900, lineHeight: 1.1,
            margin: '0 0 22px',
            background: 'linear-gradient(135deg, #f1f5f9 0%, #4ade80 50%, #38bdf8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Smart Farming<br />Powered by AI
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2.2vw, 1.2rem)', color: '#94a3b8', lineHeight: 1.8, marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>
            SofolKrishok brings cutting-edge AI tools, expert agronomists, and a thriving marketplace to every farmer in Bangladesh — in Bengali & English.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 32px', borderRadius: 12, fontWeight: 700, fontSize: '1rem',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#fff', textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(34,197,94,0.3)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(34,197,94,0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 24px rgba(34,197,94,0.3)'; }}
            >
              🌾 Get Started Free
            </Link>
            <Link to="/features" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 32px', borderRadius: 12, fontWeight: 700, fontSize: '1rem',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
              color: '#f1f5f9', textDecoration: 'none',
              transition: 'background 0.15s',
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >
              ✨ See Features
            </Link>
          </div>

          {/* Floating feature chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 48 }}>
            {['🔬 AI Disease Detection', '🌱 Soil Analysis', '🤖 Gemini AI Chat', '🛒 Marketplace', '🩺 Expert Consult', '📊 Profit Tracker'].map((chip) => (
              <span key={chip} style={{
                padding: '5px 14px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 500,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#cbd5e1',
              }}>{chip}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          STATS
         ══════════════════════════════════════════════ */}
      <section style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '56px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 32 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#4ade80', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: 6, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURES GRID
         ══════════════════════════════════════════════ */}
      <section style={{ padding: '96px 24px', background: '#0b1120' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', color: '#4ade80', textTransform: 'uppercase', marginBottom: 12 }}>PLATFORM FEATURES</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, margin: '0 0 14px', color: '#f1f5f9' }}>Everything a Modern Farmer Needs</h2>
            <p style={{ color: '#94a3b8', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>Six powerful modules working together to transform your farming operation.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(310px,1fr))', gap: 20 }}>
            {features.map((f) => (
              <div key={f.title} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20, padding: '28px 26px',
                transition: 'transform 0.2s, border-color 0.2s, background 0.2s',
                cursor: 'default',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = `${f.color}55`; e.currentTarget.style.background = f.bg; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, background: f.bg, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', marginBottom: 18 }}>{f.icon}</div>
                <h3 style={{ margin: '0 0 10px', fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9' }}>{f.title}</h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/features" style={{ color: '#4ade80', textDecoration: 'none', fontWeight: 600, fontSize: '0.92rem', borderBottom: '1px solid rgba(74,222,128,0.4)', paddingBottom: 2 }}>
              Explore all features →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS
         ══════════════════════════════════════════════ */}
      <section style={{ padding: '96px 24px', background: 'linear-gradient(180deg,#0b1120 0%,#0d1f18 100%)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', color: '#38bdf8', textTransform: 'uppercase', marginBottom: 12 }}>HOW IT WORKS</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, margin: 0, color: '#f1f5f9' }}>Start in 4 Simple Steps</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 24 }}>
            {steps.map((s, i) => (
              <div key={s.step} style={{ position: 'relative' }}>
                {i < steps.length - 1 && (
                  <div style={{ position: 'absolute', top: 28, left: '60%', width: '100%', height: 1, background: 'linear-gradient(90deg,rgba(34,197,94,0.4),transparent)', display: 'none' }} className="step-connector" />
                )}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '24px 20px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.15em', color: '#4ade80', marginBottom: 12 }}>{s.step}</div>
                  <h3 style={{ margin: '0 0 10px', fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>{s.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TESTIMONIALS
         ══════════════════════════════════════════════ */}
      <section style={{ padding: '96px 24px', background: '#0b1120' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', color: '#f59e0b', textTransform: 'uppercase', marginBottom: 12 }}>TESTIMONIALS</div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 800, margin: 0, color: '#f1f5f9' }}>Farmers Love SofolKrishok</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {testimonials.map((t) => (
              <div key={t.name} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '26px 22px' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: 14, color: '#fbbf24' }}>★★★★★</div>
                <p style={{ margin: '0 0 20px', fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.75, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f1f5f9' }}>{t.name}</div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA BANNER
         ══════════════════════════════════════════════ */}
      <section style={{
        padding: '80px 24px',
        background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(14,165,233,0.08) 100%)',
        borderTop: '1px solid rgba(34,197,94,0.15)',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 800, margin: '0 0 16px', color: '#f1f5f9' }}>
            Ready to Farm Smarter?
          </h2>
          <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 36 }}>
            Join thousands of farmers already using SofolKrishok. Free to start — no credit card required.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              padding: '14px 36px', borderRadius: 12, fontWeight: 700, fontSize: '1rem',
              background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(34,197,94,0.3)',
            }}>
              🌾 Create Free Account
            </Link>
            <Link to="/login" style={{
              padding: '14px 36px', borderRadius: 12, fontWeight: 700, fontSize: '1rem',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
              color: '#f1f5f9', textDecoration: 'none',
            }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
