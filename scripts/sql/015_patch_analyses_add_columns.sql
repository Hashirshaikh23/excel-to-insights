-- Safe, idempotent patch: only adds the column if it doesn't already exist.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'analyses'
      AND column_name = 'columns'
  ) THEN
    ALTER TABLE public.analyses
      ADD COLUMN columns jsonb;
  END IF;
END
$$;

-- Optional: ensure helpful defaults exist (no-ops if present)
ALTER TABLE public.analyses
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS x_axis text,
  ADD COLUMN IF NOT EXISTS y_axis text,
  ADD COLUMN IF NOT EXISTS chart_type text,
  ADD COLUMN IF NOT EXISTS data jsonb,
  ADD COLUMN IF NOT EXISTS source_filename text;
