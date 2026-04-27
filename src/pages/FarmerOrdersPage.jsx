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
          <div style={{ overflowX: 'auto' }}>
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
                    <td style={{ padding: 10, textTransform: 'capitalize' }}>{order.status}</td>
                    <td style={{ padding: 10, fontWeight: 700 }}>৳{order.total_amount}</td>
                    <td style={{ padding: 10, maxWidth: 280 }}>{order.shipping_address || '-'}</td>
                    <td style={{ padding: 10 }}>{new Date(order.created_at).toLocaleString()}</td>
                    <td style={{ padding: 10 }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
