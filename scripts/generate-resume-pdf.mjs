import { spawn, spawnSync } from "node:child_process";
import { access } from "node:fs/promises";
import { resolve } from "node:path";

const port = 4387;
const output = resolve("public/tyler-kleint-resume.pdf");
const chromeCandidates = ["google-chrome", "chromium", "chromium-browser"];
const chrome = chromeCandidates.find((command) =>
  spawnSync(command, ["--version"], { stdio: "ignore" }).status === 0
);

if (!chrome) {
  throw new Error("Install Google Chrome or Chromium to generate the résumé PDF.");
}

const build = spawnSync("npm", ["run", "build"], { stdio: "inherit" });
if (build.status !== 0) process.exit(build.status ?? 1);

const server = spawn("node", ["dist/server/entry.mjs"], {
  env: { ...process.env, HOST: "127.0.0.1", PORT: String(port) },
  stdio: "ignore",
});

try {
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/resume/plain`);
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
  }
  if (!ready) throw new Error("The local preview server did not become ready.");

  const pdf = spawnSync(chrome, [
    "--headless",
    "--no-sandbox",
    "--disable-gpu",
    "--no-pdf-header-footer",
    `--print-to-pdf=${output}`,
    `http://127.0.0.1:${port}/resume/plain`,
  ], { stdio: "inherit" });
  if (pdf.status !== 0) process.exit(pdf.status ?? 1);
  await access(output);
  console.log(`Generated ${output}`);
} finally {
  server.kill("SIGTERM");
}
