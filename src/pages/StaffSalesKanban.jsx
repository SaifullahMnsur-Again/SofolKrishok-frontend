import React, { useState, useEffect } from 'react';
import { marketAPI } from '../services/api';

const columns = ['pending', 'processing', 'shipped', 'delivered', 'returned', 'cancelled'];
const ARCHIVED_KEY = 'staffFulfillmentArchivedOrders';

export default function StaffSalesKanban() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggingOrder, setDraggingOrder] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [archivedOrderIds, setArchivedOrderIds] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    customer: '',
    minTotal: '',
    maxTotal: '',
  });

  const fetchOrders = async () => {
    try {
      const { data } = await marketAPI.getOrders();
      setOrders(data.results !== undefined ? data.results : data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ARCHIVED_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setArchivedOrderIds(parsed.filter((id) => Number.isInteger(id)));
      }
    } catch {
      setArchivedOrderIds([]);
    }
  }, []);

  const persistArchived = (nextIds) => {
    setArchivedOrderIds(nextIds);
    localStorage.setItem(ARCHIVED_KEY, JSON.stringify(nextIds));
  };

  const archiveOrderFromBoard = (order) => {
    if (order.status !== 'delivered') {
      alert('Only delivered orders can be removed from the board.');
      return;
    }
    if (archivedOrderIds.includes(order.id)) return;
    persistArchived([...archivedOrderIds, order.id]);
  };

  const restoreOrderToBoard = (orderId) => {
    persistArchived(archivedOrderIds.filter((id) => id !== orderId));
  };

  const clearArchived = () => {
    persistArchived([]);
  };

  const updateStatus = async (orderId, nextStatus) => {
    try {
      await marketAPI.updateOrder(orderId, { status: nextStatus });
      await fetchOrders();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const visibleOrders = showArchived
    ? orders
    : orders.filter((order) => !archivedOrderIds.includes(order.id));

  const filteredOrders = visibleOrders.filter((order) => {
    const total = Number(order.total_amount || 0);
    const minTotal = filters.minTotal ? Number(filters.minTotal) : null;
    const maxTotal = filters.maxTotal ? Number(filters.maxTotal) : null;

    const searchHit = !filters.search
      || String(order.id).includes(filters.search)
      || String(order.shipping_address || '').toLowerCase().includes(filters.search.toLowerCase())
      || String(order.notes || '').toLowerCase().includes(filters.search.toLowerCase())
      || (order.items || []).some((item) => String(item.product_name || '').toLowerCase().includes(filters.search.toLowerCase()));

    const statusHit = filters.status === 'all' || order.status === filters.status;
    const customerHit = !filters.customer || String(order.customer || '').includes(filters.customer);
    const minHit = minTotal == null || total >= minTotal;
    const maxHit = maxTotal == null || total <= maxTotal;

    return searchHit && statusHit && customerHit && minHit && maxHit;
  });

  const kpis = {
    totalOrders: filteredOrders.length,
    pending: filteredOrders.filter((o) => o.status === 'pending' || o.status === 'processing').length,
    fulfilled: filteredOrders.filter((o) => o.status === 'delivered').length,
    cancelled: filteredOrders.filter((o) => o.status === 'cancelled').length,
    revenue: filteredOrders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
  };

  const handleDragStart = (e, order) => {
    setDraggingOrder(order);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    if (!draggingOrder || draggingOrder.status === targetStatus) return;

    // Optimistic UI update
    setOrders(prev => prev.map(o => o.id === draggingOrder.id ? { ...o, status: targetStatus } : o));

    try {
      await marketAPI.updateOrder(draggingOrder.id, { status: targetStatus });
    } catch (err) {
      alert("Failed to update status.");
      fetchOrders(); // Revert on failure
    }
    setDraggingOrder(null);
  };

  if (loading) return <div>Loading Fulfillment Board...</div>;

  return (
    <div className="staff-panel-grid">
      <h3 style={{ margin: '0 0 0.6rem 0' }}>Sales Execution Kanban</h3>

      <div className="staff-panel-card" style={{ padding: '1rem', display: 'grid', gap: '0.8rem', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
        <input
          className="input"
          placeholder="Search order, address, note, item"
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        />
        <select className="input" value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}>
          <option value="all">All statuses</option>
          {columns.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <input
          className="input"
          placeholder="Customer ID"
          value={filters.customer}
          onChange={(e) => setFilters((prev) => ({ ...prev, customer: e.target.value }))}
        />
        <input
          type="number"
          className="input"
          placeholder="Min total"
          value={filters.minTotal}
          onChange={(e) => setFilters((prev) => ({ ...prev, minTotal: e.target.value }))}
        />
        <input
          type="number"
          className="input"
          placeholder="Max total"
          value={filters.maxTotal}
          onChange={(e) => setFilters((prev) => ({ ...prev, maxTotal: e.target.value }))}
        />
        <button className="btn btn-secondary" type="button" onClick={() => setShowArchived((prev) => !prev)}>
          {showArchived ? 'Hide Archived Delivered' : `Show Archived Delivered (${archivedOrderIds.length})`}
        </button>
        {archivedOrderIds.length > 0 && (
          <button className="btn btn-secondary" type="button" onClick={clearArchived}>
            Clear Archived List
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gap: '0.8rem', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <div className="staff-panel-card" style={{ padding: '0.85rem' }}><div style={{ fontSize: '0.78rem', color: '#64748b' }}>Orders</div><div style={{ fontWeight: 800, fontSize: '1.25rem' }}>{kpis.totalOrders}</div></div>
        <div className="staff-panel-card" style={{ padding: '0.85rem' }}><div style={{ fontSize: '0.78rem', color: '#64748b' }}>Pending / Processing</div><div style={{ fontWeight: 800, fontSize: '1.25rem' }}>{kpis.pending}</div></div>
        <div className="staff-panel-card" style={{ padding: '0.85rem' }}><div style={{ fontSize: '0.78rem', color: '#64748b' }}>Fulfilled</div><div style={{ fontWeight: 800, fontSize: '1.25rem' }}>{kpis.fulfilled}</div></div>
        <div className="staff-panel-card" style={{ padding: '0.85rem' }}><div style={{ fontSize: '0.78rem', color: '#64748b' }}>Cancelled</div><div style={{ fontWeight: 800, fontSize: '1.25rem' }}>{kpis.cancelled}</div></div>
        <div className="staff-panel-card" style={{ padding: '0.85rem' }}><div style={{ fontSize: '0.78rem', color: '#64748b' }}>Revenue (Filtered)</div><div style={{ fontWeight: 800, fontSize: '1.25rem' }}>৳{kpis.revenue.toFixed(2)}</div></div>
      </div>
      
      <div className="staff-kanban-board">
        {columns.map(status => (
          <div 
            key={status}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
            className="staff-kanban-column"
          >
            <h4 style={{ textTransform: 'capitalize' }}>
              {status}
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredOrders.filter(o => o.status === status).map(order => (
                <div 
                  key={order.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, order)}
                  className="staff-kanban-card"
                  style={{
                    borderLeftColor: status === 'delivered' ? '#10b981' : status === 'returned' || status === 'cancelled' ? '#ef4444' : '#3b82f6',
                    opacity: archivedOrderIds.includes(order.id) ? 0.72 : 1,
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    Order #{order.id}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Customer ID: {order.customer}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 4 }}>
                    Last moved by: {order.last_status_changed_by_name || 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 500 }}>
                    ৳{order.total_amount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 2 }}>
                    {new Date(order.created_at).toLocaleString()}
                  </div>
                  {archivedOrderIds.includes(order.id) && (
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>
                      Archived from active board
                    </div>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: 8 }}
                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                  >
                    {expandedOrderId === order.id ? 'Hide Details' : 'Order Details'}
                  </button>

                  {expandedOrderId === order.id && (
                    <div style={{ marginTop: 10, borderTop: '1px solid #e2e8f0', paddingTop: 8 }}>
                      <div style={{ marginBottom: 8, fontSize: '0.75rem', color: '#334155' }}>
                        <strong>Shipping:</strong> {order.shipping_address || 'N/A'}
                      </div>
                      <div style={{ marginBottom: 8, fontSize: '0.75rem', color: '#334155' }}>
                        <strong>Notes:</strong> {order.notes || 'N/A'}
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <label style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', marginBottom: 4 }}>Move status</label>
                        <select
                          className="input"
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          style={{ minHeight: 34, fontSize: '0.78rem' }}
                        >
                          {columns.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                      {order.status === 'delivered' && !archivedOrderIds.includes(order.id) && (
                        <div style={{ marginBottom: 8 }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => archiveOrderFromBoard(order)}
                          >
                            Remove from Fulfillment Board
                          </button>
                        </div>
                      )}

                      {archivedOrderIds.includes(order.id) && (
                        <div style={{ marginBottom: 8 }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => restoreOrderToBoard(order.id)}
                          >
                            Restore to Board
                          </button>
                        </div>
                      )}

                      <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>Items</div>
                      {(order.items || []).length === 0 ? (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 8 }}>No items found.</div>
                      ) : (
                        <div style={{ display: 'grid', gap: 5, marginBottom: 8 }}>
                          {(order.items || []).map((item) => (
                            <div key={item.id} style={{ fontSize: '0.74rem', color: '#334155' }}>
                              {item.product_name} x{item.quantity} = ৳{item.subtotal}
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>Status Handoff History</div>
                      {(order.status_history || []).length === 0 ? (
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>No handoff history yet.</div>
                      ) : (
                        <div style={{ display: 'grid', gap: 6 }}>
                          {order.status_history.map((entry) => (
                            <div key={entry.id} style={{ fontSize: '0.74rem', color: '#334155' }}>
                              <strong>{entry.new_status}</strong>
                              {entry.previous_status ? ` from ${entry.previous_status}` : ' (initial)'}
                              {' by '}
                              <strong>{entry.changed_by_name || 'System'}</strong>
                              {entry.note ? ` - ${entry.note}` : ''}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {filteredOrders.filter(o => o.status === status).length === 0 && (
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', padding: '0.35rem 0.2rem' }}>
                  No orders in this column
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
