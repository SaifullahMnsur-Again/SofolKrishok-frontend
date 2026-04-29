import PublicNav from '../../components/PublicNav';
import PublicFooter from '../../components/PublicFooter';
import { Link } from 'react-router-dom';

const modules = [
  {
    icon: '🔬',
    color: '#6366f1',
    title: 'AI Disease Detection',
    tagline: 'Catch crop disease before it spreads',
    points: [
      'Upload any crop photo — results in under 5 seconds',
      'Powered by deep learning trained on 50,000+ images',
      'Identifies 30+ diseases across rice, wheat, jute, and vegetables',
      'Provides treatment plan, severity rating, and prevention tips',
      'Works in low connectivity via optimized models',
      'Available in Bengali and English',
    ],
    crops: ['🌾 Rice', '🌽 Corn', '🍅 Tomato', '🥔 Potato', '🌿 Jute', '🫚 Mustard'],
  },
  {
    icon: '🌱',
    color: '#10b981',
    title: 'Soil Classification',
    tagline: 'Know your soil, choose the right crop',
    points: [
      'Photo-based AI soil type identification',
      'Classifies sandy, clay, loam, silt, and peat soils',
      'Crop suitability scoring for each soil type',
      'Fertilizer and amendment recommendations',
      'pH estimation and nutrient deficiency hints',
      'Integrates with land parcel management',
    ],
    crops: ['🏔️ Sandy', '🟫 Clay', '🌾 Loam', '🏝️ Silt', '🌿 Peat', '🟤 Chalky'],
  },
  {
    icon: '🤖',
    color: '#f59e0b',
    title: 'AI Farming Assistant (Gemini)',
    tagline: 'An expert agronomist in your pocket',
    points: [
      'Powered by Google Gemini AI with agricultural fine-tuning',
      'Fully bilingual — Bengali and English in the same conversation',
      'Answers questions on planting, disease, market, and weather',
      'Contextual conversation history — remembers your farm details',
      'Primary / Secondary / Tertiary model fallback for reliability',
      'Staff-configurable model hierarchy for optimal performance',
    ],
    crops: [],
  },
  {
    icon: '🌦️',
    color: '#0ea5e9',
    title: 'Hyperlocal Weather Intelligence',
    tagline: 'Farm-specific weather — not just a forecast',
    points: [
      '7-day forecasts with hourly breakdowns',
      'Irrigation advisories based on rainfall probability',
      'Spray window alerts — avoid pesticide washout',
      'Frost and flood early warning for your zone',
      'Harvest timing recommendations',
      'Wind speed, humidity, and UV index tracking',
    ],
    crops: [],
  },
  {
    icon: '🛒',
    color: '#ef4444',
    title: 'Agricultural Marketplace',
    tagline: 'Quality inputs at your fingertips',
    points: [
      'Verified suppliers of seeds, fertilizers, and pesticides',
      'Price comparison across vendors',
      'Bulk order discounts and seasonal offers',
      'Escrow-secured payments via SSLCommerz',
      'Order tracking from dispatch to delivery',
      'Staff-managed fulfillment Kanban board',
    ],
    crops: [],
  },
  {
    icon: '🩺',
    color: '#8b5cf6',
    title: 'Expert Consultation System',
    tagline: 'Real agronomists, real advice',
    points: [
      'Book 30-60 minute video or text consultations',
      'Expert filtering by specialty, zone, and language',
      'Real-time consultation room with shared file support',
      'Slot management for expert availability',
      'Follow-up and ticket history tracking',
      'Consultation ratings and expert leaderboard',
    ],
    crops: [],
  },
  {
    icon: '🗺️',
    color: '#f97316',
    title: 'Land Parcel Management',
    tagline: 'Your entire farm, digitally mapped',
    points: [
      'Register and manage multiple land parcels',
      'Record area (bigha/decimal), soil type, and location',
      'Attach crop tracks to each parcel',
      'Seasonal activity logs with date tracking',
      'Growth stage monitoring from sowing to harvest',
      'Yield history and loss event recording',
    ],
    crops: [],
  },
  {
    icon: '📈',
    color: '#ec4899',
    title: 'Profit & Loss Tracker',
    tagline: 'Turn farming data into financial insight',
    points: [
      'Input cost tracking — seeds, labour, fertilizer, irrigation',
      'Revenue recording per crop per season',
      'Net profit/loss calculation with trend charts',
      'Subscription plan monitoring and billing history',
      'Market price comparison for sell/hold decisions',
      'Exportable financial summaries',
    ],
    crops: [],
  },
];

