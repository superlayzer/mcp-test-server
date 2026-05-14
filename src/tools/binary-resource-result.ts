import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SAMPLE_PNG_BASE64 } from "./image-result.js";

export function registerBinaryResourceResult(server: McpServer): void {
  server.registerTool(
    "binary_resource_result",
    {
      title: "Binary Embedded Resource Result",
      description:
        "Returns an embedded `resource` content item with a base64 `blob` payload (binary, not text). Pairs with `embedded_resource_result` (text branch) to exercise both EmbeddedResource encodings.",
      inputSchema: {},
    },
    async () => ({
      content: [
        {
          type: "resource" as const,
          resource: {
            uri: "mcp://test-server/embedded/sample.png",
            mimeType: "image/png",
            blob: SAMPLE_PNG_BASE64,
          },
        },
      ],
    }),
  );
}
