import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { financeAPI } from '../services/api';

export default function FarmerBillingPage() {
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [plansRes, subRes] = await Promise.all([
          financeAPI.getPlans(),
          financeAPI.getSubscription().catch(() => ({ data: null }))
        ]);
        setPlans(plansRes.data.results !== undefined ? plansRes.data.results : plansRes.data);
        setSubscription(subRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleSubscribe = async (plan) => {
    try {
      const response = await financeAPI.checkout({
        description: `Subscription to ${plan.name}`,
        plan_id: plan.id
      });
      navigate(`/payment/success?reference=${response.data.reference_id}`);
    } catch (err) {
      alert("Failed to initiate payment gateway.");
    }
  };

  const subscriptionPlans = plans.filter(
    (plan) => plan.plan_type === 'primary' && plan.is_active && plan.name !== 'free'
  );

  return (
    <div>
      <h2 style={{ color: 'var(--text-color)', marginBottom: '1.5rem' }}>Billing & Subscriptions</h2>

      {subscription?.plan && subscription.plan.name !== 'free' && (
        <div className="card glass-card" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--primary-color)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Your Active Account: {subscription.plan.name}</h3>
          <p style={{ margin: 0, fontWeight: 500 }}>Available Credits: <span style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }}>{subscription.remaining_credits}</span></p>
        </div>
      )}

      <h3 style={{ marginBottom: '1rem' }}>Available Credit Packages</h3>
      
      {loading ? <p>Loading packages...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {subscriptionPlans.map(plan => (
            <div key={plan.id} className="card glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{plan.name}</div>
              <div style={{ fontSize: '2rem', color: 'var(--primary-color)', margin: '1rem 0' }}>
                ৳{plan.price_monthly}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', flex: 1, color: 'var(--text-muted)' }}>
                {(plan.features_json || []).slice(0, 4).map((feature, idx) => (
                  <li key={idx} style={{ marginBottom: '0.5rem' }}>✅ {feature}</li>
                ))}
                <li style={{ marginBottom: '0.5rem' }}>✅ Credits: {plan.credits}</li>
              </ul>
              
              <button onClick={() => handleSubscribe(plan)} className="btn btn-primary" style={{ width: '100%' }}>
                Pay via SSLCommerz
              </button>
            </div>
          ))}
          {subscriptionPlans.length === 0 && <p>No current packages configured.</p>}
        </div>
      )}
    </div>
  );
}
