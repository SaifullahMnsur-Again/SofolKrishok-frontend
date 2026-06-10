import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { financeAPI, marketAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();

  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [notes, setNotes] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState('');

  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) {
      setMessage('Your cart is empty.');
      return;
    }

    if (!shippingAddress.trim()) {
      setMessage('Shipping address is required.');
      return;
    }

    try {
      setConfirming(true);
      setMessage('');

      const orderItemsPayload = cartItems.map((item) => ({
        product: item.product.id,
        quantity: item.quantity,
      }));

      const { data: order } = await marketAPI.createOrder({
        shipping_address: shippingAddress.trim(),
        notes: notes || 'Order placed via shopping cart checkout.',
        order_items: orderItemsPayload,
      });

      const { data: checkout } = await financeAPI.checkout({
        order_id: order.id,
        description: `Marketplace Order #${order.id}`,
      });

      clearCart();
      navigate(`/payment/success?reference=${checkout.reference_id}&redirect=/orders`);
    } catch (error) {
      setMessage(error?.response?.data?.error || 'Failed to confirm order. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="animate-fade-in-up">
        <h1 className="page-title">Checkout</h1>
        <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
          <span style={{ fontSize: '3rem' }}>🛍️</span>
          <h3 style={{ margin: '16px 0 8px' }}>Your cart is empty</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Add items from the marketplace to proceed.</p>
          <button className="btn btn-primary" onClick={() => navigate('/marketplace')} style={{ marginTop: 16 }}>
            Browse Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <h1 className="page-title">Checkout</h1>
      <p className="page-subtitle">Review your cart items and provide shipping details to complete your order.</p>

      {message && (
        <div className="glass-card" style={{ padding: 12, marginBottom: 14, color: '#ef4444', fontWeight: 600 }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) minmax(300px, 1fr)', gap: '1.25rem' }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px' }}>Order Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cartItems.map((item) => (
              <div key={item.product.id} style={{ display: 'flex', gap: '16px', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
                {item.product.image ? (
                  <img src={item.product.image} alt={item.product.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '8px' }} />
                ) : (
                  <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg, #dbeafe, #dcfce7)', display: 'grid', placeItems: 'center', fontSize: '0.6rem', borderRadius: '8px', color: '#1e3a8a', fontWeight: 'bold' }}>No Image</div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{item.product.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {item.quantity} x ৳{item.product.discount_price || item.product.price}
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
                  ৳{((item.product.discount_price || item.product.price) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800 }}>
            <span>Total Amount:</span>
            <span style={{ color: 'var(--primary-600)' }}>৳{cartTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 24, display: 'grid', gap: 16, alignContent: 'start' }}>
          <h3 style={{ margin: 0 }}>Shipping & Details</h3>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Shipping Address</label>
            <textarea
              className="input"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              rows={3}
              style={{ resize: 'vertical', width: '100%' }}
              placeholder="Full delivery address..."
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Delivery Notes (Optional)</label>
            <textarea
              className="input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              style={{ resize: 'vertical', width: '100%' }}
              placeholder="Any instructions for the delivery person..."
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button className="btn btn-secondary" onClick={() => navigate('/marketplace')} style={{ flex: 1 }}>
              Back to Shop
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleConfirmOrder}
              disabled={confirming || cartItems.length === 0}
            >
              {confirming ? 'Processing...' : `Pay ৳${cartTotal.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
