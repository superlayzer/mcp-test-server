import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerFailingTool(server: McpServer): void {
  server.registerTool(
    "failing_tool",
    {
      title: "Failing Tool",
      description:
        "Always returns isError: true with a descriptive error message. Use to verify the host renders tool errors inline and continues accepting further tool calls afterwards.",
      inputSchema: {},
    },
    async () => ({
      content: [
        {
          type: "text" as const,
          text: "This tool always fails — that is its purpose. The host should surface this message and continue the conversation.",
        },
      ],
      isError: true,
    }),
  );
}
