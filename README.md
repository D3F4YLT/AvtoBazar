# AvtoBazar

Веб-платформа объявлений о продаже автомобилей. Дипломный проект по дисциплине «Разработка программного обеспечения».

**Автор:** Акарыс

## Ссылки

| Что | Где |
|---|---|
| Исходный код | https://github.com/D3F4YLT/AvtoBazar |
| Схема базы данных | [`database/schema.sql`](database/schema.sql) |
| Сайт и API | запускаются локально (см. раздел «Запуск локально») |

## Скриншоты

| Каталог | Объявление |
|---|---|
| ![Каталог](docs/screenshots/home.png) | ![Объявление](docs/screenshots/details.png) |

| Создание объявления | Профиль |
|---|---|
| ![Форма](docs/screenshots/form.png) | ![Профиль](docs/screenshots/profile.png) |

| Вход | Английский интерфейс |
|---|---|
| ![Вход](docs/screenshots/login.png) | ![EN](docs/screenshots/home-en.png) |

## Возможности

- Регистрация, вход, восстановление пароля (JWT, пароли хранятся в виде хэша bcrypt)
- Профиль: редактирование данных, смена пароля, история своих объявлений
- Объявления: создание, редактирование, удаление, до 10 фотографий
- Каталог: поиск, фильтры (марка, модель, год, цена, пробег, топливо, коробка, кузов, город), сортировка, постраничный вывод
- Карточка объявления: галерея, характеристики, контакты продавца
- Комментарии к объявлениям
- Интерфейс на русском и английском языках

## Технологии

| Слой | Технологии |
|---|---|
| Frontend | React, Redux Toolkit, React Router, Vite |
| Backend | Node.js, Express |
| База данных | PostgreSQL |
| Безопасность | JWT, bcrypt, helmet, rate limit, параметризованные SQL-запросы, очистка ввода от XSS |
| Производительность | индексы в БД, кэширование списка объявлений, пагинация |

## Архитектура

```mermaid
flowchart LR
    U[Браузер: React + Redux] -->|HTTP /api, JSON| B[Express API]
    B -->|SQL, параметризованные запросы| D[(PostgreSQL)]
    B -->|сохранение фото| F[/uploads/]
    B --- C[Кэш списка объявлений]
```

## База данных

Схема: [`database/schema.sql`](database/schema.sql). Пять таблиц, связи с каскадным удалением: при удалении пользователя удаляются его объявления, комментарии и токены, при удалении объявления удаляются его фото и комментарии.

```mermaid
erDiagram
    users ||--o{ cars : "размещает"
    users ||--o{ comments : "пишет"
    users ||--o{ password_resets : "запрашивает"
    cars  ||--o{ car_images : "имеет фото"
    cars  ||--o{ comments : "получает"

    users {
        int id PK
        varchar email UK
        text password_hash
        varchar name
        varchar phone
        varchar city
        timestamptz created_at
    }
    cars {
        int id PK
        int user_id FK
        varchar brand
        varchar model
        smallint year
        int price
        int mileage
        varchar fuel
        varchar transmission
        varchar body_type
        varchar color
        varchar city
        text description
        int views
        timestamptz created_at
        timestamptz updated_at
    }
    car_images {
        int id PK
        int car_id FK
        text url
        int position
    }
    comments {
        int id PK
        int car_id FK
        int user_id FK
        text text
        timestamptz created_at
    }
    password_resets {
        int id PK
        int user_id FK
        text token_hash UK
        timestamptz expires_at
        boolean used
    }
```

### Описание таблиц

| Таблица | Назначение | Ключевые поля |
|---|---|---|
| `users` | Пользователи | `email` (уникальный), `password_hash` (bcrypt), имя, телефон, город |
| `cars` | Объявления | марка, модель, год, цена, пробег, топливо, коробка, кузов, город, описание, счётчик просмотров |
| `car_images` | Фотографии объявлений | `car_id`, `url`, `position` (порядок в галерее) |
| `comments` | Комментарии | `car_id`, `user_id`, текст |
| `password_resets` | Токены сброса пароля | хэш токена, срок действия, флаг использования |

В таблице `cars` заданы ограничения: год от 1950 до 2100, цена и пробег не отрицательные.

### Индексы

| Индекс | Зачем |
|---|---|
| `idx_cars_brand_model` | фильтр по марке и модели |
| `idx_cars_price`, `idx_cars_year`, `idx_cars_mileage` | диапазоны и сортировка |
| `idx_cars_created` | сортировка «сначала новые» |
| `idx_cars_user` | «мои объявления» |
| `idx_images_car`, `idx_comments_car` | фото и комментарии объявления |
| `idx_resets_user` | токены сброса пароля пользователя |

