import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_consoles",
  title: "List consoles",
  description:
    "List the game consoles Gamio currently rents, including slug, name, tagline, and daily capacity.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { data, error } = await supabaseAnon()
      .from("consoles")
      .select("slug,name,tagline,description,quantity,hourly_rate")
      .eq("active", true)
      .order("sort_order");
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { consoles: data ?? [] },
    };
  },
});

const _z = z; // keep import for future schema growth
void _z;