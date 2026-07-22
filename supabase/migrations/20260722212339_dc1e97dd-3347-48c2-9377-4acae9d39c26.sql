CREATE TABLE public.payment_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'zarinpal',
  authority text NOT NULL,
  amount_toman integer NOT NULL CHECK (amount_toman > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','failed','cancelled')),
  ref_id text,
  booking_payload jsonb NOT NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX payment_intents_provider_authority_key
  ON public.payment_intents (provider, authority);

GRANT ALL ON public.payment_intents TO service_role;
-- Intentionally NO grants to anon/authenticated: this table is only touched
-- server-side via the service-role client from payment initiation/callback.

ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;

-- No policies defined. With RLS enabled and no policies, anon/authenticated
-- have no access. service_role bypasses RLS.

CREATE TRIGGER update_payment_intents_updated_at
  BEFORE UPDATE ON public.payment_intents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();