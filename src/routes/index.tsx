import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/LandingPage";
import { absUrl, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:url", content: SITE_URL + "/" },
      { property: "og:image", content: absUrl("/assets/images/home/dashboard.png") },
      { name: "twitter:image", content: absUrl("/assets/images/home/dashboard.png") },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/" }],
  }),
  component: () => <LandingPage />,
});