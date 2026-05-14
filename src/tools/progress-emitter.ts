import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const STEPS = 5;
const STEP_DELAY_MS = 400;

export function registerProgressEmitter(server: McpServer): void {
  server.registerTool(
    "progress_emitter",
    {
      title: "Progress Emitter",
      description:
        "Emits 5 `notifications/progress` events at 400ms intervals (0% → 100%) before returning. Requires the client to include a `_meta.progressToken` in the `tools/call` request — without it the tool still runs but no progress fires.",
      inputSchema: {},
    },
    async (_args, extra) => {
      const progressToken = extra._meta?.progressToken;
      for (let i = 1; i <= STEPS; i++) {
        await new Promise((r) => setTimeout(r, STEP_DELAY_MS));
        if (progressToken !== undefined) {
          await extra.sendNotification({
            method: "notifications/progress",
            params: {
              progressToken,
              progress: i,
              total: STEPS,
              message: `Step ${i} of ${STEPS}`,
            },
          });
        }
      }
      return {
        content: [
          {
            type: "text" as const,
            text:
              progressToken !== undefined
                ? `Completed ${STEPS} steps and emitted ${STEPS} progress notifications.`
                : `Completed ${STEPS} steps but no progressToken was supplied — no notifications were sent.`,
          },
        ],
      };
    },
  );
}
