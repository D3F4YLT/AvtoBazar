import { detectLang } from './i18n/lang';
import { translateServerMessage } from './i18n/serverErrors';

const TOKEN_KEY = 'avtobazar_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors || {};
  }
}

async function request(method, url, body) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (body instanceof FormData) {
    payload = body; // для загрузки фото
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const res = await fetch(url, { method, headers, body: payload });
  const data = (await res.json().catch(() => ({}))) || {};

  if (!res.ok) {
    const lang = detectLang();
    const errors = {};
    Object.entries(data.errors || {}).forEach(([field, text]) => {
      errors[field] = translateServerMessage(text, lang);
    });
    throw new ApiError(res.status, translateServerMessage(data.message || 'Ошибка запроса', lang), errors);
  }
  return data;
}

export const api = {
  get: (url) => request('GET', url),
  post: (url, body) => request('POST', url, body),
  put: (url, body) => request('PUT', url, body),
  delete: (url) => request('DELETE', url),
};

// { brand: 'Toyota', yearFrom: '' }  ->  "?brand=Toyota"
export function buildQuery(params) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) sp.set(key, value);
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}


