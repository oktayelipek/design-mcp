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

interface RegistryEntry {
  name: string;
  category: string;
  file: string;
  composedOf?: string[];
  variants?: string[];
  usedIn?: string[];
}

interface TreeNode {
  name: string;
  category: string;
  children: TreeNode[];
}

function findComponentInRegistry(componentName: string): {
  entry: RegistryEntry | null;
  layer: "atom" | "molecule" | "organism" | "template" | null;
  detail: any;
} {
  const lowerName = componentName.toLowerCase();

  const atomsReg = readJsonFile("atoms/_registry.json");
  const atomEntry = atomsReg?.components?.find(
    (c: any) => c.name.toLowerCase() === lowerName,
  );
  if (atomEntry)
    return {
      entry: atomEntry,
      layer: "atom",
      detail: readJsonFile(`atoms/${atomEntry.file}`),
    };

  const molReg = readJsonFile("molecules/_registry.json");
  const molEntry = molReg?.components?.find(
    (c: any) => c.name.toLowerCase() === lowerName,
  );
  if (molEntry)
    return {
      entry: molEntry,
      layer: "molecule",
      detail: readJsonFile(`molecules/${molEntry.file}`),
    };

  const orgReg = readJsonFile("organisms/_registry.json");
  const orgEntry = orgReg?.components?.find(
    (c: any) => c.name.toLowerCase() === lowerName,
  );
  if (orgEntry)
    return {
      entry: orgEntry,
      layer: "organism",
      detail: readJsonFile(`organisms/${orgEntry.file}`),
    };

  const tmpReg = readJsonFile("templates/_registry.json");
  const tmpEntry = tmpReg?.templates?.find(
    (t: any) => t.name.toLowerCase() === lowerName,
  );
  if (tmpEntry)
    return {
      entry: { ...tmpEntry, category: "template" },
      layer: "template",
      detail: readJsonFile(`templates/${tmpEntry.file}`),
    };

  return { entry: null, layer: null, detail: null };
}

function buildComponentTree(
  componentName: string,
  visited: Set<string> = new Set(),
): TreeNode | null {
  if (visited.has(componentName.toLowerCase())) {
    return { name: componentName, category: "circular-ref", children: [] };
  }
  visited.add(componentName.toLowerCase());

  const { entry, layer, detail } = findComponentInRegistry(componentName);
  if (!entry || !layer) return null;

  const children: TreeNode[] = [];
  const composedOf = detail?.composedOf || entry.composedOf || [];

  for (const childName of composedOf) {
    const childNode = buildComponentTree(childName, new Set(visited));
    if (childNode) {
      children.push(childNode);
    } else {
      children.push({ name: childName, category: "external", children: [] });
    }
  }

  return { name: entry.name, category: layer, children };
}

function detectModule(componentName: string): string | null {
  const tmpReg = readJsonFile("templates/_registry.json");
  if (!tmpReg?.templates) return null;

  for (const tmpl of tmpReg.templates) {
    const detail = readJsonFile(`templates/${tmpl.file}`);
    if (!detail) continue;
    const sectionComponents = (detail.sections || []).map((s: any) =>
      s.component?.toLowerCase(),
    );
    if (sectionComponents.includes(componentName.toLowerCase())) {
      return tmpl.name;
    }
  }

  const orgReg = readJsonFile("organisms/_registry.json");
  for (const org of orgReg?.components || []) {
    if (org.usedIn?.some((u: string) => u.toLowerCase().includes("wallet")))
      if (
        org.composedOf?.some(
          (c: string) => c.toLowerCase() === componentName.toLowerCase(),
        )
      )
        return "Wallet Page";
    if (org.usedIn?.some((u: string) => u.toLowerCase().includes("trade")))
      if (
        org.composedOf?.some(
          (c: string) => c.toLowerCase() === componentName.toLowerCase(),
        )
      )
        return "Trade Pages";
  }

  return null;
}

