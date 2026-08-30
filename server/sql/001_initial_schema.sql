BEGIN;

-- Enable random UUID generation.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT users_email_unique
    UNIQUE (email)
);

-- Shared master course catalogue.
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code TEXT NOT NULL,
  course_name TEXT NOT NULL,
  credits SMALLINT NOT NULL,
  department TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT courses_code_unique
    UNIQUE (course_code),

  CONSTRAINT courses_credits_positive
    CHECK (credits > 0)
);

CREATE TABLE semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  semester_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT semesters_user_fk
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT semesters_name_not_blank
    CHECK (CHAR_LENGTH(TRIM(name)) BETWEEN 1 AND 100),

  CONSTRAINT semesters_order_positive
    CHECK (semester_order > 0),

  CONSTRAINT semesters_user_order_unique
    UNIQUE (user_id, semester_order)
);

-- Courses selected inside individual semesters.
CREATE TABLE semester_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  semester_id UUID NOT NULL,
  course_id UUID NOT NULL,
  grade TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT semester_courses_semester_fk
    FOREIGN KEY (semester_id)
    REFERENCES semesters(id)
    ON DELETE CASCADE,

  CONSTRAINT semester_courses_course_fk
    FOREIGN KEY (course_id)
    REFERENCES courses(id)
    ON DELETE RESTRICT,

  CONSTRAINT semester_courses_grade_valid
    CHECK (
      grade IS NULL
      OR grade IN ('A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'E')
    ),

  CONSTRAINT semester_courses_pair_unique
    UNIQUE (semester_id, course_id)
);

COMMIT; 