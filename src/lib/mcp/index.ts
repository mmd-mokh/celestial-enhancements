import { auth, defineMcp } from "@lovable.dev/mcp-js";

import listConsolesTool from "./tools/list-consoles";
import listMyBookingsTool from "./tools/list-my-bookings";
import createBookingTool from "./tools/create-booking";
import cancelBookingTool from "./tools/cancel-booking";
import getAvailabilityTool from "./tools/get-availability";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "gamio-mcp",
  title: "Gamio",
  version: "0.1.0",
  instructions:
    "Tools for Gamio, a console-rental service. Use these to browse available consoles, check availability, and manage the signed-in user's own bookings.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listConsolesTool,
    getAvailabilityTool,
    listMyBookingsTool,
    createBookingTool,
    cancelBookingTool,
  ],
});