
DROP POLICY IF EXISTS "Anyone can view active consoles" ON public.consoles;
DROP POLICY IF EXISTS "Anyone can view active packages" ON public.packages;

CREATE POLICY "Public can view active consoles"
ON public.consoles FOR SELECT TO anon, authenticated
USING (active = true);

CREATE POLICY "Admins can view all consoles"
ON public.consoles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view active packages"
ON public.packages FOR SELECT TO anon, authenticated
USING (active = true);

CREATE POLICY "Admins can view all packages"
ON public.packages FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