export default function FeaturesPage() {
  return (
    <div style={{ fontFamily: 'Inter, Noto Sans Bengali, system-ui, sans-serif', background: '#0b1120', color: '#f1f5f9', minHeight: '100vh' }}>
      <PublicNav />

      {/* Hero */}
      <section style={{ padding: '120px 24px 60px', textAlign: 'center', background: 'linear-gradient(180deg,#06080f 0%,#0b1120 100%)' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', color: '#4ade80', textTransform: 'uppercase', marginBottom: 14 }}>PLATFORM FEATURES</div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, margin: '0 0 18px', color: '#f1f5f9' }}>
          Every Tool Your Farm Needs
        </h1>
        <p style={{ color: '#94a3b8', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.8, fontSize: '1.05rem' }}>
          Eight integrated modules — from AI disease detection to financial tracking — built specifically for Bangladeshi agriculture.
        </p>
        <Link to="/register" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 30px', borderRadius: 12,
          background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', fontWeight: 700,
          textDecoration: 'none', boxShadow: '0 8px 24px rgba(34,197,94,0.3)',
        }}>
          🌾 Start for Free
        </Link>
      </section>

      {/* Module deep-dives */}
      <section style={{ padding: '20px 24px 100px', maxWidth: 1100, margin: '0 auto' }}>
        {modules.map((m, i) => (
          <div key={m.title} style={{
            display: 'grid',
            gridTemplateColumns: i % 2 === 0 ? '1fr 1.1fr' : '1.1fr 1fr',
            gap: 40, alignItems: 'center',
            padding: '64px 0',
            borderBottom: i < modules.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          }} className="features-row">
            {/* Text block */}
            <div style={{ order: i % 2 === 0 ? 0 : 1 }} className="features-text">
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 18,
                background: `${m.color}14`, border: `1px solid ${m.color}30`,
                borderRadius: 12, padding: '8px 16px',
              }}>
                <span style={{ fontSize: '1.4rem' }}>{m.icon}</span>
                <span style={{ fontWeight: 700, color: m.color, fontSize: '0.88rem' }}>{m.title}</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, margin: '0 0 12px', color: '#f1f5f9' }}>{m.tagline}</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'grid', gap: 9 }}>
                {m.points.map((pt) => (
                  <li key={pt} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.9rem', color: '#94a3b8' }}>
                    <span style={{ color: m.color, fontWeight: 800, flexShrink: 0, marginTop: 2 }}>✓</span>
                    {pt}
                  </li>
                ))}
              </ul>
              {m.crops.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {m.crops.map((c) => (
                    <span key={c} style={{ padding: '4px 12px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600, background: `${m.color}12`, border: `1px solid ${m.color}25`, color: m.color }}>{c}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Visual block */}
            <div style={{ order: i % 2 === 0 ? 1 : 0 }} className="features-visual">
              <div style={{
                background: `linear-gradient(135deg, ${m.color}10, rgba(255,255,255,0.02))`,
                border: `1px solid ${m.color}20`,
                borderRadius: 24, padding: '40px',
                display: 'flex', flexDirection: 'column', gap: 16, minHeight: 240,
                alignItems: 'center', justifyContent: 'center', textAlign: 'center',
              }}>
                <div style={{ fontSize: '4.5rem', lineHeight: 1 }}>{m.icon}</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f1f5f9' }}>{m.title}</div>
                <div style={{
                  display: 'inline-flex', gap: 6, alignItems: 'center', padding: '6px 14px', borderRadius: 99,
                  background: `${m.color}18`, border: `1px solid ${m.color}30`,
                  fontSize: '0.78rem', color: m.color, fontWeight: 600,
                }}>
                  ● Live in Platform
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(34,197,94,0.05)', borderTop: '1px solid rgba(34,197,94,0.12)' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 14px', color: '#f1f5f9' }}>All 8 modules. One subscription.</h2>
        <p style={{ color: '#94a3b8', marginBottom: 32 }}>Start free, upgrade when you need more.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{ padding: '13px 32px', borderRadius: 12, fontWeight: 700, background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', textDecoration: 'none' }}>Get Started</Link>
          <Link to="/pricing" style={{ padding: '13px 32px', borderRadius: 12, fontWeight: 700, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', color: '#f1f5f9', textDecoration: 'none' }}>View Pricing</Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
