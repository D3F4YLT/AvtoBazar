import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { translations } from './translations';

const LOCALES = { ru: 'ru-RU', en: 'en-US' };

export function useI18n() {
  const lang = useSelector((s) => s.lang.lang);
  const dict = translations[lang] || translations.ru;

  // t('list.found', { count: 5 }) -> "Найдено: 5" / "Found: 5"
  const t = useCallback(
    (key, params) => {
      let text = dict[key] ?? translations.ru[key] ?? key;
      if (params) {
        Object.entries(params).forEach(([name, value]) => {
          text = text.replaceAll(`{${name}}`, String(value));
        });
      }
      return text;
    },
    [dict]
  );

  // Значения из базы (топливо, коробка, кузов, цвет): перевод, если он есть
  const tv = useCallback((group, value) => dict[`${group}.${value}`] ?? value, [dict]);

  const fmt = useMemo(() => {
    const locale = LOCALES[lang] || 'ru-RU';
    return {
      price: (n) => `${Number(n).toLocaleString(locale)} $`,
      mileage: (n) => `${Number(n).toLocaleString(locale)} ${lang === 'en' ? 'km' : 'км'}`,
      date: (iso) => new Date(iso).toLocaleDateString(locale),
      dateTime: (iso) => new Date(iso).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' }),
    };
  }, [lang]);

  return { t, tv, fmt, lang };
}