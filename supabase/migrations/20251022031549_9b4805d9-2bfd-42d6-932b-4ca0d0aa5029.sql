-- Enable realtime for diary_entries table
ALTER TABLE public.diary_entries REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.diary_entries;