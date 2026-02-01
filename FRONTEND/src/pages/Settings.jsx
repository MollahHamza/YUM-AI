import React, { useState, useEffect } from 'react';
import { AuthAPI } from '../lib/api';

function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  // User data
  const [user, setUser] = useState(null);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    restaurant_name: '',
    phone: '',
  });

  // Preferences form
  const [prefsForm, setPrefsForm] = useState({
    theme: 'light',
    currency: 'USD',
    language: 'en',
    notifications_enabled: true,
    low_stock_threshold: 5,
  });

  // AI Settings form
  const [aiForm, setAiForm] = useState({
    ai_model: 'gemini-2.0-flash',
    gemini_api_key: '',
  });

  // Restaurant settings form
  const [restaurantForm, setRestaurantForm] = useState({
    restaurant_address: '',
    restaurant_phone: '',
    restaurant_email: '',
    business_hours: '',
    tax_rate: '0.00',
    default_tip_percentage: '15.00',
    receipt_footer: 'Thank you for your business!',
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const data = await AuthAPI.getProfile();
      setUser(data);

      // Populate forms
      setProfileForm({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        restaurant_name: data.profile?.restaurant_name || '',
        phone: data.profile?.phone || '',
      });

      setPrefsForm({
        theme: data.profile?.theme || 'light',
        currency: data.profile?.currency || 'USD',
        language: data.profile?.language || 'en',
        notifications_enabled: data.profile?.notifications_enabled ?? true,
        low_stock_threshold: data.profile?.low_stock_threshold || 5,
      });

      setAiForm({
        ai_model: data.profile?.ai_model || 'gemini-1.5-flash',
        gemini_api_key: data.profile?.gemini_api_key || '',
      });

      if (data.app_settings) {
        setRestaurantForm({
          restaurant_address: data.app_settings.restaurant_address || '',
          restaurant_phone: data.app_settings.restaurant_phone || '',
          restaurant_email: data.app_settings.restaurant_email || '',
          business_hours: data.app_settings.business_hours || '',
          tax_rate: data.app_settings.tax_rate || '0.00',
          default_tip_percentage: data.app_settings.default_tip_percentage || '15.00',
          receipt_footer: data.app_settings.receipt_footer || 'Thank you for your business!',
        });
      }
    } catch (e) {
      setError('Failed to load profile: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, isError = false) => {
    if (isError) {
      setError(msg);
      setSuccess(null);
    } else {
      setSuccess(msg);
      setError(null);
    }
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 3000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await AuthAPI.updateProfile(profileForm);
      showMessage('Profile updated successfully!');
      loadUserData();
    } catch (e) {
      showMessage('Failed to update profile: ' + e.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await AuthAPI.updateProfile(prefsForm);
      // Apply theme immediately
      document.documentElement.setAttribute('data-theme', prefsForm.theme);
      localStorage.setItem('theme', prefsForm.theme);
      showMessage('Preferences saved successfully!');
      loadUserData();
    } catch (e) {
      showMessage('Failed to save preferences: ' + e.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAI = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await AuthAPI.updateProfile(aiForm);
      // Save API key to localStorage for immediate use
      if (aiForm.gemini_api_key) {
        localStorage.setItem('gemini_api_key', aiForm.gemini_api_key);
      }
      showMessage('AI settings saved successfully!');
      loadUserData();
    } catch (e) {
      showMessage('Failed to save AI settings: ' + e.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRestaurant = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await AuthAPI.updateSettings(restaurantForm);
      showMessage('Restaurant settings saved successfully!');
      loadUserData();
    } catch (e) {
      showMessage('Failed to save settings: ' + e.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showMessage('New passwords do not match', true);
      return;
    }
    setSaving(true);
    try {
      const result = await AuthAPI.changePassword({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      });
      // Update token
      if (result.token) {
        localStorage.setItem('auth_token', result.token);
      }
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
      showMessage('Password changed successfully!');
    } catch (e) {
      showMessage('Failed to change password: ' + e.message, true);
    } finally {
      setSaving(false);
    }
  };

  const isLoggedIn = !!localStorage.getItem('auth_token');

  if (!isLoggedIn) {
    return (
      <div className="page-container">
        <h1 className="page-title">Settings</h1>
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ marginBottom: '20px' }}>Please log in to access settings.</p>
          <a href="/login" className="action-btn">Go to Login</a>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'ai', label: 'AI Settings' },
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'security', label: 'Security' },
  ];

  return (
    <div className="page-container">
      <h1 className="page-title">Settings</h1>

      {(error || success) && (
        <div className={`alert ${error ? 'alert-error' : 'alert-success'}`}>
          {error || success}
        </div>
      )}

      {loading ? (
        <div className="card skeleton" style={{ height: 400 }} />
      ) : (
        <>
          <div className="settings-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="settings-content">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="settings-form">
                <h2>Profile Information</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={profileForm.first_name}
                      onChange={e => setProfileForm({ ...profileForm, first_name: e.target.value })}
                      placeholder="First name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={profileForm.last_name}
                      onChange={e => setProfileForm({ ...profileForm, last_name: e.target.value })}
                      placeholder="Last name"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                    placeholder="Email address"
                  />
                </div>
                <div className="form-group">
                  <label>Restaurant Name</label>
                  <input
                    type="text"
                    value={profileForm.restaurant_name}
                    onChange={e => setProfileForm({ ...profileForm, restaurant_name: e.target.value })}
                    placeholder="Your restaurant name"
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
                <button type="submit" className="action-btn" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <form onSubmit={handleSavePreferences} className="settings-form">
                <h2>Preferences</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label>Theme</label>
                    <select
                      value={prefsForm.theme}
                      onChange={e => setPrefsForm({ ...prefsForm, theme: e.target.value })}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Currency</label>
                    <select
                      value={prefsForm.currency}
                      onChange={e => setPrefsForm({ ...prefsForm, currency: e.target.value })}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                      <option value="JPY">JPY</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Language</label>
                    <select
                      value={prefsForm.language}
                      onChange={e => setPrefsForm({ ...prefsForm, language: e.target.value })}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Low Stock Threshold</label>
                    <input
                      type="number"
                      min="1"
                      value={prefsForm.low_stock_threshold}
                      onChange={e => setPrefsForm({ ...prefsForm, low_stock_threshold: parseInt(e.target.value) || 5 })}
                    />
                  </div>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={prefsForm.notifications_enabled}
                      onChange={e => setPrefsForm({ ...prefsForm, notifications_enabled: e.target.checked })}
                    />
                    Enable Notifications
                  </label>
                </div>
                <button type="submit" className="action-btn" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </form>
            )}

            {/* AI Settings Tab */}
            {activeTab === 'ai' && (
              <form onSubmit={handleSaveAI} className="settings-form">
                <h2>AI Settings</h2>
                <div className="form-group">
                  <label>Default AI Model</label>
                  <select
                    value={aiForm.ai_model}
                    onChange={e => setAiForm({ ...aiForm, ai_model: e.target.value })}
                  >
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash (Recommended)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Accurate)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Gemini API Key (Optional)</label>
                  <input
                    type="password"
                    value={aiForm.gemini_api_key}
                    onChange={e => setAiForm({ ...aiForm, gemini_api_key: e.target.value })}
                    placeholder="Enter your own Gemini API key"
                  />
                  <small className="form-help">
                    Leave empty to use the default API key. Get your own key from{' '}
                    <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
                      Google AI Studio
                    </a>
                  </small>
                </div>
                <button type="submit" className="action-btn" disabled={saving}>
                  {saving ? 'Saving...' : 'Save AI Settings'}
                </button>
              </form>
            )}

            {/* Restaurant Tab */}
            {activeTab === 'restaurant' && (
              <form onSubmit={handleSaveRestaurant} className="settings-form">
                <h2>Restaurant Settings</h2>
                <div className="form-group">
                  <label>Restaurant Address</label>
                  <textarea
                    value={restaurantForm.restaurant_address}
                    onChange={e => setRestaurantForm({ ...restaurantForm, restaurant_address: e.target.value })}
                    placeholder="Full address"
                    rows={2}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Restaurant Phone</label>
                    <input
                      type="tel"
                      value={restaurantForm.restaurant_phone}
                      onChange={e => setRestaurantForm({ ...restaurantForm, restaurant_phone: e.target.value })}
                      placeholder="Phone number"
                    />
                  </div>
                  <div className="form-group">
                    <label>Restaurant Email</label>
                    <input
                      type="email"
                      value={restaurantForm.restaurant_email}
                      onChange={e => setRestaurantForm({ ...restaurantForm, restaurant_email: e.target.value })}
                      placeholder="Email address"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Business Hours</label>
                  <input
                    type="text"
                    value={restaurantForm.business_hours}
                    onChange={e => setRestaurantForm({ ...restaurantForm, business_hours: e.target.value })}
                    placeholder="e.g., Mon-Fri 9AM-10PM, Sat-Sun 10AM-11PM"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={restaurantForm.tax_rate}
                      onChange={e => setRestaurantForm({ ...restaurantForm, tax_rate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Default Tip (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={restaurantForm.default_tip_percentage}
                      onChange={e => setRestaurantForm({ ...restaurantForm, default_tip_percentage: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Receipt Footer Message</label>
                  <textarea
                    value={restaurantForm.receipt_footer}
                    onChange={e => setRestaurantForm({ ...restaurantForm, receipt_footer: e.target.value })}
                    placeholder="Thank you message for receipts"
                    rows={2}
                  />
                </div>
                <button type="submit" className="action-btn" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Restaurant Settings'}
                </button>
              </form>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <form onSubmit={handleChangePassword} className="settings-form">
                <h2>Change Password</h2>
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.old_password}
                    onChange={e => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={passwordForm.new_password}
                    onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    placeholder="Enter new password"
                    required
                    minLength={8}
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirm_password}
                    onChange={e => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    placeholder="Confirm new password"
                    required
                    minLength={8}
                  />
                </div>
                <button type="submit" className="action-btn" disabled={saving}>
                  {saving ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Settings;
