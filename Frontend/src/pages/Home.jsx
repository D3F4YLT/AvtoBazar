import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import CarCard from '../components/CarCard';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import { useI18n } from '../i18n/useI18n';

const SORT_KEYS = ['newest', 'oldest', 'price_asc', 'price_desc', 'year_desc', 'year_asc', 'mileage_asc'];

export default function Home() {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const query = params.toString();
  const filters = Object.fromEntries(params.entries());

  // Любое изменение адреса (фильтры, сортировка, страница) = новый запрос к серверу
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .get(`/api/cars${query ? '?' + query : ''}`)
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [query]);

  const applyFilters = (values) => {
    const next = new URLSearchParams();
    Object.entries(values).forEach(([k, v]) => {
      if (v !== '' && v != null) next.set(k, v);
    });
    if (params.get('sort')) next.set('sort', params.get('sort'));
    setParams(next);
  };

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  return (
    <div>
      <h1>{t('list.title')}</h1>
      <div className="layout">
        <aside className="card filters">
          <FilterPanel key={query} values={filters} onApply={applyFilters} onReset={() => setParams({})} />
        </aside>

        <section>
          <div className="toolbar">
            <span className="muted">{data ? t('list.found', { count: data.total }) : ''}</span>
            <select
              value={filters.sort || 'newest'}
              onChange={(e) => setParam('sort', e.target.value)}
              aria-label={t('sort.label')}
            >
              {SORT_KEYS.map((value) => (
                <option key={value} value={value}>{t(`sort.${value}`)}</option>
              ))}
            </select>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {!data && loading && <p className="muted">{t('loading')}</p>}

          {data && data.cars.length === 0 && <div className="empty">{t('list.empty')}</div>}

          {data && data.cars.length > 0 && (
            <>
              <div className="grid" style={{ opacity: loading ? 0.6 : 1 }}>
                {data.cars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
              <Pagination page={data.page} pages={data.pages} onChange={(p) => setParam('page', String(p))} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}