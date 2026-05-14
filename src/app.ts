import { DurableObject } from "cloudflare:workers";
import { timingSafeEqual } from "node:crypto";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import {
  getUiCapability,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { registerPing } from "./tools/ping.js";
import {
  registerStateCounterResource,
  registerStateCounterTool,
} from "./tools/state-counter.js";
import {
  registerToolCallerResource,
  registerToolCallerTool,
} from "./tools/tool-caller.js";
import {
  registerBrokenWidgetResource,
  registerBrokenWidgetTool,
} from "./tools/broken-widget.js";
import { registerDestructiveAction } from "./tools/destructive-action.js";
import {
  registerFollowupCallerResource,
  registerFollowupCallerTool,
} from "./tools/followup-caller.js";
import {
  registerSlowWidgetResource,
  registerSlowWidgetTool,
} from "./tools/slow-widget.js";
import {
  registerBlobWidgetResource,
  registerBlobWidgetTool,
} from "./tools/blob-widget.js";
import { registerStructuredResult } from "./tools/structured-result.js";
import { registerFailingTool } from "./tools/failing-tool.js";
import { registerImageResult } from "./tools/image-result.js";
import { registerMultiContent } from "./tools/multi-content.js";
import { registerComplexInput } from "./tools/complex-input.js";
import { registerResourceLinkResult } from "./tools/resource-link-result.js";
import { registerEmbeddedResourceResult } from "./tools/embedded-resource-result.js";
import { registerEmptyResult } from "./tools/empty-result.js";
import { registerLargeTextResult } from "./tools/large-text-result.js";
import { registerBadStructuredOutput } from "./tools/bad-structured-output.js";
import { registerReadOnlyTool } from "./tools/read-only-tool.js";
import {
  registerModelOnlyTool,
  registerAppOnlyTool,
} from "./tools/visibility-variants.js";
import { registerBinaryResourceResult } from "./tools/binary-resource-result.js";
import { registerHugeTextResult } from "./tools/huge-text-result.js";
import { registerCancellableNonWidget } from "./tools/cancellable-non-widget.js";
import { registerAudioResult } from "./tools/audio-result.js";
import { registerLoggingTool } from "./tools/logging-tool.js";
import { registerProgressEmitter } from "./tools/progress-emitter.js";
import { registerDynamicTools } from "./tools/dynamic-tools.js";
import { registerExternalApiDemo } from "./tools/external-api-demo.js";

type Env = {
  MCP_API_KEY?: string;
  MCP_SESSION: DurableObjectNamespace<McpSession>;
};

const SERVER_NAME = "mcp-test-server";
const SERVER_VERSION = "0.1.0";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

// Per-session DO — capability-gating state must persist across `initialize` → `tools/list`.
export class McpSession extends DurableObject<Env> {
  private server?: McpServer;
  private transport?: WebStandardStreamableHTTPServerTransport;

  override async fetch(request: Request): Promise<Response> {
    if (!this.server || !this.transport) {
      const sessionId =
        request.headers.get("mcp-session-id") ?? crypto.randomUUID();

      this.server = new McpServer(
        { name: SERVER_NAME, version: SERVER_VERSION },
        { capabilities: { logging: {} } },
      );

      // Resources must register before connect — the SDK freezes capabilities then.
      registerStateCounterResource(this.server);
      registerToolCallerResource(this.server);
      registerBrokenWidgetResource(this.server);
      registerFollowupCallerResource(this.server);
      registerSlowWidgetResource(this.server);
      registerBlobWidgetResource(this.server);

      registerPing(this.server);
      registerStructuredResult(this.server);
      registerFailingTool(this.server);
      registerImageResult(this.server);
      registerMultiContent(this.server);
      registerComplexInput(this.server);
      registerResourceLinkResult(this.server);
      registerEmbeddedResourceResult(this.server);
      registerEmptyResult(this.server);
      registerLargeTextResult(this.server);
      registerBadStructuredOutput(this.server);
      registerReadOnlyTool(this.server);
      registerBinaryResourceResult(this.server);
      registerHugeTextResult(this.server);
      registerCancellableNonWidget(this.server);
      registerAudioResult(this.server);
      registerLoggingTool(this.server);
      registerProgressEmitter(this.server);
      registerDynamicTools(this.server);
      registerExternalApiDemo(this.server);

      // SEP-1865 capability gating: register UI tools only when the host advertised io.modelcontextprotocol/ui.
      this.server.server.oninitialized = () => {
        const caps = this.server!.server.getClientCapabilities();
        const uiCap = getUiCapability(caps);
        if (uiCap?.mimeTypes?.includes(RESOURCE_MIME_TYPE)) {
          registerStateCounterTool(this.server!);
          registerToolCallerTool(this.server!);
          registerBrokenWidgetTool(this.server!);
          registerDestructiveAction(this.server!);
          registerFollowupCallerTool(this.server!);
          registerSlowWidgetTool(this.server!);
          registerBlobWidgetTool(this.server!);
          registerModelOnlyTool(this.server!);
          registerAppOnlyTool(this.server!);
        }
      };

      this.transport = new WebStandardStreamableHTTPServerTransport({
        // Pin to Worker-assigned id so DO routing key and protocol session id match.
        sessionIdGenerator: () => sessionId,
        // SSE mode (the SDK default) required so server-initiated
        // notifications can ride the response stream.
        onsessionclosed: async () => {
          await this.transport?.close();
          await this.server?.close();
          this.server = undefined;
          this.transport = undefined;
        },
      });

      await this.server.connect(this.transport);
    }

    await this.ctx.storage.setAlarm(Date.now() + IDLE_TIMEOUT_MS);

    return await this.transport.handleRequest(request);
  }

  override async alarm(): Promise<void> {
    await this.transport?.close();
    await this.server?.close();
    this.server = undefined;
    this.transport = undefined;
  }
}

const app = new Hono<{ Bindings: Env }>();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "mcp-session-id",
      "Last-Event-ID",
      "mcp-protocol-version",
    ],
    exposeHeaders: ["mcp-session-id", "mcp-protocol-version"],
  }),
);

app.get("/", (c) => c.json({ name: SERVER_NAME, version: SERVER_VERSION }));

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

app.use("/mcp", async (c, next) => {
  const apiKey = c.env.MCP_API_KEY ?? process.env.MCP_API_KEY;
  if (!apiKey) return next();

  const auth = c.req.header("Authorization");
  if (!safeCompare(auth ?? "", `Bearer ${apiKey}`)) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return next();
});

// GET is the standalone SSE stream for server-initiated notifications
// (e.g. `notifications/message` from `sendLoggingMessage`).
app.on(["GET", "POST", "DELETE"], "/mcp", async (c) => {
  const sessionId = c.req.header("mcp-session-id") ?? crypto.randomUUID();

  const id = c.env.MCP_SESSION.idFromName(sessionId);
  const stub = c.env.MCP_SESSION.get(id);

  const headers = new Headers(c.req.raw.headers);
  headers.set("mcp-session-id", sessionId);
  const forwarded = new Request(c.req.raw.url, {
    method: c.req.raw.method,
    headers,
    body: c.req.raw.body,
  });

  return await stub.fetch(forwarded);
});

export default app;
