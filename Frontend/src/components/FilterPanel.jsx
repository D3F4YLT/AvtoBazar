import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useI18n } from '../i18n/useI18n';

const EMPTY = {
  q: '', brand: '', model: '',
  yearFrom: '', yearTo: '', priceFrom: '', priceTo: '', mileageFrom: '', mileageTo: '',
  fuel: '', transmission: '', bodyType: '', city: '',
};

export default function FilterPanel({ values, onApply, onReset }) {
  const { t, tv } = useI18n();
  const meta = useSelector((s) => s.meta);
  const [form, setForm] = useState({ ...EMPTY, ...values });

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onBrand = (e) => setForm({ ...form, brand: e.target.value, model: '' });
  const models = form.brand ? meta.brands[form.brand] || [] : [];

  const submit = (e) => {
    e.preventDefault();
    onApply(form);
  };

  return (
    <form onSubmit={submit}>
      <h3>{t('filters.title')}</h3>

      <div className="field">
        <label htmlFor="q">{t('filters.search')}</label>
        <input id="q" name="q" value={form.q} onChange={set} placeholder={t('filters.search_ph')} />
      </div>

      <div className="field">
        <label htmlFor="brand">{t('filters.brand')}</label>
        <select id="brand" name="brand" value={form.brand} onChange={onBrand}>
          <option value="">{t('filters.any_f')}</option>
          {Object.keys(meta.brands).map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="model">{t('filters.model')}</label>
        <select id="model" name="model" value={form.model} onChange={set} disabled={!form.brand}>
          <option value="">{t('filters.any_f')}</option>
          {models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>{t('filters.year')}</label>
        <div className="row">
          <input name="yearFrom" type="number" placeholder={t('filters.from')} value={form.yearFrom} onChange={set} aria-label={`${t('filters.year')}: ${t('filters.from')}`} />
          <input name="yearTo" type="number" placeholder={t('filters.to')} value={form.yearTo} onChange={set} aria-label={`${t('filters.year')}: ${t('filters.to')}`} />
        </div>
      </div>

      <div className="field">
        <label>{t('filters.price')}</label>
        <div className="row">
          <input name="priceFrom" type="number" min="0" placeholder={t('filters.from')} value={form.priceFrom} onChange={set} aria-label={`${t('filters.price')}: ${t('filters.from')}`} />
          <input name="priceTo" type="number" min="0" placeholder={t('filters.to')} value={form.priceTo} onChange={set} aria-label={`${t('filters.price')}: ${t('filters.to')}`} />
        </div>
      </div>

      <div className="field">
        <label>{t('filters.mileage')}</label>
        <div className="row">
          <input name="mileageFrom" type="number" min="0" placeholder={t('filters.from')} value={form.mileageFrom} onChange={set} aria-label={`${t('filters.mileage')}: ${t('filters.from')}`} />
          <input name="mileageTo" type="number" min="0" placeholder={t('filters.to')} value={form.mileageTo} onChange={set} aria-label={`${t('filters.mileage')}: ${t('filters.to')}`} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="fuel">{t('filters.fuel')}</label>
        <select id="fuel" name="fuel" value={form.fuel} onChange={set}>
          <option value="">{t('filters.any_n')}</option>
          {meta.fuels.map((x) => (
            <option key={x} value={x}>{tv('fuel', x)}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="transmission">{t('filters.transmission')}</label>
        <select id="transmission" name="transmission" value={form.transmission} onChange={set}>
          <option value="">{t('filters.any_f')}</option>
          {meta.transmissions.map((x) => (
            <option key={x} value={x}>{tv('trans', x)}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="bodyType">{t('filters.body')}</label>
        <select id="bodyType" name="bodyType" value={form.bodyType} onChange={set}>
          <option value="">{t('filters.any_m')}</option>
          {meta.bodyTypes.map((x) => (
            <option key={x} value={x}>{tv('body', x)}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="city">{t('filters.city')}</label>
        <input id="city" name="city" value={form.city} onChange={set} />
      </div>

      <div className="actions">
        <button className="btn btn-primary" type="submit">{t('filters.apply')}</button>
        <button className="btn btn-outline" type="button" onClick={onReset}>{t('filters.reset')}</button>
      </div>
    </form>
  );
}