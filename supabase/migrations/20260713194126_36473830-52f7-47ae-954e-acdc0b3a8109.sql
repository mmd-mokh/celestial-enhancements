-- 1. Reset table grants to least-privilege
REVOKE ALL ON public.bookings, public.consoles, public.contact_messages,
              public.newsletter_subscribers, public.packages, public.posts,
              public.user_roles
  FROM anon, authenticated;

-- anon: only what the "Anyone can ..." policies allow
GRANT INSERT ON public.bookings TO anon;
GRANT SELECT ON public.consoles TO anon;
GRANT INSERT ON public.contact_messages TO anon;
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT SELECT ON public.packages TO anon;
GRANT SELECT ON public.posts TO anon;
-- no grants on user_roles for anon

-- authenticated: standard CRUD (RLS scopes it)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consoles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.packages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;

-- service_role bypasses RLS but still needs grants
GRANT ALL ON public.bookings, public.consoles, public.contact_messages,
             public.newsletter_subscribers, public.packages, public.posts,
             public.user_roles
  TO service_role;

-- 2. Missing admin policies on newsletter_subscribers
CREATE POLICY "Admins can view newsletter subscribers"
  ON public.newsletter_subscribers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete newsletter subscribers"
  ON public.newsletter_subscribers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Missing admin policies on user_roles
CREATE POLICY "Admins can view all user roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert user roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update user roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete user roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));