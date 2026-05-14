import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerComplexInput(server: McpServer): void {
  server.registerTool(
    "complex_input",
    {
      title: "Complex Input Schema",
      description:
        "Accepts a multi-field input schema (string, enum, number, array, nested object). Use to verify how the host renders complex tool inputs and how the model fills them.",
      inputSchema: {
        name: z.string().min(1).max(100),
        category: z.enum(["fruit", "vegetable", "grain"]),
        count: z.number().int().min(1).max(10).optional(),
        tags: z.array(z.string()).max(5).optional(),
        metadata: z
          .object({
            author: z.string(),
            note: z.string().optional(),
          })
          .optional(),
      },
    },
    async ({ name, category, count, tags, metadata }) => ({
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              echoed: { name, category, count, tags, metadata },
              note: "Tool received this input and echoed it back.",
            },
            null,
            2,
          ),
        },
      ],
    }),
  );
}
