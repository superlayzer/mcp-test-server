import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerBadStructuredOutput(server: McpServer): void {
  server.registerTool(
    "bad_structured_output",
    {
      title: "Bad Structured Output (schema mismatch)",
      description:
        "Declares an outputSchema requiring `{ foo: string }` but returns structuredContent shaped `{ bar: number }`. Use to verify how the SDK + host handle structuredContent that violates its declared outputSchema.",
      inputSchema: {},
      outputSchema: {
        foo: z.string(),
      },
    },
    async () => ({
      content: [
        {
          type: "text" as const,
          text: "Returning intentionally-mismatched structuredContent.",
        },
      ],
      // Intentional mismatch: outputSchema requires { foo: string } but we
      // send { bar: number }. Whether the SDK rejects this server-side or
      // forwards it to the host is what this tool exercises.
      structuredContent: { bar: 42 } as unknown as { foo: string },
    }),
  );
}
