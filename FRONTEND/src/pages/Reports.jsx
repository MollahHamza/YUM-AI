import React, { useEffect, useMemo, useState } from 'react';
import { OrdersAPI, InventoryAPI, LLMAPI } from '../lib/api';

function Reports() {
  const [orders, setOrders] = useState([]);
  const [billingHistory, setBillingHistory] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [range, setRange] = useState('30');
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

  // Combine current orders and billing history into a unified format
  const allOrders = useMemo(() => {
    const menuMap = new Map(menuItems.map(m => [m.id, { name: m.name, price: parseFloat(m.price), category: m.category }]));

    // Current unpaid orders
    const currentOrders = orders.map(o => ({
      order_date: o.order_date,
      total: typeof o.total === 'string' ? parseFloat(o.total) : (o.total || 0),
      items: (o.items || []).map(it => ({
        name: menuMap.get(it.menu_item)?.name || `Item ${it.menu_item}`,
        category: menuMap.get(it.menu_item)?.category || 'Menu',
        quantity: parseInt(it.quantity || 0, 10),
      })),
    }));

    // Paid orders from billing history
    const paidOrders = billingHistory.map(b => {
      let items = [];
      try {
        const parsed = typeof b.items_summary === 'string' ? JSON.parse(b.items_summary) : b.items_summary;
        if (Array.isArray(parsed)) {
          items = parsed.map(it => ({
            name: it.name || 'Unknown',
            category: it.category || 'Menu',
            quantity: parseInt(it.quantity || 0, 10),
          }));
        }
      } catch {}
      return {
        order_date: b.order_date,
        total: typeof b.total_amount === 'string' ? parseFloat(b.total_amount) : (b.total_amount || 0),
        items,
      };
    });

    return [...currentOrders, ...paidOrders];
  }, [orders, billingHistory, menuItems]);

  const filteredOrders = useMemo(() => {
    if (range === 'all') return allOrders;
    const days = parseInt(range, 10) || 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return allOrders.filter(o => {
      const d = o.order_date ? new Date(o.order_date) : null;
      return d ? d >= cutoff : true;
    });
  }, [allOrders, range]);

  const metrics = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalSales = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const itemCounts = new Map();
    const dailySales = new Map();

    for (const o of filteredOrders) {
      const day = o.order_date ? new Date(o.order_date).toISOString().slice(0, 10) : 'unknown';
      dailySales.set(day, (dailySales.get(day) || 0) + (o.total || 0));

      for (const it of o.items) {
        const key = it.name;
        const existing = itemCounts.get(key) || { name: it.name, category: it.category, qty: 0 };
        existing.qty += it.quantity;
        itemCounts.set(key, existing);
      }
    }

    const topItems = Array.from(itemCounts.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    const lowStock = inventory.filter(i => (i.status || '').toLowerCase().includes('low') || (i.status || '').toLowerCase().includes('critical'));

    // Sort daily sales by date
    const sortedDailySales = Array.from(dailySales.entries())
      .map(([date, amount]) => ({ date, amount: Number(amount.toFixed(2)) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalOrders,
      totalSales: Number(totalSales.toFixed(2)),
      topItems,
      dailySales: sortedDailySales,
      lowStock: lowStock.map(i => ({ name: i.name, category: i.category, quantity: i.quantity, unit: i.unit, status: i.status })),
    };
  }, [filteredOrders, inventory]);

  const runAI = async () => {
    setAiLoading(true);
    setError(null);
    try {
      const system = "You are a restaurant BI assistant. Create a concise executive report from provided metrics. Respond ONLY as JSON with keys: summary (string), highlights (string[]), risks (string[]), suggestions (string[]).";
      const user = `Metrics: ${JSON.stringify(metrics)}`;
      const res = await LLMAPI.chat({
        model,
        stream: false,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      });
      const content = res?.message?.content || '';
      let parsed = null;
      try {
        const cleaned = content.trim().replace(/^```json/gi, '').replace(/^```/gi, '').replace(/```$/gi, '');
        parsed = JSON.parse(cleaned);
      } catch {
        parsed = { summary: content || 'No summary', highlights: [], risks: [], suggestions: [] };
      }
      setAiReport(parsed);
    } catch (e) {
      setError(`AI error: ${e.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && (orders.length > 0 || billingHistory.length > 0)) {
      runAI();
    }
  }, [loading, range, model]);

  const fmtCurrency = (n) => `$${(Number(n || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const exportJSON = (obj, filename) => {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportDailyCSV = () => {
    const header = 'date,amount\n';
    const rows = metrics.dailySales.map(r => `${r.date},${r.amount}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily_sales_${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Reports</h1>
      {loading ? (
        <>
          <div className="cards-grid">
            <div className="card skeleton" style={{ height: 90 }} />
            <div className="card skeleton" style={{ height: 90 }} />
            <div className="card skeleton" style={{ height: 90 }} />
            <div className="card skeleton" style={{ height: 90 }} />
          </div>
          <div className="section">
            <div className="skeleton" style={{ height: 180 }} />
          </div>
        </>
      ) : (
        <>
          <div className="controls-row">
            <select className="small-select" value={range} onChange={e => setRange(e.target.value)}>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="all">All time</option>
            </select>
            <select className="small-select" value={model} onChange={e => setModel(e.target.value)}>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            </select>
            <button className="btn-secondary" onClick={() => exportJSON(metrics, `metrics_${range}.json`)}>Export Metrics</button>
            <button className="btn-secondary" onClick={exportDailyCSV}>Export Daily CSV</button>
          </div>

          <div className="cards-grid">
            <div className="card">
              <h3>Total Sales</h3>
              <p>{fmtCurrency(metrics.totalSales)}</p>
            </div>
            <div className="card">
              <h3>Total Orders</h3>
              <p>{metrics.totalOrders}</p>
            </div>
            <div className="card">
              <h3>Top Item</h3>
              <p>{metrics.topItems[0]?.name || '—'} ({metrics.topItems[0]?.qty || 0})</p>
            </div>
            <div className="card">
              <h3>Low Stock Items</h3>
              <p>{metrics.lowStock.length}</p>
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">Sales by Day</h2>
            <div className="chart-container">
              {(() => {
                const max = Math.max(1, ...metrics.dailySales.map(d => d.amount));
                const days = metrics.dailySales.slice(-30);
                return (
                  <>
                    <div className="bar-chart">
                      {days.map(d => (
                        <div key={d.date} className="bar" style={{ height: `${Math.round((d.amount / max) * 100)}%` }} title={`${d.date}: ${fmtCurrency(d.amount)}`} />
                      ))}
                    </div>
                    <div className="bar-labels">
                      {days.map(d => (
                        <div key={d.date}>{d.date.slice(5)}</div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">Top Items</h2>
            <table className="invoices-table">
              <thead><tr><th>Item</th><th>Category</th><th>Qty</th></tr></thead>
              <tbody>
                {metrics.topItems.map(t => (
                  <tr key={t.id}><td>{t.name}</td><td>{t.category}</td><td>{t.qty}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="section">
            <div className="section-header">
              <h2 className="section-title">AI Executive Report</h2>
              <div>
                <button className="action-btn" onClick={runAI} disabled={aiLoading}>{aiLoading ? 'Generating…' : 'Regenerate'}</button>
                <button className="btn-secondary" style={{ marginLeft: 8 }} onClick={() => exportJSON(aiReport || {}, `ai_report_${range}.json`)}>Export AI</button>
              </div>
            </div>
            {aiReport ? (
              <div className="ai-report">
                <p>{aiReport.summary}</p>
                <div className="two-column">
                  <div>
                    <h3>Highlights</h3>
                    <ul>{(aiReport.highlights || []).map((h, i) => <li key={i}>{h}</li>)}</ul>
                  </div>
                  <div>
                    <h3>Risks</h3>
                    <ul>{(aiReport.risks || []).map((h, i) => <li key={i}>{h}</li>)}</ul>
                  </div>
                </div>
                <div>
                  <h3>Suggestions</h3>
                  <ul>{(aiReport.suggestions || []).map((s, i) => <li key={i}>{s}</li>)}</ul>
                </div>
              </div>
            ) : <p>Awaiting AI analysis…</p>}
          </div>
        </>
      )}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export default Reports;