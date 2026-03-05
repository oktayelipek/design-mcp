import express from "express";
import cors from "cors";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

config();

const API_KEY = process.env.MCP_API_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Process-level error handling to prevent unhandled crashes on Railway
process.on("uncaughtException", (err) => {
  console.error("CRITICAL: Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(
    "CRITICAL: Unhandled Rejection at:",
    promise,
    "reason:",
    reason,
  );
});

// Simple Auth Middleware
const authMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
    return next(); // Safe fallback for local or unset keys
  }

  const key = req.headers["x-api-key"] || req.query.apiKey;
  if (key !== API_KEY) {
    console.log(`[AUTH] Unauthorized access attempt from ${req.ip}`);
    res.status(401).send("Unauthorized: Invalid API Key");
    return;
  }
  next();
};

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

/**
 * Robust JSON reader with error handling
 */
function readJsonFile(relativePath: string): any {
  try {
    const filePath = path.join(__dirname, "data", relativePath);
    if (!fs.existsSync(filePath)) {
      console.warn(`[DATA] File not found: ${filePath}`);
      return null;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`[DATA] Error reading ${relativePath}:`, error);
    return null;
  }
}

function resolveTokenValue(
  tokenPath: string,
  mode: string,
  colors: any,
): string | null {
  try {
    const modeColors = colors?.modes?.[mode];
    if (!modeColors) return null;

    const parts = tokenPath.split(".");
    let current: any = modeColors;
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        return null;
      }
    }
    return typeof current === "string" ? current : null;
  } catch (err) {
    return null;
  }
}

// Initialize MCP Server
const server = new Server(
  {
    name: "design-system-mcp",
    version: "2.1.2",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  },
);

// --- RESOURCES ---
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "design-system://tokens/colors",
        name: "Design Tokens — Colors",
        mimeType: "application/json",
      },
      {
        uri: "design-system://tokens/typography",
        name: "Design Tokens — Typography",
        mimeType: "application/json",
      },
      {
        uri: "design-system://atoms",
        name: "Atoms Registry",
        mimeType: "application/json",
      },
      {
        uri: "design-system://molecules",
        name: "Molecules Registry",
        mimeType: "application/json",
      },
      {
        uri: "design-system://organisms",
        name: "Organisms Registry",
        mimeType: "application/json",
      },
      {
        uri: "design-system://templates",
        name: "Templates Registry",
        mimeType: "application/json",
      },
      {
        uri: "design-system://guidelines/wallet",
        name: "Wallet Module Guidelines",
        mimeType: "text/markdown",
      },
      {
        uri: "design-system://guidelines/home",
        name: "Home Page Module Guidelines",
        mimeType: "text/markdown",
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uriMap: Record<string, string> = {
    "design-system://tokens/colors": "tokens/colors.json",
    "design-system://tokens/typography": "tokens/typography.json",
    "design-system://atoms": "atoms/_registry.json",
    "design-system://molecules": "molecules/_registry.json",
    "design-system://organisms": "organisms/_registry.json",
    "design-system://templates": "templates/_registry.json",
  };

  const filePath = uriMap[request.params.uri];
  if (filePath) {
    const content = readJsonFile(filePath);
    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: "application/json",
          text: JSON.stringify(content ?? {}, null, 2),
        },
      ],
    };
  }

  if (request.params.uri.startsWith("design-system://guidelines/")) {
    const module = request.params.uri.split("/").pop();
    const guidelinePath = path.join(
      __dirname,
      "data",
      "guidelines",
      `${module}.md`,
    );
    if (fs.existsSync(guidelinePath)) {
      return {
        contents: [
          {
            uri: request.params.uri,
            mimeType: "text/markdown",
            text: fs.readFileSync(guidelinePath, "utf-8"),
          },
        ],
      };
    }
  }

  throw new Error(`Resource not found: ${request.params.uri}`);
});

