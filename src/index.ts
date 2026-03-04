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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

function readJsonFile(relativePath: string): any {
  const filePath = path.join(__dirname, "data", relativePath);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }
  return null;
}

function resolveTokenValue(
  tokenPath: string,
  mode: string,
  colors: any,
): string | null {
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
}

// Initialize MCP Server
const server = new Server(
  {
    name: "design-system-mcp",
    version: "2.1.0",
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
        description:
          "Semantic color tokens for BtcTurk design system (Kripto, Hisse, Global)",
        mimeType: "application/json",
      },
      {
        uri: "design-system://tokens/typography",
        name: "Design Tokens — Typography",
        description: "Typography tokens",
        mimeType: "application/json",
      },
      {
        uri: "design-system://atoms",
        name: "Atoms Registry",
        description: "Index of all UI atoms",
        mimeType: "application/json",
      },
      {
        uri: "design-system://molecules",
        name: "Molecules Registry",
        description: "Index of all UI molecules",
        mimeType: "application/json",
      },
      {
        uri: "design-system://organisms",
        name: "Organisms Registry",
        description: "Index of all UI organisms",
        mimeType: "application/json",
      },
      {
        uri: "design-system://templates",
        name: "Templates Registry",
        description: "Index of all UI templates (combined organisms)",
        mimeType: "application/json",
      },
      {
        uri: "design-system://guidelines/wallet",
        name: "Wallet Module Guidelines",
        description:
          "Visual rules, spacing, and patterns for the Wallet module",
        mimeType: "text/markdown",
      },
      {
        uri: "design-system://guidelines/home",
        name: "Home Page Module Guidelines",
        description: "Visual rules, spacing, and patterns for the Home page",
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
      const text = fs.readFileSync(guidelinePath, "utf-8");
      return {
        contents: [
          {
            uri: request.params.uri,
            mimeType: "text/markdown",
            text,
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
        description: "Get all design tokens (colors and typography).",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "get_atoms_list",
        description: "Get a summary list of all UI atoms.",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "get_atom_detail",
        description: "Get the full detail of a specific atom.",
        inputSchema: {
          type: "object",
          properties: {
            atomName: { type: "string" },
          },
          required: ["atomName"],
        },
      },
      {
        name: "get_molecules_list",
        description: "Get a summary list of all UI molecules.",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "get_molecule_detail",
        description: "Get the full detail of a specific molecule.",
        inputSchema: {
          type: "object",
          properties: {
            moleculeName: { type: "string" },
          },
          required: ["moleculeName"],
        },
      },
      {
        name: "get_organisms_list",
        description: "Get a summary list of all UI organisms.",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "get_organism_detail",
        description: "Get the full detail of a specific organism.",
        inputSchema: {
          type: "object",
          properties: {
            organismName: { type: "string" },
          },
          required: ["organismName"],
        },
      },
      {
        name: "get_templates_list",
        description: "Get a summary list of all UI templates.",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "get_template_detail",
        description: "Get the full detail of a specific template.",
        inputSchema: {
          type: "object",
          properties: {
            templateName: { type: "string" },
          },
          required: ["templateName"],
        },
      },
      {
        name: "resolve_token",
        description: "Resolve a semantic design token to its actual value.",
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
        description:
          "Get the resolved color values for a specific component (atom or molecule).",
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
        description:
          "Get design guidelines and visual rules for a specific module.",
        inputSchema: {
          type: "object",
          properties: {
            module: { type: "string", enum: ["wallet", "home"] },
          },
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

  // ATOMS
  if (name === "get_atoms_list") {
    const registry = readJsonFile("atoms/_registry.json");
    return {
      content: [{ type: "text", text: JSON.stringify(registry, null, 2) }],
    };
  }

  if (name === "get_atom_detail") {
    const atomName = (args as any)?.atomName;
    if (!atomName) throw new Error("atomName is required");

    const registry = readJsonFile("atoms/_registry.json");
    const entry = registry?.components?.find(
      (c: any) => c.name.toLowerCase() === atomName.toLowerCase(),
    );
    if (!entry) throw new Error(`Atom not found: ${atomName}`);

    const detail = readJsonFile(`atoms/${entry.file}`);
    return {
      content: [{ type: "text", text: JSON.stringify(detail, null, 2) }],
    };
  }

  // MOLECULES
  if (name === "get_molecules_list") {
    const registry = readJsonFile("molecules/_registry.json");
    return {
      content: [{ type: "text", text: JSON.stringify(registry, null, 2) }],
    };
  }

  if (name === "get_molecule_detail") {
    const moleculeName = (args as any)?.moleculeName;
    if (!moleculeName) throw new Error("moleculeName is required");

    const registry = readJsonFile("molecules/_registry.json");
    const entry = registry?.components?.find(
      (c: any) => c.name.toLowerCase() === moleculeName.toLowerCase(),
    );
    if (!entry) throw new Error(`Molecule not found: ${moleculeName}`);

    const detail = readJsonFile(`molecules/${entry.file}`);
    return {
      content: [{ type: "text", text: JSON.stringify(detail, null, 2) }],
    };
  }

  // ORGANISMS
  if (name === "get_organisms_list") {
    const registry = readJsonFile("organisms/_registry.json");
    return {
      content: [{ type: "text", text: JSON.stringify(registry, null, 2) }],
    };
  }

  if (name === "get_organism_detail") {
    const organismName = (args as any)?.organismName;
    const registry = readJsonFile("organisms/_registry.json");
    const entry = registry?.components?.find(
      (c: any) => c.name.toLowerCase() === organismName.toLowerCase(),
    );
    if (!entry) throw new Error(`Organism not found: ${organismName}`);

    const detail = readJsonFile(`organisms/${entry.file}`);
    return {
      content: [{ type: "text", text: JSON.stringify(detail, null, 2) }],
    };
  }

  // TEMPLATES (Higher-level groups of organisms)
  if (name === "get_templates_list") {
    const registry = readJsonFile("templates/_registry.json");
    return {
      content: [{ type: "text", text: JSON.stringify(registry, null, 2) }],
    };
  }

  if (name === "get_template_detail") {
    const templateName = (args as any)?.templateName;
    const registry = readJsonFile("templates/_registry.json");
    const entry = registry?.templates?.find(
      (t: any) => t.name.toLowerCase() === templateName.toLowerCase(),
    );
    if (!entry) throw new Error(`Template not found: ${templateName}`);

    const detail = readJsonFile(`templates/${entry.file}`);
    return {
      content: [{ type: "text", text: JSON.stringify(detail, null, 2) }],
    };
  }

  // RESOLVE TOKEN
  if (name === "resolve_token") {
    const tokenPath = (args as any)?.tokenPath;
    const mode = (args as any)?.mode;
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

  // GET COMPONENT COLORS
  if (name === "get_component_colors") {
    const { componentName, variant, state, mode } = args as any;

    let targetFile = null;
    let component = null;

    // Search in atoms
    const atomsReg = readJsonFile("atoms/_registry.json");
    const atomEntry = atomsReg?.components?.find(
      (c: any) => c.name.toLowerCase() === componentName.toLowerCase(),
    );
    if (atomEntry) {
      component = readJsonFile(`atoms/${atomEntry.file}`);
    } else {
      // Search in molecules
      const molReg = readJsonFile("molecules/_registry.json");
      const molEntry = molReg?.components?.find(
        (c: any) => c.name.toLowerCase() === componentName.toLowerCase(),
      );
      if (molEntry) {
        component = readJsonFile(`molecules/${molEntry.file}`);
      }
    }

    if (!component)
      throw new Error(
        `Component not found in atoms or molecules: ${componentName}`,
      );

    const variantDef = component.variants?.[variant];
    if (!variantDef) throw new Error(`Variant "${variant}" not found.`);

    const tokenMap = variantDef.tokenMap?.[state];
    if (!tokenMap) throw new Error(`State "${state}" not found.`);

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
            { component: componentName, variant, state, mode, resolvedColors },
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
    if (fs.existsSync(filePath)) {
      const text = fs.readFileSync(filePath, "utf-8");
      return {
        content: [{ type: "text", text }],
      };
    }
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
        description:
          "Guided prompt to implement a part of the Wallet module following design rules.",
        arguments: [
          {
            name: "partName",
            description:
              "Name of the wallet part (e.g., BalanceCard, AssetList)",
            required: true,
          },
        ],
      },
      {
        name: "implement-home-part",
        description:
          "Guided prompt to implement a part of the Home page following design rules.",
        arguments: [
          {
            name: "partName",
            description:
              "Name of the home page part (e.g., PositionsList, MarketingBanner)",
            required: true,
          },
        ],
      },
    ],
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  if (request.params.name === "implement-wallet-part") {
    const partName = request.params.arguments?.partName;
    return {
      description: `Implement the ${partName} part of the Wallet module.`,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `I need to implement the "${partName}" for the Wallet module. 
Before starting, please read the design guidelines from 'design-system://guidelines/wallet' and ensure all spacing, colors (PNL indicators), and typography rules are followed strictly.`,
          },
        },
      ],
    };
  }
  if (request.params.name === "implement-home-part") {
    const partName = request.params.arguments?.partName;
    return {
      description: `Implement the ${partName} part of the Home page.`,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `I need to implement the "${partName}" for the Home page. 
Before starting, please read the design guidelines from 'design-system://guidelines/home' and ensure all spacing, colors, and marketing banner rules are followed strictly.`,
          },
        },
      ],
    };
  }
  throw new Error("Prompt not found");
});

let transport: SSEServerTransport;
app.get("/sse", async (req, res) => {
  console.log("New SSE connection established");
  transport = new SSEServerTransport("/message", res);
  await server.connect(transport);
});

app.post("/message", express.json(), async (req, res) => {
  if (!transport) {
    res.status(400).send("No active SSE connection.");
    return;
  }
  await transport.handlePostMessage(req, res);
});

app.listen(PORT, () => {
  console.log(`🚀 Design System MCP Server v2.1 is running!`);
  console.log(`📡 SSE Endpoint: http://localhost:${PORT}/sse`);
  console.log(`\n📦 Available tools:`);
  console.log(`   • get_atoms_list / get_atom_detail`);
  console.log(`   • get_molecules_list / get_molecule_detail`);
  console.log(`   • get_organisms_list / get_organism_detail`);
  console.log(`   • get_templates_list / get_template_detail`);
  console.log(`   • get_component_colors`);
  console.log(`   • get_guidelines`);
  console.log(`   • resolve_token`);
});
