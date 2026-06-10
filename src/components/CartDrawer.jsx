import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartDrawer({ isOpen, onClose }) {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      <div
        className={`sidebar-backdrop ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
        style={{ zIndex: 1000 }}
      />
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🛒 Shopping Cart
            <span style={{ fontSize: '0.8rem', background: 'var(--primary-600)', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>
              {cartItems.length}
            </span>
          </h2>
          <button className="btn btn-ghost" onClick={onClose} style={{ fontSize: '1.2rem', padding: '4px 8px' }}>✕</button>
        </div>

        <div className="cart-drawer-content">
          {cartItems.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '3rem', marginBottom: '16px' }}>🛍️</span>
              <p>Your cart is empty.</p>
              <button className="btn btn-primary btn-sm" onClick={onClose} style={{ marginTop: '16px' }}>
                Browse Marketplace
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cartItems.map((item) => (
                <div key={item.product.id} className="cart-item">
                  {item.product.image ? (
                    <img src={item.product.image} alt={item.product.name} className="cart-item-img" />
                  ) : (
                    <div className="cart-item-img-placeholder">No Image</div>
                  )}
                  <div className="cart-item-details">
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>{item.product.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      ৳{item.product.discount_price || item.product.price} / {item.product.unit}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div className="cart-quantity-controls">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock_quantity}>+</button>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => removeFromCart(item.product.id)} style={{ padding: '4px 8px', color: '#ef4444' }}>
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '1.1rem', fontWeight: 700 }}>
              <span>Subtotal:</span>
              <span style={{ color: 'var(--primary-600)' }}>৳{cartTotal.toFixed(2)}</span>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginBottom: '8px' }} onClick={handleCheckout}>
              Proceed to Checkout
            </button>
            <button className="btn btn-ghost" style={{ width: '100%', fontSize: '0.8rem' }} onClick={clearCart}>
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
