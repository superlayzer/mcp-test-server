import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerResourceLinkResult(server: McpServer): void {
  server.registerTool(
    "resource_link_result",
    {
      title: "Resource Link Result",
      description:
        "Returns a `resource_link` content item pointing at this server's public mirror. Use to verify the host renders link-typed result content (and gates unsafe schemes).",
      inputSchema: {},
    },
    async () => ({
      content: [
        {
          type: "resource_link" as const,
          uri: "https://github.com/superlayzer/mcp-test-server",
          name: "mcp-test-server (public mirror)",
          mimeType: "text/html",
        },
      ],
    }),
  );
}
