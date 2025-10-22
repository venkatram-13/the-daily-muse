-- Add starred column to diary_entries
ALTER TABLE public.diary_entries
ADD COLUMN starred boolean DEFAULT false NOT NULL;