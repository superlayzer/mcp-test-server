import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerPing(server: McpServer): void {
  server.registerTool(
    "playground_ping",
    {
      title: "Playground Ping",
      description:
        "Sanity check tool for the playground MCP server. Returns a pong with a timestamp. Use only to verify the server is reachable.",
      inputSchema: {},
    },
    async () => {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                pong: true,
                message: "Hello from playground",
                timestamp: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}
