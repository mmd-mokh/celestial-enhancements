CREATE OR REPLACE FUNCTION public.get_consoles_with_remaining()
RETURNS TABLE (
  slug text,
  name text,
  tagline text,
  features jsonb,
  icon text,
  accent_from text,
  accent_to text,
  sort_order int,
  capacity int,
  booked int,
  remaining int
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT c.slug,
         c.name,
         c.tagline,
         c.features,
         c.icon,
         c.accent_from,
         c.accent_to,
         c.sort_order,
         r.capacity,
         r.booked,
         r.remaining
  FROM public.consoles c
  LEFT JOIN public.get_consoles_remaining() r ON r.slug = c.slug
  WHERE c.active = true
  ORDER BY c.sort_order ASC;
$$;