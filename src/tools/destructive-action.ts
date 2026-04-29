import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerDestructiveAction(server: McpServer): void {
  server.registerTool(
    "destructive_action",
    {
      title: "Playground Destructive Action",
      description:
        "Pretends to do something irreversible. Use to verify the host's destructive-confirmation modal.",
      inputSchema: {},
      _meta: { destructive: true },
    },
    async () => ({
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            confirmed: true,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    }),
  );
}
