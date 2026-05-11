import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { BLOB_WIDGET_HTML } from "./blob-widget-html.js";

const URI = "ui://blob-widget/widget.html";

// Every other widget here serves HTML via `text`. This one uses
// SEP-1865's `blob` (base64) alternative so hosts can verify their
// decoder — particularly the multi-byte UTF-8 path atob mishandles.
const BLOB_WIDGET_BASE64 = Buffer.from(BLOB_WIDGET_HTML, "utf-8").toString(
  "base64",
);

export function registerBlobWidgetResource(server: McpServer): void {
  server.registerResource(
    "blob-widget",
    URI,
    { mimeType: "text/html;profile=mcp-app" },
    async () => ({
      contents: [
        {
          uri: URI,
          blob: BLOB_WIDGET_BASE64,
          mimeType: "text/html;profile=mcp-app",
        },
      ],
    }),
  );
}

export function registerBlobWidgetTool(server: McpServer): void {
  server.registerTool(
    "blob_widget",
    {
      title: "Blob Widget (base64 resource delivery)",
      description:
        "Renders a widget whose HTML is delivered as a base64-encoded `blob` instead of plaintext `text`. Use to verify the host decodes SEP-1865 UI resources correctly, including multi-byte UTF-8 characters.",
      inputSchema: {},
      _meta: { ui: { resourceUri: URI } },
    },
    async () => ({
      content: [{ type: "text" as const, text: "{}" }],
    }),
  );
}
