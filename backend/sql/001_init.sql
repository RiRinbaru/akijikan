CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,

  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  required_minutes INTEGER,

  timezone TEXT NOT NULL DEFAULT 'Asia/Tokyo',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (start_date <= end_date),
  CHECK (required_minutes IS NULL OR required_minutes > 0)
);

CREATE TABLE event_windows (
  id BIGSERIAL PRIMARY KEY,

  event_id BIGINT NOT NULL
    REFERENCES events(id)
    ON DELETE CASCADE,

  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,

  CHECK (start_at < end_at)
);

CREATE TABLE participants (
  id BIGSERIAL PRIMARY KEY,

  event_id BIGINT NOT NULL
    REFERENCES events(id)
    ON DELETE CASCADE,

  name TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE availability_ranges (
  id BIGSERIAL PRIMARY KEY,

  participant_id BIGINT NOT NULL
    REFERENCES participants(id)
    ON DELETE CASCADE,

  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,

  CHECK (start_at < end_at)
);