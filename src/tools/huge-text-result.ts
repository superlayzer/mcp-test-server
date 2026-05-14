import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// ~1 MB of repeating text — qualitatively different from large_text_result
// (~12 KB). Pushes truncation / scroll / memory-budget behaviour. Generated
// at module load so the cost is one-time.
const HUGE_TEXT = Array.from(
  { length: 8000 },
  (_, i) =>
    `Line ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
).join("\n");

export function registerHugeTextResult(server: McpServer): void {
  server.registerTool(
    "huge_text_result",
    {
      title: "Huge Text Result",
      description:
        "Returns approximately 1 MB of text. Use to verify the host's behaviour under high-payload conditions — truncation, scroll performance, or memory limits.",
      inputSchema: {},
    },
    async () => ({
      content: [{ type: "text" as const, text: HUGE_TEXT }],
    }),
  );
}
