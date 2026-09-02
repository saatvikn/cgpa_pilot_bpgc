BEGIN;

-- Support substring searches in course codes and names.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS courses_code_search_idx
ON courses
USING GIN (course_code gin_trgm_ops);

CREATE INDEX IF NOT EXISTS courses_name_search_idx
ON courses
USING GIN (course_name gin_trgm_ops);

COMMIT;
