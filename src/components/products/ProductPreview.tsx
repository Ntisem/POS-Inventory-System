import { Package } from 'lucide-react';
import type { ProductDraft } from '../../types';
import { formatCurrency } from '../../utils/validation';
import './ProductPreview.css';

interface Props {
  drafts: ProductDraft[];
}

export function ProductPreview({ drafts }: Props) {
  const totalValue = drafts.reduce((sum, d) => sum + Number(d.price || 0) * Number(d.stock || 0), 0);

  return (
    <div className="preview panel panel--light">
      <div className="preview__head">
        <div>
          <h3>Submission preview</h3>
          <p>{drafts.length} product{drafts.length === 1 ? '' : 's'} ready to publish</p>
        </div>
        <span className="badge badge--accent">{drafts.length} / {drafts.length} ready</span>
      </div>

      <ul className="preview__list">
        {drafts.map((d, i) => (
          <li key={d.tempId} className="preview__row">
            <div className="preview__icon">
              <Package size={16} />
            </div>
            <div className="preview__meta">
              <strong>{d.name || `Untitled item ${i + 1}`}</strong>
              <span>
                {d.sku || '—'} · {d.category || 'Uncategorized'} · Stock {d.stock || 0}
              </span>
            </div>
            <div className="preview__price">{formatCurrency(Number(d.price || 0))}</div>
          </li>
        ))}
      </ul>

      <div className="preview__footer">
        <span>Inventory value at list price</span>
        <strong>{formatCurrency(totalValue)}</strong>
      </div>
    </div>
  );
}
