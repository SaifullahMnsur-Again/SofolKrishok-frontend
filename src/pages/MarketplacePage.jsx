import { useState, useEffect, useCallback } from 'react';
import { marketAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import ProductQuickViewModal from '../components/ProductQuickViewModal';

const CATEGORY_EMOJIS = {
  seeds: '🌱', fertilizer: '🧪', pesticide: '🧴',
  equipment: '🔧', machinery: '🚜', other: '📦',
};

export default function MarketplacePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useCart();

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

  return (
    <div className="animate-fade-in-up">
      <div className="marketplace-hero">
        <h1>🌾 SofolKrishok Marketplace</h1>
        <p>Premium agricultural supplies, direct to farmers. Explore our vast catalog of high-yield seeds, specialized fertilizers, and modern equipment at unbeatable prices.</p>
      </div>

      {/* Category Filter */}
      <div className="category-filter-row" style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
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
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setSelectedProduct(product)}>
                {product.image ? (
                  <>
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      style={{ width: '100%', height: 190, objectFit: 'cover' }} 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'grid';
                      }}
                    />
                    <div style={{ display: 'none', height: 190, placeItems: 'center', background: 'linear-gradient(135deg, #dbeafe, #dcfce7)', color: '#1e3a8a', fontWeight: 700 }}>
                      No Product Photo
                    </div>
                  </>
                ) : (
                  <div style={{ height: 190, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #dbeafe, #dcfce7)', color: '#1e3a8a', fontWeight: 700 }}>
                    No Product Photo
                  </div>
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', opacity: 0, transition: 'opacity 0.2s', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 'bold' }} className="quick-view-overlay">
                  Quick View
                </div>
              </div>
              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{product.name}</div>
                  <span className="category-badge">
                    {CATEGORY_EMOJIS[product.category] || '📦'}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5, flex: 1 }}>
                  {product.description?.substring(0, 85) || 'No description'}...
                </p>
                


                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                  <div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-600)' }}>
                      ৳{product.discount_price || product.price}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 4 }}>/{product.unit}</span>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={product.stock_quantity <= 0}
                    onClick={() => addToCart(product, 1)}
                    style={{ padding: '8px 16px', borderRadius: '8px' }}
                  >
                    {product.stock_quantity <= 0 ? 'Out' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Quick View Modal */}
      {selectedProduct && (
        <ProductQuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
