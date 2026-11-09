import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../store/authSlice';
import { useI18n } from '../i18n/useI18n';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { loading, error, fieldErrors } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', password: '' });

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(register(form));
    if (register.fulfilled.match(result)) navigate('/');
  };

  const FieldError = ({ name }) =>
    fieldErrors[name] ? <span className="field-error">{fieldErrors[name]}</span> : null;

  return (
    <div className="card auth-box">
      <h1>{t('auth.register.title')}</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="name">{t('auth.name')}</label>
          <input id="name" name="name" value={form.name} onChange={onChange} required autoComplete="name" />
          <FieldError name="name" />
        </div>
        <div className="field">
          <label htmlFor="email">{t('auth.email')}</label>
          <input id="email" name="email" type="email" value={form.email} onChange={onChange} required autoComplete="email" />
          <FieldError name="email" />
        </div>
        <div className="row">
          <div className="field">
            <label htmlFor="phone">{t('auth.phone')}</label>
            <input id="phone" name="phone" value={form.phone} onChange={onChange} placeholder="+7 700 000 00 00" autoComplete="tel" />
          </div>
          <div className="field">
            <label htmlFor="city">{t('auth.city')}</label>
            <input id="city" name="city" value={form.city} onChange={onChange} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="password">{t('auth.password_min')}</label>
          <input id="password" name="password" type="password" value={form.password} onChange={onChange} required autoComplete="new-password" />
          <FieldError name="password" />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? t('auth.register.loading') : t('auth.register.submit')}
        </button>
      </form>
      <p className="muted">
        {t('auth.have_account')} <Link to="/login">{t('auth.to_login')}</Link>
      </p>
    </div>
  );
}