import { useParams } from 'react-router-dom';
import { Dashboard } from './Dashboard';

export function OverviewVariants() {
  const { id } = useParams();
  if (!id || id === '1') return <Dashboard />;

  return (
    <div className="simple-page">
      <div className="simple-page__header">
        <div>
          <h1>Overview {id}</h1>
          <p>Alternate dashboard layout — same Studio OS shell and theme system.</p>
        </div>
      </div>
      <div className="panel panel--solid" style={{ padding: 28 }}>
        <p style={{ color: 'var(--text-secondary)' }}>
          Overview {id} mirrors the primary control surface. Use Overview 1 for the full inventory
          launch board with KPIs, charts, and stock alerts.
        </p>
      </div>
    </div>
  );
}
