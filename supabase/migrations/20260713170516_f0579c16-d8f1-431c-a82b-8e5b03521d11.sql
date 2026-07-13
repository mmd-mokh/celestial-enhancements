CREATE OR REPLACE FUNCTION public.rate_limit_contact_messages()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _recent int;
BEGIN
  IF NEW.email IS NULL AND NEW.phone IS NULL THEN RETURN NEW; END IF;
  SELECT count(*) INTO _recent FROM public.contact_messages
   WHERE created_at > now() - interval '1 hour'
     AND ((NEW.email IS NOT NULL AND email = NEW.email)
       OR (NEW.phone IS NOT NULL AND phone = NEW.phone));
  IF _recent >= 5 THEN RAISE EXCEPTION 'rate_limited' USING ERRCODE = 'check_violation'; END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_rate_limit_contact_messages ON public.contact_messages;
CREATE TRIGGER trg_rate_limit_contact_messages
  BEFORE INSERT ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.rate_limit_contact_messages();

CREATE OR REPLACE FUNCTION public.rate_limit_newsletter_subscribers()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _recent int;
BEGIN
  SELECT count(*) INTO _recent FROM public.newsletter_subscribers
   WHERE created_at > now() - interval '1 hour' AND email = NEW.email;
  IF _recent >= 3 THEN RAISE EXCEPTION 'rate_limited' USING ERRCODE = 'check_violation'; END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_rate_limit_newsletter_subscribers ON public.newsletter_subscribers;
CREATE TRIGGER trg_rate_limit_newsletter_subscribers
  BEFORE INSERT ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.rate_limit_newsletter_subscribers();

CREATE INDEX IF NOT EXISTS contact_messages_email_created_idx
  ON public.contact_messages (email, created_at DESC);
CREATE INDEX IF NOT EXISTS contact_messages_phone_created_idx
  ON public.contact_messages (phone, created_at DESC);
CREATE INDEX IF NOT EXISTS newsletter_subscribers_email_created_idx
  ON public.newsletter_subscribers (email, created_at DESC);