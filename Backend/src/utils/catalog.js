// Справочники для форм и фильтров
const brands = {
  Audi: ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7'],
  BMW: ['3 Series', '5 Series', 'X3', 'X5', 'X6'],
  Chevrolet: ['Aveo', 'Cruze', 'Lacetti', 'Spark'],
  Daewoo: ['Matiz', 'Nexia', 'Lanos'],
  Ford: ['Focus', 'Fiesta', 'Mondeo', 'Kuga', 'Mustang'],
  Honda: ['Accord', 'Civic', 'CR-V', 'Fit'],
  Hyundai: ['Accent', 'Elantra', 'Sonata', 'Tucson', 'Santa Fe'],
  Kia: ['Ceed', 'Optima', 'Rio', 'Sportage', 'Sorento'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLE', 'GLC'],
  Mazda: ['3', '6', 'CX-5', 'CX-30'],
  Nissan: ['Qashqai', 'X-Trail', 'Juke', 'Leaf', 'Almera'],
  Skoda: ['Octavia', 'Rapid', 'Superb', 'Kodiaq', 'Fabia'],
  Toyota: ['Camry', 'Corolla', 'RAV4', 'Land Cruiser', 'Prius'],
  Volkswagen: ['Golf', 'Passat', 'Polo', 'Tiguan', 'Touareg'],
};

const fuels = ['Бензин', 'Дизель', 'Газ/бензин', 'Гибрид', 'Электро'];
const transmissions = ['Механика', 'Автомат', 'Робот', 'Вариатор'];
const bodyTypes = ['Седан', 'Хэтчбек', 'Универсал', 'Внедорожник', 'Кроссовер', 'Купе', 'Минивэн', 'Пикап'];

module.exports = { brands, fuels, transmissions, bodyTypes };