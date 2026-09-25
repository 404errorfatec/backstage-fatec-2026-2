CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  protocol_code TEXT NOT NULL UNIQUE,
  reporter_name TEXT NOT NULL,
  photo_path TEXT NOT NULL,
  photo_original_name TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  manual_street TEXT,
  manual_number TEXT,
  manual_district TEXT,
  manual_city TEXT,
  location_source TEXT NOT NULL CHECK (location_source IN ('gps', 'manual')),
  status TEXT NOT NULL DEFAULT 'na_fila',
  created_at TEXT NOT NULL DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'now')),
  status_updated_at TEXT NOT NULL DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports (created_at DESC);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports (status);
