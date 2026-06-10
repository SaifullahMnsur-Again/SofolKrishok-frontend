import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function ProductQuickViewModal({ product, onClose }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAdd = () => {
    addToCart(product, quantity);
    onClose();
  };

  return (
    <>
      <div className="sidebar-backdrop visible" onClick={onClose} style={{ zIndex: 1050 }} />
      <div className="quick-view-modal">
        <button className="quick-view-close" onClick={onClose}>✕</button>
        <div className="quick-view-content">
          <div className="quick-view-image-container">
            {product.image ? (
              <>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="quick-view-img" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'grid';
                  }}
                />
                <div className="quick-view-img-placeholder" style={{ display: 'none' }}>No Photo</div>
              </>
            ) : (
              <div className="quick-view-img-placeholder">No Photo</div>
            )}
          </div>
          <div className="quick-view-details">
            <span className="category-badge">
              {product.category}
            </span>
            <h2 style={{ margin: '12px 0 8px', fontSize: '1.5rem' }}>{product.name}</h2>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-600)', marginBottom: '16px' }}>
              ৳{product.discount_price || product.price} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ {product.unit}</span>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
              {product.description || 'No detailed description available.'}
            </p>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Quantity</label>
                <div className="cart-quantity-controls" style={{ minHeight: '44px' }}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                  <span style={{ minWidth: '30px', textAlign: 'center' }}>{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))} disabled={quantity >= product.stock_quantity}>+</button>
                </div>
              </div>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, minHeight: '44px' }}
                onClick={handleAdd}
                disabled={product.stock_quantity <= 0}
              >
                {product.stock_quantity <= 0 ? 'Out of Stock' : 'Add to Cart - ৳' + ((product.discount_price || product.price) * quantity).toFixed(2)}
              </button>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>
              Available Stock: {product.stock_quantity} {product.unit}s
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
