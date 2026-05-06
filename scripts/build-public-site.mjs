import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "_site");
const publicPaths = [
  ".nojekyll",
  "CNAME",
  "robots.txt",
  "sitemap.xml",
  "index.html",
  "style.css",
  "script.js",
  "blog",
];

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

for (const publicPath of publicPaths) {
  const source = path.join(root, publicPath);
  if (!existsSync(source)) {
    continue;
  }

  cpSync(source, path.join(outputDir, publicPath), { recursive: true });
}

console.log(`Built public site in ${path.relative(root, outputDir)}/`);
