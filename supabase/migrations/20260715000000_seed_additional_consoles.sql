-- Seed the three additional consoles (PS4, Xbox Series S, Xbox One) so the
-- booking dialog shows a stable set of 6 bookable consoles. Idempotent:
-- INSERT ... ON CONFLICT (slug) DO NOTHING.
INSERT INTO public.consoles (slug, name, description, image_url, sort_order, active, hourly_rate, tagline, features, icon, accent_from, accent_to, quantity)
VALUES
  (
    'ps4',
    'PlayStation 4',
    'کنسول کلاسیک و محبوب سونی با کتابخانه بازی‌های غنی.',
    NULL,
    2,
    true,
    80000,
    'کلاسیک محبوب سونی',
    '["بازی‌های انحصاری متنوع", "سازگاری با تلویزیون‌های قدیمی", "تحویل رایگان در تهران"]'::jsonb,
    'bi-playstation',
    '#003791',
    '#6c5ce7',
    1
  ),
  (
    'xbox-series-s',
    'Xbox Series S',
    'نسل جدید ایکس‌باکس با طراحی فشرده و قیمت مناسب.',
    NULL,
    4,
    true,
    75000,
    'نسل جدید، فشرده',
    '["Game Pass یک ماهه", "۴K با نرخ فریم بالا", "طراحی جمع‌وجور"]'::jsonb,
    'bi-xbox',
    '#107c10',
    '#00cec9',
    1
  ),
  (
    'xbox-one',
    'Xbox One',
    'انتخاب مقرون‌به‌صرفه برای تجربه بازی‌های ایکس‌باکس.',
    NULL,
    5,
    true,
    75000,
    'انتخاب مقرون‌به‌صرفه',
    '["کتابخانه بازی‌های متنوع", "سازگاری با لوازم جانبی", "تحویل رایگان در تهران"]'::jsonb,
    'bi-xbox',
    '#107c10',
    '#a29bfe',
    1
  )
ON CONFLICT (slug) DO NOTHING;
