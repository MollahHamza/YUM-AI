import { useState } from 'react';
import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';
import UnderConstruction from './pages/UnderConstruction';
import './App.css';
import './pages/pages.css';

function App() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="logo">YumAI</h2>
          <button className="mobile-close" onClick={toggleMobileMenu}>×</button>
        </div>
        <nav className="sidebar-nav">
          <ul className="nav-list">
            <li className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
              <Link to="/" className="nav-link">
                <span className="nav-icon">📊</span>
                <span>Dashboard</span>
              </Link>
            </li>
            <li className={`nav-item ${location.pathname === '/billing' ? 'active' : ''}`}>
              <Link to="/billing" className="nav-link">
                <span className="nav-icon">💰</span>
                <span>Billing & POS</span>
              </Link>
            </li>
            <li className={`nav-item ${location.pathname === '/inventory' ? 'active' : ''}`}>
              <Link to="/inventory" className="nav-link">
                <span className="nav-icon">📦</span>
                <span>Inventory</span>
              </Link>
            </li>
            <li className={`nav-item ${location.pathname === '/reports' ? 'active' : ''}`}>
              <Link to="/reports" className="nav-link">
                <span className="nav-icon">📈</span>
                <span>Reports</span>
              </Link>
            </li>
            <li className={`nav-item ${location.pathname === '/forecasting' ? 'active' : ''}`}>
              <Link to="/forecasting" className="nav-link">
                <span className="nav-icon">🔮</span>
                <span>Forecasting</span>
              </Link>
            </li>
            <li className={`nav-item ${location.pathname === '/ai-insights' ? 'active' : ''}`}>
              <Link to="/ai-insights" className="nav-link">
                <span className="nav-icon">🤖</span>
                <span>AI Insights</span>
              </Link>
            </li>
            <li className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}>
              <Link to="/settings" className="nav-link">
                <span className="nav-icon">⚙️</span>
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="top-navbar">
          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>☰</button>
          <div className="search-container">
            <input type="text" placeholder="Search..." className="search-input" />
          </div>
          <div className="user-controls">
            <button className="notification-btn">🔔</button>
            <div className="user-avatar">
              <span className="user-initials">JD</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/reports" element={<UnderConstruction pageName="Reports" />} />
          <Route path="/forecasting" element={<UnderConstruction pageName="Forecasting" />} />
          <Route path="/ai-insights" element={<UnderConstruction pageName="AI Insights" />} />
          <Route path="/settings" element={<UnderConstruction pageName="Settings" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
