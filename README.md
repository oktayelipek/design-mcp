# 🎨 Design System MCP Server (v2.1.6)

> **Model Context Protocol (MCP)** server that exposes a complete UI Design System to AI assistants — enabling pixel-perfect, design-compliant code generation.

Built with **Node.js**, **TypeScript**, and the official **MCP SDK**. Deployed on **Railway**.

---

## 📊 Registry at a Glance

| Category       | Count | Examples                                      |
| -------------- | ----- | --------------------------------------------- |
| **Atoms**      | 26    | Button, Badge, Input, Toggle, Toast, Checkbox |
| **Molecules**  | 39    | Asset Row, Tabs, Ticker, Drawer, Tooltip      |
| **Organisms**  | 24    | Order Book, Asset List, Balance Card, Menu    |
| **Templates**  | 3     | Home Page, Wallet Page, Trade Pages           |
| **Guidelines** | 2     | Wallet Module, Home Module                    |
| **Modes**      | 6     | Kripto/Hisse/Global × Light/Dark              |

---

## 🚀 Features

- **SSE Transport** — Real-time Server-Sent Events communication
- **Multi-Client Isolation** — Every connection gets its own server instance; zero session conflicts
- **Atomic Design Registry** — Full component hierarchy: Atoms → Molecules → Organisms → Templates
- **Smart Color Resolution** — Resolve semantic tokens (e.g., `text.focus`) across 6 theme modes
- **Component Color Lookup** — Get resolved hex colors for any component/variant/state/mode combination
- **Module Guidelines** — Design rules in Markdown (spacing, PNL indicators, typography hierarchy)
- **Prompt Templates** — Built-in prompt helpers for common implementation tasks
- **API Key Auth** — Secure endpoints with `MCP_API_KEY` environment variable
- **Health Check** — `/health` endpoint for uptime monitoring

---

## ☁️ Remote Server (Railway)

The server is publicly deployed and ready to use:

```
https://design-mcp-production-6cf0.up.railway.app
```

| Endpoint                 | Method | Description                     |
| ------------------------ | ------ | ------------------------------- |
| `/sse?apiKey=YOUR_KEY`   | GET    | SSE connection for MCP clients  |
| `/message?sessionId=...` | POST   | Message relay (used internally) |
| `/health`                | GET    | Health check — returns `OK`     |

---

## 🔌 Client Setup

### Cursor (Native SSE)

Cursor supports SSE natively — no bridge needed.

1. **Settings → Models → MCP Servers**
2. Click **+ Add New MCP Server**
3. Configure:
   - **Name:** `design-system`
   - **Type:** `SSE`
   - **URL:**

```
https://design-mcp-production-6cf0.up.railway.app/sse?apiKey=YOUR_KEY
```

---

### Claude Desktop / Antigravity / Windsurf (stdio → SSE Bridge)

These clients use **stdio** transport. Use `mcp-remote` to bridge to the remote SSE server.

