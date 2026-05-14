import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerStructuredResult(server: McpServer): void {
  server.registerTool(
    "structured_result",
    {
      title: "Structured Result",
      description:
        "Returns a typed structuredContent payload matching its outputSchema. Use to verify the host parses MCP 2025-03-26 structured output alongside the legacy `content` array.",
      inputSchema: {},
      outputSchema: {
        message: z.string(),
        count: z.number().int(),
        items: z.array(z.string()),
      },
    },
    async () => ({
      content: [
        {
          type: "text" as const,
          text: "Structured payload — see structuredContent.",
        },
      ],
      structuredContent: {
        message: "hello from structured_result",
        count: 3,
        items: ["alpha", "beta", "gamma"],
      },
    }),
  );
}
