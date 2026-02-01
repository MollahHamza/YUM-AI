import React, { useEffect, useState } from 'react';
import { OrdersAPI } from '../lib/api';

function Billing() {
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('pos');
  const [customerName, setCustomerName] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add menu item form
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', price: '', category: '' });

  const loadData = async () => {
    setError(null);
    try {
      const [menu, bills] = await Promise.all([
        OrdersAPI.getMenuItems(),
        OrdersAPI.getBillingHistory(),
      ]);
      setMenuItems((menu || []).map(m => ({
        id: m.id,
        name: m.name,
        price: typeof m.price === 'string' ? parseFloat(m.price) : m.price,
        category: m.category || 'Menu',
      })));
      setInvoices((bills || []).map(b => ({
        id: b.id,
        customer: b.customer_name || 'Unknown',
        date: b.order_date ? new Date(b.order_date).toLocaleDateString() : '',
        amount: typeof b.total_amount === 'string' ? parseFloat(b.total_amount) : (b.total_amount || 0),
        status: b.status || 'Paid',
        order_number: b.order_number,
      })));
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Add menu item
  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price || !newItem.category) {
      alert('Please fill all fields');
      return;
    }
    try {
      setLoading(true);
      await OrdersAPI.createMenuItem({
        name: newItem.name,
        price: parseFloat(newItem.price),
        category: newItem.category
      });
      setNewItem({ name: '', price: '', category: '' });
      setShowAddItem(false);
      await loadData();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete menu item
  const handleDeleteMenuItem = async (id) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      await OrdersAPI.deleteMenuItem(id);
      await loadData();
    } catch (e) {
      setError(e.message);
    }
  };

  // Add item to cart
  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);

    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    const existingItem = cart.find(item => item.id === itemId);

    if (existingItem.quantity === 1) {
      setCart(cart.filter(item => item.id !== itemId));
    } else {
      setCart(cart.map(item =>
        item.id === itemId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    }
  };

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Process payment via backend
  const processPayment = async () => {
    try {
      if (cart.length === 0) {
        alert('Cart is empty');
        return;
      }
      setLoading(true);
      setError(null);
      const items = cart.map(ci => ({ menu_item_id: ci.id, quantity: ci.quantity }));
      const order = await OrdersAPI.createOrder({ customer_name: customerName || 'Unknown', items });
      const paid = await OrdersAPI.payOrder({ order_id: order.id });
      alert(`Payment successful: ${paid.order_number} - $${paid.total_amount}`);
      clearCart();
      setCustomerName('');
      await loadData();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Billing & POS</h1>

      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'pos' ? 'active' : ''}`}
          onClick={() => setActiveTab('pos')}
        >
          Point of Sale
        </button>
        <button
          className={`tab-button ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          Menu Items
        </button>
        <button
          className={`tab-button ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          Billing History
        </button>
      </div>

      {activeTab === 'pos' ? (
        <div className="pos-container">
          <div className="menu-section">
            <h2 className="section-title">Menu Items</h2>
            {menuItems.length === 0 ? (
              <div className="empty-state">
                <p>No menu items yet.</p>
                <button className="action-btn" onClick={() => setActiveTab('menu')}>
                  Add Menu Items
                </button>
              </div>
            ) : (
              <div className="menu-grid">
                {menuItems.map(item => (
                  <div key={item.id} className="menu-item" onClick={() => addToCart(item)}>
                    <div className="menu-item-details">
                      <h3>{item.name}</h3>
                      <p className="menu-item-category">{item.category}</p>
                      <p className="menu-item-price">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="cart-section">
            <h2 className="section-title">Current Order</h2>
            {cart.length === 0 ? (
              <p className="empty-cart-message">No items in cart</p>
            ) : (
              <>
                <div className="customer-input">
                  <label>Customer Name</label>
                  <input
                    type="text"
                    className="inventory-search"
                    placeholder="Enter customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-details">
                        <h3>{item.name}</h3>
                        <p>${item.price.toFixed(2)} x {item.quantity}</p>
                      </div>
                      <div className="cart-item-actions">
                        <button className="quantity-btn" onClick={() => removeFromCart(item.id)}>-</button>
                        <span className="quantity">{item.quantity}</span>
                        <button className="quantity-btn" onClick={() => addToCart(item)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div className="cart-total">
                    <h3>Total:</h3>
                    <h3>${calculateTotal()}</h3>
                  </div>
                  <div className="cart-actions">
                    <button className="clear-btn" onClick={clearCart} disabled={loading}>Clear</button>
                    <button className="pay-btn" onClick={processPayment} disabled={loading}>
                      {loading ? 'Processing...' : 'Pay Now'}
                    </button>
                  </div>
                </div>
              </>
            )}
            {error && <p className="error-text">{error}</p>}
          </div>
        </div>
      ) : activeTab === 'menu' ? (
        <div className="billing-container">
          <div className="section-header">
            <h2 className="section-title">Manage Menu Items</h2>
            <button className="add-item-btn" onClick={() => setShowAddItem(!showAddItem)}>
              {showAddItem ? 'Cancel' : '+ Add Item'}
            </button>
          </div>

          {showAddItem && (
            <form onSubmit={handleAddMenuItem} className="add-item-form">
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Item name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Category (e.g., Drinks, Food)"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  required
                />
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          )}

          <table className="invoices-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                    No menu items. Add your first item above.
                  </td>
                </tr>
              ) : (
                menuItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>
                      <button
                        className="action-btn"
                        onClick={() => handleDeleteMenuItem(item.id)}
                        style={{ color: '#e74c3c' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {error && <p className="error-text">{error}</p>}
        </div>
      ) : (
        <div className="billing-container">
          <div className="invoices-section">
            <h2 className="section-title">Recent Invoices</h2>
            <table className="invoices-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                      No billing history yet.
                    </td>
                  </tr>
                ) : (
                  invoices.map(invoice => (
                    <tr key={invoice.id}>
                      <td>{invoice.order_number || invoice.id}</td>
                      <td>{invoice.customer}</td>
                      <td>{invoice.date}</td>
                      <td>${invoice.amount.toFixed(2)}</td>
                      <td>
                        <span className={`status-badge ${invoice.status.toLowerCase()}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td>
                        <button className="action-btn">View</button>
                        <button className="action-btn">Print</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {error && <p className="error-text">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default Billing;
