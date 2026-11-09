import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/authSlice';
import { useI18n } from '../i18n/useI18n';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const from = location.state?.from || '/';
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) navigate(from, { replace: true });
  };

  return (
    <div className="card auth-box">
      <h1>{t('auth.login.title')}</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="email">{t('auth.email')}</label>
          <input id="email" name="email" type="email" value={form.email} onChange={onChange} required autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="password">{t('auth.password')}</label>
          <input id="password" name="password" type="password" value={form.password} onChange={onChange} required autoComplete="current-password" />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? t('auth.login.loading') : t('auth.login.submit')}
        </button>
      </form>
      <p>
        <Link to="/forgot-password">{t('auth.forgot_link')}</Link>
      </p>
      <p className="muted">
        {t('auth.no_account')} <Link to="/register">{t('auth.to_register')}</Link>
      </p>
    </div>
  );
}