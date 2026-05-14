import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerReadOnlyTool(server: McpServer): void {
  server.registerTool(
    "read_only_tool",
    {
      title: "Read-Only Tool",
      description:
        "Declares all four MCP tool annotations: readOnlyHint, idempotentHint, openWorldHint, plus an explicit title. Use to verify a host respects every annotation (e.g. caching idempotent results, badging read-only / external tools).",
      inputSchema: {},
      annotations: {
        title: "Read-Only Tool",
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => ({
      content: [
        {
          type: "text" as const,
          text: "Tool returned. Inspect the tools/list response on the host to confirm all four annotation hints are present.",
        },
      ],
    }),
  );
}
