import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// ~10 KB of repeating text — enough to overflow most chat surfaces vertically
// without crossing into "this could be a security/perf concern" territory.
const LARGE_TEXT = Array.from(
  { length: 100 },
  (_, i) =>
    `Line ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
).join("\n");

export function registerLargeTextResult(server: McpServer): void {
  server.registerTool(
    "large_text_result",
    {
      title: "Large Text Result",
      description:
        "Returns approximately 10 KB of text in a single content item. Use to verify the host's behaviour with long results — overflow, scroll, truncation, or none.",
      inputSchema: {},
    },
    async () => ({
      content: [{ type: "text" as const, text: LARGE_TEXT }],
    }),
  );
}
