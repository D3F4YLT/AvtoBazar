import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { api } from '../api';
import { useI18n } from '../i18n/useI18n';

export default function Comments({ carId, ownerId }) {
  const { t, fmt } = useI18n();
  const user = useSelector((s) => s.auth.user);
  const location = useLocation();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/api/cars/${carId}/comments`)
      .then((d) => !cancelled && setComments(d.comments))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [carId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const d = await api.post(`/api/cars/${carId}/comments`, { text });
      setComments((list) => [...list, d.comment]);
      setText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const onDelete = async (id) => {
    try {
      await api.delete(`/api/comments/${id}`);
      setComments((list) => list.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="card comments">
      <h2>{t('comments.title', { count: comments.length })}</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {comments.length === 0 && <p className="muted">{t('comments.empty')}</p>}

      {comments.map((c) => (
        <div className="comment" key={c.id}>
          <div className="comment-head">
            <span>
              <strong>{c.author}</strong> · {fmt.dateTime(c.created_at)}
            </span>
            {user && (user.id === c.user_id || user.id === ownerId) && (
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(c.id)}>
                {t('car.delete')}
              </button>
            )}
          </div>
          <div className="comment-text">{c.text}</div>
        </div>
      ))}

      {user ? (
        <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
          <div className="field">
            <label htmlFor="comment">{t('comments.yours')}</label>
            <textarea id="comment" value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={sending}>
            {sending ? t('comments.sending') : t('comments.send')}
          </button>
        </form>
      ) : (
        <p style={{ marginTop: 16 }}>
          <Link to="/login" state={{ from: location.pathname }}>{t('comments.login_link')}</Link>
          {t('comments.login_rest')}
        </p>
      )}
    </section>
  );
}