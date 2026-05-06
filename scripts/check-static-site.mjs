import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const siteOrigin = "https://unconsultancy.org";
const errors = [];

const ignoredDirs = new Set([".git", "_site", "node_modules"]);

function fail(message) {
  errors.push(message);
}

function posixPath(filePath) {
  return filePath.split(path.sep).join("/");
}

function walk(dir) {
  const files = [];

  for (const entry of readdirSync(dir)) {
    if (ignoredDirs.has(entry)) {
      continue;
    }

    const fullPath = path.join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(...walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function readRelative(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function pagePathForUrl(url) {
  const parsed = new URL(url);
  const pathname = parsed.pathname;

  if (pathname.endsWith("/")) {
    return path.join(root, pathname, "index.html");
  }

  return path.join(root, pathname);
}

function idsIn(html) {
  return new Set(
    [...html.matchAll(/\sid=(["'])(.*?)\1/g)].map((match) => match[2]),
  );
}

function hasTagAttribute(tag, name, value) {
  const pattern = new RegExp(`\\b${name}=(["'])${value}\\1`, "i");
  return pattern.test(tag);
}

function hasNonEmptyAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}=(["'])(.*?)\\1`, "i"));
  return Boolean(match?.[2]?.trim());
}

function hasNamedMetaWithContent(html, name) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)].some((match) => {
    const tag = match[0];
    return hasTagAttribute(tag, "name", name) && hasNonEmptyAttribute(tag, "content");
  });
}

function hasCanonical(html) {
  return [...html.matchAll(/<link\b[^>]*>/gi)].some((match) => {
    const tag = match[0];
    const href = tag.match(/\bhref=(["'])(.*?)\1/i)?.[2] ?? "";
    return hasTagAttribute(tag, "rel", "canonical") && href.startsWith(`${siteOrigin}/`);
  });
}

function assertFragmentExists(file, html, fragment) {
  if (!fragment) {
    return;
  }

  const decoded = decodeURIComponent(fragment);
  if (!idsIn(html).has(decoded)) {
    fail(`${file}: missing target id "#${decoded}"`);
  }
}

function localTarget(file, value) {
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    value.startsWith("data:") ||
    value.startsWith("javascript:")
  ) {
    return null;
  }

  const [withoutHash, hash = ""] = value.split("#");
  const cleanPath = withoutHash.split("?")[0];

  if (cleanPath === "") {
    return { filePath: file, fragment: hash };
  }

  const baseDir = path.dirname(path.join(root, file));
  const resolved = cleanPath.startsWith("/")
    ? path.join(root, cleanPath)
    : path.resolve(baseDir, cleanPath);

  const filePath = cleanPath.endsWith("/")
    ? path.join(resolved, "index.html")
    : resolved;

  return { filePath, fragment: hash };
}

function checkHtmlFile(file) {
  const html = readRelative(file);

  if (!/^<!doctype html>/i.test(html.trimStart())) {
    fail(`${file}: missing <!DOCTYPE html>`);
  }

  if (!/<html\b[^>]*\slang=(["'])[^"']+\1/i.test(html)) {
    fail(`${file}: missing html lang attribute`);
  }

  if (!/<title>[^<]+<\/title>/i.test(html)) {
    fail(`${file}: missing non-empty title`);
  }

  if (!/<meta\b[^>]*\bname=(["'])viewport\1/i.test(html)) {
    fail(`${file}: missing viewport meta tag`);
  }

  if (!hasNamedMetaWithContent(html, "description")) {
    fail(`${file}: missing non-empty description meta tag`);
  }

  if (!hasCanonical(html)) {
    fail(`${file}: missing canonical URL`);
  }

  const idList = [...html.matchAll(/\sid=(["'])(.*?)\1/g)].map((match) => match[2]);
  const duplicateIds = idList.filter((id, index) => idList.indexOf(id) !== index);
  for (const id of new Set(duplicateIds)) {
    fail(`${file}: duplicate id "${id}"`);
  }

  for (const match of html.matchAll(/\s(href|src)=(["'])(.*?)\2/g)) {
    const value = match[3];
    const target = localTarget(file, value);

    if (!target) {
      continue;
    }

    if (!existsSync(target.filePath)) {
      fail(`${file}: missing local ${match[1]} target "${value}"`);
      continue;
    }

    if (target.fragment) {
      const targetRelative = posixPath(path.relative(root, target.filePath));
      const targetHtml = readRelative(targetRelative);
      assertFragmentExists(file, targetHtml, target.fragment);
    }
  }

  for (const match of html.matchAll(/<a\b[^>]*target=(["'])_blank\1[^>]*>/gi)) {
    const tag = match[0];
    if (!/\srel=(["'])[^"']*\bnoopener\b[^"']*\1/i.test(tag)) {
      fail(`${file}: target="_blank" link missing rel="noopener"`);
    }
  }
}

function checkSitemap(htmlFiles) {
  const sitemap = readRelative("sitemap.xml");
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  const sitemapFiles = new Set();

  for (const url of urls) {
    if (!url.startsWith(`${siteOrigin}/`)) {
      fail(`sitemap.xml: URL is outside ${siteOrigin}: ${url}`);
      continue;
    }

    const pagePath = pagePathForUrl(url);
    if (!existsSync(pagePath)) {
      fail(`sitemap.xml: URL has no matching file: ${url}`);
      continue;
    }

    sitemapFiles.add(posixPath(path.relative(root, pagePath)));
  }

  for (const file of htmlFiles) {
    if (file.startsWith("staging/")) {
      continue;
    }

    if (!sitemapFiles.has(file)) {
      fail(`sitemap.xml: missing public HTML page ${file}`);
    }
  }
}

function checkRobots() {
  const robots = readRelative("robots.txt");
  if (!robots.includes(`Sitemap: ${siteOrigin}/sitemap.xml`)) {
    fail("robots.txt: missing sitemap declaration");
  }
}

function checkRepositoryLayout() {
  if (existsSync(path.join(root, "README.md"))) {
    fail("README.md must not live at the site root; use .github/README.md");
  }

  if (!existsSync(path.join(root, ".github", "README.md"))) {
    fail(".github/README.md is missing");
  }
}

const htmlFiles = walk(root)
  .map((filePath) => posixPath(path.relative(root, filePath)))
  .filter((file) => file.endsWith(".html") && !file.startsWith(".github/"));

for (const file of htmlFiles) {
  checkHtmlFile(file);
}

checkSitemap(htmlFiles);
checkRobots();
checkRepositoryLayout();

if (errors.length > 0) {
  console.error(`Static site checks failed with ${errors.length} issue(s):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Static site checks passed for ${htmlFiles.length} HTML page(s).`);
