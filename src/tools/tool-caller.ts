import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TOOL_CALLER_WIDGET_HTML } from "./tool-caller-widget.js";

const URI = "ui://tool-caller/widget.html";

export function registerToolCallerResource(server: McpServer): void {
  server.registerResource(
    "tool-caller-widget",
    URI,
    { mimeType: "text/html;profile=mcp-app" },
    async () => ({
      contents: [
        {
          uri: URI,
          text: TOOL_CALLER_WIDGET_HTML,
          mimeType: "text/html;profile=mcp-app",
        },
      ],
    }),
  );
}

export function registerToolCallerTool(server: McpServer): void {
  server.registerTool(
    "tool_caller",
    {
      title: "Playground Tool Caller",
      description:
        "Renders a widget that invokes other tools on the same MCP server via standard MCP tools/call. Use to verify same-server tool invocation end-to-end and to demonstrate the error path for missing tools.",
      inputSchema: {},
      _meta: { ui: { resourceUri: URI } },
    },
    async () => ({
      content: [{ type: "text" as const, text: "{}" }],
    }),
  );
}
