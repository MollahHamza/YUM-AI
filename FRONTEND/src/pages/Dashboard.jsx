import React, { useEffect, useState, useMemo } from 'react';
import { DashboardAPI, OrdersAPI, InventoryAPI } from '../lib/api';

function Dashboard() {
  const [stats, setStats] = useState({ total_sales_today: 0, total_orders_today: 0, total_inventory_items: 0, low_stock_count: 0 });
  const [orders, setOrders] = useState([]);
  const [billingHistory, setBillingHistory] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [s, ordersRes, billingRes, menuRes] = await Promise.all([
          DashboardAPI.stats(),
          OrdersAPI.listOrders(),
          OrdersAPI.getBillingHistory(),
          OrdersAPI.getMenuItems(),
        ]);
        setStats({
          total_sales_today: Number(s.total_sales_today || 0),
          total_orders_today: Number(s.total_orders_today || 0),
          total_inventory_items: Number(s.total_inventory_items || 0),
          low_stock_count: Number(s.low_stock_count || 0),
        });
        setOrders(Array.isArray(ordersRes) ? ordersRes : []);
        setBillingHistory(Array.isArray(billingRes) ? billingRes : []);
        setMenuItems(Array.isArray(menuRes) ? menuRes : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Combine orders and billing history for recent orders display
  const recentOrders = useMemo(() => {
    const combined = [
      ...orders.map(o => ({
        id: o.order_number || `#${o.id}`,
        customer: o.customer_name || 'Unknown',
        items: o.items?.length || 0,
        total: parseFloat(o.total) || 0,
        status: 'Pending',
        date: new Date(o.order_date),
      })),
      ...billingHistory.map(b => ({
        id: b.order_number || `#${b.id}`,
        customer: b.customer_name || 'Unknown',
        items: (() => {
          try {
            const items = typeof b.items_summary === 'string' ? JSON.parse(b.items_summary) : b.items_summary;
            return Array.isArray(items) ? items.length : 0;
          } catch { return 0; }
        })(),
        total: parseFloat(b.total_amount) || 0,
        status: 'Paid',
        date: new Date(b.order_date),
      })),
    ];
    return combined.sort((a, b) => b.date - a.date).slice(0, 10);
  }, [orders, billingHistory]);

  // Calculate unique customers from all orders
  const uniqueCustomers = useMemo(() => {
    const names = new Set();
    orders.forEach(o => o.customer_name && names.add(o.customer_name.toLowerCase()));
    billingHistory.forEach(b => b.customer_name && names.add(b.customer_name.toLowerCase()));
    return names.size;
  }, [orders, billingHistory]);

  // Calculate daily sales for the chart (last 7 days)
  const dailySales = useMemo(() => {
    const salesMap = new Map();
    const today = new Date();
    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      salesMap.set(key, 0);
    }
    // Add sales from billing history (paid orders)
    billingHistory.forEach(b => {
      const day = new Date(b.order_date).toISOString().slice(0, 10);
      if (salesMap.has(day)) {
        salesMap.set(day, salesMap.get(day) + (parseFloat(b.total_amount) || 0));
      }
    });
    return Array.from(salesMap.entries()).map(([date, amount]) => ({ date, amount }));
  }, [billingHistory]);

  // Calculate popular items from billing history
  const popularItems = useMemo(() => {
    const itemCounts = new Map();
    billingHistory.forEach(b => {
      try {
        const items = typeof b.items_summary === 'string' ? JSON.parse(b.items_summary) : b.items_summary;
        if (Array.isArray(items)) {
          items.forEach(item => {
            const name = item.name || 'Unknown';
            itemCounts.set(name, (itemCounts.get(name) || 0) + (item.quantity || 1));
          });
        }
      } catch {}
    });
    // Also count items from current orders
    orders.forEach(o => {
      const menuMap = new Map(menuItems.map(m => [m.id, m.name]));
      (o.items || []).forEach(item => {
        const name = menuMap.get(item.menu_item) || `Item ${item.menu_item}`;
        itemCounts.set(name, (itemCounts.get(name) || 0) + (item.quantity || 1));
      });
    });
    return Array.from(itemCounts.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [billingHistory, orders, menuItems]);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Restaurant Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon blue">💰</div>
            <div className="stat-info">
              <p className="stat-label">Today's Sales</p>
              <p className="stat-value">${stats.total_sales_today.toFixed(2)}</p>
            </div>
          </div>
          <div className="stat-change">&nbsp;</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon green">🛒</div>
            <div className="stat-info">
              <p className="stat-label">Orders</p>
              <p className="stat-value">{stats.total_orders_today}</p>
            </div>
          </div>
          <div className="stat-change">&nbsp;</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon purple">📦</div>
            <div className="stat-info">
              <p className="stat-label">Inventory Items</p>
              <p className="stat-value">{stats.total_inventory_items}</p>
            </div>
          </div>
          <div className="stat-change">&nbsp;</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon yellow">👤</div>
            <div className="stat-info">
              <p className="stat-label">Customers</p>
              <p className="stat-value">{uniqueCustomers}</p>
            </div>
          </div>
          <div className="stat-change">&nbsp;</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>⚠️</div>
            <div className="stat-info">
              <p className="stat-label">Low Stock</p>
              <p className="stat-value">{stats.low_stock_count}</p>
            </div>
          </div>
          <div className="stat-change">&nbsp;</div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-card">
          <h2 className="chart-title">Sales Overview (Last 7 Days)</h2>
          <div className="chart-container">
            {(() => {
              const max = Math.max(1, ...dailySales.map(d => d.amount));
              return (
                <>
                  <div className="bar-chart">
                    {dailySales.map(d => (
                      <div key={d.date} className="bar" style={{ height: `${Math.round((d.amount / max) * 100)}%` }} title={`${d.date}: $${d.amount.toFixed(2)}`} />
                    ))}
                  </div>
                  <div className="bar-labels">
                    {dailySales.map(d => (
                      <div key={d.date}>{d.date.slice(5)}</div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        <div className="chart-card">
          <h2 className="chart-title">Popular Items</h2>
          <div className="popular-items-list">
            {popularItems.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {popularItems.map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                    <span>{item.name}</span>
                    <span style={{ fontWeight: 'bold' }}>{item.qty} sold</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ textAlign: 'center', color: '#888' }}>No sales data yet</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Recent Orders */}
      <div className="orders-card">
        <div className="orders-header">
          <h2 className="orders-title">Recent Orders</h2>
        </div>
        <div className="orders-content">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#dc2626' }}>Error: {error}</td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>No orders yet</td>
                </tr>
              ) : (
                recentOrders.map((order, idx) => (
                  <tr key={idx}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.items}</td>
                    <td>${order.total.toFixed(2)}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: order.status === 'Paid' ? '#dcfce7' : '#fef3c7',
                        color: order.status === 'Paid' ? '#166534' : '#92400e'
                      }}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;