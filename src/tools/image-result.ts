import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// 16x16 checkerboard PNG (red/blue tiles). Small enough to inline,
// large enough to render visibly in a host's chat UI. Shared with
// multi-content so both tools emit the same easily-recognised image.
export const SAMPLE_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAKElEQVR4nGN4oODwH4QVFBrAmFQ+A8UGkKsRxqfcgNEwGA2D0TAAYwBaU/8Q8AGPeQAAAABJRU5ErkJggg==";

export function registerImageResult(server: McpServer): void {
  server.registerTool(
    "image_result",
    {
      title: "Image Result",
      description:
        "Returns a base64 PNG as image content. Use to verify the host renders inline `image` content items from a tool result.",
      inputSchema: {},
    },
    async () => ({
      content: [
        {
          type: "image" as const,
          data: SAMPLE_PNG_BASE64,
          mimeType: "image/png",
        },
      ],
    }),
  );
}
