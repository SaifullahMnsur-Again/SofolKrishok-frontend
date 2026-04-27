import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketAPI } from '../services/api';

const CATEGORY_EMOJIS = {
  seeds: '🌱', fertilizer: '🧪', pesticide: '🧴',
  equipment: '🔧', machinery: '🚜', other: '📦',
};

export default function MarketplacePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [quantities, setQuantities] = useState({});
  const [feedback, setFeedback] = useState('');

  const loadProducts = useCallback(async () => {
    try {
      const params = filter ? { category: filter } : {};
      const { data } = await marketAPI.getProducts(params);
      setProducts(data.results || data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const setQty = (productId, quantity) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, Number(quantity) || 1),
    }));
  };

  const handleBuy = async (product) => {
    const quantity = quantities[product.id] || 1;
    if (quantity > product.stock_quantity) {
      setFeedback(`Requested quantity exceeds stock for ${product.name}.`);
      return;
    }

    navigate(`/marketplace/product/${product.id}?qty=${quantity}`);
  };

  const handleViewDetails = (product) => {
    const quantity = quantities[product.id] || 1;
    navigate(`/marketplace/product/${product.id}?qty=${quantity}`);
  };

  return (
    <div className="animate-fade-in-up">
      <h1 className="page-title">🛒 Marketplace</h1>
      <p className="page-subtitle">Buy seeds, fertilizers, equipment, and more</p>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          className={`btn ${!filter ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setFilter('')}
        >
          All
        </button>
        {Object.entries(CATEGORY_EMOJIS).map(([key, emoji]) => (
          <button
            key={key}
            className={`btn ${filter === key ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setFilter(key)}
          >
            {emoji} {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      {feedback && (
        <div className="glass-card" style={{ padding: 12, marginBottom: 16, color: 'var(--text-primary)' }}>
          {feedback}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <div className="loading-spinner" style={{ width: 40, height: 40 }} />
        </div>
      ) : products.length === 0 ? (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
          <span style={{ fontSize: '3rem' }}>🛍️</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, margin: '12px 0 8px' }}>No products available</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Products will appear here once the sales team adds them
          </div>
        </div>
      ) : (
        <div className="marketplace-card-grid">
          {products.map((product) => (
            <div key={product.id} className="glass-card marketplace-photo-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {product.image ? (
                <img src={product.image} alt={product.name} style={{ width: '100%', height: 190, objectFit: 'cover' }} />
              ) : (
                <div style={{ height: 190, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #dbeafe, #dcfce7)', color: '#1e3a8a', fontWeight: 700 }}>
                  No Product Photo
                </div>
              )}
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>{product.name}</div>
                  <span style={{
                    fontSize: '0.7rem', padding: '2px 8px',
                    background: 'rgba(34,197,94,0.12)', color: 'var(--primary-600)',
                    borderRadius: 'var(--radius-full)', fontWeight: 600,
                  }}>
                    {CATEGORY_EMOJIS[product.category] || '📦'} {product.category}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
                  {product.description?.substring(0, 95) || 'No description'}
                </p>
                {/* Group Buy Integration */}
                <div style={{ background: '#fef9c3', color: '#854d0e', padding: '10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px', border: '1px solid #fde047' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    👥 Group Buy Available: -15% Off
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#a16207', fontWeight: 400 }}>
                    4/10 farmers joined. 6 more needed for discount.
                  </div>
                  <button 
                    className="btn btn-sm" 
                    style={{ background: '#ca8a04', color: 'white', border: 'none', padding: '4px 8px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      alert("Successfully joined the Group Buy pool for " + product.name + ". You will be notified once the 10-farmer threshold is reached!");
                    }}
                  >
                    Join Pool
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                  <div>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-600)' }}>
                      ৳{product.discount_price || product.price}
                    </span>
                    {product.discount_price && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: 6 }}>
                        ৳{product.price}
                      </span>
                    )}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 4 }}>/{product.unit}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="number"
                      className="input"
                      min="1"
                      max={product.stock_quantity}
                      value={quantities[product.id] || 1}
                      onChange={(e) => setQty(product.id, e.target.value)}
                      style={{ width: 76, minHeight: 34, padding: '6px 8px' }}
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={product.stock_quantity <= 0}
                      onClick={() => handleBuy(product)}
                    >
                      {product.stock_quantity <= 0 ? 'Out' : 'Buy'}
                    </button>
                  </div>
                </div>
                <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Stock: {product.stock_quantity}
                </div>
                <div style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%' }}
                    onClick={() => handleViewDetails(product)}
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
