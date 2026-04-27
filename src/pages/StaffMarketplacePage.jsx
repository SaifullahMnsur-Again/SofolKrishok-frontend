import React, { useEffect, useMemo, useState } from 'react';
import { marketAPI } from '../services/api';

const CATEGORY_OPTIONS = ['seeds', 'fertilizer', 'pesticide', 'equipment', 'machinery', 'other'];
const STATUS_OPTIONS = ['active', 'out_of_stock', 'draft'];

export default function StaffMarketplacePage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({ search: '', category: 'all', status: 'all', stock: 'all' });
  const [formData, setFormData] = useState({
    name: '', category: 'seeds', price: '', stock_quantity: '', unit: 'piece', description: '', status: 'active'
  });
  const [newImageFile, setNewImageFile] = useState(null);
  const [editData, setEditData] = useState({
    name: '', category: 'seeds', price: '', stock_quantity: '', unit: 'piece', description: '', status: 'active'
  });
  const [editImageFile, setEditImageFile] = useState(null);

  const salesStats = useMemo(() => {
    const toNum = (val) => Number(val || 0);
    const activeOrders = orders.filter((o) => o.status !== 'cancelled');
    const deliveredOrders = orders.filter((o) => o.status === 'delivered');
    const grossRevenue = activeOrders.reduce((sum, o) => sum + toNum(o.total_amount), 0);
    const deliveredRevenue = deliveredOrders.reduce((sum, o) => sum + toNum(o.total_amount), 0);
    const totalItems = activeOrders.reduce((sum, o) => sum + (o.items || []).reduce((s, item) => s + Number(item.quantity || 0), 0), 0);

    const byProduct = new Map();
    activeOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const key = item.product_name || `Product #${item.product}`;
        const existing = byProduct.get(key) || { name: key, quantity: 0, revenue: 0 };
        existing.quantity += Number(item.quantity || 0);
        existing.revenue += Number(item.subtotal || 0);
        byProduct.set(key, existing);
      });
    });

    const topProducts = Array.from(byProduct.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === 'pending' || o.status === 'processing').length,
      deliveredOrders: deliveredOrders.length,
      grossRevenue,
      deliveredRevenue,
      totalItems,
      topProducts,
    };
  }, [orders]);

  const fetchOrders = async () => {
    try {
      setLoadingStats(true);
      const { data } = await marketAPI.getOrders();
      setOrders(data.results !== undefined ? data.results : data);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await marketAPI.getProducts();
      setProducts(data.results !== undefined ? data.results : data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchHit = !filters.search
        || String(product.name || '').toLowerCase().includes(filters.search.toLowerCase())
        || String(product.description || '').toLowerCase().includes(filters.search.toLowerCase());

      const categoryHit = filters.category === 'all' || product.category === filters.category;
      const statusHit = filters.status === 'all' || product.status === filters.status;

      let stockHit = true;
      if (filters.stock === 'low') stockHit = Number(product.stock_quantity || 0) > 0 && Number(product.stock_quantity || 0) <= 10;
      if (filters.stock === 'out') stockHit = Number(product.stock_quantity || 0) === 0;
      if (filters.stock === 'in') stockHit = Number(product.stock_quantity || 0) > 0;

      return searchHit && categoryHit && statusHit && stockHit;
    });
  }, [products, filters]);

  const buildProductFormData = (values, file) => {
    const payload = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      payload.append(key, value == null ? '' : value);
    });
    if (file) payload.append('image', file);
    return payload;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = buildProductFormData(formData, newImageFile);
      await marketAPI.createProduct(payload);
      setShowAddForm(false);
      setFormData({ name: '', category: 'seeds', price: '', stock_quantity: '', unit: 'piece', description: '', status: 'active' });
      setNewImageFile(null);
      await fetchProducts();
    } catch (err) {
      alert('Failed to add product');
    }
  };

  const startEditing = (product) => {
    setEditingId(product.id);
    setEditData({
      name: product.name || '',
      category: product.category || 'seeds',
      price: product.price || '',
      stock_quantity: product.stock_quantity ?? 0,
      unit: product.unit || 'piece',
      description: product.description || '',
      status: product.status || 'active',
    });
    setEditImageFile(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      const payload = buildProductFormData(editData, editImageFile);
      await marketAPI.updateProduct(editingId, payload);
      setEditingId(null);
      setEditImageFile(null);
      await fetchProducts();
    } catch (err) {
      alert('Failed to update product');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        await marketAPI.deleteProduct(id);
        await fetchProducts();
      } catch (err) {
        alert('Failed to delete');
      }
    }
  };

  return (
    <div className="staff-panel-grid">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Marketplace Inventory Management</h3>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setShowStats((prev) => !prev)}>
            {showStats ? 'Hide Sales Statistics' : 'Sales Statistics'}
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Close Form' : 'Add New Product'}
          </button>
        </div>
      </div>

      <div className="staff-panel-card" style={{ padding: '1rem', display: 'grid', gap: '0.8rem', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
        <input
          className="input"
          placeholder="Search by name/details"
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        />
        <select className="input" value={filters.category} onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}>
          <option value="all">All categories</option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
          ))}
        </select>
        <select className="input" value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}>
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>{option.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
          ))}
        </select>
        <select className="input" value={filters.stock} onChange={(e) => setFilters((prev) => ({ ...prev, stock: e.target.value }))}>
          <option value="all">All stock levels</option>
          <option value="in">In stock</option>
          <option value="low">Low stock (1-10)</option>
          <option value="out">Out of stock</option>
        </select>
      </div>

      {showStats && (
        <div className="staff-panel-card" style={{ padding: '1.25rem', display: 'grid', gap: '1rem' }}>
          <h4 style={{ margin: 0 }}>Sales Statistics</h4>
          {loadingStats ? (
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Loading sales statistics...</p>
          ) : (
            <>
              <div style={{ display: 'grid', gap: '0.8rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                <div className="staff-panel-soft" style={{ padding: '0.85rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Total Orders</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{salesStats.totalOrders}</div>
                </div>
                <div className="staff-panel-soft" style={{ padding: '0.85rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Pending / Processing</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{salesStats.pendingOrders}</div>
                </div>
                <div className="staff-panel-soft" style={{ padding: '0.85rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Delivered Orders</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{salesStats.deliveredOrders}</div>
                </div>
                <div className="staff-panel-soft" style={{ padding: '0.85rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Gross Revenue</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>৳{salesStats.grossRevenue.toFixed(2)}</div>
                </div>
                <div className="staff-panel-soft" style={{ padding: '0.85rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Delivered Revenue</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>৳{salesStats.deliveredRevenue.toFixed(2)}</div>
                </div>
                <div className="staff-panel-soft" style={{ padding: '0.85rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Units Sold</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{salesStats.totalItems}</div>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(148,163,184,0.2)' }}>
                      <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>Top Product</th>
                      <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>Units Sold</th>
                      <th style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesStats.topProducts.map((p) => (
                      <tr key={p.name} style={{ borderBottom: '1px solid rgba(148,163,184,0.14)' }}>
                        <td style={{ padding: '10px 8px' }}>{p.name}</td>
                        <td style={{ padding: '10px 8px' }}>{p.quantity}</td>
                        <td style={{ padding: '10px 8px' }}>৳{p.revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                    {salesStats.topProducts.length === 0 && (
                      <tr>
                        <td colSpan="3" style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>
                          No sales data available yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="staff-panel-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4>Create Product</h4>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <input className="input" placeholder="Product Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{flex: 1}}/>
            <select className="input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{flex: 1}}>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
              ))}
            </select>
            <select className="input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <input type="number" className="input" placeholder="Price (৳)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required style={{flex: 1}}/>
            <input type="number" className="input" placeholder="Stock Quantity" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} required style={{flex: 1}}/>
            <input className="input" placeholder="Unit (e.g., kg, piece)" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} required style={{flex: 1}}/>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Product Image / Media</label>
            <input type="file" accept="image/*" className="input" onChange={(e) => setNewImageFile(e.target.files?.[0] || null)} />
          </div>
          <textarea className="input" placeholder="Product details / description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Save Product</button>
        </form>
      )}

      {editingId && (
        <form onSubmit={handleEditSubmit} className="staff-panel-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0 }}>Edit Product #{editingId}</h4>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
          </div>
          <div style={{ display: 'grid', gap: '0.8rem', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
            <input className="input" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} required />
            <select className="input" value={editData.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })}>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
              ))}
            </select>
            <select className="input" value={editData.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
              ))}
            </select>
            <input type="number" className="input" value={editData.price} onChange={(e) => setEditData({ ...editData, price: e.target.value })} required />
            <input type="number" className="input" value={editData.stock_quantity} onChange={(e) => setEditData({ ...editData, stock_quantity: e.target.value })} required />
            <input className="input" value={editData.unit} onChange={(e) => setEditData({ ...editData, unit: e.target.value })} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Replace Product Image / Media</label>
            <input type="file" accept="image/*" className="input" onChange={(e) => setEditImageFile(e.target.files?.[0] || null)} />
          </div>
          <textarea className="input" value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} placeholder="Product details / description" />
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Update Product</button>
        </form>
      )}

      <div className="staff-panel-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Product Catalog ({filteredProducts.length})</h4>
        </div>
        <div style={{ padding: '1rem' }}>
          {loading ? <p>Loading inventory...</p> : (
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              {filteredProducts.map((p) => (
                <div key={p.id} className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {p.image ? (
                    <img src={p.image} alt={p.name} style={{ width: '100%', height: 170, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: 170, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #dbeafe, #dcfce7)', color: '#1e3a8a', fontWeight: 700 }}>
                      No Product Media
                    </div>
                  )}
                  <div style={{ padding: '0.9rem', display: 'grid', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <strong>{p.name}</strong>
                      <span style={{ fontSize: '0.72rem', textTransform: 'capitalize', padding: '2px 8px', borderRadius: 999, background: 'rgba(34,197,94,0.12)' }}>{p.status.replace('_', ' ')}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                      {p.category}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {p.description || 'No details provided'}
                    </div>
                    <div style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span>৳{p.price}/{p.unit}</span>
                      <span style={{ fontSize: '0.82rem', color: Number(p.stock_quantity || 0) > 10 ? '#16a34a' : Number(p.stock_quantity || 0) > 0 ? '#f59e0b' : '#dc2626' }}>
                        Stock: {p.stock_quantity}
                      </span>
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                      <button onClick={() => startEditing(p)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="btn btn-sm" style={{ flex: 1, background: '#fef2f2', color: '#ef4444', border: 'none' }}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>No products found for the selected filters.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
