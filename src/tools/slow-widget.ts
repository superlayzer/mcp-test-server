import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SLOW_WIDGET_HTML } from "./slow-widget-html.js";

const URI = "ui://slow-widget/widget.html";

export function registerSlowWidgetResource(server: McpServer): void {
  server.registerResource(
    "slow-widget",
    URI,
    { mimeType: "text/html;profile=mcp-app" },
    async () => ({
      contents: [
        {
          uri: URI,
          text: SLOW_WIDGET_HTML,
          mimeType: "text/html;profile=mcp-app",
        },
      ],
    }),
  );
}

export function registerSlowWidgetTool(server: McpServer): void {
  server.registerTool(
    "slow_widget",
    {
      title: "Slow Widget (cancellation harness)",
      description:
        "Cancellation-testing harness for SEP-1865 ui/notifications/tool-cancelled. Sleeps `seconds` (5-60, default 30) before returning, honoring the request abort signal. Pass 30 or higher so the user has time to click Stop.",
      inputSchema: {
        seconds: z.number().int().min(5).max(60).optional(),
      },
      _meta: { ui: { resourceUri: URI } },
    },
    async (args, extra) => {
      const seconds = args.seconds ?? 30;
      await new Promise<void>((resolve, reject) => {
        if (extra.signal.aborted) {
          reject(new Error("Aborted"));
          return;
        }
        const timer = setTimeout(() => {
          extra.signal.removeEventListener("abort", onAbort);
          resolve();
        }, seconds * 1000);
        const onAbort = () => {
          clearTimeout(timer);
          reject(new Error("Aborted"));
        };
        extra.signal.addEventListener("abort", onAbort, { once: true });
      });
      return {
        content: [
          { type: "text" as const, text: `Slept for ${seconds} seconds.` },
        ],
      };
    },
  );
}
