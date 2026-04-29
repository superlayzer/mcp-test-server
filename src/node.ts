import { serve } from "@hono/node-server";
import app from "./app.js";

const PORT = Number(process.env.PORT ?? 3006);

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`MCP Test server running on http://localhost:${PORT}/mcp`);
});
