import { copyFileSync, existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const outDir = join(root, "dist");
const stagingDir = join(root, ".dist-build");
const previousDir = join(root, ".dist-previous");
const workspaceRoot = join(root, "..");

const excluded = new Set([
  ".git",
  ".DS_Store",
  ".gitignore",
  "backup",
  "dist",
  ".dist-build",
  ".dist-previous",
  "node_modules",
  "package-lock.json",
  "package.json",
  "scripts",
  "src",
  "tailwind.config.js",
]);

function wait(milliseconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

function copyFileWithFallback(source, destination) {
  const relativePath = relative(root, source);
  const fallback = join(workspaceRoot, relativePath);
  const candidates = [source];

  if (existsSync(fallback) && statSync(fallback).size === statSync(source).size) {
    candidates.push(fallback);
  }

  let lastError;
  for (const candidate of candidates) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        copyFileSync(candidate, destination);
        if (candidate !== source) {
          console.warn(`Used workspace fallback for ${relativePath}`);
        }
        return;
      } catch (error) {
        lastError = error;
        if (!["ETIMEDOUT", "EIO", "EBUSY"].includes(error.code) || attempt === 3) break;
        wait(attempt * 1000);
      }
    }
  }
  throw lastError;
}

function copyTree(source, destination) {
  mkdirSync(destination, { recursive: true });
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    if (entry.name === ".DS_Store") continue;
    const from = join(source, entry.name);
    const to = join(destination, entry.name);
    if (entry.isDirectory()) {
      copyTree(from, to);
    } else if (entry.isFile()) {
      copyFileWithFallback(from, to);
    }
  }
}

rmSync(stagingDir, { force: true, recursive: true });
mkdirSync(stagingDir, { recursive: true });

for (const entry of readdirSync(root, { withFileTypes: true })) {
  if (excluded.has(entry.name) || entry.name.endsWith(".bak")) {
    continue;
  }

  const source = join(root, entry.name);
  const destination = join(stagingDir, entry.name);
  if (entry.isDirectory()) {
    copyTree(source, destination);
  } else if (entry.isFile()) {
    copyFileWithFallback(source, destination);
  }
}

if (!existsSync(join(stagingDir, "index.html"))) {
  throw new Error("staged dist/index.html was not created");
}

rmSync(previousDir, { force: true, recursive: true });
if (existsSync(outDir)) renameSync(outDir, previousDir);
renameSync(stagingDir, outDir);
rmSync(previousDir, { force: true, recursive: true });

console.log("Built dist successfully.");
