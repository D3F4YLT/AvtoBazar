import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/useI18n';

export default function CarCard({ car }) {
  const { t, tv, fmt } = useI18n();

  return (
    <Link to={`/cars/${car.id}`} className="car-card">
      {car.image ? (
        <img className="car-img" src={car.image} alt={`${car.brand} ${car.model}`} loading="lazy" />
      ) : (
        <div className="car-img-ph">{t('car.no_photo')}</div>
      )}
      <div className="car-body">
        <div className="car-title">
          {car.brand} {car.model} {car.year}
        </div>
        <div className="car-price">{fmt.price(car.price)}</div>
        <div className="car-meta">
          {fmt.mileage(car.mileage)} · {tv('fuel', car.fuel)} · {tv('trans', car.transmission)}
        </div>
        <div className="car-meta">{car.city}</div>
      </div>
    </Link>
  );
}