# 🎨 Design System MCP Server (v2.1)

This project is a **Model Context Protocol (MCP)** server built with Node.js and TypeScript. It exposes a structured UI Design System (Atoms, Molecules, Organisms, Templates) and module-specific design guidelines to AI assistants (Claude, Cursor, ChatGPT).

By providing this context, AI tools can generate code that strictly adheres to the provided design rules, token sets, and component architectures.

## 🚀 Features

- **SSE Transport:** Communication via Server-Sent Events for real-time integration.
- **Atomic Design Registry:** Fully categorized UI components (Atoms, Molecules, Organisms).
- **Page Templates:** Ready-to-use page layouts (Home Page, Wallet Page).
- **Design Guidelines:** Module-specific visual rules (Spacing, PNL indicators, Typography hierarchy) in Markdown format.
- **Smart Color Resolution:** Tools to resolve semantic tokens (e.g., `text.focus`) based on different modes (Kripto, Hisse, Global - Light/Dark).

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
├── package.json
└── tsconfig.json
```

---

## 🛠️ MCP Tools

The server exposes several tools for AI assistants:

- `get_tokens`: Fetches all raw design tokens.
- `get_atoms_list` / `get_atom_detail`: Browse UI atoms.
- `get_molecules_list` / `get_molecule_detail`: Browse UI molecules.
- `get_templates_list` / `get_template_detail`: Access page layouts.
- `get_guidelines(module)`: Get specific design rules (e.g., `home`, `wallet`).
- `resolve_token(tokenPath, mode)`: Resolve a semantic token to its hex value.
- `get_component_colors`: Get full theme colors for a specific component.

---

## 👥 Sharing with Friends

To share your Design System MCP with others, the server needs to be publicly accessible and (optionally) secured.

### 1. Secure with an API Key

In your environment variables (e.g., on Railway), set:

```text
MCP_API_KEY=your_secret_key_here
```

If this key is set, the server will require it for every connection.

### 2. Client Connection (Remote)

Your friends can add your public URL to their **Claude Desktop** config.

**Without API Key:**

```json
"shared-design": {
  "command": "node",
  "args": ["/path/to/local/proxy/script.js", "https://your-server.up.railway.app/sse"]
}
```

**With API Key (via query param):**

```json
"shared-design": {
  "command": "node",
  "args": ["/path/to/local/proxy/script.js", "https://your-server.up.railway.app/sse?apiKey=your_secret_key_here"]
}
```

> [!TIP]
> Since Claude's native SSE transport doesn't allow custom headers easily, we've enabled `apiKey` support via query parameters for easier sharing.

---

## 🚦 Getting Started

**Installation:**

```bash
npm install
npm run build
```

**Run Development Mode:**

```bash
npm run dev
```

**Run Production Server:**

```bash
npm start
```

---

## 🤖 Connection Logic

For **Claude Desktop**, add the server configuration:

```json
"design-mcp": {
  "command": "node",
  "args": ["/path/to/design-mcp/dist/index.js"]
}
```

---

## 📈 Roadmap

- [x] Atomic Design Registry implementation.
- [x] Home Page & Wallet Page templates.
- [x] Multi-mode token resolution (Kripto/Hisse/Global).
- [ ] Automated Figma-to-JSON extraction scripts.
- [ ] Component implementation prompt generators.

_Powered by Model Context Protocol (MCP)._