Add to your MCP config (`mcp_settings.json` or `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "design-system": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://design-mcp-production-6cf0.up.railway.app/sse?apiKey=YOUR_KEY"
      ]
    }
  }
}
```

> **No local setup.** `mcp-remote` is downloaded automatically via `npx` and handles stdio ↔ SSE conversion.

#### Alternative: Local Bridge Script

A zero-dependency bridge script is included for offline or custom setups:

```json
{
  "design-system": {
    "command": "node",
    "args": [
      "/path/to/design-mcp/scripts/bridge.js",
      "https://design-mcp-production-6cf0.up.railway.app/sse?apiKey=YOUR_KEY"
    ]
  }
}
```

---

## 🛠️ MCP Tools (12)

### Token & Color Tools

| Tool                   | Description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| `get_tokens`           | Fetch all raw design tokens (colors + typography)            |
| `resolve_token`        | Resolve a semantic token path to its hex value for a mode    |
| `get_component_colors` | Get resolved colors for a component variant/state/mode combo |

### Component Registry Tools

| Tool                  | Description                            |
| --------------------- | -------------------------------------- |
| `get_atoms_list`      | List all UI atoms                      |
| `get_atom_detail`     | Get full detail of a specific atom     |
| `get_molecules_list`  | List all UI molecules                  |
| `get_molecule_detail` | Get full detail of a specific molecule |
| `get_organisms_list`  | List all UI organisms                  |
| `get_organism_detail` | Get full detail of a specific organism |
| `get_templates_list`  | List all page templates                |
| `get_template_detail` | Get full detail of a specific template |

### Guidelines Tool

| Tool             | Description                                        |
| ---------------- | -------------------------------------------------- |
| `get_guidelines` | Get design rules for a module (`wallet` or `home`) |

---

## 📚 MCP Resources (8)

The server also exposes read-only resources that clients can browse:

| URI                                 | Type               | Description              |
| ----------------------------------- | ------------------ | ------------------------ |
| `design-system://tokens/colors`     | `application/json` | Color token definitions  |
| `design-system://tokens/typography` | `application/json` | Typography tokens        |
| `design-system://atoms`             | `application/json` | Atoms registry           |
| `design-system://molecules`         | `application/json` | Molecules registry       |
| `design-system://organisms`         | `application/json` | Organisms registry       |
| `design-system://templates`         | `application/json` | Templates registry       |
| `design-system://guidelines/wallet` | `text/markdown`    | Wallet module guidelines |
| `design-system://guidelines/home`   | `text/markdown`    | Home page guidelines     |

---

## 💬 MCP Prompts (2)

Built-in prompt templates for common implementation tasks:

| Prompt                  | Description                       | Argument   |
| ----------------------- | --------------------------------- | ---------- |
| `implement-wallet-part` | Implement a Wallet page component | `partName` |
| `implement-home-part`   | Implement a Home page component   | `partName` |

**Example:** Calling `implement-wallet-part` with `partName: "BalanceCard"` generates a contextual prompt referencing the Wallet guidelines.

---

## 🏗️ Project Structure

```text
design-mcp/
├── src/
│   ├── index.ts                  # MCP Server (Express + SSE)
│   └── data/
│       ├── tokens/
│       │   ├── colors.json       # Semantic color tokens (6 modes)
│       │   └── typography.json   # Typography scale & weights
│       ├── atoms/                # 26 atom definitions
│       │   ├── _registry.json
│       │   ├── button.json
│       │   ├── input.json
│       │   └── ...
│       ├── molecules/            # 39 molecule definitions
│       │   ├── _registry.json
│       │   ├── asset-row.json
│       │   ├── tabs.json
│       │   └── ...
│       ├── organisms/            # 24 organism definitions
│       │   ├── _registry.json
│       │   ├── order-book.json
│       │   ├── asset-list.json
│       │   └── ...
│       ├── templates/            # 3 page templates
│       │   ├── _registry.json
│       │   ├── home.json
│       │   ├── wallet.json
│       │   └── trade-pages.json
│       └── guidelines/           # Module design rules (Markdown)
│           ├── home.md
│           └── wallet.md
├── scripts/
│   └── bridge.js                 # stdio ↔ SSE bridge for Claude Desktop
├── Dockerfile                    # Railway deployment
├── package.json
└── tsconfig.json
```

---

## 🔒 API Key Security

Set the `MCP_API_KEY` environment variable to protect the server:

```env
MCP_API_KEY=your_secret_key_here
```

When set, every SSE connection must include `?apiKey=your_secret_key_here` in the URL. The `/message` endpoint is session-authenticated (no separate key needed).

---

## 🚦 Local Development

```bash
# Install dependencies
npm install

# Build & run (production)
npm run build
npm start

# Development mode (hot reload)
npm run dev
```

The server starts on port **3001** by default. Override with the `PORT` environment variable.

---

## 🎯 Theme Modes

The design system supports **6 theme modes** for token resolution:

| Mode           | Use Case                         |
| -------------- | -------------------------------- |
| `Kripto Dark`  | Crypto trading — dark theme      |
| `Kripto Light` | Crypto trading — light theme     |
| `Hisse Dark`   | Stock trading — dark theme       |
| `Hisse Light`  | Stock trading — light theme      |
| `Global Dark`  | Shared/global components — dark  |
| `Global Light` | Shared/global components — light |

---

## 📈 Roadmap

- [x] Atomic Design Registry (Atoms, Molecules, Organisms)
- [x] Page Templates (Home, Wallet, Trade)
- [x] Multi-mode token resolution (Kripto / Hisse / Global × Light / Dark)
- [x] Remote deployment (Railway)
- [x] Multi-client SSE support with session isolation
- [x] API key authentication
- [x] Prompt templates for common tasks
- [ ] Automated Figma-to-JSON extraction pipeline
- [ ] Component implementation prompt generators
- [ ] Streaming token resolution for batch queries

---

## 🤝 Tech Stack

| Layer      | Technology                            |
| ---------- | ------------------------------------- |
| Runtime    | Node.js (ESM)                         |
| Language   | TypeScript                            |
| Framework  | Express 5                             |
| Protocol   | MCP SDK (`@modelcontextprotocol/sdk`) |
| Transport  | Server-Sent Events (SSE)              |
| Build      | tsup                                  |
| Deployment | Railway (Docker)                      |

---

_Powered by [Model Context Protocol](https://modelcontextprotocol.io) • Deployed on [Railway](https://railway.app)_
