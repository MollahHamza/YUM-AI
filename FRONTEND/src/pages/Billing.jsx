import React, { useState } from 'react';

function Billing() {
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('pos');
  
  // Menu items for POS
  const menuItems = [
    { id: 1, name: 'Cheeseburger', price: 8.99, category: 'Burgers' },
    { id: 2, name: 'Chicken Sandwich', price: 7.99, category: 'Sandwiches' },
    { id: 3, name: 'Caesar Salad', price: 6.99, category: 'Salads' },
    { id: 4, name: 'French Fries', price: 3.99, category: 'Sides' },
    { id: 5, name: 'Onion Rings', price: 4.99, category: 'Sides' },
    { id: 6, name: 'Soda', price: 1.99, category: 'Drinks' },
    { id: 7, name: 'Milkshake', price: 4.99, category: 'Drinks' },
    { id: 8, name: 'Pizza', price: 12.99, category: 'Main' },
    { id: 9, name: 'Pasta', price: 10.99, category: 'Main' },
  ];
  
  // Recent invoices for billing tab
  const invoices = [
    { id: 'INV-001', customer: 'John Smith', date: '2023-06-15', amount: 45.99, status: 'Paid' },
    { id: 'INV-002', customer: 'Sarah Johnson', date: '2023-06-14', amount: 32.50, status: 'Pending' },
    { id: 'INV-003', customer: 'Michael Brown', date: '2023-06-13', amount: 78.25, status: 'Paid' },
    { id: 'INV-004', customer: 'Emily Davis', date: '2023-06-12', amount: 22.75, status: 'Overdue' },
  ];

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

  // Process payment
  const processPayment = () => {
    alert(`Payment processed for $${calculateTotal()}`);
    clearCart();
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
          </div>
          
          <div className="cart-section">
            <h2 className="section-title">Current Order</h2>
            {cart.length === 0 ? (
              <p className="empty-cart-message">No items in cart</p>
            ) : (
              <>
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
                    <button className="clear-btn" onClick={clearCart}>Clear</button>
                    <button className="pay-btn" onClick={processPayment}>Pay Now</button>
                  </div>
                </div>
              </>
            )}
          </div>
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
                {invoices.map(invoice => (
                  <tr key={invoice.id}>
                    <td>{invoice.id}</td>
                    <td>{invoice.customer}</td>
                    <td>{invoice.date}</td>
                    <td>${invoice.amount}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Billing;