// --- TOOLS ---
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_tokens",
        description: "Get all design tokens.",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "get_atoms_list",
        description: "List all UI atoms.",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "get_atom_detail",
        description: "Get detail of an atom.",
        inputSchema: {
          type: "object",
          properties: { atomName: { type: "string" } },
          required: ["atomName"],
        },
      },
      {
        name: "get_molecules_list",
        description: "List all UI molecules.",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "get_molecule_detail",
        description: "Get detail of a molecule.",
        inputSchema: {
          type: "object",
          properties: { moleculeName: { type: "string" } },
          required: ["moleculeName"],
        },
      },
      {
        name: "get_organisms_list",
        description: "List all UI organisms.",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "get_organism_detail",
        description: "Get detail of an organism.",
        inputSchema: {
          type: "object",
          properties: { organismName: { type: "string" } },
          required: ["organismName"],
        },
      },
      {
        name: "get_templates_list",
        description: "List all UI templates.",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "get_template_detail",
        description: "Get detail of a template.",
        inputSchema: {
          type: "object",
          properties: { templateName: { type: "string" } },
          required: ["templateName"],
        },
      },
      {
        name: "resolve_token",
        description: "Resolve token to value.",
        inputSchema: {
          type: "object",
          properties: {
            tokenPath: { type: "string" },
            mode: {
              type: "string",
              enum: [
                "Kripto Dark",
                "Kripto Light",
                "Hisse Dark",
                "Hisse Light",
                "Global Dark",
                "Global Light",
              ],
            },
          },
          required: ["tokenPath", "mode"],
        },
      },
      {
        name: "get_component_colors",
        description: "Get colors for component.",
        inputSchema: {
          type: "object",
          properties: {
            componentName: { type: "string" },
            variant: { type: "string" },
            state: { type: "string" },
            mode: {
              type: "string",
              enum: [
                "Kripto Dark",
                "Kripto Light",
                "Hisse Dark",
                "Hisse Light",
                "Global Dark",
                "Global Light",
              ],
            },
          },
          required: ["componentName", "variant", "state", "mode"],
        },
      },
      {
        name: "get_guidelines",
        description: "Get module guidelines.",
        inputSchema: {
          type: "object",
          properties: { module: { type: "string", enum: ["wallet", "home"] } },
          required: ["module"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "get_tokens") {
    const colors = readJsonFile("tokens/colors.json");
    const typography = readJsonFile("tokens/typography.json");
    return {
      content: [
        { type: "text", text: JSON.stringify({ colors, typography }, null, 2) },
      ],
    };
  }

  if (name === "get_atoms_list") {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(readJsonFile("atoms/_registry.json"), null, 2),
        },
      ],
    };
  }

  if (name === "get_atom_detail") {
    const name = (args as any)?.atomName;
    const reg = readJsonFile("atoms/_registry.json");
    const entry = reg?.components?.find(
      (c: any) => c.name.toLowerCase() === name.toLowerCase(),
    );
    if (!entry) throw new Error(`Atom not found: ${name}`);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(readJsonFile(`atoms/${entry.file}`), null, 2),
        },
      ],
    };
  }

  if (name === "get_molecules_list") {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            readJsonFile("molecules/_registry.json"),
            null,
            2,
          ),
        },
      ],
    };
  }

  if (name === "get_molecule_detail") {
    const name = (args as any)?.moleculeName;
    const reg = readJsonFile("molecules/_registry.json");
    const entry = reg?.components?.find(
      (c: any) => c.name.toLowerCase() === name.toLowerCase(),
    );
    if (!entry) throw new Error(`Molecule not found: ${name}`);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            readJsonFile(`molecules/${entry.file}`),
            null,
            2,
          ),
        },
      ],
    };
  }

  if (name === "get_organisms_list") {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            readJsonFile("organisms/_registry.json"),
            null,
            2,
          ),
        },
      ],
    };
  }

  if (name === "get_organism_detail") {
    const name = (args as any)?.organismName;
    const reg = readJsonFile("organisms/_registry.json");
    const entry = reg?.components?.find(
      (c: any) => c.name.toLowerCase() === name.toLowerCase(),
    );
    if (!entry) throw new Error(`Organism not found: ${name}`);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            readJsonFile(`organisms/${entry.file}`),
            null,
            2,
          ),
        },
      ],
    };
  }

  if (name === "get_templates_list") {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            readJsonFile("templates/_registry.json"),
            null,
            2,
          ),
        },
      ],
    };
  }

  if (name === "get_template_detail") {
    const name = (args as any)?.templateName;
    const reg = readJsonFile("templates/_registry.json");
    const entry = reg?.templates?.find(
      (t: any) => t.name.toLowerCase() === name.toLowerCase(),
    );
    if (!entry) throw new Error(`Template not found: ${name}`);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            readJsonFile(`templates/${entry.file}`),
            null,
            2,
          ),
        },
      ],
    };
  }

  if (name === "resolve_token") {
    const { tokenPath, mode } = args as any;
    const colors = readJsonFile("tokens/colors.json");
    const resolved = resolveTokenValue(tokenPath, mode, colors);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ tokenPath, mode, resolved }, null, 2),
        },
      ],
    };
  }

  if (name === "get_component_colors") {
    const { componentName, variant, state, mode } = args as any;
    let component = null;

    // Search Atomic
    const atomsReg = readJsonFile("atoms/_registry.json");
    const atomEntry = atomsReg?.components?.find(
      (c: any) => c.name.toLowerCase() === componentName.toLowerCase(),
    );
    if (atomEntry) component = readJsonFile(`atoms/${atomEntry.file}`);
    else {
      const molReg = readJsonFile("molecules/_registry.json");
      const molEntry = molReg?.components?.find(
        (c: any) => c.name.toLowerCase() === componentName.toLowerCase(),
      );
      if (molEntry) component = readJsonFile(`molecules/${molEntry.file}`);
    }

    if (!component) throw new Error(`Component not found: ${componentName}`);
    const variantDef = component.variants?.[variant];
    const tokenMap = variantDef?.tokenMap?.[state];
    if (!tokenMap) throw new Error(`Variant/State not found.`);

    let effectiveTokenMap = { ...tokenMap };
    const modeOverrides = component.modeOverrides?.[mode];
    if (modeOverrides?.[variant]?.[state]) {
      effectiveTokenMap = {
        ...effectiveTokenMap,
        ...modeOverrides[variant][state],
      };
    }

    const colors = readJsonFile("tokens/colors.json");
    const resolvedColors: Record<string, any> = {};
    for (const [key, tokenRef] of Object.entries(effectiveTokenMap)) {
      if (
        typeof tokenRef === "string" &&
        !tokenRef.startsWith("#") &&
        !tokenRef.endsWith("px") &&
        tokenRef !== "transparent"
      ) {
        const resolved = resolveTokenValue(tokenRef, mode, colors);
        resolvedColors[key] = {
          token: tokenRef,
          value: resolved ?? `unresolved`,
        };
      } else {
        resolvedColors[key] = { token: tokenRef, value: tokenRef };
      }
    }
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { componentName, variant, state, mode, resolvedColors },
            null,
            2,
          ),
        },
      ],
    };
  }

  if (name === "get_guidelines") {
    const module = (args as any)?.module;
    const filePath = path.join(__dirname, "data", "guidelines", `${module}.md`);
    if (fs.existsSync(filePath))
      return {
        content: [{ type: "text", text: fs.readFileSync(filePath, "utf-8") }],
      };
    throw new Error(`Guidelines for module "${module}" not found.`);
  }

  throw new Error(`Tool not found: ${name}`);
});

