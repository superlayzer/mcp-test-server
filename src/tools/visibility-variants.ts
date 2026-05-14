import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Two tools sharing a file because they only exist to demonstrate the
// `_meta.ui.visibility` field per SEP-1865 — neither does meaningful work.

export function registerModelOnlyTool(server: McpServer): void {
  server.registerTool(
    "model_only_tool",
    {
      title: "Model-Only Tool",
      description:
        'Declares `_meta.ui.visibility: ["model"]`. The chat UI tool picker should hide this tool, but the model should be able to call it. Use to verify model-only routing.',
      inputSchema: {},
      _meta: { ui: { visibility: ["model"] } },
    },
    async () => ({
      content: [
        {
          type: "text" as const,
          text: "Called via the model-only path. If you see this, the host did not filter the tool out of the model's tool list.",
        },
      ],
    }),
  );
}

export function registerAppOnlyTool(server: McpServer): void {
  server.registerTool(
    "app_only_tool",
    {
      title: "App-Only Tool",
      description:
        'Declares `_meta.ui.visibility: ["app"]`. The model should NOT see this tool, only widget code can invoke it via `tools/call`. Use to verify app-only routing.',
      inputSchema: {},
      _meta: { ui: { visibility: ["app"] } },
    },
    async () => ({
      content: [
        {
          type: "text" as const,
          text: "Called via the app-only path. If the model invoked this directly, the host failed to filter it.",
        },
      ],
    }),
  );
}
