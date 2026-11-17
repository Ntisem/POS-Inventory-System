import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tags } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { CATEGORIES } from '../data/seed';
import { formatCurrency } from '../utils/validation';
import './SimplePages.css';

export function Categories() {
  const { products } = useInventory();

  const rows = useMemo(
    () =>
      CATEGORIES.map((c) => {
        const items = products.filter((p) => p.category === c.name);
        const value = items.reduce((s, p) => s + p.price * p.stock, 0);
        return { ...c, count: items.length, value };
      }),
    [products],
  );

  return (
    <div className="simple-page">
      <div className="simple-page__header">
        <div>
          <h1>Categories</h1>
          <p>Catalog groups powering product filters and reports.</p>
        </div>
        <Link to="/add-products" className="btn btn--primary">
          Add to category
        </Link>
      </div>

      <div className="category-grid">
        {rows.map((c) => (
          <article key={c.id} className="panel panel--solid category-card">
            <div className="category-card__icon">
              <Tags size={18} />
            </div>
            <h3>{c.name}</h3>
            <p>{c.count} products</p>
            <strong>{formatCurrency(c.value)}</strong>
            <Link to="/products" className="category-card__link">
              Browse <ArrowRight size={14} />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
