import React, { useEffect, useMemo, useState } from 'react';
import { OrdersAPI, InventoryAPI, LLMAPI } from '../lib/api';

function Forecasting() {
  const [orders, setOrders] = useState([]);
  const [billingHistory, setBillingHistory] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState([]);
  const [model, setModel] = useState('gemini-2.0-flash');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [ordersRes, billingRes, inventoryRes, menuRes] = await Promise.all([
          OrdersAPI.listOrders(),
          OrdersAPI.getBillingHistory(),
          InventoryAPI.list(),
          OrdersAPI.getMenuItems(),
        ]);
        setOrders(Array.isArray(ordersRes) ? ordersRes : ordersRes?.value || []);
        setBillingHistory(Array.isArray(billingRes) ? billingRes : billingRes?.value || []);
        setInventory(Array.isArray(inventoryRes) ? inventoryRes : inventoryRes?.value || []);
        setMenuItems(Array.isArray(menuRes) ? menuRes : menuRes?.value || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const salesByItem = useMemo(() => {
    const map = new Map();
    const menuMap = new Map(menuItems.map(m => [m.id, m.name]));

    // Count from current orders
    for (const o of orders) {
      const items = o.items || [];
      for (const it of items) {
        const name = menuMap.get(it.menu_item) || `Item ${it.menu_item}`;
        const qty = parseInt(it.quantity || 0, 10);
        map.set(name, (map.get(name) || 0) + qty);
      }
    }

    // Count from billing history (paid orders)
    for (const b of billingHistory) {
      try {
        const items = typeof b.items_summary === 'string' ? JSON.parse(b.items_summary) : b.items_summary;
        if (Array.isArray(items)) {
          for (const it of items) {
            const name = it.name || 'Unknown';
            const qty = parseInt(it.quantity || 0, 10);
            map.set(name, (map.get(name) || 0) + qty);
          }
        }
      } catch {}
    }

    return map;
  }, [orders, billingHistory, menuItems]);

  const runAI = async () => {
    setAiLoading(true);
    setError(null);
    try {
      const inventoryMap = new Map(inventory.map(i => [i.name.toLowerCase(), i]));
      const menuMap = new Map(menuItems.map(m => [m.name.toLowerCase(), m]));

      const data = Array.from(salesByItem.entries()).map(([name, qty]) => ({
        name,
        category: menuMap.get(name.toLowerCase())?.category || 'Menu',
        sold_last_period: qty,
        current_stock: inventoryMap.get(name.toLowerCase())?.quantity || null,
      }));

      // Also add inventory items that haven't been sold but exist in stock
      for (const inv of inventory) {
        if (!salesByItem.has(inv.name)) {
          data.push({
            name: inv.name,
            category: inv.category || 'Inventory',
            sold_last_period: 0,
            current_stock: inv.quantity,
          });
        }
      }

      const system = "You are a demand forecasting assistant for a restaurant. Given item sales and current stock, forecast demand for the next 7 days and recommend reorder quantities. Consider items with high sales velocity need more stock. Respond ONLY as JSON array of objects with keys: item_name, predicted_next_7_days (number), recommended_reorder (number), reasoning (string).";
      const user = `Data: ${JSON.stringify(data)}`;
      const res = await LLMAPI.chat({ model, stream: false, messages: [ { role: 'system', content: system }, { role: 'user', content: user } ] });
      const content = res?.message?.content || '';
      let parsed = [];
      try {
        const cleaned = content.trim().replace(/^```json/gi, '').replace(/^```/gi, '').replace(/```$/gi, '');
        parsed = JSON.parse(cleaned);
      } catch {
        parsed = [];
      }
      setPlan(parsed);
    } catch (e) {
      setError(`AI error: ${e.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && (orders.length > 0 || billingHistory.length > 0 || inventory.length > 0)) {
      runAI();
    }
  }, [loading]);

  const exportJSON = (obj, filename) => {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totals = useMemo(() => {
    const predicted = plan.reduce((s, r) => s + (Number(r.predicted_next_7_days) || 0), 0);
    const reorder = plan.reduce((s, r) => s + (Number(r.recommended_reorder) || 0), 0);
    return { predicted, reorder };
  }, [plan]);

  return (
    <div className="page-container">
      <h1 className="page-title">Forecasting</h1>
      {loading ? (
        <>
          <div className="cards-grid">
            <div className="card skeleton" style={{ height: 90 }} />
            <div className="card skeleton" style={{ height: 90 }} />
          </div>
          <div className="section">
            <div className="skeleton" style={{ height: 220 }} />
          </div>
        </>
      ) : (
        <>
          <div className="controls-row">
            <select className="small-select" value={model} onChange={e => setModel(e.target.value)}>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            </select>
            <button className="btn-secondary" onClick={() => exportJSON(plan, 'forecast_plan.json')}>Export Plan</button>
          </div>

          <div className="cards-grid">
            <div className="card">
              <h3>Total predicted (7d)</h3>
              <p>{Math.round(totals.predicted)}</p>
            </div>
            <div className="card">
              <h3>Total recommended reorder</h3>
              <p>{Math.round(totals.reorder)}</p>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <h2 className="section-title">7-Day Demand & Reorder Plan</h2>
              <button className="action-btn" onClick={runAI} disabled={aiLoading}>{aiLoading ? 'Generating…' : 'Regenerate'}</button>
            </div>
            <table className="invoices-table">
              <thead><tr><th>Item</th><th>Predicted (7d)</th><th>Recommended Reorder</th><th>Reasoning</th></tr></thead>
              <tbody>
                {plan.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.item_name}</td>
                    <td>{Math.round(Number(row.predicted_next_7_days) || 0)}</td>
                    <td>{Math.round(Number(row.recommended_reorder) || 0)}</td>
                    <td>{row.reasoning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export default Forecasting;