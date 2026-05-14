# mcp-test-server

Reference MCP server demonstrating the [MCP Apps spec
(SEP-1865)](https://github.com/modelcontextprotocol/ext-apps):
widgets, state persistence, destructive-action confirmation,
handshake timeouts, tool-driven UI, and capability-gated tool
registration.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

## What is this?

An [MCP](https://modelcontextprotocol.io) server whose tools each
exercise a specific apps-sdk protocol capability. If you're
implementing an apps-sdk-compatible host or building widgets that
target one, this is a working reference you can read, fork, deploy,
and connect to your own host implementation.

The tools here are deliberately minimal — they exist to demonstrate
the protocol, not to be useful in their own right.

## Capability-gated tool registration

This server demonstrates the SEP-1865 §"Server Behavior" canonical
pattern: UI-bearing tools register only when the host has advertised
`io.modelcontextprotocol/ui` in its `initialize` capabilities. Hosts
that didn't advertise see only the text-only `playground_ping` tool.

The pattern requires per-session server state, so this server uses
a per-session [Cloudflare Durable Object](https://developers.cloudflare.com/durable-objects/)
keyed on `mcp-session-id`. The `getUiCapability(clientCapabilities)`
check fires inside `Server.oninitialized`; the registered tools then
remain available for the subsequent `tools/list` request in the
same session.

## Tools

| Tool                 | Demonstrates                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------- |
| `playground_ping`    | Sanity check — text-only, registered unconditionally                                        |
| `state_counter`      | Widget state persistence via `ui/state/get` + `ui/state/set`, with a payload-cap test       |
| `tool_caller`        | Widget-driven tool invocation via `ui/request-tool-call`                                    |
| `broken_widget`      | Widget that never sends `ui/initialize` — exercises the host's handshake timeout            |
| `destructive_action` | Tool flagged `annotations.destructiveHint: true` — exercises the per-call confirmation gate |
| `followup_caller`    | Widget-driven assistant continuation via `ui/request-followup-turn`                         |
| `slow_widget`        | Sleeps configurable seconds and honors abort — exercises `ui/notifications/tool-cancelled`  |
| `blob_widget`        | Widget HTML delivered as base64-encoded `blob` — exercises SEP-1865 UI-resource decoding    |
| `structured_result`  | Returns typed `structuredContent` matching its `outputSchema` (MCP 2025-03-26)              |
| `failing_tool`       | Always returns `isError: true` — exercises the host's tool-error render path                |
| `image_result`       | Returns a base64 PNG as `image` content — exercises inline image rendering                  |
| `multi_content`      | Returns multiple `content[]` items (text + image + text) in a single result                 |
| `complex_input`      | Multi-field input schema (string, enum, number, array, nested object) — echoes the input    |
| `resource_link_result` | Returns a `resource_link` content item — exercises link rendering and unsafe-scheme gating |
| `embedded_resource_result` | Returns an embedded `resource` content item with inline text                          |
| `empty_result`       | Returns `content: []` — exercises the host's empty-result placeholder                       |
| `large_text_result`  | Returns ~10 KB of text — exercises overflow / scroll / truncation behaviour                 |
| `bad_structured_output` | Declares `outputSchema` but returns mismatching `structuredContent` — exercises validation |
| `read_only_tool`     | Declares all four tool annotations (`readOnlyHint`, `idempotentHint`, `openWorldHint`, `title`) |
| `model_only_tool`    | `_meta.ui.visibility: ["model"]` — chat UI should hide it, model can still call    |
| `app_only_tool`      | `_meta.ui.visibility: ["app"]` — model should NOT see it; only widgets can invoke  |
| `binary_resource_result` | Embedded `resource` with `blob` payload (binary) — pairs with `embedded_resource_result` |
| `huge_text_result`   | Returns ~1 MB of text — exercises high-payload truncation / scroll performance     |
| `cancellable_non_widget` | Sleeps + honors abort, with no widget — non-widget cancellation path           |
| `audio_result`       | Returns a base64 WAV as `audio` content — exercises inline audio player rendering  |
| `logging_tool`       | Emits one `notifications/message` per severity level (debug → error)               |
| `progress_emitter`   | Emits 5 `notifications/progress` events over ~2s — requires client `progressToken` |
| `dynamic_tools`      | Toggles a secondary tool on/off and sends `notifications/tools/list_changed`       |
| `external_api_demo`  | Calls an external HTTP API (GitHub Zen) — exercises outbound `fetch` from a tool handler |

The widget tools (those with a `_meta.ui.resourceUri`) only register
when the host has advertised the `io.modelcontextprotocol/ui`
extension; the rest register unconditionally.

## Quick start

```bash
git clone https://github.com/superlayzer/mcp-test-server.git
cd mcp-test-server
npm install
npm run dev
```

Server runs at `http://localhost:3006/mcp` via `wrangler dev`
(Cloudflare's local Workers runtime, which provides the same
Durable Object behaviour as production).

## Authentication (optional)

By default the server is open access. To require API key authentication, set the `MCP_API_KEY` environment variable:

```bash
MCP_API_KEY=your-secret-key npm run dev
```

Clients must send `Authorization: Bearer your-secret-key` in requests.

For Cloudflare Workers: `npx wrangler secret put MCP_API_KEY`

## Register in an MCP client

Add the server URL `http://localhost:3006/mcp` (local) or your
deployed Workers URL to any MCP-compatible client.

**Layzer:** Account > MCP Servers > Add Server

**Claude Desktop:** Add to `claude_desktop_config.json`:

```json
{ "mcpServers": { "test": { "url": "http://localhost:3006/mcp" } } }
```

## Deploy to Cloudflare Workers

```bash
npx wrangler login
npm run deploy
```

Your server URL: `https://mcp-test-server.<your-subdomain>.workers.dev/mcp`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
