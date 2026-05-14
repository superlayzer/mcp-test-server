import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SAMPLE_PNG_BASE64 } from "./image-result.js";

export function registerMultiContent(server: McpServer): void {
  server.registerTool(
    "multi_content",
    {
      title: "Multi-Content Result",
      description:
        "Returns a result with multiple content items of mixed types (text, image, text). Use to verify the host iterates over content[] and renders each item rather than only the first.",
      inputSchema: {},
    },
    async () => ({
      content: [
        { type: "text" as const, text: "First text block." },
        {
          type: "image" as const,
          data: SAMPLE_PNG_BASE64,
          mimeType: "image/png",
        },
        {
          type: "text" as const,
          text: "Second text block — should appear after the image.",
        },
      ],
    }),
  );
}
