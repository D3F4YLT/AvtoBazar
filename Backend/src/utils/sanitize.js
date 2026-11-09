const xss = require('xss');

// Защита от XSS: вырезаем любые HTML-теги и содержимое <script>/<style>.
// (Кроме того, React экранирует весь текст при выводе — двойная защита.)
const options = {
  whiteList: {},
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style'],
};

function clean(value, max = 255) {
  if (value === undefined || value === null) return '';
  return xss(String(value).trim(), options).slice(0, max);
}

module.exports = { clean };