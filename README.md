# 🎨 Design System MCP Server

This project is a **Model Context Protocol (MCP)** server built with Node.js and TypeScript. Its primary goal is to expose a UI Design System (colors, typography, and component specifications) to AI assistants (like Claude, Cursor, ChatGPT) via the Server-Sent Events (SSE) transport protocol. By doing so, AI tools can generate code that strictly adheres to the provided design rules and components.

## 🚀 Features

- **SSE Transport:** Designed to run continuously and communicate efficiently with MCP clients.
- **Resources Architecture:** Exposes static design data such as `colors` and `typography` JSON payloads directly as readable URIs.
- **Component Tooling:** (WIP) Will allow AIs to specifically request code/import examples of components (e.g., getting a React `<Button>`).
- **Headless & Scalable:** By separating "tokens" (JSON) and "components" (MD/TS), it supports current React-based implementations but is modular enough for future expansion into Flutter or Swift.

---

## 🏗️ Project Structure

```text
├── src/
│   ├── data/                 # The actual Design System values!
│   │   ├── colors.json       # Headless color tokens
│   │   ├── typography.json   # Headless font and text styles
│   │   └── components/       # Component specs (React, Flutter etc.)
│   │       └── Button.md     # Example component spec
│   └── index.ts              # Express Server & MCP SSE Initialization
├── package.json
└── tsconfig.json
```

---

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Build the TypeScript code
npm run build
```

---

## 🚦 Running the Server

**Development Mode:**

```bash
npm run dev
```

**Production Mode:**

```bash
npm run build
npm start
```

Once running, the server will output two endpoints:

- **SSE Endpoint:** `http://localhost:3001/sse`
- **Message Endpoint:** `http://localhost:3001/message`

---

## 🤖 Connecting to a Client

To connect this to an MCP client like **Claude Desktop**, add the server configuration using this logic (for SSE, wait for the cloud deployment URL, or run a local proxy script):

If converted to Stdio in the future, it would look like this in `claude_desktop_config.json`:

```json
"design-mcp": {
  "command": "node",
  "args": ["/path/to/design-mcp/dist/index.js"]
}
```

---

## 📈 Roadmap & Tasks

You can find the active development tasks inside [`design-system-mcp-server.md`](./design-system-mcp-server.md).

**Current Status:** Building out the "Resources" (`Task 5`) to stream the JSON token configurations.

---

_Powered by Model Context Protocol (MCP)._
