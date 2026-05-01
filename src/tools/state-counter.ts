import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { STATE_COUNTER_WIDGET_HTML } from "./state-counter-widget.js";

export function registerStateCounter(server: McpServer): void {
  server.registerTool(
    "state_counter",
    {
      title: "Playground State Counter",
      description:
        "Renders a counter widget that persists its value via the MCP Apps state API. Use to verify ui/state/get and ui/state/set end-to-end and to demonstrate the size-cap error path.",
      inputSchema: {},
      _meta: { ui: { resourceUri: "ui://state-counter/widget.html" } },
    },
    async () => ({
      content: [{ type: "text" as const, text: "{}" }],
    }),
  );

  server.registerResource(
    "state-counter-widget",
    "ui://state-counter/widget.html",
    { mimeType: "text/html;profile=mcp-app" },
    async () => ({
      contents: [
        {
          uri: "ui://state-counter/widget.html",
          text: STATE_COUNTER_WIDGET_HTML,
          mimeType: "text/html;profile=mcp-app",
        },
      ],
    }),
  );
}
