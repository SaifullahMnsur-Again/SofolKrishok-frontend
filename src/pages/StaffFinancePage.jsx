import React, { useState, useEffect } from 'react';
import { financeAPI } from '../services/api';

export default function StaffFinancePage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    plan_type: 'primary',
    description: '',
    price_monthly: '',
    credits: '',
    disease_detection_limit: '',
    ai_assistant_daily_limit: '',
    expert_appointment_limit: '',
    market_prediction_limit: '',
    farming_suggestion_limit: '',
    discount_percent: 0,
    features_json: [],
    notify_farmers: false,
    notification_message: '',
    notify_target: 'all',
    target_zones: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await financeAPI.getPlans();
      setPlans(data.results !== undefined ? data.results : data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await financeAPI.createPlan(formData);
      setShowForm(false);
      setFormData({
        name: '',
        plan_type: 'primary',
        description: '',
        price_monthly: '',
        credits: '',
        disease_detection_limit: '',
        ai_assistant_daily_limit: '',
        expert_appointment_limit: '',
        market_prediction_limit: '',
        farming_suggestion_limit: '',
        discount_percent: 0,
        features_json: [],
        notify_farmers: false,
        notification_message: '',
        notify_target: 'all',
        target_zones: '',
      });
      fetchData();
    } catch (err) {
      alert('Failed to create plan. Ensure you are logged in as a General Manager.');
    }
  };

  const handleSeedDefaults = async () => {
    try {
      await financeAPI.seedDefaults();
      fetchData();
      alert('Default subscription tiers seeded successfully.');
    } catch (err) {
      alert('Failed to seed default tiers. This action requires GM/Site Engineer access.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Archive this plan?")) {
      try {
        await financeAPI.deletePlan(id);
        fetchData();
      } catch (err) {
        alert('Action forbidden for your role.');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: '#334155' }}>Subscription Tier Management</h3>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={handleSeedDefaults}>
            Seed Default Tiers
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Create New Plan'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
          <h4>Construct Subscription Profile</h4>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input className="input" placeholder="Plan Title (e.g. Premium Farmer)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{flex: 1}}/>
            <select className="input" value={formData.plan_type} onChange={e => setFormData({...formData, plan_type: e.target.value})} style={{flex: 1}}>
              <option value="primary">Primary</option>
              <option value="addon">Add-On</option>
            </select>
            <input type="number" className="input" placeholder="Included Credits" value={formData.credits} onChange={e => setFormData({...formData, credits: e.target.value})} required style={{flex: 1}}/>
            <input type="number" className="input" placeholder="Price (৳)" value={formData.price_monthly} onChange={e => setFormData({...formData, price_monthly: e.target.value})} required style={{flex: 1}}/>
          </div>
          <textarea className="input" placeholder="Plan Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <input type="number" className="input" placeholder="Disease detection / month" value={formData.disease_detection_limit} onChange={e => setFormData({...formData, disease_detection_limit: e.target.value})} />
            <input type="number" className="input" placeholder="AI assistant / day" value={formData.ai_assistant_daily_limit} onChange={e => setFormData({...formData, ai_assistant_daily_limit: e.target.value})} />
            <input type="number" className="input" placeholder="Expert appointments / month" value={formData.expert_appointment_limit} onChange={e => setFormData({...formData, expert_appointment_limit: e.target.value})} />
            <input type="number" className="input" placeholder="Market prediction / month" value={formData.market_prediction_limit} onChange={e => setFormData({...formData, market_prediction_limit: e.target.value})} />
            <input type="number" className="input" placeholder="Farming suggestions / month" value={formData.farming_suggestion_limit} onChange={e => setFormData({...formData, farming_suggestion_limit: e.target.value})} />
            <input type="number" className="input" placeholder="Discount %" value={formData.discount_percent} onChange={e => setFormData({...formData, discount_percent: e.target.value})} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#334155' }}>
            <input
              type="checkbox"
              checked={formData.notify_farmers}
              onChange={(e) => setFormData({ ...formData, notify_farmers: e.target.checked })}
            />
            Send notification to all farmers when this plan goes live
          </label>
          {formData.notify_farmers && (
            <>
              <select
                className="input"
                value={formData.notify_target}
                onChange={(e) => setFormData({ ...formData, notify_target: e.target.value })}
              >
                <option value="all">All farmers</option>
                <option value="zone">Only selected zones</option>
              </select>
              {formData.notify_target === 'zone' && (
                <input
                  className="input"
                  placeholder="Target zones (comma-separated, e.g., Rajshahi-North,Dhaka-East)"
                  value={formData.target_zones}
                  onChange={(e) => setFormData({ ...formData, target_zones: e.target.value })}
                  required
                />
              )}
              <textarea
                className="input"
                placeholder="Notification message for farmers"
                value={formData.notification_message}
                onChange={(e) => setFormData({ ...formData, notification_message: e.target.value })}
                required
              />
            </>
          )}
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Save Configuration</button>
        </form>
      )}

      <div style={{ marginTop: '1.5rem', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#475569' }}>Active Monetization Tiers</h4>
        </div>
        <div style={{ padding: '1rem' }}>
          {loading ? <p>Syncing ledger...</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 8px', color: '#64748b' }}>Plan Title</th>
                  <th style={{ padding: '12px 8px', color: '#64748b' }}>Type</th>
                  <th style={{ padding: '12px 8px', color: '#64748b' }}>Granted Credits</th>
                  <th style={{ padding: '12px 8px', color: '#64748b' }}>Limits</th>
                  <th style={{ padding: '12px 8px', color: '#64748b' }}>Cost (৳)</th>
                  <th style={{ padding: '12px 8px', color: '#64748b' }}>Override</th>
                </tr>
              </thead>
              <tbody>
                {plans?.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 500 }}>{p.name}</td>
                    <td style={{ padding: '12px 8px', textTransform: 'capitalize' }}>{p.plan_type || 'primary'}</td>
                    <td style={{ padding: '12px 8px', color: '#16a34a' }}>+ {p.credits} Credits</td>
                    <td style={{ padding: '12px 8px', color: '#475569', fontSize: '0.8rem' }}>
                      Scan {p.disease_detection_limit || 0}/mo, AI {p.ai_assistant_daily_limit || 0}/day, Expert {p.expert_appointment_limit || 0}/mo
                    </td>
                    <td style={{ padding: '12px 8px' }}>৳{p.price_monthly}</td>
                    <td style={{ padding: '12px 8px' }}>
                       <button onClick={() => handleDelete(p.id)} className="btn btn-sm" style={{ background: '#fef2f2', color: '#ef4444', border: 'none' }}>Unlist</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
