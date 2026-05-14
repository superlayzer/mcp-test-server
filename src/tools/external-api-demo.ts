import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// GitHub's Zen endpoint: unauthenticated, no rate-limit issues for low
// traffic, returns a single line of text. Stable target for showing the
// pattern of "MCP tool handler makes an outbound HTTP call".
const ZEN_URL = "https://api.github.com/zen";

export function registerExternalApiDemo(server: McpServer): void {
  server.registerTool(
    "external_api_demo",
    {
      title: "External API Demo",
      description:
        "Fetches a random GitHub Zen quote via outbound HTTP. Use as a reference for MCP servers that call external APIs from inside their tool handlers — exercises fetch, abort-signal propagation, and the success/error result split.",
      inputSchema: {},
    },
    async (_args, extra) => {
      try {
        const response = await fetch(ZEN_URL, {
          signal: extra.signal,
          headers: { "User-Agent": "mcp-test-server" },
        });
        if (!response.ok) {
          return {
            content: [
              {
                type: "text" as const,
                text: `GitHub Zen API returned ${response.status} ${response.statusText}`,
              },
            ],
            isError: true,
          };
        }
        const quote = (await response.text()).trim();
        return {
          content: [
            {
              type: "text" as const,
              text: `GitHub Zen: ${quote}`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text" as const,
              text:
                err instanceof Error
                  ? `Fetch failed: ${err.message}`
                  : "Fetch failed with unknown error",
            },
          ],
          isError: true,
        };
      }
    },
  );
}
