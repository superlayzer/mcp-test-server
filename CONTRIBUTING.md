# Contributing

Thanks for your interest in contributing! This server is a reference
implementation of [Layzer](https://layzer.ai)'s apps-sdk protocol —
each tool exercises one specific protocol capability.

## Prerequisites

- Node.js 20+
- npm (or pnpm/yarn)

## Local development

```bash
npm install
npm run dev
```

Server starts at http://localhost:3006/mcp.

## Adding a new tool

1. Create `src/tools/my-tool.ts` following the pattern in existing tool files
2. If it renders UI, also create `src/tools/my-tool-widget.ts` with the widget HTML
3. Export a `registerMyTool(server: McpServer)` function
4. Import and call it in `src/app.ts`
5. Run `npm run typecheck` to verify

See README.md for details.

## Code style

- TypeScript strict mode
- Use `as const` for MCP content type literals

## Submitting a PR

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Run `npm run typecheck`
5. Open a pull request

## Note

Source of truth is the [Layzer monorepo](https://github.com/superlayzer/layzer). Small fixes welcome here; new capabilities should go upstream so the host-side implementation lands alongside.
