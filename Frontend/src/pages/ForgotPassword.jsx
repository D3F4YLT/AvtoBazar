import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useI18n } from '../i18n/useI18n';
import { translateServerMessage } from '../i18n/serverErrors';

export default function ForgotPassword() {
  const { t, lang } = useI18n();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      setResult(await api.post('/api/auth/forgot', { email }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // В режиме разработки сервер возвращает ссылку вместо отправки письма
  const devPath = result?.devResetLink ? new URL(result.devResetLink).pathname : null;

  return (
    <div className="card auth-box">
      <h1>{t('auth.forgot.title')}</h1>
      <p className="muted">{t('auth.forgot.hint')}</p>
      {error && <div className="alert alert-error">{error}</div>}
      {result && <div className="alert alert-ok">{translateServerMessage(result.message, lang)}</div>}
      {devPath && (
        <div className="alert alert-info">
          {t('auth.forgot.dev')} <Link to={devPath}>{t('auth.forgot.dev_link')}</Link>
        </div>
      )}
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="email">{t('auth.email')}</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? t('auth.forgot.loading') : t('auth.forgot.submit')}
        </button>
      </form>
      <p className="muted">
        <Link to="/login">{t('auth.back_to_login')}</Link>
      </p>
    </div>
  );
}