import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthAPI } from '../lib/api';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await AuthAPI.login(form);

      // Store token and user data
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      // Store Gemini API key if user has one
      if (result.user?.profile?.gemini_api_key) {
        localStorage.setItem('gemini_api_key', result.user.profile.gemini_api_key);
      }

      // Notify parent component
      if (onLogin) {
        onLogin(result.user);
      }

      // Redirect to dashboard
      navigate('/');
    } catch (e) {
      setError(e.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-logo">YumAI</h1>
          <p className="auth-subtitle">Restaurant Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Welcome Back</h2>
          <p className="auth-description">Sign in to your account</p>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label>Username or Email</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="Enter your username or email"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
