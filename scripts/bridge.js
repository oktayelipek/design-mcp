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
let connectionStarted = false;

// Health Check before full SSE (Optional but good for 500 debugging)
const healthUrl = new URL(url);
healthUrl.pathname = "/health";
httpClient.get(healthUrl, (res) => {
  if (res.statusCode !== 200) {
    console.error(`⚠️  Health check failed (${res.statusCode}). Service might be booting or unstable.`);
  } else {
    console.error(`✅ Remote health check passed.`);
  }
}).on('error', () => { /* Ignore health check errors, move to SSE */ });

// 1. Establish SSE Connection
const sseReq = httpClient.request(remoteUrl, {
  method: "GET",
  headers: {
    "Accept": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  }
}, (res) => {
  connectionStarted = true;
  if (res.statusCode !== 200) {
    console.error(`🔴 Remote connection failed with status: ${res.statusCode}`);
    if (res.statusCode === 401) console.error("   Reason: Invalid or missing apiKey.");
    if (res.statusCode === 500) console.error("   Reason: Server Internal Error. Check Railway logs.");
    process.exit(1);
  }

  res.on("data", (chunk) => {
    const data = chunk.toString();
    
    // Check for sessionId in the first message
    if (!sessionId && data.includes("endpoint=")) {
      const match = data.match(/sessionId=([^&\s"]+)/);
      if (match) {
        sessionId = match[1];
        console.error(`🟢 Connected! Session: ${sessionId}`);
      }
    }

    // Forward SSE messages to STDOUT for Claude/MCP Client
    const lines = data.split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const payload = line.replace("data: ", "").trim();
        if (payload) {
          try {
            // Verify if it's valid JSON before sending to Claude
            JSON.parse(payload);
            process.stdout.write(payload + "\n");
          } catch (e) {
            console.error(`⚠️  Filtering malformed JSON from remote: ${payload.substring(0, 50)}...`);
          }
        }
      }
    }
  });

  res.on("end", () => {
    console.error("🔴 SSE Connection closed by remote server (EOF).");
    process.exit(1);
  });
});

sseReq.on("error", (err) => {
  console.error(`🔴 SSE Connection error: ${err.message}`);
  process.exit(1);
});

// Timeout if we can't connect at all in 15 seconds
setTimeout(() => {
  if (!connectionStarted) {
    console.error("🔴 Connection timeout: Remote server didn't respond in 15s.");
    sseReq.destroy();
    process.exit(1);
  }
}, 15000);

sseReq.end();

// 2. Listen for STDIN (from Claude) and forward as POST messages
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

rl.on("line", (line) => {
  if (!line.trim() || !sessionId) {
    if (!sessionId) console.error("⏳ Waiting for sessionId before forwarding message...");
    return;
  }

  const postUrl = new URL(url);
  postUrl.pathname = "/message";
  postUrl.searchParams.set("sessionId", sessionId);
  
  const originalApiKey = url.searchParams.get("apiKey");
  if (originalApiKey) postUrl.searchParams.set("apiKey", originalApiKey);

  const postReq = httpClient.request(postUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(line)
    }
  }, (res) => {
    res.resume(); // Consume response
  });

  postReq.on("error", (err) => {
    console.error(`🔴 POST error: ${err.message}`);
  });

  postReq.write(line);
  postReq.end();
});

console.error(`📡 Bridge starting for ${url.hostname}...`);
