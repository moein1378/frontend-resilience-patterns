import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";

const textExtensions = new Set([
  "",
  ".env",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".scss",
  ".ts",
  ".vue",
  ".yaml",
  ".yml",
]);
const signatures = [
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/],
  ["GitHub token", /\bgh[opusr]_[A-Za-z0-9]{30,}\b/],
];
const excludedDirectories = new Set([
  ".git",
  ".quasar",
  "dist",
  "node_modules",
  "playwright-report",
  "test-results",
]);

async function collectFiles(directory = ".") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!excludedDirectories.has(entry.name))
        files.push(...(await collectFiles(path)));
    } else if (entry.isFile()) {
      files.push(path);
    }
  }
  return files;
}

const files = await collectFiles();
const findings = [];
for (const file of files) {
  if (!textExtensions.has(extname(file)) && !file.endsWith(".env.example"))
    continue;
  const content = await readFile(file, "utf8");
  for (const [label, signature] of signatures) {
    if (signature.test(content)) findings.push(`${file}: ${label}`);
  }
}
if (findings.length > 0) {
  console.error(findings.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Secret signature scan: ${files.length} repository paths checked, 0 high-confidence findings`,
  );
}
