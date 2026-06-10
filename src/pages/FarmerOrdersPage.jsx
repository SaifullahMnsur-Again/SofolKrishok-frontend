import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketAPI, financeAPI } from '../services/api';

export default function FarmerOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data } = await marketAPI.getOrders();
      setOrders(data.results || data || []);
    } catch (error) {
      setMessage('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const payableStatuses = useMemo(() => new Set(['pending']), []);

  const renderDeliveryState = (status) => {
    const states = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = states.indexOf(status?.toLowerCase());
    
    if (status?.toLowerCase() === 'cancelled') {
      return (
        <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.85rem' }}>
          🚫 Cancelled
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
        {states.map((state, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <div key={state} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div 
                style={{ 
                  width: '12px', height: '12px', borderRadius: '50%', 
                  background: isCurrent ? 'var(--primary-600)' : isCompleted ? 'var(--primary-300)' : '#e2e8f0',
                  boxShadow: isCurrent ? '0 0 0 2px rgba(34, 197, 94, 0.3)' : 'none'
                }} 
                title={state.charAt(0).toUpperCase() + state.slice(1)}
              />
              {index < states.length - 1 && (
                <div style={{ flex: 1, height: '2px', background: index < currentIndex ? 'var(--primary-300)' : '#e2e8f0', margin: '0 2px' }} />
              )}
            </div>
          );
        })}
        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: '6px', textTransform: 'capitalize', width: '60px' }}>
          {status || 'Unknown'}
        </span>
      </div>
    );
  };

  const handleCancel = async (order) => {
    if (!window.confirm(`Cancel order #${order.id}?`)) return;
    try {
      setProcessingId(order.id);
      await marketAPI.updateOrder(order.id, { status: 'cancelled' });
      setMessage(`Order #${order.id} cancelled.`);
      await loadOrders();
    } catch (error) {
      setMessage(error?.response?.data?.error || 'Failed to cancel order.');
    } finally {
      setProcessingId(null);
    }
  };

  const handlePay = async (order) => {
    try {
      setProcessingId(order.id);
      const { data } = await financeAPI.checkout({
        order_id: order.id,
        description: `Payment for order #${order.id}`,
      });
      navigate(`/payment/success?reference=${data.reference_id}&redirect=/orders`);
    } catch (error) {
      setMessage(error?.response?.data?.error || 'Failed to initiate payment.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateAddress = async (order) => {
    const nextAddress = window.prompt('Update shipping address:', order.shipping_address || '');
    if (!nextAddress || nextAddress.trim() === order.shipping_address) return;

    try {
      setProcessingId(order.id);
      await marketAPI.updateOrder(order.id, { shipping_address: nextAddress.trim() });
      setMessage(`Shipping address updated for order #${order.id}.`);
      await loadOrders();
    } catch (error) {
      setMessage(error?.response?.data?.error || 'Failed to update order address.');
    } finally {
      setProcessingId(null);
    }
  };

  const renderOrderActions = (order) => (
    <>
      {payableStatuses.has(order.status) && (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => handlePay(order)}
          disabled={processingId === order.id}
        >
          {processingId === order.id ? 'Processing...' : 'Pay Now'}
        </button>
      )}
      {(order.status === 'pending' || order.status === 'processing') && (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => handleUpdateAddress(order)}
          disabled={processingId === order.id}
        >
          Update Address
        </button>
      )}
      {(order.status === 'pending' || order.status === 'processing') && (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => handleCancel(order)}
          disabled={processingId === order.id}
        >
          Cancel
        </button>
      )}
    </>
  );

  return (
    <div className="animate-fade-in-up">
      <h1 className="page-title">📦 My Orders</h1>
      <p className="page-subtitle">Track, update, and complete payments for your marketplace orders.</p>

      {message && (
        <div className="glass-card" style={{ padding: 12, marginBottom: 14 }}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="glass-card" style={{ padding: 20 }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="glass-card" style={{ padding: 30, textAlign: 'center' }}>
          No orders yet. Place your first marketplace order.
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 16 }}>
          {/* Desktop table */}
          <div className="mobile-table-hide" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 10 }}>Order</th>
                  <th style={{ textAlign: 'left', padding: 10 }}>Status</th>
                  <th style={{ textAlign: 'left', padding: 10 }}>Total</th>
                  <th style={{ textAlign: 'left', padding: 10 }}>Address</th>
                  <th style={{ textAlign: 'left', padding: 10 }}>Date</th>
                  <th style={{ textAlign: 'left', padding: 10 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: 10 }}>
                      <div style={{ fontWeight: 700 }}>#{order.id}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {(order.items || []).length} items
                      </div>
                    </td>
                    <td style={{ padding: 10 }}>
                      <div style={{ maxWidth: '180px' }}>
                        {renderDeliveryState(order.status)}
                      </div>
                    </td>
                    <td style={{ padding: 10, fontWeight: 700 }}>৳{order.total_amount}</td>
                    <td style={{ padding: 10, maxWidth: 280 }}>{order.shipping_address || '-'}</td>
                    <td style={{ padding: 10 }}>{new Date(order.created_at).toLocaleString()}</td>
                    <td style={{ padding: 10 }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {renderOrderActions(order)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="mobile-card-list">
            {orders.map((order) => (
              <div key={order.id} className="mobile-card-item">
                <div className="mobile-card-item-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Order #{order.id}</span>
                  <div style={{ width: '100%', marginBottom: '4px' }}>
                    {renderDeliveryState(order.status)}
                  </div>
                </div>
                <div className="mobile-card-item-row">
                  <span className="mobile-card-item-label">Total</span>
                  <span className="mobile-card-item-value" style={{ color: 'var(--primary-600)' }}>৳{order.total_amount}</span>
                </div>
                <div className="mobile-card-item-row">
                  <span className="mobile-card-item-label">Items</span>
                  <span className="mobile-card-item-value">{(order.items || []).length} items</span>
                </div>
                <div className="mobile-card-item-row">
                  <span className="mobile-card-item-label">Date</span>
                  <span className="mobile-card-item-value" style={{ fontSize: '0.8rem' }}>{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                {order.shipping_address && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    📍 {order.shipping_address}
                  </div>
                )}
                <div className="mobile-card-item-actions">
                  {renderOrderActions(order)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
