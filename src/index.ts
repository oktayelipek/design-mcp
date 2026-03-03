import express from "express";
import cors from "cors";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

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
