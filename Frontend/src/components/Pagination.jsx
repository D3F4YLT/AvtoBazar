import { useI18n } from '../i18n/useI18n';

export default function Pagination({ page, pages, onChange }) {
  const { t } = useI18n();
  if (pages <= 1) return null;

  // 1 ... 4 5 6 ... 10
  const items = [];
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= 1) items.push(p);
    else if (items[items.length - 1] !== '...') items.push('...');
  }

  return (
    <nav className="pagination" aria-label={t('pager.label')}>
      <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        {t('pager.prev')}
      </button>
      {items.map((p, i) =>
        p === '...' ? (
          <span key={`dots${i}`} className="muted">…</span>
        ) : (
          <button
            key={p}
            className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-outline'}`}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        )
      )}
      <button className="btn btn-outline btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        {t('pager.next')}
      </button>
    </nav>
  );
}