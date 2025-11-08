import React, { useEffect, useMemo, useState } from 'react';
import { OrdersAPI, InventoryAPI, LLMAPI } from '../lib/api';

function Forecasting() {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState([]);
  const [model, setModel] = useState('llama3.2:1b');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [ordersRes, inventoryRes, menuRes] = await Promise.all([
          OrdersAPI.listOrders(),
          InventoryAPI.list(),
          OrdersAPI.getMenuItems(),
        ]);
        setOrders(Array.isArray(ordersRes) ? ordersRes : ordersRes?.value || []);
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
    for (const o of orders) {
      const items = o.items || [];
      for (const it of items) {
        const id = it.menu_item;
        const qty = parseInt(it.quantity || 0, 10);
        map.set(id, (map.get(id) || 0) + qty);
      }
    }
    return map;
  }, [orders]);

  const runAI = async () => {
    setAiLoading(true);
    setError(null);
    try {
      const menuMap = new Map(menuItems.map(m => [m.id, m]));
      const inventoryMap = new Map(inventory.map(i => [i.name.toLowerCase(), i]));
      const data = Array.from(salesByItem.entries()).map(([id, qty]) => ({
        id,
        name: menuMap.get(id)?.name || `Item ${id}`,
        category: menuMap.get(id)?.category || 'Menu',
        sold_last_period: qty,
        current_stock: inventoryMap.get((menuMap.get(id)?.name || `Item ${id}`).toLowerCase())?.quantity || null,
      }));
      const system = "You are a demand forecasting assistant for a restaurant. Given item sales and current stock, forecast demand for the next 7 days and recommend reorder quantities. Respond ONLY as JSON array of objects with keys: item_name, predicted_next_7_days (number), recommended_reorder (number), reasoning (string).";
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
    if (!loading && orders.length > 0) {
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
              <option value="llama3.2:1b">llama3.2:1b</option>
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