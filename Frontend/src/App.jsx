import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './store/authSlice';
import { loadMeta } from './store/metaSlice';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CarDetails from './pages/CarDetails';
import ProtectedRoute from './components/ProtectedRoute';
import CarForm from './pages/CarForm';
import Profile from './pages/Profile';
import { useI18n } from './i18n/useI18n';

export default function App() {
  const dispatch = useDispatch();
  const ready = useSelector((s) => s.auth.ready);
  const { t, lang } = useI18n();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    dispatch(loadUser());
    dispatch(loadMeta());
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <main className="page container">
        {!ready ? (
          <p className="muted">{t('loading')}</p>
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="*" element={<div className="empty">{t('notFound')}</div>} />
            <Route path="/cars/:id" element={<CarDetails />} />
            <Route path="/cars/new" element={<ProtectedRoute><CarForm key="new" /></ProtectedRoute>} />
            <Route path="/cars/:id/edit" element={<ProtectedRoute><CarForm key="edit" /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
        )}
      </main>
      <Footer />
    </>
  );
}