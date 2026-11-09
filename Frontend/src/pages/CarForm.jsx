import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { api } from '../api';
import { useI18n } from '../i18n/useI18n';

const MAX_IMAGES = 10;
const MAX_SIZE = 5 * 1024 * 1024;

const EMPTY = {
  brand: '', model: '', year: '', price: '', mileage: '',
  fuel: '', transmission: '', body_type: '', color: '', city: '', description: '',
};

export default function CarForm() {
  const { t, tv } = useI18n();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const meta = useSelector((s) => s.meta);
  const user = useSelector((s) => s.auth.user);

  const [form, setForm] = useState({ ...EMPTY, city: user?.city || '' });
  const [existing, setExisting] = useState([]); // фото, которые уже на сервере
  const [removed, setRemoved] = useState([]); // id фото, которые пользователь убрал
  const [files, setFiles] = useState([]); // новые файлы
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [forbidden, setForbidden] = useState(false);
  const [tooBig, setTooBig] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Режим редактирования: загружаем текущие данные
  useEffect(() => {
    if (!isEdit) return undefined;
    let cancelled = false;
    api
      .get(`/api/cars/${id}`)
      .then(({ car }) => {
        if (cancelled) return;
        if (!car.isOwner) {
          setForbidden(true);
        } else {
          setForm({
            brand: car.brand, model: car.model, year: car.year, price: car.price, mileage: car.mileage,
            fuel: car.fuel, transmission: car.transmission, body_type: car.body_type,
            color: car.color || '', city: car.city, description: car.description || '',
          });
          setExisting(car.images);
        }
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  // Миниатюры выбранных файлов
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onBrand = (e) => setForm({ ...form, brand: e.target.value, model: '' });
  const models = form.brand ? meta.brands[form.brand] || [] : [];
  const keptExisting = existing.filter((img) => !removed.includes(img.id));
  const fe = (name) => (fieldErrors[name] ? <span className="field-error">{fieldErrors[name]}</span> : null);

  const onFiles = (e) => {
    const picked = Array.from(e.target.files);
    e.target.value = '';
    setTooBig(picked.some((f) => f.size > MAX_SIZE));
    const ok = picked.filter((f) => f.size <= MAX_SIZE);
    setFiles((prev) => [...prev, ...ok].slice(0, MAX_IMAGES - keptExisting.length));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setTooBig(false);
    setFieldErrors({});

    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => fd.append(key, value));
    files.forEach((file) => fd.append('images', file));
    if (removed.length) fd.append('removeImages', removed.join(','));

    try {
      const data = isEdit ? await api.put(`/api/cars/${id}`, fd) : await api.post('/api/cars', fd);
      navigate(`/cars/${data.id}`);
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.errors || {});
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="muted">{t('loading')}</p>;

  const shownError = forbidden ? t('form.forbidden') : error || (tooBig ? t('form.too_big') : '');

  return (
    <div className="card" style={{ maxWidth: 760, margin: '0 auto' }}>
      <h1>{isEdit ? t('form.edit_title') : t('form.new_title')}</h1>
      {shownError && <div className="alert alert-error">{shownError}</div>}

      <form onSubmit={onSubmit}>
        <div className="row">
          <div className="field">
            <label htmlFor="brand">{t('filters.brand')}</label>
            <select id="brand" name="brand" value={form.brand} onChange={onBrand} required>
              <option value="">{t('form.select')}</option>
              {Object.keys(meta.brands).map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            {fe('brand')}
          </div>
          <div className="field">
            <label htmlFor="model">{t('filters.model')}</label>
            <select id="model" name="model" value={form.model} onChange={set} required disabled={!form.brand}>
              <option value="">{t('form.select')}</option>
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            {fe('model')}
          </div>
        </div>

        <div className="row-3">
          <div className="field">
            <label htmlFor="year">{t('car.year')}</label>
            <input id="year" name="year" type="number" value={form.year} onChange={set} required />
            {fe('year')}
          </div>
          <div className="field">
            <label htmlFor="price">{t('filters.price')}</label>
            <input id="price" name="price" type="number" min="0" value={form.price} onChange={set} required />
            {fe('price')}
          </div>
          <div className="field">
            <label htmlFor="mileage">{t('filters.mileage')}</label>
            <input id="mileage" name="mileage" type="number" min="0" value={form.mileage} onChange={set} required />
            {fe('mileage')}
          </div>
        </div>

        <div className="row-3">
          <div className="field">
            <label htmlFor="fuel">{t('car.fuel')}</label>
            <select id="fuel" name="fuel" value={form.fuel} onChange={set} required>
              <option value="">{t('form.select')}</option>
              {meta.fuels.map((x) => (
                <option key={x} value={x}>{tv('fuel', x)}</option>
              ))}
            </select>
            {fe('fuel')}
          </div>
          <div className="field">
            <label htmlFor="transmission">{t('car.transmission')}</label>
            <select id="transmission" name="transmission" value={form.transmission} onChange={set} required>
              <option value="">{t('form.select')}</option>
              {meta.transmissions.map((x) => (
                <option key={x} value={x}>{tv('trans', x)}</option>
              ))}
            </select>
            {fe('transmission')}
          </div>
          <div className="field">
            <label htmlFor="body_type">{t('car.body')}</label>
            <select id="body_type" name="body_type" value={form.body_type} onChange={set} required>
              <option value="">{t('form.select')}</option>
              {meta.bodyTypes.map((x) => (
                <option key={x} value={x}>{tv('body', x)}</option>
              ))}
            </select>
            {fe('body_type')}
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor="color">{t('car.color')}</label>
            <input id="color" name="color" value={form.color} onChange={set} />
          </div>
          <div className="field">
            <label htmlFor="city">{t('car.city')}</label>
            <input id="city" name="city" value={form.city} onChange={set} required />
            {fe('city')}
          </div>
        </div>

        <div className="field">
          <label htmlFor="description">{t('car.description')}</label>
          <textarea id="description" name="description" value={form.description} onChange={set} maxLength={5000} />
        </div>

        <div className="field">
          <label htmlFor="images">{t('form.photos', { max: MAX_IMAGES })}</label>
          <input
            id="images"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={onFiles}
            disabled={keptExisting.length + files.length >= MAX_IMAGES}
          />
          {(keptExisting.length > 0 || previews.length > 0) && (
            <div className="previews">
              {keptExisting.map((img) => (
                <div className="preview-item" key={`old${img.id}`}>
                  <img src={img.url} alt="" />
                  <button type="button" className="preview-remove" aria-label={t('form.remove_photo')}
                    onClick={() => setRemoved([...removed, img.id])}>×</button>
                </div>
              ))}
              {previews.map((url, i) => (
                <div className="preview-item" key={url}>
                  <img src={url} alt="" />
                  <button type="button" className="preview-remove" aria-label={t('form.remove_photo')}
                    onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="actions">
          <button className="btn btn-primary" type="submit" disabled={saving || forbidden}>
            {saving ? t('form.saving') : isEdit ? t('form.save') : t('form.publish')}
          </button>
          <Link className="btn btn-outline" to={isEdit ? `/cars/${id}` : '/'}>{t('form.cancel')}</Link>
        </div>
      </form>
    </div>
  );
}