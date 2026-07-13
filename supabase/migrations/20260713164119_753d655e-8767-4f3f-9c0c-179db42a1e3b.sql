CREATE INDEX IF NOT EXISTS bookings_console_status_dates_idx
  ON public.bookings (console_type, status, start_date, end_date);

CREATE INDEX IF NOT EXISTS bookings_user_created_idx
  ON public.bookings (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS posts_published_at_idx
  ON public.posts (published, published_at DESC);