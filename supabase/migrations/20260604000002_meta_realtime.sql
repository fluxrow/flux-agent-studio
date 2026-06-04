-- Enable Supabase Realtime for Meta channel tables.
-- Without this, postgres_changes subscriptions on these tables receive no events.
ALTER PUBLICATION supabase_realtime ADD TABLE public.meta_channel_connections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meta_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meta_messages;
