
CREATE OR REPLACE FUNCTION public.get_consoles_remaining()
RETURNS TABLE(slug text, name text, capacity integer, booked integer, remaining integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    c.slug,
    c.name,
    c.quantity AS capacity,
    COALESCE((
      SELECT count(*)::int
      FROM public.bookings b
      WHERE b.console_type = c.slug
        AND b.status IN ('pending','confirmed')
        AND b.start_date IS NOT NULL
        AND b.end_date IS NOT NULL
        AND CURRENT_DATE BETWEEN b.start_date AND b.end_date
    ), 0) AS booked,
    GREATEST(
      c.quantity - COALESCE((
        SELECT count(*)::int
        FROM public.bookings b
        WHERE b.console_type = c.slug
          AND b.status IN ('pending','confirmed')
          AND b.start_date IS NOT NULL
          AND b.end_date IS NOT NULL
          AND CURRENT_DATE BETWEEN b.start_date AND b.end_date
      ), 0),
      0
    ) AS remaining
  FROM public.consoles c
  WHERE c.active
  ORDER BY c.sort_order;
$function$;

GRANT EXECUTE ON FUNCTION public.get_consoles_remaining() TO anon, authenticated, service_role;
