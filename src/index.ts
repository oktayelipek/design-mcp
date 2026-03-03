import express from "express";
import cors from "cors";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

// Initialize MCP Server
const server = new Server(
  {
    name: "design-system-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

// --- RESOURCES ---
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "design-system://colors",
        name: "Design System Colors",
        description: "Color tokens for the BtcTurk design system (Light, Dark, Global)",
        mimeType: "application/json",
      },
      {
        uri: "design-system://typography",
        name: "Design System Typography",
        description: "Typography tokens for the BtcTurk design system",
        mimeType: "application/json",
      },
      {
        uri: "design-system://components",
        name: "Design System Core Components",
        description: "Core UI components (buttons, inputs, etc.) available in FellowKit",
        mimeType: "application/json",
      },
      {
        uri: "design-system://modules",
        name: "Design System Modules",
        description: "Complex UI modules (Top Nav, Trade Pages, etc.) composed of core components",
        mimeType: "application/json",
      }
    ]
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  let fileName = "";
  if (request.params.uri === "design-system://colors") fileName = "colors.json";
  else if (request.params.uri === "design-system://typography") fileName = "typography.json";
  else if (request.params.uri === "design-system://components") fileName = "core_components.json";
  else if (request.params.uri === "design-system://modules") fileName = "modules.json";
  
  if (fileName) {
    const filePath = path.join(__dirname, "data", fileName);
    const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf-8") : "{}";
    return {
      contents: [{
        uri: request.params.uri,
        mimeType: "application/json",
        text: content
      }]
    };
  }
  
  throw new Error(`Resource not found: ${request.params.uri}`);
});

// --- TOOLS ---
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_design_tokens",
        description: "Get all design system tokens (colors and typography)",
        inputSchema: {
          type: "object",
          properties: {},
        }
      },
      {
        name: "get_components_and_modules",
        description: "Get lists of all available core components and composite modules in the design system",
        inputSchema: {
          type: "object",
          properties: {},
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_design_tokens") {
    const colorsPath = path.join(__dirname, "data", "colors.json");
    const typoPath = path.join(__dirname, "data", "typography.json");
    
    let colors = {};
    let typography = {};
    
    if (fs.existsSync(colorsPath)) colors = JSON.parse(fs.readFileSync(colorsPath, "utf-8"));
    if (fs.existsSync(typoPath)) typography = JSON.parse(fs.readFileSync(typoPath, "utf-8"));
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ colors, typography }, null, 2)
      }]
    };
  }

  if (request.params.name === "get_components_and_modules") {
    const componentsPath = path.join(__dirname, "data", "core_components.json");
    const modulesPath = path.join(__dirname, "data", "modules.json");
    
    let components = [];
    let modules = [];
    
    if (fs.existsSync(componentsPath)) components = JSON.parse(fs.readFileSync(componentsPath, "utf-8"));
    if (fs.existsSync(modulesPath)) modules = JSON.parse(fs.readFileSync(modulesPath, "utf-8"));
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ components, modules }, null, 2)
      }]
    };
  }
  
  throw new Error(`Tool not found: ${request.params.name}`);
});

let transport: SSEServerTransport;

// Endpoint for the SSE connection
app.get("/sse", async (req, res) => {
  console.log("New SSE connection established");
  transport = new SSEServerTransport("/message", res);
  await server.connect(transport);
});

// Endpoint for receiving messages from the client
app.post("/message", express.json(), async (req, res) => {
  if (!transport) {
    res.status(400).send("No active SSE connection.");
    return;
  }
  await transport.handlePostMessage(req, res);
});

app.listen(PORT, () => {
  console.log(`🚀 Design System MCP Server is running!`);
  console.log(`📡 SSE Endpoint: http://localhost:${PORT}/sse`);
  console.log(`✉️  Message Endpoint: http://localhost:${PORT}/message`);
});
