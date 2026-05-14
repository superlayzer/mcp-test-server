import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const LEVELS = ["debug", "info", "notice", "warning", "error"] as const;

export function registerLoggingTool(server: McpServer): void {
  server.registerTool(
    "logging_tool",
    {
      title: "Logging Tool",
      description:
        "Emits one `notifications/message` log entry at each standard severity level (debug → error), then returns. Use to verify the host receives and surfaces server-side log messages.",
      inputSchema: {},
    },
    async () => {
      for (const level of LEVELS) {
        await server.server.sendLoggingMessage({
          level,
          logger: "logging_tool",
          data: { message: `${level} severity log entry from logging_tool` },
        });
      }
      return {
        content: [
          {
            type: "text" as const,
            text: `Sent ${LEVELS.length} logging notifications: ${LEVELS.join(", ")}.`,
          },
        ],
      };
    },
  );
}
