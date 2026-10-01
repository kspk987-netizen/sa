/**
 * PARA Local & Production Node Server
 * Zero external dependencies - runs with native Node.js (v18+)
 * Serves static assets and delegates /api/assistant to the assistant handler.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = parseInt(process.env.PORT || "5173", 10);
const ROOT = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

let assistantHandler;
try {
  assistantHandler = require("./api/assistant.js");
} catch (e) {
  console.warn("Notice: ./api/assistant.js could not be loaded directly:", e.message);
}

function parseBody(req) {
  return new Promise((resolve) => {
    let chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      try {
        resolve(raw ? JSON.parse(raw) : null);
      } catch (err) {
        resolve(raw);
      }
    });
    req.on("error", () => resolve(null));
  });
}

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let pathname = decodeURIComponent(urlObj.pathname);

  // 1. API Route
  if (pathname === "/api/assistant" && assistantHandler) {
    if (req.method === "POST" && !req.body) {
      req.body = await parseBody(req);
    }
    // Express-like helpers if needed by assistantHandler
    if (!res.status) {
      res.status = (code) => {
        res.statusCode = code;
        return res;
      };
    }
    if (!res.json) {
      res.json = (data) => {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify(data));
        return res;
      };
    }
    try {
      await assistantHandler(req, res);
    } catch (err) {
      console.error("API handler error:", err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    }
    return;
  }

  // 2. Static file resolution
  if (pathname === "/" || pathname === "") {
    pathname = "/index.html";
  }

  const safePath = path.normalize(path.join(ROOT, pathname));
  if (!safePath.startsWith(ROOT)) {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(safePath).toLowerCase();
      res.statusCode = 200;
      res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
      fs.createReadStream(safePath).pipe(res);
    } else {
      // Fallback to index.html for SPA hash/clean URL routes
      const indexPath = path.join(ROOT, "index.html");
      fs.stat(indexPath, (indexErr, indexStats) => {
        if (!indexErr && indexStats.isFile()) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          fs.createReadStream(indexPath).pipe(res);
        } else {
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end("404 Not Found");
        }
      });
    }
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`\n  PARA is running at http://localhost:${PORT}/`);
    console.log(`  AI assistant:      /api/assistant`);
    console.log(`  Serving folder:    ${ROOT}\n`);
  });
}

module.exports = server;
