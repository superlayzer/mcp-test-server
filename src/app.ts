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

      registerPing(this.server);

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
        }
      };

      this.transport = new WebStandardStreamableHTTPServerTransport({
        // Pin to Worker-assigned id so DO routing key and protocol session id match.
        sessionIdGenerator: () => sessionId,
        enableJsonResponse: true,
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

// JSON-mode transport doesn't support GET (SSE notification stream) —
// answer with 405 so MCP clients fall back to POST-only instead of
// treating the SDK's stateless-mode 400 as a fatal connection error.
app.get("/mcp", (c) =>
  c.text("Method Not Allowed", 405, { Allow: "POST, DELETE" }),
);

app.on(["POST", "DELETE"], "/mcp", async (c) => {
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
