import React, { useEffect, useState } from 'react';
import { OrdersAPI, InventoryAPI, LLMAPI } from '../lib/api';

function AIInsights() {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);
  const [model, setModel] = useState('gemini-2.0-flash');

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

  const runAI = async () => {
    setAiLoading(true);
    setError(null);
    try {
      const payload = {
        orders,
        inventory,
        menuItems,
      };
      const system = "You are a restaurant operations AI. Provide actionable insights from data. Respond ONLY as JSON with keys: slow_movers (string[]), fast_sellers (string[]), price_opportunities (string[]), combo_suggestions (string[]), waste_reduction (string[]).";
      const user = `Data: ${JSON.stringify(payload)}`;
      const res = await LLMAPI.chat({ model, stream: false, messages: [ { role: 'system', content: system }, { role: 'user', content: user } ] });
      const content = res?.message?.content || '';
      let parsed = null;
      try {
        const cleaned = content.trim().replace(/^```json/gi, '').replace(/^```/gi, '').replace(/```$/gi, '');
        parsed = JSON.parse(cleaned);
      } catch {
        parsed = { slow_movers: [], fast_sellers: [], price_opportunities: [], combo_suggestions: [], waste_reduction: [] };
      }
      setInsights(parsed);
    } catch (e) {
      setError(`AI error: ${e.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      runAI();
    }
  }, [loading]);

  const Section = ({ title, items }) => (
    <div className="card">
      <h3>{title}</h3>
      {items?.length ? <ul>{items.map((it, idx) => <li key={idx}>{it}</li>)}</ul> : <p>None</p>}
    </div>
  );

  const exportJSON = (obj, filename) => {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyJSON = async (obj) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    } catch {}
  };

  return (
    <div className="page-container">
      <h1 className="page-title">AI Insights</h1>
      {loading ? (
        <>
          <div className="cards-grid">
            <div className="card skeleton" style={{ height: 90 }} />
            <div className="card skeleton" style={{ height: 90 }} />
            <div className="card skeleton" style={{ height: 90 }} />
            <div className="card skeleton" style={{ height: 90 }} />
            <div className="card skeleton" style={{ height: 90 }} />
          </div>
        </>
      ) : (
        <>
          <div className="controls-row">
            <select className="small-select" value={model} onChange={e => setModel(e.target.value)}>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            </select>
            <button className="btn-secondary" onClick={() => exportJSON(insights || {}, 'insights.json')}>Export</button>
            <button className="btn-secondary" onClick={() => copyJSON(insights || {})}>Copy</button>
          </div>
          <div className="section-header">
            <button className="action-btn" onClick={runAI} disabled={aiLoading}>{aiLoading ? 'Generating…' : 'Regenerate'}</button>
          </div>
          {insights ? (
            <div className="cards-grid">
              <Section title="Slow Movers" items={insights.slow_movers} />
              <Section title="Fast Sellers" items={insights.fast_sellers} />
              <Section title="Price Opportunities" items={insights.price_opportunities} />
              <Section title="Combo Suggestions" items={insights.combo_suggestions} />
              <Section title="Waste Reduction" items={insights.waste_reduction} />
            </div>
          ) : <p>Awaiting AI insights…</p>}
        </>
      )}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export default AIInsights;