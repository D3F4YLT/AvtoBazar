import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useI18n } from '../i18n/useI18n';
import { translateServerMessage } from '../i18n/serverErrors';

export default function ResetPassword() {
  const { token } = useParams();
  const { t, lang } = useI18n();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError(t('auth.reset.mismatch'));
      return;
    }
    setLoading(true);
    try {
      const data = await api.post('/api/auth/reset', { token, password });
      setDone(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card auth-box">
      <h1>{t('auth.reset.title')}</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {done ? (
        <>
          <div className="alert alert-ok">{translateServerMessage(done, lang)}</div>
          <Link className="btn btn-primary" to="/login">{t('auth.to_login')}</Link>
        </>
      ) : (
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="password">{t('auth.reset.new')}</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
          </div>
          <div className="field">
            <label htmlFor="confirm">{t('auth.reset.confirm')}</label>
            <input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? t('auth.reset.loading') : t('auth.reset.submit')}
          </button>
        </form>
      )}
    </div>
  );
}