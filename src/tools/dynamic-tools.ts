import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerDynamicTools(server: McpServer): void {
  const secondary = server.registerTool(
    "dynamic_secondary_tool",
    {
      title: "Dynamic Secondary Tool",
      description:
        "Registered by the server but starts disabled. Toggled on/off by calling `dynamic_tools`. Use to verify the host re-lists tools after `notifications/tools/list_changed`.",
      inputSchema: {},
    },
    async () => ({
      content: [
        {
          type: "text" as const,
          text: "Secondary tool called. You only see this if dynamic_tools toggled it on AND your host honored notifications/tools/list_changed.",
        },
      ],
    }),
  );

  // Start hidden — only becomes visible after a dynamic_tools toggle.
  secondary.disable();

  server.registerTool(
    "dynamic_tools",
    {
      title: "Dynamic Tools Toggle",
      description:
        "Toggles `dynamic_secondary_tool` between enabled/disabled and sends `notifications/tools/list_changed`. A host that re-lists on the notification will see the secondary tool appear/disappear in its tool list.",
      inputSchema: {},
    },
    async () => {
      if (secondary.enabled) {
        secondary.disable();
      } else {
        secondary.enable();
      }
      server.sendToolListChanged();
      return {
        content: [
          {
            type: "text" as const,
            text: `Secondary tool is now ${secondary.enabled ? "ENABLED" : "DISABLED"}. Sent notifications/tools/list_changed — refresh the tool list on the host to confirm.`,
          },
        ],
      };
    },
  );
}
