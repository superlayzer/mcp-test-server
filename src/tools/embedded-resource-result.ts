import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerEmbeddedResourceResult(server: McpServer): void {
  server.registerTool(
    "embedded_resource_result",
    {
      title: "Embedded Resource Result",
      description:
        "Returns an embedded `resource` content item with inline text. Distinct from `_meta.ui.resourceUri` (widgets) and `resource_link` (references). Use to verify the host renders inline resource payloads.",
      inputSchema: {},
    },
    async () => ({
      content: [
        {
          type: "resource" as const,
          resource: {
            uri: "mcp://test-server/embedded/sample.txt",
            mimeType: "text/plain",
            text: "This is the inline text payload of an embedded resource.\nIt arrived as part of the tool result, not via resources/read.\nLine 3.",
          },
        },
      ],
    }),
  );
}
