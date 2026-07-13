import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "cancel_booking",
  title: "Cancel booking",
  description: "Cancel one of the signed-in user's own bookings by id.",
  inputSchema: {
    booking_id: z.string().uuid().describe("The booking id to cancel."),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  handler: async ({ booking_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { error } = await supabaseForUser(ctx).rpc("cancel_booking", {
      _booking_id: booking_id,
    });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: "Booking cancelled." }] };
  },
});