import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowRight, ArrowUpRight, RefreshCw } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { ProgressRing } from '../components/ui/ProgressRing';
import { formatCompact, formatCurrency, statusLabel } from '../utils/validation';
import './Dashboard.css';

const REVENUE = [
  { month: 'Jan', thisYear: 28, lastYear: 22 },
  { month: 'Feb', thisYear: 34, lastYear: 26 },
  { month: 'Mar', thisYear: 31, lastYear: 29 },
  { month: 'Apr', thisYear: 42, lastYear: 33 },
  { month: 'May', thisYear: 48, lastYear: 36 },
  { month: 'Jun', thisYear: 45, lastYear: 38 },
  { month: 'Jul', thisYear: 52, lastYear: 40 },
  { month: 'Aug', thisYear: 58, lastYear: 44 },
  { month: 'Sep', thisYear: 55, lastYear: 41 },
  { month: 'Oct', thisYear: 62, lastYear: 46 },
  { month: 'Nov', thisYear: 70, lastYear: 50 },
];

const SERVICE_COLORS = ['#a78bfa', '#7ee0d0', '#f0a06a', '#e8eaef'];

export function Dashboard() {
  const { products, transactions } = useInventory();

  const inventoryValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const lowStock = products.filter((p) => p.status === 'low-stock').length;
  const outStock = products.filter((p) => p.status === 'out-of-stock').length;
  const inStock = products.filter((p) => p.status === 'in-stock').length;

  const byCategory = Object.entries(
    products.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const topProjects = products.slice(0, 5);
  const recent = transactions.slice(0, 5);

  return (
    <div className="dash">
      <section className="dash-hero">
        <article className="dash-project panel">
          <div className="dash-project__bg" />
          <div className="dash-project__content">
            <div className="dash-project__top">
              <div>
                <span className="dash-kicker">Current focus</span>
                <span className="badge badge--green">On track</span>
              </div>
              <Link to="/products" className="btn btn--icon btn--ghost" aria-label="Open products">
                <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="dash-project__bottom">
              <h2>Inventory Launch</h2>
              <p>Stock · Pricing · Fulfillment</p>
              <div className="dash-project__rings">
                <ProgressRing value={87} label="Delivery" size={72} />
                <ProgressRing value={78} label="Capacity" size={72} color="var(--purple)" />
                <ProgressRing value={64} label="Budget" size={72} color="var(--orange)" />
              </div>
            </div>
          </div>
        </article>

        <article className="dash-budget panel--accent">
          <div className="dash-budget__top">
            <div>
              <span className="dash-budget__label">Total</span>
              <strong>{formatCompact(inventoryValue)}</strong>
            </div>
            <span className="badge">On plan</span>
          </div>
          <p>Campaign inventory value</p>
          <p className="dash-budget__sub">Atelier · Brand direction</p>
          <div className="dash-budget__bar">
            <div style={{ width: '64%' }} />
          </div>
          <div className="dash-budget__meta">
            <span>Committed {formatCompact(inventoryValue * 0.64)}</span>
            <span>Available {formatCompact(inventoryValue * 0.36)}</span>
          </div>
        </article>

        <article className="dash-files panel panel--light">
          <div className="dash-files__head">
            <div>
              <h3>Stock alerts</h3>
              <span className="badge badge--orange">
                {lowStock + outStock} / {products.length} need attention
              </span>
            </div>
            <Link to="/products">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <ul>
            {products
              .filter((p) => p.status !== 'in-stock')
              .slice(0, 3)
              .map((p) => (
                <li key={p.id}>
                  <div>
                    <strong>{p.name}</strong>
                    <span>
                      {p.sku} · {p.stock} left
                    </span>
                  </div>
                  <span className={`badge ${p.status === 'out-of-stock' ? 'badge--red' : 'badge--orange'}`}>
                    {statusLabel(p.status)}
                  </span>
                </li>
              ))}
          </ul>
        </article>
      </section>

      <section className="dash-report panel panel--solid">
        <div className="dash-report__head">
          <div>
            <h3>Studio report</h3>
            <p>This month · all inventory</p>
          </div>
          <button type="button" className="btn btn--ghost btn--sm">
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
        <div className="dash-kpis">
          <div>
            <span>Inventory value</span>
            <strong>{formatCurrency(inventoryValue)}</strong>
            <em className="is-up">+18% vs last month</em>
          </div>
          <div>
            <span>SKUs live</span>
            <strong>{products.length}</strong>
            <em className="is-up">+9% vs last month</em>
          </div>
          <div>
            <span>Low stock</span>
            <strong>{lowStock}</strong>
            <em className="is-down">Needs reorder</em>
          </div>
          <div>
            <span>In stock</span>
            <strong>{inStock}</strong>
            <em className="is-up">Healthy coverage</em>
          </div>
        </div>
      </section>

      <section className="dash-charts">
        <article className="panel panel--solid dash-chart">
          <div className="dash-chart__head">
            <div>
              <h3>Revenue report</h3>
              <p>Invoiced this year vs last year</p>
            </div>
            <div className="segmented">
              <button type="button" className="segmented__btn is-active">Year</button>
              <button type="button" className="segmented__btn">Weeks</button>
              <button type="button" className="segmented__btn">Quarters</button>
            </div>
          </div>
          <div className="dash-chart__summary">
            <div>
              <span>This year</span>
              <strong>$485.0k</strong>
            </div>
            <div>
              <span>Last year</span>
              <strong className="is-muted">$366.0k</strong>
            </div>
          </div>
          <div className="dash-chart__canvas">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={REVENUE}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `$${v}k`} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-panel-solid)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 12,
                  }}
                />
                <Area type="monotone" dataKey="thisYear" stroke="var(--accent)" fill="url(#revFill)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel panel--solid dash-donut">
          <h3>Stock by category</h3>
          <div className="dash-donut__wrap">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={3}
                >
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={SERVICE_COLORS[i % SERVICE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-panel-solid)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="dash-donut__center">
              <strong>{byCategory[0]?.name ?? '—'}</strong>
              <span>
                {byCategory[0]
                  ? `${Math.round((byCategory[0].value / products.length) * 100)}%`
                  : '0%'}
              </span>
            </div>
          </div>
        </article>
      </section>

      <section className="dash-bottom">
        <article className="panel panel--solid dash-table">
          <div className="dash-table__head">
            <div>
              <h3>Top products</h3>
              <p>{products.length} products</p>
            </div>
            <Link to="/products">
              All products <ArrowRight size={14} />
            </Link>
          </div>
          <div className="dash-table__cols">
            <span>Project</span>
            <span>Progress</span>
            <span>Status</span>
          </div>
          {topProjects.map((p) => {
            const progress = Math.min(100, Math.round((p.stock / Math.max(p.reorderLevel * 3, 1)) * 100));
            return (
              <div key={p.id} className="dash-table__row">
                <div>
                  <strong>{p.name}</strong>
                  <span>{p.category}</span>
                </div>
                <div className="dash-progress">
                  <div className="dash-progress__track">
                    <div style={{ width: `${progress}%`, background: p.status === 'out-of-stock' ? 'var(--red)' : p.status === 'low-stock' ? 'var(--orange)' : 'var(--accent)' }} />
                  </div>
                  <span>{progress}%</span>
                </div>
                <span className={`badge ${p.status === 'in-stock' ? 'badge--green' : p.status === 'low-stock' ? 'badge--orange' : 'badge--red'}`}>
                  {statusLabel(p.status)}
                </span>
              </div>
            );
          })}
        </article>

        <article className="panel panel--solid dash-activity">
          <div className="dash-table__head">
            <h3>Team activity</h3>
            <Link to="/transactions">Show all</Link>
          </div>
          <ul>
            {recent.map((t, i) => (
              <li key={t.id}>
                <span className={`dash-activity__dot dash-activity__dot--${i % 4}`} />
                <div>
                  <strong>
                    {t.type === 'sale' ? 'Sale recorded' : t.type === 'restock' ? 'Restock' : 'Adjustment'} · {t.productName}
                  </strong>
                  <span>{new Date(t.date).toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
