CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  slot_minutes INTEGER NOT NULL,
  required_minutes INTEGER NOT NULL,

  timezone TEXT NOT NULL DEFAULT 'Asia/Tokyo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE event_slots (
  id BIGSERIAL PRIMARY KEY,

  event_id BIGINT NOT NULL
    REFERENCES events(id)
    ON DELETE CASCADE,

  start_at TIMESTAMPTZ NOT NULL,

  UNIQUE (event_id, start_at)
);

CREATE TABLE participants (
  id BIGSERIAL PRIMARY KEY,

  event_id BIGINT NOT NULL
    REFERENCES events(id)
    ON DELETE CASCADE,

  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE availability (
  participant_id BIGINT NOT NULL
    REFERENCES participants(id)
    ON DELETE CASCADE,

  event_slot_id BIGINT NOT NULL
    REFERENCES event_slots(id)
    ON DELETE CASCADE,

  status SMALLINT NOT NULL
    CHECK (status IN (0, 1, 2)),

  PRIMARY KEY (participant_id, event_slot_id)
);