CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  emp_id      VARCHAR(50)  UNIQUE NOT NULL,
  department  VARCHAR(100),
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(20)  NOT NULL DEFAULT 'employee',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rides (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emp_id          VARCHAR(50)  NOT NULL,
  emp_name        VARCHAR(100) NOT NULL,
  emp_email       VARCHAR(150) NOT NULL,
  department      VARCHAR(100),
  source          VARCHAR(255) NOT NULL,
  destination     VARCHAR(255) NOT NULL,
  cab_number      VARCHAR(50),
  cab_type        VARCHAR(50),
  check_in_time   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  check_out_time  TIMESTAMPTZ,
  duration_mins   INTEGER,
  duration_str    VARCHAR(50),
  status          VARCHAR(20)  NOT NULL DEFAULT 'Active',
  ride_date       DATE         NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rides_user_id   ON rides(user_id);
CREATE INDEX IF NOT EXISTS idx_rides_emp_id    ON rides(emp_id);
CREATE INDEX IF NOT EXISTS idx_rides_status    ON rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_ride_date ON rides(ride_date);

-- Default admin (password: Admin@123)
INSERT INTO users (name, email, emp_id, department, password, role)
VALUES (
  'Administrator',
  'admin@company.com',
  'ADMIN',
  'IT',
  '$2b$10$rOv.4H4Jdy7pKNOoAGAaU.ggRa.JhkX5JdJq6jKwzQ2G3F1mzO7Sq',
  'admin'
) ON CONFLICT DO NOTHING;
