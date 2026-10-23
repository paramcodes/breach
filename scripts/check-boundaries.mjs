import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const EXCLUDE = new Set([
  "node_modules",
  ".next",
  "dist",
  "coverage",
  ".git",
  ".worktrees",
  "pr-12-work",
]);
const FILE_EXCLUDE = new Set(["record-demo.ts"]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (EXCLUDE.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry) && !FILE_EXCLUDE.has(entry)) out.push(full);
  }
  return out;
}

function featureOf(rel) {
  const m = rel.match(/(?:^|\/)features\/([^/]+)/);
  return m ? m[1] : null;
}

const files = walk(ROOT);
const violations = [];

for (const file of files) {
  const rel = relative(ROOT, file).split(sep).join("/");
  const content = readFileSync(file, "utf8");
  const currentFeature = featureOf(rel);
  const isShared = rel.startsWith("shared/");
  const isApp = rel.startsWith("app/");
  const isScript = rel.startsWith("scripts/") || rel.startsWith("e2e/");
  const isLogger = rel === "shared/lib/logger.ts";

  const imports = new Set();
  for (const m of content.matchAll(/from\s+['"]([^'"]+)['"]/g)) imports.add(m[1]);
  for (const m of content.matchAll(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) imports.add(m[1]);
  for (const m of content.matchAll(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) imports.add(m[1]);

  for (const spec of imports) {
    const featureMatch = spec.match(/features\/([^/]+)/);
    const importedFeature = featureMatch ? featureMatch[1] : null;

    if (isShared && /features\//.test(spec)) {
      violations.push(`${rel}: shared imports feature (${spec})`);
    }

    if (currentFeature && importedFeature && importedFeature !== currentFeature) {
      violations.push(
        `${rel}: feature ${currentFeature} imports feature ${importedFeature} (${spec})`,
      );
    }

    if (isApp && importedFeature) {
      const deep = spec.match(/features\/[^/]+\/.+/);
      if (deep) violations.push(`${rel}: app deep-imports feature (${spec})`);
    }
  }

  if (!isScript && !rel.endsWith(".schema.ts") && content.includes("JSON.parse(")) {
    violations.push(`${rel}: JSON.parse outside *.schema.ts`);
  }

  if (!isLogger && !isScript && content.includes("console.log(")) {
    violations.push(`${rel}: console.log outside logger`);
  }
}

if (violations.length) {
  process.stderr.write("Boundary violations:\n");
  for (const v of violations) process.stderr.write(` - ${v}\n`);
  process.exit(1);
} else {
  process.stdout.write("Boundary check passed.\n");
}
