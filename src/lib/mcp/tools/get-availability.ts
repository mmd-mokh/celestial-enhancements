import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "get_console_availability",
  title: "Get console availability",
  description:
    "Return per-day booked count and capacity for a console between two dates (inclusive). Use `list_consoles` to get valid slugs.",
  inputSchema: {
    console_slug: z.string().describe("Console slug, e.g. 'ps5' or 'xbox-series-x'."),
    from: z.string().describe("Start date in YYYY-MM-DD."),
    to: z.string().describe("End date in YYYY-MM-DD, inclusive."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ console_slug, from, to }) => {
    const { data, error } = await supabaseAnon().rpc("get_console_availability", {
      _console_slug: console_slug,
      _from: from,
      _to: to,
    });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { availability: data ?? [] },
    };
  },
});