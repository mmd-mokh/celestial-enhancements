/**
 * Use-case landing pages (`/rent/$slug`). Each entry targets a Persian
 * seasonal / occasion keyword: مهمانی، نوروز، جشن تولد.
 */
export type RentContent = {
  slug: string;
  seoTitle: string;
  seoDescription: string;
  hero: { eyebrow: string; heading: string; subheading: string };
  benefits: { icon: string; title: string; body: string }[];
  suggestedPackage: string; // slug from PACKAGES
  ctaLabel: string;
};

export const RENT_CONTENT: Record<string, RentContent> = {
  party: {
    slug: "party",
    seoTitle: "اجاره کنسول برای مهمانی | Nintendo Switch و PS5 | کنسولتو",
    seoDescription:
      "برای مهمانی، دورهمی و شب‌نشینی، کنسول اجاره کن. بازی‌های چندنفره Mario Kart، FIFA و Just Dance با تحویل سریع درب منزل در تهران.",
    hero: {
      eyebrow: "مهمانی و دورهمی",
      heading: "اجاره کنسول برای مهمانی و شب‌نشینی",
      subheading:
        "شب دورهمی بی‌نظیر با Mario Kart، Just Dance و FIFA. کنسول را ما می‌آوریم، خنده و رقابت با شما.",
    },
    benefits: [
      {
        icon: "bi-people-fill",
        title: "بازی‌های چندنفره",
        body: "تا ۴ نفر همزمان روی یک کنسول — Nintendo Switch بهترین انتخاب برای مهمانی است.",
      },
      {
        icon: "bi-truck",
        title: "تحویل همان روز",
        body: "کمتر از ۲ ساعت پس از رزرو، کنسول و دو دسته در محل مهمانی است.",
      },
      {
        icon: "bi-piggy-bank-fill",
        title: "هزینه مقرون‌به‌صرفه",
        body: "پکیج آخر هفته با ۱۳٪ صرفه‌جویی — بدون خرید میلیونی کنسول.",
      },
    ],
    suggestedPackage: "weekend",
    ctaLabel: "پکیج آخر هفته را رزرو کن",
  },
  nowruz: {
    slug: "nowruz",
    seoTitle: "اجاره کنسول بازی برای نوروز ۱۴۰۴ | تعطیلات پرهیجان | کنسولتو",
    seoDescription:
      "تعطیلات نوروز را با اجاره PS5، Xbox یا Nintendo Switch به یک تجربه فراموش‌نشدنی تبدیل کن. پکیج ویژه ۱۳ روزه با تحویل تهران.",
    hero: {
      eyebrow: "نوروز و تعطیلات",
      heading: "اجاره کنسول برای تعطیلات نوروز",
      subheading:
        "سیزده روز تعطیلات، سیزده روز بازی. کنسول موردعلاقه‌ات را برای کل نوروز اجاره کن و با خانواده لحظه‌های خاطره‌انگیز بساز.",
    },
    benefits: [
      {
        icon: "bi-calendar-heart",
        title: "برنامه تعطیلات کامل",
        body: "پکیج ماهانه یا هفتگی، متناسب با تعطیلات ۱۳ روزه نوروز.",
      },
      {
        icon: "bi-house-heart-fill",
        title: "سرگرمی خانوادگی",
        body: "بازی‌های Nintendo و PS5 برای همه سنین — از بچه تا بزرگ‌تر.",
      },
      {
        icon: "bi-shield-check",
        title: "بیمه کامل",
        body: "خیالت راحت — همه کنسول‌ها بیمه‌اند، خرابی غیرعمدی مشکلی نیست.",
      },
    ],
    suggestedPackage: "monthly",
    ctaLabel: "پکیج نوروزی را رزرو کن",
  },
  birthday: {
    slug: "birthday",
    seoTitle: "اجاره کنسول برای جشن تولد | هدیه غافلگیرکننده | کنسولتو",
    seoDescription:
      "برای جشن تولد یک روز خاطره‌انگیز بساز — Nintendo Switch یا PS5 با تحویل رایگان در تهران، بدون نگرانی از هزینه خرید.",
    hero: {
      eyebrow: "جشن تولد",
      heading: "اجاره کنسول برای جشن تولد",
      subheading:
        "غافلگیری بی‌نظیر برای تولد بچه‌ها یا دوست گیمرت — کنسول را برای یک روز اجاره کن و بدون هزینه سنگین جشن به یاد ماندنی بساز.",
    },
    benefits: [
      {
        icon: "bi-gift-fill",
        title: "هدیه ویژه",
        body: "جایگزین شگفت‌انگیز کیک و شمع — تجربه‌ای که فراموش نمی‌شود.",
      },
      {
        icon: "bi-clock-history",
        title: "پکیج روزانه",
        body: "فقط برای یک روز جشن اجاره کن — بدون تعهد بلندمدت.",
      },
      {
        icon: "bi-emoji-laughing-fill",
        title: "بازی برای همه",
        body: "Mario Party و Just Dance، مناسب مهمان‌های همه سنین.",
      },
    ],
    suggestedPackage: "daily",
    ctaLabel: "پکیج روزانه را رزرو کن",
  },
};

export const RENT_SLUGS = Object.keys(RENT_CONTENT);