// --- PROMPTS ---
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "implement-wallet-part",
        description: "Implement Wallet part.",
        arguments: [
          { name: "partName", description: "e.g. BalanceCard", required: true },
        ],
      },
      {
        name: "implement-home-part",
        description: "Implement Home part.",
        arguments: [
          { name: "partName", description: "e.g. AssetList", required: true },
        ],
      },
    ],
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const partName = args?.partName;
  const module = name.includes("wallet") ? "wallet" : "home";
  return {
    description: `Implement ${partName}`,
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `I need to implement ${partName} for the ${module} page. See 'design-system://guidelines/${module}'`,
        },
      },
    ],
  };
});

// --- SSE TRANSPORT MANAGEMENT ---
const transports = new Map<string, SSEServerTransport>();

app.get("/sse", authMiddleware, async (req, res) => {
  console.log(`[SSE] New connection attempt from ${req.ip}`);

  // Set headers to prevent buffering
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  try {
    const transport = new SSEServerTransport("/message", res);
    const sessionId = transport.sessionId;

    transports.set(sessionId, transport);
    console.log(`[SSE] Connected. Session: ${sessionId}`);

    transport.onclose = () => {
      console.log(`[SSE] Disconnected. Session: ${sessionId}`);
      transports.delete(sessionId);
    };

    await server.connect(transport);
  } catch (err) {
    console.error(`[SSE] Failed to establish transport:`, err);
    if (!res.headersSent) {
      res.status(500).send("Failed to establish SSE transport");
    }
  }
});

app.post("/message", authMiddleware, express.json(), async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports.get(sessionId);

  if (!transport) {
    console.warn(`[MSG] Unknown session: ${sessionId}`);
    res.status(400).send(`Unknown session: ${sessionId}`);
    return;
  }

  try {
    await transport.handlePostMessage(req, res);
  } catch (err) {
    console.error(`[MSG] Error handling message for ${sessionId}:`, err);
    if (!res.headersSent) {
      res.status(500).send("Error handling message");
    }
  }
});

// Health check endpoint for Railway
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Design System MCP Server v2.1.2 running on port ${PORT}`);
  console.log(`📡 SSE Endpoint: http://0.0.0.0:${PORT}/sse`);
  console.log(`🏥 Health Check: http://0.0.0.0:${PORT}/health`);
});
