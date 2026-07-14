import { queryOptions } from "@tanstack/react-query";
import { getConsoles, getConsoleBySlug } from "@/lib/consoles.functions";
import { listPublishedPosts, getPublishedPost } from "@/lib/posts.functions";

export const consolesQueryOptions = () =>
  queryOptions({
    queryKey: ["consoles"],
    queryFn: () => getConsoles(),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

export const consoleBySlugQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["consoles", "detail", slug],
    queryFn: () => getConsoleBySlug({ data: { slug } }),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

export const blogListQueryOptions = () =>
  queryOptions({
    queryKey: ["posts", "list"],
    queryFn: () => listPublishedPosts(),
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

export const blogPostQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["posts", "detail", slug],
    queryFn: () => getPublishedPost({ data: { slug } }),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });