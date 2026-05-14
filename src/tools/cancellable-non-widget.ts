import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerCancellableNonWidget(server: McpServer): void {
  server.registerTool(
    "cancellable_non_widget",
    {
      title: "Cancellable Non-Widget Tool",
      description:
        "Sleeps `seconds` (5-60, default 30) and honors the request abort signal. Unlike `slow_widget`, this tool has no widget — exercises the non-widget cancellation code path. Pass 30 or higher so you have time to click Stop.",
      inputSchema: {
        seconds: z.number().int().min(5).max(60).optional(),
      },
    },
    async ({ seconds }, extra) => {
      const target = seconds ?? 30;
      await new Promise<void>((resolve, reject) => {
        if (extra.signal.aborted) {
          reject(new Error("Aborted"));
          return;
        }
        const timer = setTimeout(() => {
          extra.signal.removeEventListener("abort", onAbort);
          resolve();
        }, target * 1000);
        const onAbort = () => {
          clearTimeout(timer);
          reject(new Error("Aborted"));
        };
        extra.signal.addEventListener("abort", onAbort, { once: true });
      });
      return {
        content: [
          { type: "text" as const, text: `Slept for ${target} seconds.` },
        ],
      };
    },
  );
}
