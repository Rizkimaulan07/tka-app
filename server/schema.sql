-- Skema database SiapTKA
-- Jalankan lewat: npm run db:setup

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_option_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  explanation TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS questions_subject_idx ON questions (subject_id);
CREATE INDEX IF NOT EXISTS questions_sort_idx ON questions (sort_order);

CREATE TABLE IF NOT EXISTS attempts (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  exam_title TEXT NOT NULL,
  subject_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  flagged JSONB NOT NULL DEFAULT '[]'::jsonb,
  score INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  total INTEGER NOT NULL,
  time_spent_seconds INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS attempts_finished_idx ON attempts (finished_at DESC);

CREATE TABLE IF NOT EXISTS student_recaps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  progress INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  submitted_at TEXT NOT NULL DEFAULT '—'
);

CREATE TABLE IF NOT EXISTS classes (
  class_name TEXT PRIMARY KEY,
  students INTEGER NOT NULL,
  average INTEGER NOT NULL
);
