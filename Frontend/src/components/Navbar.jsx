import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { changeLang } from '../store/langSlice';
import { useI18n } from '../i18n/useI18n';

export default function Navbar() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, lang } = useI18n();

  const onLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">
          <img src="/favicon.svg" alt="" />
          <span className="logo-text">
            Avto<span>Bazar</span>
          </span>
        </Link>
        <nav className="nav-links">
          <NavLink to="/">{t('nav.listings')}</NavLink>
          {user ? (
            <>
              <Link to="/cars/new" className="btn btn-primary btn-sm">{t('nav.sell')}</Link>
              <NavLink to="/profile">{user.name}</NavLink>
              <button className="btn btn-outline btn-sm" onClick={onLogout}>{t('nav.logout')}</button>
            </>
          ) : (
            <>
              <NavLink to="/login">{t('nav.login')}</NavLink>
              <Link to="/register" className="btn btn-primary btn-sm">{t('nav.register')}</Link>
            </>
          )}
          <div className="lang-switch" role="group" aria-label={t('nav.language')}>
            {['ru', 'en'].map((code) => (
              <button
                key={code}
                type="button"
                className={lang === code ? 'active' : ''}
                onClick={() => dispatch(changeLang(code))}
                aria-pressed={lang === code}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}