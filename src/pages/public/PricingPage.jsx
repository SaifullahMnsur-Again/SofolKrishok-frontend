import PublicNav from '../../components/PublicNav';
import PublicFooter from '../../components/PublicFooter';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Starter',
    badge: 'Free Forever',
    price: '৳0',
    period: '/month',
    color: '#22c55e',
    highlight: false,
    features: [
      '✅ AI Disease Detection (5/month)',
      '✅ Soil Classification (3/month)',
      '✅ AI Chat Assistant (20 messages/day)',
      '✅ Weather Forecasts',
      '✅ 1 Land Parcel',
      '✅ Marketplace Access (browse only)',
      '❌ Expert Consultations',
      '❌ Advanced Analytics',
      '❌ Profit/Loss Reports',
      '❌ Priority Support',
    ],
  },
  {
    name: 'Farmer Pro',
    badge: 'Most Popular',
    price: '৳299',
    period: '/month',
    color: '#0ea5e9',
    highlight: true,
    features: [
      '✅ Unlimited Disease Detection',
      '✅ Unlimited Soil Classification',
      '✅ AI Chat (Unlimited)',
      '✅ Advanced Weather Alerts',
      '✅ Up to 10 Land Parcels',
      '✅ Full Marketplace (buy & order tracking)',
      '✅ 2 Expert Consultations/month',
      '✅ Profit/Loss Tracker',
      '✅ Crop Track Logs',
      '❌ Priority Support',
    ],
  },
  {
    name: 'Enterprise',
    badge: 'Full Platform',
    price: '৳799',
    period: '/month',
    color: '#8b5cf6',
    highlight: false,
    features: [
      '✅ Everything in Farmer Pro',
      '✅ Unlimited Land Parcels',
      '✅ 10 Expert Consultations/month',
      '✅ Priority AI Model Access',
      '✅ Advanced Market Predictions',
      '✅ Custom Zone & Team Access',
      '✅ Financial Report Export',
      '✅ Dedicated Account Manager',
      '✅ 24/7 Priority Support',
      '✅ API Access (coming soon)',
    ],
  },
];

const faq = [
  { q: 'Is there a free trial?', a: 'Yes! The Starter plan is free forever. No credit card required to sign up.' },
  { q: 'Can I switch plans anytime?', a: 'Absolutely. Upgrade or downgrade at any time. Changes take effect from your next billing cycle.' },
  { q: 'How does payment work?', a: 'We use SSLCommerz — Bangladesh\'s most trusted payment gateway. Supports bKash, Nagad, Rocket, VISA, and Mastercard.' },
  { q: 'Is my data safe?', a: 'Yes. All data is encrypted in transit and at rest. We never share your farm data with third parties.' },
  { q: 'What language is the platform available in?', a: 'Both Bengali (বাংলা) and English. You can switch anytime from your profile settings.' },
  { q: 'Do I need a smartphone to use it?', a: 'SofolKrishok works on any device with a browser — smartphone, tablet, or desktop.' },
];

export default function PricingPage() {
  return (
    <div style={{ fontFamily: 'Inter, Noto Sans Bengali, system-ui, sans-serif', background: '#0b1120', color: '#f1f5f9', minHeight: '100vh' }}>
      <PublicNav />

      {/* Hero */}
      <section style={{ padding: '120px 24px 60px', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', color: '#4ade80', textTransform: 'uppercase', marginBottom: 14 }}>PRICING</div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, margin: '0 0 18px', color: '#f1f5f9' }}>
          Simple, Transparent Pricing
        </h1>
        <p style={{ color: '#94a3b8', maxWidth: 480, margin: '0 auto', lineHeight: 1.8 }}>
          Start free. Pay only when you need more. Every plan includes the core AI tools.
        </p>
      </section>

      {/* Plans */}
      <section style={{ padding: '20px 24px 80px' }}>
        <div style={{ maxWidth: 1050, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 20, alignItems: 'stretch' }}>
          {plans.map((plan) => (
            <div key={plan.name} style={{
              background: plan.highlight ? `linear-gradient(145deg,rgba(14,165,233,0.12),rgba(99,102,241,0.06))` : 'rgba(255,255,255,0.03)',
              border: `2px solid ${plan.highlight ? plan.color + '50' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 24, padding: '32px 28px',
              display: 'flex', flexDirection: 'column', gap: 0,
              position: 'relative',
              boxShadow: plan.highlight ? `0 0 40px ${plan.color}20` : 'none',
            }}>
              {plan.highlight && (
                <div style={{
                  position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                  background: `linear-gradient(135deg,${plan.color},#6366f1)`,
                  color: '#fff', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.05em',
                  padding: '5px 18px', borderRadius: 99,
                }}>
                  ★ {plan.badge}
                </div>
              )}
              {!plan.highlight && (
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: plan.color, marginBottom: 8, letterSpacing: '0.05em' }}>{plan.badge}</div>
              )}
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#f1f5f9', marginBottom: 6, marginTop: plan.highlight ? 16 : 0 }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                <span style={{ fontSize: '2.6rem', fontWeight: 900, color: plan.color }}>{plan.price}</span>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'grid', gap: 10, flex: 1 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ fontSize: '0.86rem', color: f.startsWith('❌') ? '#475569' : '#cbd5e1', lineHeight: 1.5 }}>{f}</li>
                ))}
              </ul>
              <Link to="/register" style={{
                display: 'block', textAlign: 'center', padding: '13px', borderRadius: 12,
                fontWeight: 700, fontSize: '0.92rem', textDecoration: 'none',
                background: plan.highlight ? `linear-gradient(135deg,${plan.color},#6366f1)` : `${plan.color}18`,
                border: `1px solid ${plan.color}40`,
                color: plan.highlight ? '#fff' : plan.color,
              }}>
                {plan.price === '৳0' ? 'Get Started Free' : 'Choose Plan'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '60px 24px 100px', maxWidth: 760, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 36, color: '#f1f5f9', textAlign: 'center' }}>Frequently Asked Questions</h2>
        <div style={{ display: 'grid', gap: 16 }}>
          {faq.map((item) => (
            <div key={item.q} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '20px 22px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9', marginBottom: 8 }}>Q: {item.q}</div>
              <div style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.7 }}>{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
