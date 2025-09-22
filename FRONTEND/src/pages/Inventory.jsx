import React, { useState } from 'react';

function Inventory() {
  const [inventoryItems, setInventoryItems] = useState([
    { id: 1, name: 'Beef Patties', category: 'Meat', quantity: 120, unit: 'pcs', status: 'In Stock' },
    { id: 2, name: 'Hamburger Buns', category: 'Bread', quantity: 80, unit: 'pcs', status: 'In Stock' },
    { id: 3, name: 'Lettuce', category: 'Vegetables', quantity: 5, unit: 'kg', status: 'Low Stock' },
    { id: 4, name: 'Tomatoes', category: 'Vegetables', quantity: 8, unit: 'kg', status: 'In Stock' },
    { id: 5, name: 'Cheese Slices', category: 'Dairy', quantity: 50, unit: 'pcs', status: 'In Stock' },
    { id: 6, name: 'Bacon', category: 'Meat', quantity: 3, unit: 'kg', status: 'Low Stock' },
    { id: 7, name: 'Chicken Breast', category: 'Meat', quantity: 15, unit: 'kg', status: 'In Stock' },
    { id: 8, name: 'Potatoes', category: 'Vegetables', quantity: 25, unit: 'kg', status: 'In Stock' },
    { id: 9, name: 'Cooking Oil', category: 'Condiments', quantity: 2, unit: 'L', status: 'Low Stock' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingItem, setEditingItem] = useState(null);
  const [newQuantity, setNewQuantity] = useState('');

  // Get unique categories
  const categories = ['All', ...new Set(inventoryItems.map(item => item.category))];

  // Filter items based on search and category
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Start editing an item
  const startEdit = (item) => {
    setEditingItem(item.id);
    setNewQuantity(item.quantity.toString());
  };

  // Save edited quantity
  const saveEdit = (id) => {
    setInventoryItems(inventoryItems.map(item => 
      item.id === id 
        ? { 
            ...item, 
            quantity: parseInt(newQuantity), 
            status: parseInt(newQuantity) <= 5 ? 'Low Stock' : 'In Stock'
          } 
        : item
    ));
    setEditingItem(null);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingItem(null);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Inventory Management</h1>
      
      <div className="inventory-controls">
        <div className="search-filter">
          <input 
            type="text" 
            placeholder="Search inventory..." 
            className="inventory-search" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select 
            className="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <button className="add-item-btn">+ Add New Item</button>
      </div>
      
      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>
                  {editingItem === item.id ? (
                    <input 
                      type="number" 
                      className="quantity-input" 
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(e.target.value)}
                      min="0"
                    />
                  ) : (
                    item.quantity
                  )}
                </td>
                <td>{item.unit}</td>
                <td>
                  <span className={`status-badge ${item.status === 'Low Stock' ? 'low-stock' : 'in-stock'}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  {editingItem === item.id ? (
                    <div className="edit-actions">
                      <button className="save-btn" onClick={() => saveEdit(item.id)}>Save</button>
                      <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
                    </div>
                  ) : (
                    <div className="item-actions">
                      <button className="edit-btn" onClick={() => startEdit(item)}>Edit</button>
                      <button className="order-btn">Order</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="inventory-summary">
        <div className="summary-card">
          <h3>Total Items</h3>
          <p>{inventoryItems.length}</p>
        </div>
        <div className="summary-card">
          <h3>Low Stock Items</h3>
          <p>{inventoryItems.filter(item => item.status === 'Low Stock').length}</p>
        </div>
        <div className="summary-card">
          <h3>Categories</h3>
          <p>{categories.length - 1}</p>
        </div>
      </div>
    </div>
  );
}

export default Inventory;