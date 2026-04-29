import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { BROKEN_WIDGET_HTML } from "./broken-widget-html.js";

export function registerBrokenWidget(server: McpServer): void {
  server.registerTool(
    "broken_widget",
    {
      title: "Playground Broken Widget",
      description:
        "Renders a widget whose JS never sends ui/initialize. Use to verify the host's 8s handshake-timeout error card and retry path.",
      inputSchema: {},
      _meta: { ui: { resourceUri: "ui://broken-widget/widget.html" } },
    },
    async () => ({
      content: [{ type: "text" as const, text: "{}" }],
    }),
  );

  server.registerResource(
    "broken-widget",
    "ui://broken-widget/widget.html",
    { mimeType: "text/html;profile=mcp-app" },
    async () => ({
      contents: [
        {
          uri: "ui://broken-widget/widget.html",
          text: BROKEN_WIDGET_HTML,
          mimeType: "text/html;profile=mcp-app",
        },
      ],
    }),
  );
}
