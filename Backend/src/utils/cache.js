const NodeCache = require('node-cache');

// Кэш в памяти процесса: результаты списка объявлений живут 60 секунд.
// При любом изменении объявлений кэш списков сбрасывается.
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120, useClones: false });

function invalidate(prefix) {
  const keys = cache.keys().filter((k) => k.startsWith(prefix));
  if (keys.length) cache.del(keys);
}

module.exports = { cache, invalidate };