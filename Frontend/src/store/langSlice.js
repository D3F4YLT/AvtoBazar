import { createSlice } from '@reduxjs/toolkit';
import { detectLang, saveLang } from '../i18n/lang';

const slice = createSlice({
  name: 'lang',
  initialState: { lang: detectLang() },
  reducers: {
    setLang(state, action) {
      state.lang = action.payload;
    },
  },
});

// Смена языка: запоминаем выбор в браузере и обновляем хранилище
export const changeLang = (lang) => (dispatch) => {
  saveLang(lang);
  dispatch(slice.actions.setLang(lang));
};

export default slice.reducer;