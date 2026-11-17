import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  ChevronDown,
  Gauge,
  LayoutGrid,
  Package,
  PlusCircle,
  Search,
  ShoppingBag,
  Tags,
  Receipt,
  Boxes,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import './Sidebar.css';

export function Sidebar() {
  const { products } = useInventory();
  const location = useLocation();
  const [dashOpen, setDashOpen] = useState(true);
  const [ecomOpen, setEcomOpen] = useState(
    location.pathname.startsWith('/products') ||
      location.pathname.startsWith('/add') ||
      location.pathname.startsWith('/categories') ||
      location.pathname.startsWith('/transactions'),
  );

  const lowStock = products.filter((p) => p.status === 'low-stock' || p.status === 'out-of-stock').length;

  return (
    <aside className="sidebar glass">
      <div className="sidebar__brand">
        <div className="sidebar__logo" aria-hidden>
          <span /><span /><span /><span />
        </div>
        <div>
          <strong>POS STUDIO OS</strong>
          <span>Inventory control</span>
        </div>
      </div>

      <div className="sidebar__search">
        <Search size={15} />
        <input type="search" placeholder="Search or jump to…" readOnly />
        <kbd>Ctrl K</kbd>
      </div>

      <nav className="sidebar__nav">
        <div className="sidebar__section">
          <button type="button" className="sidebar__section-title">
            General reports
            <span className="badge badge--count">2</span>
            <ChevronDown size={14} />
          </button>

          <div className="sidebar__group">
            <button
              type="button"
              className={`sidebar__item ${location.pathname === '/' || location.pathname.startsWith('/overview') ? 'is-parent-active' : ''}`}
              onClick={() => setDashOpen((v) => !v)}
            >
              <Gauge size={18} />
              <span>Dashboards</span>
              <span className="badge badge--count">4</span>
              <ChevronDown size={14} className={dashOpen ? 'is-open' : ''} />
            </button>
            {dashOpen ? (
              <div className="sidebar__sub">
                <NavLink to="/" end className={({ isActive }) => `sidebar__subitem${isActive ? ' is-active' : ''}`}>
                  Overview 1
                </NavLink>
                <NavLink to="/overview/2" className={({ isActive }) => `sidebar__subitem${isActive ? ' is-active' : ''}`}>
                  Overview 2
                </NavLink>
                <NavLink to="/overview/3" className={({ isActive }) => `sidebar__subitem${isActive ? ' is-active' : ''}`}>
                  Overview 3
                </NavLink>
                <NavLink to="/overview/4" className={({ isActive }) => `sidebar__subitem${isActive ? ' is-active' : ''}`}>
                  Overview 4
                </NavLink>
              </div>
            ) : null}
          </div>

          <div className="sidebar__group">
            <button
              type="button"
              className={`sidebar__item ${ecomOpen ? 'is-parent-active' : ''}`}
              onClick={() => setEcomOpen((v) => !v)}
            >
              <ShoppingBag size={18} />
              <span>E-Commerce</span>
              <span className="badge badge--count">6</span>
              <ChevronDown size={14} className={ecomOpen ? 'is-open' : ''} />
            </button>
            {ecomOpen ? (
              <div className="sidebar__sub">
                <NavLink to="/categories" className={({ isActive }) => `sidebar__subitem${isActive ? ' is-active' : ''}`}>
                  Categories
                </NavLink>
                <NavLink to="/add-products" className={({ isActive }) => `sidebar__subitem${isActive ? ' is-active' : ''}`}>
                  Add Product
                </NavLink>
                <NavLink to="/products" className={({ isActive }) => `sidebar__subitem${isActive ? ' is-active' : ''}`}>
                  Products
                  {lowStock > 0 ? <span className="badge badge--count">{lowStock}</span> : null}
                </NavLink>
                <NavLink to="/transactions" className={({ isActive }) => `sidebar__subitem${isActive ? ' is-active' : ''}`}>
                  Transactions
                </NavLink>
              </div>
            ) : null}
          </div>
        </div>

        <div className="sidebar__section">
          <button type="button" className="sidebar__section-title">
            Apps
            <span className="badge badge--count">6</span>
            <ChevronDown size={14} />
          </button>
          <NavLink to="/products" className="sidebar__item">
            <Package size={18} />
            <span>Inventory</span>
          </NavLink>
          <NavLink to="/add-products" className="sidebar__item">
            <PlusCircle size={18} />
            <span>Quick add</span>
          </NavLink>
          <NavLink to="/categories" className="sidebar__item">
            <Tags size={18} />
            <span>Catalog</span>
          </NavLink>
          <NavLink to="/transactions" className="sidebar__item">
            <Receipt size={18} />
            <span>Sales log</span>
          </NavLink>
          <div className="sidebar__item is-static">
            <Boxes size={18} />
            <span>Stock rooms</span>
          </div>
          <div className="sidebar__item is-static">
            <LayoutGrid size={18} />
            <span>Modules</span>
          </div>
        </div>
      </nav>
    </aside>
  );
}
