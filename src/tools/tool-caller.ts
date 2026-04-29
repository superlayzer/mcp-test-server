import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TOOL_CALLER_WIDGET_HTML } from "./tool-caller-widget.js";

export function registerToolCaller(server: McpServer): void {
  server.registerTool(
    "tool_caller",
    {
      title: "Playground Tool Caller",
      description:
        "Renders a widget that invokes other tools on the same MCP server via ui/request-tool-call. Use to verify same-server tool invocation end-to-end and to demonstrate the error path for missing tools.",
      inputSchema: {},
      _meta: { ui: { resourceUri: "ui://tool-caller/widget.html" } },
    },
    async () => ({
      content: [{ type: "text" as const, text: "{}" }],
    }),
  );

  server.registerResource(
    "tool-caller-widget",
    "ui://tool-caller/widget.html",
    { mimeType: "text/html;profile=mcp-app" },
    async () => ({
      contents: [
        {
          uri: "ui://tool-caller/widget.html",
          text: TOOL_CALLER_WIDGET_HTML,
          mimeType: "text/html;profile=mcp-app",
        },
      ],
    }),
  );
}
