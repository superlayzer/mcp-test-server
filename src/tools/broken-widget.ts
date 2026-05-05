import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { BROKEN_WIDGET_HTML } from "./broken-widget-html.js";

const URI = "ui://broken-widget/widget.html";

export function registerBrokenWidgetResource(server: McpServer): void {
  server.registerResource(
    "broken-widget",
    URI,
    { mimeType: "text/html;profile=mcp-app" },
    async () => ({
      contents: [
        {
          uri: URI,
          text: BROKEN_WIDGET_HTML,
          mimeType: "text/html;profile=mcp-app",
        },
      ],
    }),
  );
}

export function registerBrokenWidgetTool(server: McpServer): void {
  server.registerTool(
    "broken_widget",
    {
      title: "Playground Broken Widget",
      description:
        "Renders a widget whose JS never sends ui/initialize. Use to verify the host's 8s handshake-timeout error card and retry path.",
      inputSchema: {},
      _meta: { ui: { resourceUri: URI } },
    },
    async () => ({
      content: [{ type: "text" as const, text: "{}" }],
    }),
  );
}
