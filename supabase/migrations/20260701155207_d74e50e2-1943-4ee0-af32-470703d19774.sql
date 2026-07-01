
CREATE TABLE public.consoles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  hourly_rate NUMERIC(10,2),
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.consoles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.consoles TO authenticated;
GRANT ALL ON public.consoles TO service_role;

ALTER TABLE public.consoles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active consoles" ON public.consoles
  FOR SELECT TO anon, authenticated USING (active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert consoles" ON public.consoles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update consoles" ON public.consoles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete consoles" ON public.consoles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_consoles_updated_at BEFORE UPDATE ON public.consoles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  duration_hours NUMERIC(6,2),
  price NUMERIC(12,2) NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  badge TEXT,
  popular BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.packages TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.packages TO authenticated;
GRANT ALL ON public.packages TO service_role;

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active packages" ON public.packages
  FOR SELECT TO anon, authenticated USING (active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert packages" ON public.packages
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update packages" ON public.packages
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete packages" ON public.packages
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed consoles
INSERT INTO public.consoles (slug, name, description, hourly_rate, sort_order) VALUES
  ('ps5', 'PlayStation 5', 'کنسول نسل جدید سونی با گرافیک 4K', 80000, 1),
  ('xbox', 'Xbox Series X', 'قدرتمندترین کنسول مایکروسافت', 75000, 2),
  ('switch', 'Nintendo Switch', 'کنسول هیبریدی برای بازی در هر مکان', 50000, 3);

-- Seed packages
INSERT INTO public.packages (slug, name, description, duration_hours, price, features, badge, popular, sort_order) VALUES
  ('basic', 'پکیج پایه', 'مناسب برای تجربه کوتاه‌مدت', 2, 150000,
    '["۲ ساعت بازی","انتخاب یک کنسول","۲ دسته بازی"]'::jsonb, NULL, false, 1),
  ('standard', 'پکیج استاندارد', 'محبوب‌ترین پکیج ما', 4, 280000,
    '["۴ ساعت بازی","انتخاب کنسول","۴ دسته بازی","نوشیدنی رایگان"]'::jsonb, 'محبوب', true, 2),
  ('premium', 'پکیج ویژه', 'تجربه کامل گیمینگ', 8, 500000,
    '["۸ ساعت بازی","تمام کنسول‌ها","۴ دسته بازی","نوشیدنی و اسنک","اتاق اختصاصی"]'::jsonb, 'ویژه', false, 3);
