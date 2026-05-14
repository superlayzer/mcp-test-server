import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerEmptyResult(server: McpServer): void {
  server.registerTool(
    "empty_result",
    {
      title: "Empty Result",
      description:
        "Returns `content: []` with no structuredContent and no isError. Use to verify the host renders a meaningful placeholder rather than a blank card.",
      inputSchema: {},
    },
    async () => ({
      content: [],
    }),
  );
}
