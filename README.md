# mcp-test-server

Reference MCP server demonstrating [Layzer](https://layzer.ai)'s
apps-sdk protocol: widgets, state persistence, destructive-action
confirmation, handshake timeouts, and tool-driven UI.

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

## Tools

| Tool                 | Demonstrates                                                                          |
| -------------------- | ------------------------------------------------------------------------------------- |
| `playground_ping`    | Sanity check — confirms the server is reachable                                       |
| `state_counter`      | Widget state persistence via `ui/state/get` + `ui/state/set`, with a payload-cap test |
| `tool_caller`        | Widget-driven tool invocation via `ui/request-tool-call`                              |
| `broken_widget`      | Widget that never sends `ui/initialize` — exercises the host's handshake timeout      |
| `destructive_action` | Tool flagged `_meta.destructive: true` — exercises the per-call confirmation gate     |
| `followup_caller`    | Widget-driven assistant continuation via `ui/request-followup-turn`                   |

## Quick start

```bash
git clone https://github.com/superlayzer/mcp-test-server.git
cd mcp-test-server
npm install
npm run dev
```

Server runs at `http://localhost:3006/mcp`.

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
