import React, { useEffect, useState } from 'react';
import { DashboardAPI } from '../lib/api';

function Dashboard() {
  const [stats, setStats] = useState({ total_sales_today: 0, total_orders_today: 0, total_inventory_items: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const s = await DashboardAPI.stats();
        setStats({
          total_sales_today: Number(s.total_sales_today || 0),
          total_orders_today: Number(s.total_orders_today || 0),
          total_inventory_items: Number(s.total_inventory_items || 0),
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
              <p className="stat-value">—</p>
            </div>
          </div>
          <div className="stat-change">&nbsp;</div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-card">
          <h2 className="chart-title">Sales Overview</h2>
          <div className="chart-placeholder">
            <p>Sales Chart Placeholder</p>
          </div>
        </div>
        
        <div className="chart-card">
          <h2 className="chart-title">Popular Items</h2>
          <div className="chart-placeholder">
            <p>Items Chart Placeholder</p>
          </div>
        </div>
      </div>
      
      {/* Recent Orders */}
      <div className="orders-card">
        <div className="orders-header">
          <h2 className="orders-title">Recent Orders</h2>
          <button className="view-all-btn">View All</button>
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
              {/* You can fetch and render recent orders later from /api/orders/orders/ */}
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>
                  {loading ? 'Loading…' : error ? `Error: ${error}` : 'No recent orders to display'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;