import { readdir, readFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const packageNames = [
  "contracts",
  "failure-scenarios",
  "resilience-core",
  "telemetry",
];
const allowedInternalDependencies = new Map([
  ["contracts", new Set()],
  ["failure-scenarios", new Set(["contracts"])],
  ["resilience-core", new Set(["contracts"])],
  ["telemetry", new Set(["contracts"])],
]);
const frameworkImports = ["vue", "vue-router", "quasar", "hono", "@hono/"];

function packageFor(sourcePath) {
  const normalized = sourcePath.split(sep).join("/");
  const match = normalized.match(/(?:^|\/)packages\/([^/]+)\//);
  return match?.[1] ?? null;
}

function importedPackage(specifier) {
  const match = specifier.match(/^@frp\/([^/]+)(?:\/(.+))?$/);
  return match ? { name: match[1], deepPath: match[2] } : null;
}

export function validateImport(sourcePath, specifier) {
  const sourcePackage = packageFor(sourcePath);
  if (!sourcePackage) return { ok: true };

  if (
    frameworkImports.some(
      (name) => specifier === name || specifier.startsWith(name),
    ) ||
    specifier.includes("/apps/") ||
    specifier.startsWith("apps/")
  ) {
    return {
      ok: false,
      reason: `Domain packages cannot import framework or app modules: ${specifier}`,
    };
  }

  const targetPackage = importedPackage(specifier);
  if (targetPackage?.deepPath) {
    return {
      ok: false,
      reason: `Cross-package imports must use the public entry point: ${specifier}`,
    };
  }

  if (
    targetPackage &&
    targetPackage.name !== sourcePackage &&
    !allowedInternalDependencies.get(sourcePackage)?.has(targetPackage.name)
  ) {
    return {
      ok: false,
      reason: `${sourcePackage} cannot depend on @frp/${targetPackage.name}`,
    };
  }

  return { ok: true };
}

function extractImports(source) {
  const imports = [];
  const matcher =
    /(?:import|export)\s+(?:type\s+)?(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;
  for (const match of source.matchAll(matcher))
    imports.push(match[1] ?? match[2]);
  return imports.filter(Boolean);
}

async function sourceFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await sourceFiles(path)));
    else if ([".ts", ".js", ".mjs", ".vue"].includes(extname(entry.name)))
      files.push(path);
  }
  return files;
}

export async function checkArchitecture(root = process.cwd()) {
  const violations = [];
  for (const packageName of packageNames) {
    const directory = resolve(root, "packages", packageName, "src");
    for (const file of await sourceFiles(directory)) {
      const source = await readFile(file, "utf8");
      for (const specifier of extractImports(source)) {
        let checkedSpecifier = specifier;
        if (specifier.startsWith(".")) {
          const target = resolve(dirname(file), specifier);
          const targetRelative = relative(root, target).split(sep).join("/");
          const targetPackage = packageFor(targetRelative);
          if (targetPackage && targetPackage !== packageName)
            checkedSpecifier = `@frp/${targetPackage}/deep-import`;
          else if (targetRelative.startsWith("apps/"))
            checkedSpecifier = targetRelative;
        }
        const result = validateImport(relative(root, file), checkedSpecifier);
        if (!result.ok)
          violations.push(`${relative(root, file)}: ${result.reason}`);
      }
    }
  }
  return violations;
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const violations = await checkArchitecture();
  if (violations.length > 0) {
    console.error(violations.join("\n"));
    process.exitCode = 1;
  } else {
    console.log("Architecture boundaries: 0 violations");
  }
}
