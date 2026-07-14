import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/LandingPage";
import { absUrl, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "کنسولتو | اجاره کنسول PS5، Xbox و Nintendo Switch در تهران" },
      {
        name: "description",
        content:
          "اجاره کنسول PS5، Xbox Series X و Nintendo Switch در تهران با تحویل درب منزل، پکیج روزانه تا ماهانه و رزرو آنلاین در ۳ دقیقه.",
      },
      { property: "og:title", content: "کنسولتو - اجاره کنسول بازی PS5 و Xbox در تهران" },
      {
        property: "og:description",
        content:
          "تجربه کنسول‌های نسل جدید بدون خرید میلیونی. اجاره روزانه، هفتگی و ماهانه با تحویل رایگان در تهران.",
      },
      { property: "og:url", content: SITE_URL + "/" },
      { property: "og:image", content: absUrl("/assets/images/home/dashboard.png") },
      { name: "twitter:image", content: absUrl("/assets/images/home/dashboard.png") },
    ],
    links: [
      { rel: "canonical", href: SITE_URL + "/" },
      {
        rel: "preload",
        as: "image",
        href: "/assets/images/home/dashboard.png",
        fetchpriority: "high",
      },
    ],
  }),
  component: () => <LandingPage />,
});