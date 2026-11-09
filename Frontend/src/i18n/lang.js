const KEY = 'avtobazar_lang';
export const LANGS = ['ru', 'en'];

// Язык: сохранённый выбор, иначе по настройкам браузера, иначе русский
export function detectLang() {
  try {
    const saved = localStorage.getItem(KEY);
    if (LANGS.includes(saved)) return saved;
  } catch {
    /* localStorage недоступен */
  }
  const browser = (navigator.language || 'ru').toLowerCase();
  return browser.startsWith('en') ? 'en' : 'ru';
}

export function saveLang(lang) {
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    
  }
}