## Запуск локально

Требуется Node.js 20+ и PostgreSQL 15+.

### 1. База данных

```sql
CREATE USER avtobazar WITH PASSWORD 'avtobazar';
CREATE DATABASE avtobazar OWNER avtobazar;
```

Затем создайте таблицы одним из способов:

```bash
psql -U avtobazar -d avtobazar -f database/schema.sql
```

или командой `npm run migrate` в папке `Backend` (выполняет тот же скрипт).

### 2. Backend

```bash
cd Backend
npm install
```

Скопируйте `.env.example` в `.env` и при необходимости измените значения:

```
PORT=4000
DATABASE_URL=postgres://avtobazar:avtobazar@localhost:5432/avtobazar
JWT_SECRET=замените_на_длинную_случайную_строку
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Создайте таблицы, заполните базу тестовыми данными и запустите сервер:

```bash
npm run migrate
npm run seed
npm run dev
```

Сервер: http://localhost:4000 (проверка: http://localhost:4000/api/health)

### 3. Frontend

В новом терминале:

```bash
cd Frontend
npm install
npm run dev
```

Сайт: http://localhost:5173

### Тестовые аккаунты

После `npm run seed`: `almas@example.com`, `dana@example.com`, `erzhan@example.com`, пароль `password123`.

## API

| Метод | Адрес | Описание |
|---|---|---|
| GET | `/api/health` | проверка сервера и базы |
| GET | `/api/meta` | справочники (марки, модели, топливо...) |
| POST | `/api/auth/register`, `/api/auth/login` | регистрация, вход |
| POST | `/api/auth/forgot`, `/api/auth/reset` | сброс пароля |
| GET | `/api/auth/me` | текущий пользователь |
| GET, PUT | `/api/users/me` | профиль |
| PUT | `/api/users/me/password` | смена пароля |
| GET | `/api/users/me/cars` | мои объявления |
| GET | `/api/cars` | список: фильтры, сортировка, страницы |
| GET | `/api/cars/:id` | карточка объявления |
| POST, PUT, DELETE | `/api/cars`, `/api/cars/:id` | создание, изменение, удаление (только владелец) |
| GET, POST | `/api/cars/:carId/comments` | комментарии |
| DELETE | `/api/comments/:id` | удаление комментария (автор или владелец объявления) |

## Структура проекта

```
AvtoBazar/
├── database/schema.sql            # схема БД
├── docs/screenshots/              # скриншоты для README
├── Backend/
│   ├── src/
│   │   ├── app.js, index.js, db.js    # сервер и подключение к БД
│   │   ├── schema.sql, migrate.js     # схема и миграция
│   │   ├── seed.js                    # тестовые данные
│   │   ├── routes/                    # auth, users, cars, comments, meta
│   │   ├── middleware/                # проверка токена, обработка ошибок
│   │   └── utils/                     # кэш, валидация, защита от XSS
│   └── uploads/                       # загруженные фото
└── Frontend/
    └── src/
        ├── pages/                     # страницы
        ├── components/                # переиспользуемые компоненты
        ├── store/                     # Redux (auth, meta, lang)
        ├── i18n/                      # переводы RU/EN
        └── api.js                     # обёртка над fetch
```

## Безопасность

- **SQL-инъекции:** все запросы параметризованы (`$1, $2...`), значения не подставляются в строку SQL.
- **XSS:** текст объявлений и комментариев очищается на сервере от HTML, React экранирует вывод.
- **Пароли:** хранятся только в виде хэша bcrypt.
- **Доступ:** изменять и удалять можно только свои объявления; токен JWT проверяется на сервере.
- **Защита от перебора:** ограничение числа запросов (rate limit), заголовки helmet.
- **Загрузка файлов:** только JPG/PNG/WebP, до 5 МБ, до 10 штук.

## Производительность и масштабирование

- Индексы по полям, участвующим в фильтрах и сортировке.
- Кэш списка объявлений (60 с), сбрасывается при любом изменении объявлений.
- Постраничный вывод: сервер отдаёт только нужную страницу.
- Сервер не хранит сессии (JWT), поэтому его можно запускать в нескольких экземплярах за балансировщиком.

## Известные ограничения

- Восстановление пароля работает в режиме разработки: письма не отправляются, ссылка выводится в консоль сервера и на странице. Для боевого режима нужен SMTP-сервер.
- Названия городов, описания и комментарии не переводятся.