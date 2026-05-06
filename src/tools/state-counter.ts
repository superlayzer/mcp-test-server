import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { STATE_COUNTER_WIDGET_HTML } from "./state-counter-widget.js";

const URI = "ui://state-counter/widget.html";

export function registerStateCounterResource(server: McpServer): void {
  server.registerResource(
    "state-counter-widget",
    URI,
    { mimeType: "text/html;profile=mcp-app" },
    async () => ({
      contents: [
        {
          uri: URI,
          text: STATE_COUNTER_WIDGET_HTML,
          mimeType: "text/html;profile=mcp-app",
        },
      ],
    }),
  );
}

export function registerStateCounterTool(server: McpServer): void {
  server.registerTool(
    "state_counter",
    {
      title: "Playground State Counter",
      description:
        "Renders a counter widget that persists its value via the MCP Apps state API. Use to verify ui/state/get and ui/state/set end-to-end and to demonstrate the size-cap error path.",
      inputSchema: {},
      _meta: { ui: { resourceUri: URI } },
    },
    async () => ({
      content: [{ type: "text" as const, text: "{}" }],
    }),
  );
}
