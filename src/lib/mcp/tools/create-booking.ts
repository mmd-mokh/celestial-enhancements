import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_booking",
  title: "Create booking",
  description:
    "Create a new console-rental booking for the signed-in user. Dates are inclusive (YYYY-MM-DD). Use `get_console_availability` first to confirm a slot is free.",
  inputSchema: {
    name: z.string().min(2).describe("Full name for the booking."),
    phone: z.string().min(6).describe("Contact phone number."),
    console_slug: z.string().describe("Console slug from list_consoles, e.g. 'ps5'."),
    package_type: z
      .string()
      .describe("Package name, e.g. 'daily', 'weekend', 'weekly', 'monthly'."),
    start_date: z.string().describe("Start date YYYY-MM-DD."),
    end_date: z.string().describe("End date YYYY-MM-DD, inclusive."),
    notes: z.string().optional().describe("Optional notes for the booking."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx).rpc("create_booking", {
      _name: input.name,
      _phone: input.phone,
      _console_type: input.console_slug,
      _package_type: input.package_type,
      _start_date: input.start_date,
      _end_date: input.end_date,
      _notes: input.notes ?? null,
    });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Booking created: ${String(data)}` }],
      structuredContent: { booking_id: data },
    };
  },
});