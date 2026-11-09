

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,
  name          VARCHAR(100) NOT NULL,
  phone         VARCHAR(30),
  city          VARCHAR(100),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cars (
  id           SERIAL PRIMARY KEY,
  user_id      INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand        VARCHAR(50)  NOT NULL,
  model        VARCHAR(50)  NOT NULL,
  year         SMALLINT     NOT NULL CHECK (year BETWEEN 1950 AND 2100),
  price        INT          NOT NULL CHECK (price >= 0),
  mileage      INT          NOT NULL CHECK (mileage >= 0),
  fuel         VARCHAR(20)  NOT NULL,
  transmission VARCHAR(20)  NOT NULL,
  body_type    VARCHAR(30)  NOT NULL,
  color        VARCHAR(30),
  city         VARCHAR(100) NOT NULL,
  description  TEXT         NOT NULL DEFAULT '',
  views        INT          NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS car_images (
  id        SERIAL PRIMARY KEY,
  car_id    INT  NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  url       TEXT NOT NULL,
  position  INT  NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS comments (
  id         SERIAL PRIMARY KEY,
  car_id     INT         NOT NULL REFERENCES cars(id)  ON DELETE CASCADE,
  user_id    INT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS password_resets (
  id         SERIAL PRIMARY KEY,
  user_id    INT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT        NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN     NOT NULL DEFAULT false
);


CREATE INDEX IF NOT EXISTS idx_cars_brand_model ON cars (brand, model);
CREATE INDEX IF NOT EXISTS idx_cars_price      ON cars (price);
CREATE INDEX IF NOT EXISTS idx_cars_year       ON cars (year);
CREATE INDEX IF NOT EXISTS idx_cars_mileage    ON cars (mileage);
CREATE INDEX IF NOT EXISTS idx_cars_created    ON cars (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cars_user       ON cars (user_id);
CREATE INDEX IF NOT EXISTS idx_images_car      ON car_images (car_id, position);
CREATE INDEX IF NOT EXISTS idx_comments_car    ON comments (car_id, created_at);
CREATE INDEX IF NOT EXISTS idx_resets_user     ON password_resets (user_id);