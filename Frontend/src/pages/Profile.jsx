import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../api';
import { updateProfile, clearError } from '../store/authSlice';
import { useI18n } from '../i18n/useI18n';
import { translateServerMessage } from '../i18n/serverErrors';

export default function Profile() {
  const { t, fmt, lang } = useI18n();
  const dispatch = useDispatch();
  const { user, loading, error, fieldErrors } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', city: user.city || '' });
  const [saved, setSaved] = useState(false);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [pwMsg, setPwMsg] = useState(null);

  const [cars, setCars] = useState(null);
  const [carsError, setCarsError] = useState('');

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // История объявлений
  useEffect(() => {
    let cancelled = false;
    api
      .get('/api/users/me/cars')
      .then((d) => !cancelled && setCars(d.cars))
      .catch((e) => !cancelled && setCarsError(e.message));
    return () => {
      cancelled = true;
    };
  }, []);

  const onProfile = async (e) => {
    e.preventDefault();
    setSaved(false);
    const result = await dispatch(updateProfile(form));
    if (updateProfile.fulfilled.match(result)) setSaved(true);
  };

  const onPassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    try {
      const data = await api.put('/api/users/me/password', pw);
      setPwMsg({ type: 'ok', text: data.message });
      setPw({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message });
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm(t('car.delete_confirm'))) return;
    try {
      await api.delete(`/api/cars/${id}`);
      setCars((list) => list.filter((c) => c.id !== id));
    } catch (err) {
      setCarsError(err.message);
    }
  };

  return (
    <div>
      <h1>{t('profile.title')}</h1>
      <div className="profile-grid">
        <div style={{ display: 'grid', gap: 24 }}>
          <div className="card">
            <h2>{t('profile.data')}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            {saved && <div className="alert alert-ok">{t('profile.saved')}</div>}
            <form onSubmit={onProfile}>
              <div className="field">
                <label htmlFor="email">{t('auth.email')}</label>
                <input id="email" value={user.email} disabled />
              </div>
              <div className="field">
                <label htmlFor="name">{t('auth.name')}</label>
                <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
              </div>
              <div className="row">
                <div className="field">
                  <label htmlFor="phone">{t('auth.phone')}</label>
                  <input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="city">{t('auth.city')}</label>
                  <input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? t('form.saving') : t('form.save')}
              </button>
            </form>
          </div>

          <div className="card">
            <h2>{t('profile.password_title')}</h2>
            {pwMsg && (
              <div className={`alert ${pwMsg.type === 'ok' ? 'alert-ok' : 'alert-error'}`}>
                {pwMsg.type === 'ok' ? translateServerMessage(pwMsg.text, lang) : pwMsg.text}
              </div>
            )}
            <form onSubmit={onPassword}>
              <div className="field">
                <label htmlFor="current">{t('profile.current_password')}</label>
                <input id="current" type="password" value={pw.currentPassword}
                  onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required autoComplete="current-password" />
              </div>
              <div className="field">
                <label htmlFor="new">{t('auth.reset.new')}</label>
                <input id="new" type="password" value={pw.newPassword}
                  onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required autoComplete="new-password" />
              </div>
              <button className="btn btn-outline" type="submit">{t('profile.change_password')}</button>
            </form>
          </div>
        </div>

        <div className="card">
          <h2>{t('profile.my_cars')}{cars ? ` (${cars.length})` : ''}</h2>
          {carsError && <div className="alert alert-error">{carsError}</div>}
          {!cars && !carsError && <p className="muted">{t('loading')}</p>}
          {cars && cars.length === 0 && (
            <p className="muted">
              {t('profile.no_cars')} <Link to="/cars/new">{t('profile.first')}</Link>
            </p>
          )}
          {cars &&
            cars.map((c) => (
              <div className="my-car" key={c.id}>
                {c.image ? (
                  <img className="my-car-img" src={c.image} alt="" />
                ) : (
                  <div className="my-car-img car-img-ph" style={{ fontSize: 12 }}>{t('car.no_photo')}</div>
                )}
                <div className="my-car-info">
                  <Link to={`/cars/${c.id}`}>
                    <strong>{c.brand} {c.model} {c.year}</strong>
                  </Link>
                  <div>{fmt.price(c.price)}</div>
                  <div className="muted" style={{ fontSize: 13 }}>
                    {fmt.date(c.created_at)} · {c.views} {t('profile.views')}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Link className="btn btn-outline btn-sm" to={`/cars/${c.id}/edit`}>{t('profile.edit_short')}</Link>
                  <button className="btn btn-danger btn-sm" onClick={() => onDelete(c.id)}>{t('car.delete')}</button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}