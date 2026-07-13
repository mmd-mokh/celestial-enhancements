import { queryOptions } from "@tanstack/react-query";
import { getConsoles } from "@/lib/consoles.functions";

export const consolesQueryOptions = () =>
  queryOptions({
    queryKey: ["consoles"],
    queryFn: () => getConsoles(),
    staleTime: 5 * 60 * 1000,
  });