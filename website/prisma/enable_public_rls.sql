-- Enable Row-Level Security on all tables in the public schema.
-- This is safe for the current app because browser clients do not query
-- tables directly; all database access goes through server-side Prisma.

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
  END LOOP;
END
$$;
