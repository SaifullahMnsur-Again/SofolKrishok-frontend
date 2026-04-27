import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { financeAPI, marketAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MarketplaceConfirmPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const initialQty = Math.max(1, Number(searchParams.get('qty')) || 1);

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(initialQty);
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const { data } = await marketAPI.getProduct(productId);
        setProduct(data);
      } catch (error) {
        setMessage('Unable to load product details.');
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [productId]);

  const unitPrice = Number(product?.discount_price || product?.price || 0);
  const total = unitPrice * quantity;

  const handleConfirmOrder = async () => {
    if (!product) return;

    if (quantity < 1) {
      setMessage('Quantity must be at least 1.');
      return;
    }

    if (quantity > Number(product.stock_quantity || 0)) {
      setMessage('Quantity exceeds available stock.');
      return;
    }

    if (!shippingAddress.trim()) {
      setMessage('Shipping address is required.');
      return;
    }

    try {
      setConfirming(true);
      setMessage('');

      const { data: order } = await marketAPI.createOrder({
        shipping_address: shippingAddress.trim(),
        notes: notes || 'Order confirmed from marketplace confirmation page.',
        order_items: [{ product: product.id, quantity }],
      });

      const { data: checkout } = await financeAPI.checkout({
        order_id: order.id,
        description: `Marketplace order #${order.id}`,
      });

      navigate(`/payment/success?reference=${checkout.reference_id}&redirect=/orders`);
    } catch (error) {
      setMessage(error?.response?.data?.error || 'Failed to confirm order. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: 24 }}>
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="glass-card" style={{ padding: 24 }}>
        <p style={{ marginTop: 0 }}>Product not found.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/marketplace')}>
          Back to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <h1 className="page-title">Confirm Order</h1>
      <p className="page-subtitle">Review product details and confirm your purchase.</p>

      {message && (
        <div className="glass-card" style={{ padding: 12, marginBottom: 14 }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) minmax(300px, 1fr)', gap: '1.25rem' }}>
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {product.image ? (
            <img src={product.image} alt={product.name} style={{ width: '100%', height: 280, objectFit: 'cover' }} />
          ) : (
            <div style={{ height: 280, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #dbeafe, #dcfce7)', color: '#1e3a8a', fontWeight: 700 }}>
              No Product Photo
            </div>
          )}

          <div style={{ padding: 18 }}>
            <h3 style={{ margin: 0 }}>{product.name}</h3>
            <p style={{ color: 'var(--text-secondary)', margin: '10px 0' }}>{product.description || 'No description available.'}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
                ৳{product.discount_price || product.price}
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: 6 }}>/ {product.unit}</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Category: {product.category}
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Stock available: {product.stock_quantity}
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 18, display: 'grid', gap: 12, alignContent: 'start' }}>
          <h3 style={{ margin: 0 }}>Order Details</h3>

          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Quantity</label>
          <input
            type="number"
            className="input"
            min="1"
            max={product.stock_quantity}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          />

          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Shipping Address</label>
          <textarea
            className="input"
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            rows={3}
            style={{ resize: 'vertical' }}
          />

          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Notes (Optional)</label>
          <textarea
            className="input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            style={{ resize: 'vertical' }}
            placeholder="Any delivery instruction..."
          />

          <div style={{ marginTop: 8, padding: 10, borderRadius: 8, background: 'rgba(15, 23, 42, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Unit Price</span>
              <strong>৳{unitPrice}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Quantity</span>
              <strong>{quantity}</strong>
            </div>
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700 }}>Total</span>
              <strong style={{ fontSize: '1.1rem' }}>৳{total.toFixed(2)}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button className="btn btn-secondary" onClick={() => navigate('/marketplace')} style={{ flex: 1 }}>
              Back
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleConfirmOrder}
              disabled={confirming || Number(product.stock_quantity || 0) <= 0}
            >
              {confirming ? 'Confirming...' : 'Confirm Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
