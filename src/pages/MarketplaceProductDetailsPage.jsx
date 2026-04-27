import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { marketAPI } from '../services/api';

export default function MarketplaceProductDetailsPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [searchParams] = useSearchParams();

  const initialQty = Math.max(1, Number(searchParams.get('qty')) || 1);

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(initialQty);
  const [loading, setLoading] = useState(true);
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

  const proceedToConfirm = () => {
    if (!product) return;
    if (quantity < 1) {
      setMessage('Quantity must be at least 1.');
      return;
    }
    if (quantity > Number(product.stock_quantity || 0)) {
      setMessage('Quantity exceeds available stock.');
      return;
    }

    navigate(`/marketplace/confirm/${product.id}?qty=${quantity}`);
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

  const unitPrice = Number(product.discount_price || product.price || 0);

  return (
    <div className="animate-fade-in-up">
      <h1 className="page-title">Product Details</h1>
      <p className="page-subtitle">Review complete product information before moving to order confirmation.</p>

      {message && (
        <div className="glass-card" style={{ padding: 12, marginBottom: 14 }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(280px, 1fr)', gap: '1.25rem' }}>
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {product.image ? (
            <img src={product.image} alt={product.name} style={{ width: '100%', height: 320, objectFit: 'cover' }} />
          ) : (
            <div style={{ height: 320, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #dbeafe, #dcfce7)', color: '#1e3a8a', fontWeight: 700 }}>
              No Product Photo
            </div>
          )}
          <div style={{ padding: 20 }}>
            <h3 style={{ marginTop: 0 }}>{product.name}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
              {product.description || 'No detailed description provided for this product.'}
            </p>
            <div style={{ display: 'grid', gap: 8, fontSize: '0.92rem' }}>
              <div><strong>Category:</strong> {product.category}</div>
              <div><strong>Unit:</strong> {product.unit}</div>
              <div><strong>Price:</strong> ৳{product.discount_price || product.price}</div>
              {product.discount_price && <div><strong>Original Price:</strong> <span style={{ textDecoration: 'line-through' }}>৳{product.price}</span></div>}
              <div><strong>Current Stock:</strong> {product.stock_quantity}</div>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 20, display: 'grid', gap: 12, alignContent: 'start' }}>
          <h3 style={{ margin: 0 }}>Prepare Order</h3>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Quantity</label>
          <input
            type="number"
            className="input"
            min="1"
            max={product.stock_quantity}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          />

          <div style={{ marginTop: 8, padding: 10, borderRadius: 8, background: 'rgba(15, 23, 42, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Unit Price</span>
              <strong>৳{unitPrice.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Estimated Total</span>
              <strong>৳{(unitPrice * quantity).toFixed(2)}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/marketplace')}>
              Back
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={proceedToConfirm}
              disabled={Number(product.stock_quantity || 0) <= 0}
            >
              Continue to Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
