
ALTER TABLE public.consoles
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS features jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS icon text,
  ADD COLUMN IF NOT EXISTS accent_from text,
  ADD COLUMN IF NOT EXISTS accent_to text;

UPDATE public.consoles SET
  tagline = 'نسل جدید بازی با گرافیک 4K و سرعت فوق‌العاده',
  features = '["۲ دسته بی‌سیم","بازی‌های انحصاری","تحویل رایگان در تهران"]'::jsonb,
  icon = 'bi-playstation', accent_from = '#0070d1', accent_to = '#00b4d8'
WHERE slug = 'ps5';

UPDATE public.consoles SET
  tagline = 'قدرتمندترین کنسول با Game Pass نامحدود',
  features = '["Game Pass یک ماهه","سازگاری با نسل قبل","۴K واقعی با ۱۲۰ فریم"]'::jsonb,
  icon = 'bi-xbox', accent_from = '#107c10', accent_to = '#00b894'
WHERE slug = 'xbox';

UPDATE public.consoles SET
  tagline = 'بازی خانوادگی و قابل حمل برای هر جا',
  features = '["قابل حمل و خانگی","بازی‌های خانوادگی","۴ دسته Joy-Con"]'::jsonb,
  icon = 'bi-nintendo-switch', accent_from = '#e60012', accent_to = '#ff6b6b'
WHERE slug = 'switch';
