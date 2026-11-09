import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import Comments from '../components/Comments';
import { useI18n } from '../i18n/useI18n';

export default function CarDetails() {
  const { t, tv, fmt } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [error, setError] = useState('');
  const [active, setActive] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setCar(null);
    setError('');
    setActive(0);
    api
      .get(`/api/cars/${id}`)
      .then((d) => !cancelled && setCar(d.car))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const onDelete = async () => {
    if (!window.confirm(t('car.delete_confirm'))) return;
    try {
      await api.delete(`/api/cars/${id}`);
      navigate('/profile');
    } catch (e) {
      setError(e.message);
    }
  };

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!car) return <p className="muted">{t('loading')}</p>;

  const { images, seller } = car;
  const specs = [
    [t('car.year'), car.year],
    [t('car.mileage'), fmt.mileage(car.mileage)],
    [t('car.fuel'), tv('fuel', car.fuel)],
    [t('car.transmission'), tv('trans', car.transmission)],
    [t('car.body'), tv('body', car.body_type)],
    [t('car.color'), car.color ? tv('color', car.color) : '—'],
    [t('car.city'), car.city],
    [t('car.views'), car.views],
  ];

  return (
    <div>
      <p>
        <Link to="/">{t('back_all')}</Link>
      </p>
      <h1>
        {car.brand} {car.model} {car.year}
      </h1>

      <div className="details">
        <div>
          {images.length > 0 ? (
            <>
              <img className="gallery-main" src={images[active].url} alt={`${car.brand} ${car.model}`} />
              {images.length > 1 && (
                <div className="thumbs">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      className={`thumb ${i === active ? 'active' : ''}`}
                      onClick={() => setActive(i)}
                      aria-label={t('car.photo_n', { n: i + 1 })}
                    >
                      <img src={img.url} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="gallery-ph">{t('car.no_photo')}</div>
          )}

          <div className="card" style={{ marginTop: 16 }}>
            <h3>{t('car.description')}</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{car.description || t('car.no_description')}</p>
          </div>
        </div>

        <aside>
          <div className="card">
            <div className="price-big">{fmt.price(car.price)}</div>
            <table className="specs">
              <tbody>
                {specs.map(([label, value]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {car.isOwner && (
              <div className="actions">
                <Link className="btn btn-outline btn-sm" to={`/cars/${car.id}/edit`}>
                  {t('car.edit')}
                </Link>
                <button className="btn btn-danger btn-sm" onClick={onDelete}>
                  {t('car.delete')}
                </button>
              </div>
            )}
          </div>

          <div className="card seller">
            <h3>{t('car.seller')}</h3>
            <p>
              <strong>{seller.name}</strong>
            </p>
            {seller.phone ? (
              <p>
                {t('car.phone')}: <a href={`tel:${seller.phone}`}>{seller.phone}</a>
              </p>
            ) : (
              <p className="muted">{t('car.no_phone')}</p>
            )}
            <p>
              {t('auth.email')}: <a href={`mailto:${seller.email}`}>{seller.email}</a>
            </p>
            {seller.city && <p className="muted">{seller.city}</p>}
          </div>
        </aside>
      </div>

      <Comments carId={car.id} ownerId={car.user_id} />
    </div>
  );
}