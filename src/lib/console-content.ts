/**
 * Per-console editorial content used by `/consoles/$slug` landing pages.
 * SEO copy, popular games, and specs — one entry per active console slug.
 */
export type ConsoleContent = {
  slug: string;
  seoTitle: string;
  seoDescription: string;
  hero: {
    heading: string;
    subheading: string;
    keyword: string;
  };
  specs: { label: string; value: string }[];
  popularGames: string[];
  price: { from: string; period: string };
  /** Numeric price for schema.org offer (IRR). */
  priceIRR: string;
};

export const CONSOLE_CONTENT: Record<string, ConsoleContent> = {
  ps5: {
    slug: "ps5",
    seoTitle: "اجاره PS5 در تهران | پلی‌استیشن ۵ با تحویل درب منزل | گیمیو",
    seoDescription:
      "اجاره PlayStation 5 در تهران با دو دسته DualSense، بازی‌های انحصاری و تحویل رایگان درب منزل. رزرو آنلاین در ۳ دقیقه.",
    hero: {
      heading: "اجاره PlayStation 5 در تهران",
      subheading:
        "قدرت گرافیکی نسل جدید، بازی‌های انحصاری Sony و SSD فوق‌سریع — همه در چند کلیک.",
      keyword: "اجاره PS5 تهران",
    },
    specs: [
      { label: "پردازنده", value: "AMD Zen 2 هشت‌هسته‌ای" },
      { label: "گرافیک", value: "AMD RDNA 2 (10.28 TFLOPS)" },
      { label: "حافظه", value: "825GB SSD فوق‌سریع" },
      { label: "خروجی تصویر", value: "4K HDR تا 120Hz" },
      { label: "دسته", value: "دو عدد DualSense" },
    ],
    popularGames: [
      "God of War Ragnarök",
      "Spider-Man 2",
      "Horizon Forbidden West",
      "Gran Turismo 7",
      "The Last of Us Part I",
      "Demon's Souls",
    ],
    price: { from: "۲۵۰,۰۰۰", period: "تومان از هر روز" },
    priceIRR: "250000",
  },
  "xbox-series-x": {
    slug: "xbox-series-x",
    seoTitle: "اجاره Xbox Series X در تهران | ایکس‌باکس با Game Pass | گیمیو",
    seoDescription:
      "اجاره Xbox Series X با دسترسی به Game Pass، دو دسته و تحویل رایگان در تهران. پکیج روزانه، هفتگی و ماهانه.",
    hero: {
      heading: "اجاره Xbox Series X در تهران",
      subheading:
        "قدرتمندترین کنسول مایکروسافت با کتابخانه Game Pass — صدها بازی، یک کنسول.",
      keyword: "اجاره Xbox Series X تهران",
    },
    specs: [
      { label: "پردازنده", value: "AMD Zen 2 هشت‌هسته‌ای" },
      { label: "گرافیک", value: "AMD RDNA 2 (12 TFLOPS)" },
      { label: "حافظه", value: "1TB SSD NVMe" },
      { label: "خروجی تصویر", value: "4K HDR تا 120Hz، آماده 8K" },
      { label: "دسته", value: "دو عدد Xbox Wireless Controller" },
    ],
    popularGames: [
      "Forza Horizon 5",
      "Halo Infinite",
      "Starfield",
      "Sea of Thieves",
      "Microsoft Flight Simulator",
      "Gears 5",
    ],
    price: { from: "۲۵۰,۰۰۰", period: "تومان از هر روز" },
    priceIRR: "250000",
  },
  "nintendo-switch": {
    slug: "nintendo-switch",
    seoTitle: "اجاره Nintendo Switch در تهران | نینتندو سوییچ خانوادگی | گیمیو",
    seoDescription:
      "اجاره Nintendo Switch با بازی‌های خانوادگی مثل Mario Kart و Zelda، تحویل رایگان درب منزل در تهران و پکیج‌های منعطف.",
    hero: {
      heading: "اجاره Nintendo Switch در تهران",
      subheading:
        "بهترین انتخاب برای مهمانی‌های خانوادگی و بازی گروهی — قابل حمل و همیشه سرگرم‌کننده.",
      keyword: "اجاره نینتندو سوییچ",
    },
    specs: [
      { label: "پردازنده", value: "NVIDIA Tegra X1" },
      { label: "حالت‌ها", value: "TV، رومیزی، دستی" },
      { label: "حافظه", value: "32GB داخلی + کارت حافظه" },
      { label: "خروجی تصویر", value: "1080p در حالت TV، 720p در حالت دستی" },
      { label: "دسته", value: "دو عدد Joy-Con" },
    ],
    popularGames: [
      "Mario Kart 8 Deluxe",
      "The Legend of Zelda: Tears of the Kingdom",
      "Super Smash Bros. Ultimate",
      "Super Mario Odyssey",
      "Animal Crossing: New Horizons",
      "Splatoon 3",
    ],
    price: { from: "۲۰۰,۰۰۰", period: "تومان از هر روز" },
    priceIRR: "200000",
  },
};

export const CONSOLE_SLUGS = Object.keys(CONSOLE_CONTENT);