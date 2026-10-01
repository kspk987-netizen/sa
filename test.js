/**
 * PARA Automated Test Suite
 * Verifies syntax, file integrity, API responses, and server functionality.
 */

const fs = require("fs");
const path = require("path");
const http = require("http");

const FILES = [
  "index.html",
  "styles.css",
  "vercel.json",
  ".htaccess",
  "server.js",
  "api/assistant.js",
  "assets/logo.js",
  "assets/store.js",
  "assets/geo.js",
  "assets/analytics.js",
  "assets/views-public.js",
  "assets/views-admin.js",
  "assets/views-driver.js",
  "assets/views-passenger.js",
  "assets/app.js",
  "assets/knowledge.js",
  "assets/assistant.js",
  "istockphoto-1488597778-612x612.jpg"
];

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    passCount++;
    console.log(`  [PASS] ${message}`);
  } else {
    failCount++;
    console.error(`  [FAIL] ${message}`);
  }
}

async function run() {
  console.log("\n==================================================");
  console.log("  PARA Pre-Deployment Verification Suite");
  console.log("==================================================\n");

  console.log("1. Checking core files integrity & syntax...");
  for (const rel of FILES) {
    const full = path.join(__dirname, rel);
    const exists = fs.existsSync(full);
    assert(exists, `File exists: ${rel}`);
    if (exists) {
      const stats = fs.statSync(full);
      assert(stats.size > 0, `File not empty: ${rel} (${stats.size} bytes)`);
      if (rel.endsWith(".js")) {
        try {
          const code = fs.readFileSync(full, "utf8");
          new Function(code);
          assert(true, `Syntax valid: ${rel}`);
        } catch (e) {
          assert(false, `Syntax error in ${rel}: ${e.message}`);
        }
      }
    }
  }

  console.log("\n2. Testing /api/assistant serverless handler...");
  const handler = require("./api/assistant.js");
  let getOk = false;
  await new Promise((resolve) => {
    const req = { method: "GET", headers: {} };
    const res = {
      statusCode: 200,
      headers: {},
      setHeader(k, v) { this.headers[k] = v; },
      status(c) { this.statusCode = c; return this; },
      json(data) {
        getOk = data && data.ok && data.service === "PARA assistant";
        resolve();
      }
    };
    handler(req, res);
  });
  assert(getOk, "GET /api/assistant returns service status");

  console.log("\n3. Testing server.js static & API serving...");
  const server = require("./server.js");
  const TEST_PORT = 5199;

  await new Promise((resolve) => {
    server.listen(TEST_PORT, () => {
      http.get(`http://localhost:${TEST_PORT}/`, (res) => {
        assert(res.statusCode === 200, "Server responds 200 on /");
        let body = "";
        res.on("data", c => body += c);
        res.on("end", () => {
          assert(body.includes("Loading PARA") || body.includes("PARA"), "Index contains PARA title");
          http.get(`http://localhost:${TEST_PORT}/api/assistant`, (apiRes) => {
            assert(apiRes.statusCode === 200, "Server responds 200 on /api/assistant");
            server.close(() => resolve());
          });
        });
      });
    });
  });

  console.log("\n==================================================");
  console.log(`  Tests completed: ${passCount} passed, ${failCount} failed.`);
  console.log("==================================================\n");

  if (failCount > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Test execution threw error:", err);
  process.exit(1);
});
