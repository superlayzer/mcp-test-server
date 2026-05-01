import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FOLLOWUP_CALLER_WIDGET_HTML } from "./followup-caller-widget.js";

export function registerFollowupCaller(server: McpServer): void {
  server.registerTool(
    "followup_caller",
    {
      title: "Playground Follow-Up Caller",
      description:
        "Renders a widget with an editable prompt and a Send button that calls bridge.requestFollowUp / ui/request-followup-turn. Use to verify the host has accepted the request — the resolved promise indicates host acceptance, not that the model has run (a host may auto-invoke the model OR draft the prompt for explicit user confirmation).",
      inputSchema: {},
      _meta: { ui: { resourceUri: "ui://followup-caller/widget.html" } },
    },
    async () => ({
      content: [{ type: "text" as const, text: "{}" }],
    }),
  );

  server.registerResource(
    "followup-caller-widget",
    "ui://followup-caller/widget.html",
    { mimeType: "text/html;profile=mcp-app" },
    async () => ({
      contents: [
        {
          uri: "ui://followup-caller/widget.html",
          text: FOLLOWUP_CALLER_WIDGET_HTML,
          mimeType: "text/html;profile=mcp-app",
        },
      ],
    }),
  );
}
