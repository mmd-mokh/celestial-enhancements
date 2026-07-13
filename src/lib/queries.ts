import { queryOptions } from "@tanstack/react-query";
import { getConsoles } from "@/lib/consoles.functions";
import { listPublishedPosts, getPublishedPost } from "@/lib/posts.functions";

export const consolesQueryOptions = () =>
  queryOptions({
    queryKey: ["consoles"],
    queryFn: () => getConsoles(),
    staleTime: 5 * 60 * 1000,
  });

export const blogListQueryOptions = () =>
  queryOptions({
    queryKey: ["posts", "list"],
    queryFn: () => listPublishedPosts(),
    staleTime: 5 * 60 * 1000,
  });

export const blogPostQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["posts", "detail", slug],
    queryFn: () => getPublishedPost({ data: { slug } }),
    staleTime: 5 * 60 * 1000,
  });