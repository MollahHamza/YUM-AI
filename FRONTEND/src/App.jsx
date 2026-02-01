import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Forecasting from './pages/Forecasting';
import AIInsights from './pages/AIInsights';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';
import './pages/pages.css';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('auth_token');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
      }
    }
    setIsLoading(false);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('gemini_api_key');
    setUser(null);
    setShowUserMenu(false);
    navigate('/login');
  };

  const getUserInitials = () => {
    if (user?.profile?.avatar_initials) {
      return user.profile.avatar_initials;
    }
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Auth pages don't show the sidebar
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  // Show loading while checking auth
  if (isLoading) {
    return <div className="loading-screen">Loading...</div>;
  }

  // Redirect to login if not authenticated (except for auth pages)
  if (!user && !isAuthPage) {
    return <Navigate to="/login" replace />;
  }

  if (isAuthPage) {
    // If already logged in, redirect to dashboard
    if (user) {
      return <Navigate to="/" replace />;
    }
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="logo">YumAI</h2>
          <button className="mobile-close" onClick={toggleMobileMenu}>x</button>
        </div>
        <nav className="sidebar-nav">
          <ul className="nav-list">
            <li className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
              <Link to="/" className="nav-link">
                <span>Dashboard</span>
              </Link>
            </li>
            <li className={`nav-item ${location.pathname === '/billing' ? 'active' : ''}`}>
              <Link to="/billing" className="nav-link">
                <span>Billing & POS</span>
              </Link>
            </li>
            <li className={`nav-item ${location.pathname === '/inventory' ? 'active' : ''}`}>
              <Link to="/inventory" className="nav-link">
                <span>Inventory</span>
              </Link>
            </li>
            <li className={`nav-item ${location.pathname === '/reports' ? 'active' : ''}`}>
              <Link to="/reports" className="nav-link">
                <span>Reports</span>
              </Link>
            </li>
            <li className={`nav-item ${location.pathname === '/forecasting' ? 'active' : ''}`}>
              <Link to="/forecasting" className="nav-link">
                <span>Forecasting</span>
              </Link>
            </li>
            <li className={`nav-item ${location.pathname === '/ai-insights' ? 'active' : ''}`}>
              <Link to="/ai-insights" className="nav-link">
                <span>AI Insights</span>
              </Link>
            </li>
            <li className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}>
              <Link to="/settings" className="nav-link">
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="top-navbar">
          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>Menu</button>
          <div className="search-container">
            <input type="text" placeholder="Search..." className="search-input" />
          </div>
          <div className="user-controls">
            <div className="user-menu-container">
              <div
                className="user-avatar"
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ cursor: 'pointer' }}
              >
                <span className="user-initials">{getUserInitials()}</span>
              </div>
              {showUserMenu && (
                <div className="user-dropdown">
                  {user ? (
                    <>
                      <div className="dropdown-header">
                        <strong>{user.first_name || user.username}</strong>
                        <small>{user.email}</small>
                      </div>
                      <Link to="/settings" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                        Settings
                      </Link>
                      <button className="dropdown-item logout-btn" onClick={handleLogout}>
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                        Login
                      </Link>
                      <Link to="/register" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                        Register
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/forecasting" element={<Forecasting />} />
          <Route path="/ai-insights" element={<AIInsights />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
