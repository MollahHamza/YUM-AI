import React from 'react';

function Dashboard() {
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
              <p className="stat-value">$12,426</p>
            </div>
          </div>
          <div className="stat-change positive">+8% from yesterday</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon green">🛒</div>
            <div className="stat-info">
              <p className="stat-label">Orders</p>
              <p className="stat-value">156</p>
            </div>
          </div>
          <div className="stat-change positive">+12% from yesterday</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon purple">📦</div>
            <div className="stat-info">
              <p className="stat-label">Inventory Items</p>
              <p className="stat-value">243</p>
            </div>
          </div>
          <div className="stat-change negative">5 items low stock</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="stat-icon yellow">👤</div>
            <div className="stat-info">
              <p className="stat-label">Customers</p>
              <p className="stat-value">1,893</p>
            </div>
          </div>
          <div className="stat-change positive">+3% from last week</div>
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
              <tr>
                <td>#ORD-001</td>
                <td>John Smith</td>
                <td>3</td>
                <td>$45.99</td>
                <td><span className="status-badge completed">Completed</span></td>
              </tr>
              <tr>
                <td>#ORD-002</td>
                <td>Sarah Johnson</td>
                <td>1</td>
                <td>$18.50</td>
                <td><span className="status-badge processing">Processing</span></td>
              </tr>
              <tr>
                <td>#ORD-003</td>
                <td>Michael Brown</td>
                <td>2</td>
                <td>$32.75</td>
                <td><span className="status-badge delivered">Delivered</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;