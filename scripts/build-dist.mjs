import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const outDir = join(root, "dist");

const excluded = new Set([
  ".git",
  ".DS_Store",
  ".gitignore",
  "backup",
  "dist",
  "node_modules",
  "package-lock.json",
  "package.json",
  "scripts",
  "src",
  "tailwind.config.js",
]);

rmSync(outDir, { force: true, recursive: true });
mkdirSync(outDir, { recursive: true });

for (const entry of readdirSync(root, { withFileTypes: true })) {
  if (excluded.has(entry.name) || entry.name.endsWith(".bak")) {
    continue;
  }

  cpSync(join(root, entry.name), join(outDir, entry.name), {
    recursive: true,
    verbatimSymlinks: true,
  });
}

if (!existsSync(join(outDir, "index.html"))) {
  throw new Error("dist/index.html was not created");
}
