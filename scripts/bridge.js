import { spawn } from "child_process";
import https from "https";
import http from "http";
import readline from "readline";

/**
 * 🛠️ Design System MCP - Stdio-to-SSE Bridge (v1.1)
 * 
 * Usage: node scripts/bridge.js <REMOTE_SSE_URL>
 */

const remoteUrl = process.argv[2];

if (!remoteUrl) {
  console.error("Usage: node scripts/bridge.js <REMOTE_SSE_URL>");
  process.exit(1);
}

const url = new URL(remoteUrl);
const isHttps = url.protocol === "https:";
const httpClient = isHttps ? https : http;

let sessionId = null;

// 1. Establish SSE Connection
const sseReq = httpClient.request(remoteUrl, {
  method: "GET",
  headers: {
    "Accept": "text/event-stream",
    "Cache-Control": "no-cache"
  }
}, (res) => {
  // If we get a 301/302, technically we should follow, but Railway is direct.
  if (res.statusCode !== 200) {
    console.error(`🔴 Remote connection failed with status: ${res.statusCode}`);
    if (res.statusCode === 401) console.error("   Reason: Invalid or missing apiKey.");
    process.exit(1);
  }

  res.on("data", (chunk) => {
    const data = chunk.toString();
    
    // Check for sessionId in the first message
    if (!sessionId && data.includes("endpoint=")) {
      const match = data.match(/sessionId=([^&\s]+)/);
      if (match) {
        sessionId = match[1];
        console.error(`🟢 Connected to remote SSE! Session: ${sessionId}`);
      }
    }

    // Forward SSE messages (excluding comment/session lines) to STDOUT for Claude
    // MCP SDK sends data in "event: message\ndata: { ... }\n\n" format
    const lines = data.split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const payload = line.replace("data: ", "").trim();
        if (payload) {
          process.stdout.write(payload + "\n");
        }
      }
    }
  });

  res.on("end", () => {
    console.error("🔴 SSE Connection closed by remote server.");
    process.exit(0);
  });
});

sseReq.on("error", (err) => {
  console.error(`🔴 SSE Connection error: ${err.message}`);
  process.exit(1);
});

sseReq.end();

// 2. Listen for STDIN (from Claude) and forward as POST messages
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

rl.on("line", (line) => {
  if (!line.trim() || !sessionId) return;

  // The endpoint for POST messages is established during SSE connection.
  // In our server, it's always /message?sessionId=...
  const postUrl = new URL(url);
  postUrl.pathname = "/message";
  postUrl.searchParams.set("sessionId", sessionId);
  
  // If the original URL had an apiKey, we should pass it too!
  const originalApiKey = url.searchParams.get("apiKey");
  if (originalApiKey) {
    postUrl.searchParams.set("apiKey", originalApiKey);
  }

  const postReq = httpClient.request(postUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(line)
    }
  }, (res) => {
    if (res.statusCode >= 400) {
      console.error(`🔴 POST message failed: ${res.statusCode} for session ${sessionId}`);
    }
    // We don't need to read the body unless we want to debug.
    res.resume();
  });

  postReq.on("error", (err) => {
    console.error(`🔴 POST error: ${err.message}`);
  });

  postReq.write(line);
  postReq.end();
});

console.error(`📡 Bridge starting for ${remoteUrl}...`);
