import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

async function waitForServer(url: string, maxAttempts = 30): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise<void>((resolve, reject) => {
        const req = http.get(url, (res) => {
          if (res.statusCode === 200) resolve();
          else reject(new Error(`Status: ${res.statusCode}`));
        });
        req.on("error", reject);
        req.setTimeout(2000, () => reject(new Error("Timeout")));
      });
      return true;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  return false;
}

async function main() {
  // Start the dev server
  const server = spawn("bun", ["run", "dev"], {
    cwd: "/home/param/Work/breach",
    env: { ...process.env, PORT: "3001" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  server.stdout?.on("data", (data) => {
    console.log(`[SERVER] ${data.toString().trim()}`);
  });
  server.stderr?.on("data", (data) => {
    console.error(`[SERVER ERR] ${data.toString().trim()}`);
  });

  console.log("Waiting for server to start...");
  const serverReady = await waitForServer("http://localhost:3001");

  if (!serverReady) {
    console.error("Server failed to start");
    server.kill();
    process.exit(1);
  }

  console.log("Server ready, starting browser...");

  const videoDir = "/home/param/Work/breach/media/demo";
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: {
      dir: videoDir,
      size: { width: 1280, height: 720 },
    },
  });
  const page = await context.newPage();

  try {
    // Navigate to home page
    console.log("Navigating to home page...");
    await page.goto("http://localhost:3001", { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    // Navigate to browse page
    console.log("Navigating to browse page...");
    await page.goto("http://localhost:3001", { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    // Scroll to show content
    console.log("Scrolling...");
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(1000);
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(1000);

    // Scroll back up
    await page.mouse.wheel(0, -1000);
    await page.waitForTimeout(1000);

    // Navigate to watch page
    console.log("Navigating to watch page...");
    await page.goto("http://localhost:3001/watch/shroud", { waitUntil: "networkidle" });
    await page.waitForTimeout(4000);

    // Scroll on watch page
    console.log("Scrolling watch page...");
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(1000);

    // Navigate to studio page
    console.log("Navigating to studio page...");
    await page.goto("http://localhost:3001/studio/go-live", { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    console.log("Recording complete, waiting for video to save...");
  } catch (error) {
    console.error("Error during recording:", error);
  } finally {
    // Important: wait for video to be saved
    await page.waitForTimeout(2000);
    await context.close();
    await browser.close();
    server.kill();

    // Wait a bit more for file to be written
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Check for video files
    const files = fs.readdirSync(videoDir);
    console.log("Video files:", files);
    for (const file of files) {
      const stats = fs.statSync(path.join(videoDir, file));
      console.log(`  ${file}: ${stats.size} bytes`);
    }
  }
}

main().catch(console.error);
