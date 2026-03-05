# 🎨 Design System MCP Server (v2.1.5)

This project is a **Model Context Protocol (MCP)** server built with Node.js and TypeScript. It exposes a structured UI Design System (Atoms, Molecules, Organisms, Templates) and module-specific design guidelines to AI assistants (Claude, Cursor, Windsurf, Antigravity).

By providing this context, AI tools can generate code that strictly adheres to the provided design rules, token sets, and component architectures.

## 🚀 Features

- **SSE Transport:** Communication via Server-Sent Events for real-time integration.
- **Multi-Client Support:** Each connection gets an isolated server instance — no session conflicts.
- **Atomic Design Registry:** Fully categorized UI components (Atoms, Molecules, Organisms).
- **Page Templates:** Ready-to-use page layouts (Home Page, Wallet Page).
- **Design Guidelines:** Module-specific visual rules (Spacing, PNL indicators, Typography hierarchy) in Markdown format.
- **Smart Color Resolution:** Tools to resolve semantic tokens (e.g., `text.focus`) based on different modes (Kripto, Hisse, Global - Light/Dark).
- **API Key Auth:** Secure your server with an API key.
- **Health Check:** Built-in `/health` endpoint for monitoring.

---

## ☁️ Remote Server (Railway)

The server is deployed on **Railway** and publicly accessible:

```
https://design-mcp-production-6cf0.up.railway.app
```

| Endpoint                 | Description                        |
| ------------------------ | ---------------------------------- |
| `/sse?apiKey=YOUR_KEY`   | SSE connection for MCP clients     |
| `/message?sessionId=...` | Message endpoint (used internally) |
| `/health`                | Health check — returns `OK`        |

---

## 🔌 Client Connection

### Cursor (Native SSE)

Cursor supports SSE natively. No extra setup needed.

1. Go to **Settings > Models > MCP Servers**
2. Click **+ Add New MCP Server**
3. Name: `Design-System`
4. Type: `SSE`
5. URL:

```
https://design-mcp-production-6cf0.up.railway.app/sse?apiKey=DesignTeam2026
```

---

### Claude Desktop / Antigravity / Windsurf (stdio → SSE Bridge)

These clients use **stdio**. Use `mcp-remote` to bridge to the remote SSE server:

```json
{
  "mcpServers": {
    "design-system": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://design-mcp-production-6cf0.up.railway.app/sse?apiKey=DesignTeam2026"
      ]
    }
  }
}
```

> **No local files needed.** `mcp-remote` is downloaded automatically via npx and handles the stdio↔SSE conversion.

#### Alternative: Local Bridge Script

If you prefer not to use `mcp-remote`, a zero-dependency bridge script is included in `scripts/bridge.js`:

```json
"design-system": {
  "command": "node",
  "args": [
    "/path/to/design-mcp/scripts/bridge.js",
    "https://design-mcp-production-6cf0.up.railway.app/sse?apiKey=DesignTeam2026"
  ]
}
```

---

## 🏗️ Project Structure

```text
├── src/
│   ├── data/                 # Design System Registry
│   │   ├── tokens/           # Color & Typography tokens
│   │   ├── atoms/            # Single elements (Icons, Badges)
│   │   ├── molecules/        # Composite elements (Asset Items)
│   │   ├── organisms/        # Complex modules (Balance Card, Lists)
│   │   ├── templates/        # Page structures (Home, Wallet)
│   │   └── guidelines/       # Visual rules & Module patterns (MD)
│   └── index.ts              # MCP Server Implementation
├── scripts/
│   └── bridge.js             # stdio↔SSE bridge for Claude Desktop
├── Dockerfile                # Railway deployment
├── package.json
└── tsconfig.json
```

---

## 🛠️ MCP Tools

The server exposes several tools for AI assistants:

| Tool                                | Description                                              |
| ----------------------------------- | -------------------------------------------------------- |
| `get_tokens`                        | Fetches all raw design tokens (colors + typography)      |
| `get_atoms_list`                    | List all UI atoms                                        |
| `get_atom_detail(atomName)`         | Get detail of a specific atom                            |
| `get_molecules_list`                | List all UI molecules                                    |
| `get_molecule_detail(moleculeName)` | Get detail of a specific molecule                        |
| `get_organisms_list`                | List all UI organisms                                    |
| `get_organism_detail(organismName)` | Get detail of a specific organism                        |
| `get_templates_list`                | List all page templates                                  |
| `get_template_detail(templateName)` | Get detail of a specific template                        |
| `get_guidelines(module)`            | Get design rules for a module (`wallet`, `home`)         |
| `resolve_token(tokenPath, mode)`    | Resolve a semantic token to its hex value                |
| `get_component_colors(...)`         | Get full theme colors for a component variant/state/mode |

---

## 🔒 API Key Security

Set the `MCP_API_KEY` environment variable to secure the server:

```env
MCP_API_KEY=your_secret_key_here
```

If set, every connection must include `?apiKey=your_secret_key_here` in the URL.

---

## 🚦 Local Development

```bash
# Install dependencies
npm install

# Build & run
npm run build
npm start

# Or development mode
npm run dev
```

The server runs on port `3001` by default (`PORT` env to override).

---

## 📈 Roadmap

- [x] Atomic Design Registry implementation
- [x] Home Page & Wallet Page templates
- [x] Multi-mode token resolution (Kripto/Hisse/Global)
- [x] Remote deployment (Railway)
- [x] Multi-client SSE support
- [ ] Automated Figma-to-JSON extraction scripts
- [ ] Component implementation prompt generators

---

_Powered by Model Context Protocol (MCP) • Deployed on Railway_
