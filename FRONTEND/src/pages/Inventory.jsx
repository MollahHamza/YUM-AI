import React, { useEffect, useState } from 'react';
import { InventoryAPI } from '../lib/api';

function Inventory() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingItem, setEditingItem] = useState(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [stats, setStats] = useState({ total_items: 0, low_stock_items: 0, categories: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add new item form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: '', quantity: '', unit: '' });

  const loadItems = async (params = {}) => {
    setError(null);
    setLoading(true);
    try {
      const items = await InventoryAPI.list(params);
      const normalized = (items || []).map(it => ({
        id: it.id,
        name: it.name,
        category: it.category || 'Unknown',
        quantity: it.quantity,
        unit: it.unit || '',
        status: (it.quantity <= 5) ? 'Low Stock' : 'In Stock',
      }));
      setInventoryItems(normalized);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const s = await InventoryAPI.stats();
      setStats({
        total_items: s.total_items ?? 0,
        low_stock_items: s.low_stock_items ?? 0,
        categories: s.categories ?? 0,
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadItems({});
    loadStats();
  }, []);

  // Get unique categories from loaded items
  const categories = ['All', ...new Set(inventoryItems.map(item => item.category))];

  // Filter items based on search and category
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add new item
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.category || !newItem.quantity || !newItem.unit) {
      alert('Please fill all fields');
      return;
    }
    try {
      setLoading(true);
      await InventoryAPI.create({
        name: newItem.name,
        category: newItem.category,
        quantity: parseFloat(newItem.quantity),
        unit: newItem.unit
      });
      setNewItem({ name: '', category: '', quantity: '', unit: '' });
      setShowAddForm(false);
      await loadItems({});
      await loadStats();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete item
  const handleDeleteItem = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      await InventoryAPI.remove(id);
      await loadItems({});
      await loadStats();
    } catch (e) {
      setError(e.message);
    }
  };

  // Start editing an item
  const startEdit = (item) => {
    setEditingItem(item.id);
    setNewQuantity(item.quantity.toString());
  };

  // Save edited quantity to backend
  const saveEdit = async (id) => {
    try {
      const qty = parseFloat(newQuantity);
      await InventoryAPI.patch(id, { quantity: qty });
      setInventoryItems(inventoryItems.map(item =>
        item.id === id
          ? {
              ...item,
              quantity: qty,
              status: qty <= 5 ? 'Low Stock' : 'In Stock'
            }
          : item
      ));
      await loadStats();
    } catch (e) {
      setError(e.message);
    } finally {
      setEditingItem(null);
    }
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
            onChange={async (e) => {
              const val = e.target.value;
              setSearchTerm(val);
              const params = {};
              if (val) params.search = val;
              if (selectedCategory !== 'All') params.category = selectedCategory;
              await loadItems(params);
            }}
          />

          <select
            className="category-filter"
            value={selectedCategory}
            onChange={async (e) => {
              const cat = e.target.value;
              setSelectedCategory(cat);
              const params = {};
              if (searchTerm) params.search = searchTerm;
              if (cat !== 'All') params.category = cat;
              await loadItems(params);
            }}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <button className="add-item-btn" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : '+ Add New Item'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddItem} className="add-item-form">
          <div className="form-row">
            <input
              type="text"
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Category"
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Quantity"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Unit (kg, pcs, L)"
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              required
            />
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      )}

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
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                  {loading ? 'Loading...' : 'No inventory items. Add your first item above.'}
                </td>
              </tr>
            ) : (
              filteredItems.map(item => (
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
                        step="0.01"
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
                        <button
                          className="action-btn"
                          onClick={() => handleDeleteItem(item.id)}
                          style={{ color: '#e74c3c' }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="inventory-summary">
        <div className="summary-card">
          <h3>Total Items</h3>
          <p>{stats.total_items || inventoryItems.length}</p>
        </div>
        <div className="summary-card">
          <h3>Low Stock Items</h3>
          <p>{stats.low_stock_items ?? inventoryItems.filter(item => item.status === 'Low Stock').length}</p>
        </div>
        <div className="summary-card">
          <h3>Categories</h3>
          <p>{stats.categories ?? (categories.length - 1)}</p>
        </div>
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export default Inventory;
