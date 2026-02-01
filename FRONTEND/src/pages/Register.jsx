import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthAPI } from '../lib/api';

function Register({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    restaurant_name: '',
  });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const errors = {};

    if (form.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (form.password !== form.password2) {
      errors.password2 = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await AuthAPI.register(form);

      // Store token and user data
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      // Notify parent component
      if (onLogin) {
        onLogin(result.user);
      }

      // Redirect to dashboard
      navigate('/');
    } catch (e) {
      // Parse error message
      try {
        const errorData = JSON.parse(e.message.replace('HTTP 400: ', ''));
        if (typeof errorData === 'object') {
          setFieldErrors(errorData);
        } else {
          setError(e.message);
        }
      } catch {
        setError(e.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkUsername = async () => {
    if (form.username.length >= 3) {
      try {
        const result = await AuthAPI.checkUsername(form.username);
        if (!result.available) {
          setFieldErrors(prev => ({ ...prev, username: 'Username is already taken' }));
        } else {
          setFieldErrors(prev => {
            const { username, ...rest } = prev;
            return rest;
          });
        }
      } catch (e) {
        // Ignore check errors
      }
    }
  };

  const checkEmail = async () => {
    if (form.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      try {
        const result = await AuthAPI.checkEmail(form.email);
        if (!result.available) {
          setFieldErrors(prev => ({ ...prev, email: 'Email is already registered' }));
        } else {
          setFieldErrors(prev => {
            const { email, ...rest } = prev;
            return rest;
          });
        }
      } catch (e) {
        // Ignore check errors
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container auth-container-wide">
        <div className="auth-header">
          <h1 className="auth-logo">YumAI</h1>
          <p className="auth-subtitle">Restaurant Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Create Account</h2>
          <p className="auth-description">Get started with YumAI</p>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={form.first_name}
                onChange={e => setForm({ ...form, first_name: e.target.value })}
                placeholder="First name"
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={form.last_name}
                onChange={e => setForm({ ...form, last_name: e.target.value })}
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              onBlur={checkUsername}
              placeholder="Choose a username"
              required
              className={fieldErrors.username ? 'input-error' : ''}
            />
            {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              onBlur={checkEmail}
              placeholder="Enter your email"
              required
              className={fieldErrors.email ? 'input-error' : ''}
            />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>

          <div className="form-group">
            <label>Restaurant Name</label>
            <input
              type="text"
              value={form.restaurant_name}
              onChange={e => setForm({ ...form, restaurant_name: e.target.value })}
              placeholder="Your restaurant name (optional)"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Create a password"
                required
                minLength={8}
                className={fieldErrors.password ? 'input-error' : ''}
              />
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                value={form.password2}
                onChange={e => setForm({ ...form, password2: e.target.value })}
                placeholder="Confirm password"
                required
                minLength={8}
                className={fieldErrors.password2 ? 'input-error' : ''}
              />
              {fieldErrors.password2 && <span className="field-error">{fieldErrors.password2}</span>}
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