// --- MULTI-CLIENT HANDLER FACTORY ---
function setupHandlers(server: Server) {
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
          name: "get_component_tree",
          description:
            "Get the full dependency tree of a component — shows which atoms, molecules, and organisms compose it, recursively.",
          inputSchema: {
            type: "object",
            properties: {
              componentName: {
                type: "string",
                description:
                  "Name of the component (e.g. 'Order Book', 'Wallet Balance Card')",
              },
            },
            required: ["componentName"],
          },
        },
        {
          name: "generate_component_prompt",
          description:
            "Generate a comprehensive, context-aware implementation prompt for a component. Includes full spec, sub-component details, resolved tokens, layout rules, and guidelines.",
          inputSchema: {
            type: "object",
            properties: {
              componentName: {
                type: "string",
                description: "Name of the component to implement",
              },
              platform: {
                type: "string",
                enum: ["react", "swiftui", "compose", "flutter"],
                description: "Target platform for code generation",
              },
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
                description:
                  "Theme mode for token resolution (default: Kripto Dark)",
              },
            },
            required: ["componentName"],
          },
        },
        {
          name: "get_implementation_checklist",
          description:
            "Get a verification checklist for implementing a component — covers tokens, variants, states, spacing, and accessibility.",
          inputSchema: {
            type: "object",
            properties: {
              componentName: {
                type: "string",
                description: "Name of the component",
              },
            },
            required: ["componentName"],
          },
        },
        {
          name: "get_code_snippet",
          description:
            "Get a production-ready code snippet (Code Connect) for a component.",
          inputSchema: {
            type: "object",
            properties: {
              componentName: { type: "string" },
              platform: {
                type: "string",
                enum: ["react", "swiftui", "compose"],
              },
            },
            required: ["componentName", "platform"],
          },
        },
        {
          name: "get_guidelines",
          description: "Get module guidelines.",
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
          {
            type: "text",
            text: JSON.stringify({ colors, typography }, null, 2),
          },
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
      const target = (args as any)?.atomName;
      const reg = readJsonFile("atoms/_registry.json");
      const entry = reg?.components?.find(
        (c: any) => c.name.toLowerCase() === target.toLowerCase(),
      );
      if (!entry) throw new Error(`Atom not found: ${target}`);
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
      const target = (args as any)?.moleculeName;
      const reg = readJsonFile("molecules/_registry.json");
      const entry = reg?.components?.find(
        (c: any) => c.name.toLowerCase() === target.toLowerCase(),
      );
      if (!entry) throw new Error(`Molecule not found: ${target}`);
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

    if (name === "get_component_tree") {
      const componentName = (args as any)?.componentName;
      const tree = buildComponentTree(componentName);
      if (!tree) throw new Error(`Component not found: ${componentName}`);

      const flattenTree = (node: TreeNode, depth: number = 0): string => {
        const indent = "  ".repeat(depth);
        const badge =
          node.category === "external" ? "[ext]" : `[${node.category}]`;
        let line = `${indent}${badge} ${node.name}`;
        for (const child of node.children) {
          line += "\n" + flattenTree(child, depth + 1);
        }
        return line;
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                tree,
                visualization: flattenTree(tree),
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    if (name === "generate_component_prompt") {
      const componentName = (args as any)?.componentName;
      const platform = (args as any)?.platform || "react";
      const mode = (args as any)?.mode || "Kripto Dark";

      const { entry, layer, detail } = findComponentInRegistry(componentName);
      if (!entry || !layer)
        throw new Error(`Component not found: ${componentName}`);

      const tree = buildComponentTree(componentName);
      const colors = readJsonFile("tokens/colors.json");
      const typography = readJsonFile("tokens/typography.json");

      // Collect sub-component specs
      const subSpecs: Record<string, any> = {};
      const composedOf = detail?.composedOf || entry.composedOf || [];
      for (const childName of composedOf) {
        const child = findComponentInRegistry(childName);
        if (child.detail) {
          subSpecs[childName] = child.detail;
        }
      }

      // Resolve all tokens in the component
      const resolvedTokens: Record<string, any> = {};
      if (detail?.variants) {
        for (const [variantName, variantDef] of Object.entries(
          detail.variants,
        )) {
          const tokenMap = (variantDef as any)?.tokenMap;
          if (!tokenMap) continue;
          resolvedTokens[variantName] = {};
          for (const [state, tokens] of Object.entries(tokenMap)) {
            resolvedTokens[variantName][state] = {};
            for (const [key, tokenRef] of Object.entries(tokens as any)) {
              if (
                typeof tokenRef === "string" &&
                !tokenRef.startsWith("#") &&
                tokenRef !== "transparent"
              ) {
                const resolved = resolveTokenValue(tokenRef, mode, colors);
                resolvedTokens[variantName][state][key] = {
                  token: tokenRef,
                  hex: resolved ?? "unresolved",
                };
              } else {
                resolvedTokens[variantName][state][key] = {
                  token: tokenRef,
                  hex: tokenRef,
                };
              }
            }
          }
        }
      }

      // Detect module and load guidelines
      const moduleName = detectModule(componentName);
      let guidelines: string | null = null;
      if (moduleName) {
        const guidelineSlug = moduleName.toLowerCase().includes("wallet")
          ? "wallet"
          : moduleName.toLowerCase().includes("home")
            ? "home"
            : null;
        if (guidelineSlug) {
          const gPath = path.join(
            __dirname,
            "data",
            "guidelines",
            `${guidelineSlug}.md`,
          );
          if (fs.existsSync(gPath))
            guidelines = fs.readFileSync(gPath, "utf-8");
        }
      }

      // Build the mega prompt
      const prompt = [
        `# Implementation Brief: ${entry.name}`,
        ``,
        `## Target`,
        `- **Component:** ${entry.name}`,
        `- **Layer:** ${layer}`,
        `- **Platform:** ${platform}`,
        `- **Theme Mode:** ${mode}`,
        moduleName ? `- **Page Context:** ${moduleName}` : "",
        ``,
        `## Component Spec`,
        "```json",
        JSON.stringify(detail, null, 2),
        "```",
        ``,
        `## Dependency Tree`,
        "```",
        tree
          ? (() => {
              const renderNode = (node: TreeNode, d: number = 0): string => {
                const ind = "  ".repeat(d);
                const b =
                  node.category === "external" ? "[ext]" : `[${node.category}]`;
                let l = `${ind}${b} ${node.name}`;
                for (const c of node.children) l += "\n" + renderNode(c, d + 1);
                return l;
              };
              return renderNode(tree);
            })()
          : "(no tree)",
        "```",
      ];

      if (Object.keys(subSpecs).length > 0) {
        prompt.push("", "## Sub-Component Specs");
        for (const [childName, spec] of Object.entries(subSpecs)) {
          prompt.push(
            `### ${childName}`,
            "```json",
            JSON.stringify(spec, null, 2),
            "```",
          );
        }
      }

      if (Object.keys(resolvedTokens).length > 0) {
        prompt.push(
          "",
          `## Resolved Tokens (${mode})`,
          "```json",
          JSON.stringify(resolvedTokens, null, 2),
          "```",
        );
      }

      if (guidelines) {
        prompt.push("", "## Design Guidelines", guidelines);
      }

      prompt.push(
        "",
        "## Implementation Rules",
        `1. Use the exact design tokens listed above — do NOT hardcode hex values`,
        `2. Implement ALL variants: ${(entry.variants || Object.keys(detail?.variants || {})).join(", ") || "default"}`,
        `3. Implement ALL states from the tokenMap`,
        `4. Follow the layout structure exactly as specified`,
        `5. Use semantic naming matching the design system`,
        detail?.sizes
          ? `6. Support all sizes: ${Object.keys(detail.sizes).join(", ")}`
          : "",
        detail?.props
          ? `7. Expose these props: ${Object.keys(detail.props).join(", ")}`
          : "",
      );

      return {
        content: [
          {
            type: "text",
            text: prompt.filter(Boolean).join("\n"),
          },
        ],
      };
    }

    if (name === "get_implementation_checklist") {
      const componentName = (args as any)?.componentName;
      const { entry, layer, detail } = findComponentInRegistry(componentName);
      if (!entry || !layer)
        throw new Error(`Component not found: ${componentName}`);

      const composedOf = detail?.composedOf || entry.composedOf || [];
      const variants = entry.variants || Object.keys(detail?.variants || {});
      const states = detail?.states || [];
      const props = detail?.props ? Object.keys(detail.props) : [];
      const sizes = detail?.sizes ? Object.keys(detail.sizes) : [];

      // Gather all token paths used
      const tokenPaths = new Set<string>();
      if (detail?.variants) {
        for (const vDef of Object.values(detail.variants)) {
          const tMap = (vDef as any)?.tokenMap;
          if (!tMap) continue;
          for (const stateMap of Object.values(tMap)) {
            for (const tokenRef of Object.values(stateMap as any)) {
              if (
                typeof tokenRef === "string" &&
                !tokenRef.startsWith("#") &&
                tokenRef !== "transparent"
              )
                tokenPaths.add(tokenRef);
            }
          }
        }
      }

      const checklist = {
        component: entry.name,
        layer,
        checks: [
          {
            category: "Structure",
            items: [
              {
                check: `Component renders correctly`,
                required: true,
              },
              ...composedOf.map((c: string) => ({
                check: `Sub-component "${c}" integrated`,
                required: true,
              })),
              detail?.layout
                ? {
                    check: `Layout direction: ${detail.layout.direction || detail.layout.type}`,
                    required: true,
                  }
                : null,
            ].filter(Boolean),
          },
          {
            category: "Variants & States",
            items: [
              ...variants.map((v: string) => ({
                check: `Variant "${v}" implemented`,
                required: true,
              })),
              ...states.map((s: string) => ({
                check: `State "${s}" handled`,
                required: true,
              })),
            ],
          },
          {
            category: "Design Tokens",
            items: [
              ...Array.from(tokenPaths).map((t: string) => ({
                check: `Token "${t}" applied`,
                required: true,
              })),
              {
                check: "No hardcoded hex values",
                required: true,
              },
              {
                check: "Supports theme mode switching",
                required: true,
              },
            ],
          },
          {
            category: "Props",
            items: props.map((p: string) => ({
              check: `Prop "${p}" exposed with correct type: ${detail.props[p].type}`,
              required: true,
            })),
          },
          {
            category: "Sizing",
            items: sizes.map((s: string) => ({
              check: `Size "${s}" implemented`,
              required: true,
            })),
          },
          {
            category: "Accessibility",
            items: [
              {
                check: "Semantic HTML elements used",
                required: true,
              },
              {
                check: "ARIA labels for interactive elements",
                required: detail?.category !== "atom" || composedOf.length > 0,
              },
              {
                check: "Keyboard navigation support",
                required: [
                  "button",
                  "input",
                  "toggle",
                  "checkbox",
                  "radio",
                  "tabs",
                  "segmented control",
                ].some((k) => entry.name.toLowerCase().includes(k)),
              },
            ],
          },
        ].filter((section) => section.items.length > 0),
        totalChecks: 0,
        requiredChecks: 0,
      };

      checklist.totalChecks = checklist.checks.reduce(
        (sum, s) => sum + s.items.length,
        0,
      );
      checklist.requiredChecks = checklist.checks.reduce(
        (sum, s) => sum + s.items.filter((i: any) => i.required).length,
        0,
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(checklist, null, 2),
          },
        ],
      };
    }

    if (name === "get_guidelines") {
      const module = (args as any)?.module;
      const filePath = path.join(
        __dirname,
        "data",
        "guidelines",
        `${module}.md`,
      );
      if (fs.existsSync(filePath))
        return {
          content: [{ type: "text", text: fs.readFileSync(filePath, "utf-8") }],
        };
      throw new Error(`Guidelines for module "${module}" not found.`);
    }

    if (name === "get_code_snippet") {
      const { componentName, platform } = args as any;
      const lowerName = componentName.toLowerCase().replace(/\s+/g, "-");
      let ext = "tsx";
      if (platform === "swiftui") ext = "swift";
      if (platform === "compose") ext = "kt";

      const filePath = path.join(
        __dirname,
        "data",
        "snippets",
        platform,
        `${lowerName}.${ext}`,
      );

      if (!fs.existsSync(filePath)) {
        throw new Error(
          `Code snippet not found for ${componentName} on ${platform} platform.`,
        );
      }

      const code = fs.readFileSync(filePath, "utf-8");
      return {
        content: [
          {
            type: "text",
            text: code,
          },
        ],
      };
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
            {
              name: "partName",
              description: "e.g. BalanceCard",
              required: true,
            },
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
}

// --- SSE SERVER APP ---
const transports = new Map<string, SSEServerTransport>();

// mcp-remote tries POST /sse first (Streamable HTTP strategy) — return 405 cleanly
app.post("/sse", (req, res) => {
  res
    .status(405)
    .json({ error: "Method Not Allowed. Use GET for SSE connections." });
});

app.get("/sse", authMiddleware, async (req, res) => {
  console.log(`[SSE] New client connection: ${req.ip}`);

  try {
    const transport = new SSEServerTransport("/message", res);

    const connectionServer = new Server(
      { name: "design-system-mcp", version: "2.3.0" },
      { capabilities: { resources: {}, tools: {}, prompts: {} } },
    );

    setupHandlers(connectionServer);

    transports.set(transport.sessionId, transport);

    transport.onclose = () => {
      console.log(`[SSE] Closed session ${transport.sessionId}`);
      transports.delete(transport.sessionId);
    };

    await connectionServer.connect(transport);
    console.log(`[SSE] Session established: ${transport.sessionId}`);
  } catch (err: any) {
    console.error(`[SSE] FATAL:`, err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

// NO authMiddleware — session was already authenticated during SSE connection.
// NO express.json() — handlePostMessage reads the raw body stream itself.
app.post("/message", async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports.get(sessionId);
  if (!transport) return res.status(400).send(`Unknown session: ${sessionId}`);
  try {
    await transport.handlePostMessage(req, res);
  } catch (err: any) {
    console.error(`[MSG] Error for ${sessionId}:`, err);
    if (!res.headersSent) res.status(500).send(err.message);
  }
});

// Global Error Handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("[GLOBAL ERROR]", err);
    if (!res.headersSent) {
      res.status(500).send(`Internal Server Error: ${err.message}`);
    }
  },
);

app.get("/health", (req, res) => res.status(200).send("OK"));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Design System MCP v2.3.0 running on port ${PORT}`);
});
