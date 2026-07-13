import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { sanitizeHtml } from "@/lib/sanitize";
import { blogPostQueryOptions } from "@/lib/queries";
import { absUrl, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ context, params }) => {
    const post = await context.queryClient.ensureQueryData(blogPostQueryOptions(params.slug));
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.post;
    const url = absUrl(`/blog/${params.slug}`);
    if (!p) {
      return {
        meta: [
          { title: "بلاگ گیمیو" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const image = p.cover_url ? absUrl(p.cover_url) : undefined;
    return {
      meta: [
        { title: `${p.title} | بلاگ گیمیو` },
        { name: "description", content: p.excerpt ?? p.title },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.excerpt ?? p.title },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        ...(image ? [{ property: "og:image" as const, content: image }] : []),
        ...(image ? [{ name: "twitter:image" as const, content: image }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: p.title,
          description: p.excerpt ?? undefined,
          image: image ?? undefined,
          datePublished: p.published_at ?? undefined,
          dateModified: p.published_at ?? undefined,
          author: { "@type": "Organization", name: "گیمیو" },
          publisher: {
            "@type": "Organization",
            name: "گیمیو",
            logo: { "@type": "ImageObject", url: absUrl("/assets/logo/logo1.png") },
          },
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
          inLanguage: "fa-IR",
          keywords: (p.tags ?? []).join(", "),
          url: SITE_URL,
        }) },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <div dir="rtl" className="min-h-dvh flex items-center justify-center p-6 text-center">
      <div>
        <p className="text-muted-foreground mb-4">{(error as Error).message}</p>
        <Link to="/blog" className="text-primary hover:underline">بازگشت به بلاگ</Link>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div dir="rtl" className="min-h-dvh flex items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-3xl font-bold mb-2">مطلب پیدا نشد</h1>
        <Link to="/blog" className="text-primary hover:underline">بازگشت به بلاگ</Link>
      </div>
    </div>
  ),
  component: PostPage,
});

function PostPage() {
  const { slug } = Route.useParams();
  const { data: postData } = useSuspenseQuery(blogPostQueryOptions(slug));
  const post = postData!;
  const [html, setHtml] = useState("");
  useEffect(() => {
    // Simple line-break + paragraph rendering (content is plain text/markdown-ish).
    setHtml(
      (post.content as string)
        .split(/\n{2,}/)
        .map((para: string) => `<p>${para.replace(/\n/g, "<br/>")}</p>`)
        .join(""),
    );
  }, [post.content]);

  return (
    <div dir="rtl" className="min-h-dvh bg-background" style={{ fontFamily: "Vazirmatn, sans-serif" }}>
      <article className="mx-auto max-w-3xl px-6 py-10 space-y-6">
        <nav className="text-sm">
          <Link to="/" className="text-muted-foreground hover:text-foreground">خانه</Link>
          <span className="text-muted-foreground mx-1">/</span>
          <Link to="/blog" className="text-muted-foreground hover:text-foreground">بلاگ</Link>
        </nav>
        <header className="space-y-3">
          <h1 className="text-4xl font-bold leading-tight">{post.title}</h1>
          {post.published_at && (
            <p className="text-sm text-muted-foreground">{new Date(post.published_at).toLocaleDateString("fa-IR")}</p>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(post.tags as string[]).map((t: string) => (
                <span key={t} className="inline-block text-xs bg-muted px-2 py-1 rounded">{t}</span>
              ))}
            </div>
          )}
        </header>
        {post.cover_url && (
          <div className="aspect-video overflow-hidden rounded-lg bg-muted">
            <img src={post.cover_url} alt={post.title} className="size-full object-cover" />
          </div>
        )}
        <div
          className="prose prose-neutral dark:prose-invert max-w-none leading-8"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
        />
      </article>
    </div>
  );
}