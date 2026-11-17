import { useInventory } from '../context/InventoryContext';
import { formatCurrency } from '../utils/validation';
import './SimplePages.css';

export function Transactions() {
  const { transactions } = useInventory();
  const outstanding = transactions
    .filter((t) => t.status === 'pending')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="simple-page">
      <div className="simple-page__header">
        <div>
          <h1>Recent invoices</h1>
          <p>Outstanding {formatCurrency(outstanding)}</p>
        </div>
      </div>

      <div className="panel panel--solid txn-table">
        <div className="txn-table__head">
          <span>Product</span>
          <span>Type</span>
          <span>Amount</span>
          <span>Date</span>
          <span>Status</span>
        </div>
        {transactions.map((t) => (
          <div key={t.id} className="txn-table__row">
            <div className="txn-client">
              <div className="txn-avatar">{t.productName.slice(0, 2).toUpperCase()}</div>
              <strong>{t.productName}</strong>
            </div>
            <span className="badge badge--accent">{t.type}</span>
            <span>{formatCurrency(t.amount)}</span>
            <span>{new Date(t.date).toLocaleDateString()}</span>
            <span className={`badge ${t.status === 'completed' ? 'badge--green' : t.status === 'pending' ? 'badge--orange' : 'badge--red'}`}>
              {t.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
