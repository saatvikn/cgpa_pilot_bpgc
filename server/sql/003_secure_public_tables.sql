BEGIN;

-- Block direct Data API access to backend-owned tables.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semester_courses ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE
  public.users,
  public.courses,
  public.semesters,
  public.semester_courses
FROM anon, authenticated;

COMMIT;