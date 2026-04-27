import React, { useState, useEffect } from 'react';
import { marketAPI, consultationAPI } from '../services/api';

export default function StaffDashboardPage() {
  const [stats, setStats] = useState({ orders: 0, tickets: 0 });
  const [lastOrderUpdate, setLastOrderUpdate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [ordersRes, ticketsRes] = await Promise.allSettled([
          marketAPI.getOrders(),
          consultationAPI.getTickets()
        ]);

        const orderList = ordersRes.status === 'fulfilled' ? (ordersRes.value.data?.results || ordersRes.value.data || []) : [];
        const latest = [...orderList].sort(
          (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )[0] || null;
        
        setStats({
          orders: orderList.length,
          tickets: ticketsRes.status === 'fulfilled' ? ticketsRes.value.data?.results?.length || ticketsRes.value.data?.length || 0 : 0,
        });
        setLastOrderUpdate(latest);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="staff-panel-grid">
      <h3 style={{ marginTop: 0 }}>Platform Overview</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
        
        <div className="card staff-panel-card">
          <div style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Active Orders</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', margin: '0.5rem 0' }}>{loading ? '...' : stats.orders}</div>
          <div style={{ fontSize: '0.85rem', color: '#f59e0b' }}>Pending Fulfillment</div>
          <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: 6 }}>
            Last moved by: {lastOrderUpdate?.last_status_changed_by_name || 'N/A'}
            {lastOrderUpdate?.id ? ` (Order #${lastOrderUpdate.id})` : ''}
          </div>
        </div>

        <div className="card staff-panel-card">
          <div style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Open Consultations</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', margin: '0.5rem 0' }}>{loading ? '...' : stats.tickets}</div>
          <div style={{ fontSize: '0.85rem', color: '#ef4444' }}>Consultation Tickets</div>
        </div>

        <div className="card staff-panel-card staff-panel-accent" style={{ color: 'var(--text-primary)' }}>
          <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 600, opacity: 0.9 }}>System Status</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0' }}>Online</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>API & AI Engines Active</div>
        </div>

      </div>

      <div className="staff-panel-card" style={{ marginTop: '2rem' }}>
        <h4 style={{ margin: '0 0 1rem 0' }}>Platform Management</h4>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Use the left sidebar to manage products, fulfill orders, or schedule consultations. 
          As staff, your role grants you access to specific administrative tools.
        </div>
      </div>
    </div>
  );
}
