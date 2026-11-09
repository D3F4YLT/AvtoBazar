import { useI18n } from '../i18n/useI18n';

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span className="logo-text">
          Avto<span>Bazar</span>
        </span>
        <span>{t('footer.text', { year: new Date().getFullYear() })}</span>
      </div>
    </footer>
  );
}