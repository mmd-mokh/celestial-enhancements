import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/LandingPage";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "قیمت اجاره کنسول بازی | پکیج‌های روزانه تا ماهانه | گیمیو" },
      {
        name: "description",
        content:
          "تعرفه اجاره کنسول در گیمیو: پکیج روزانه، آخر هفته، هفتگی و ماهانه. بدون هزینه پنهان، شامل بیمه و ارسال رایگان در تهران.",
      },
      { property: "og:title", content: "قیمت اجاره کنسول در گیمیو" },
      {
        property: "og:description",
        content: "پکیج‌های منعطف روزانه، آخر هفته، هفتگی و ماهانه — بدون هزینه پنهان.",
      },
      { property: "og:url", content: "/pricing" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/pricing" }],
  }),
  component: () => <LandingPage scrollTo="pricing" />,
});