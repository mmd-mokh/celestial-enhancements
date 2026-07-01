
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  console_type TEXT,
  package_type TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.bookings TO anon;
GRANT INSERT ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Public lead capture: anyone may submit a booking request, no one may read.
CREATE POLICY "Anyone can submit a booking"
  ON public.bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(name))  BETWEEN 2 AND 120
    AND length(trim(phone)) BETWEEN 6 AND 30
    AND (console_type IS NULL OR length(console_type) <= 40)
    AND (package_type IS NULL OR length(package_type) <= 40)
    AND (notes IS NULL OR length(notes) <= 1000)
  );
