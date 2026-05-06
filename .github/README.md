# Unconsultancy.org

This repository contains the static website for the Unconsultancy Manifesto at
<https://unconsultancy.org/>.

The public site is served from the repository root. Keep repository-only
documentation in `.github/` so it is available on GitHub without becoming part
of the published website.

## Site Structure

- `index.html` contains the manifesto landing page.
- `blog/` contains static blog article pages.
- `style.css` contains global styling for the landing page and blog.
- `script.js` contains the FAQ accordion behavior.
- `sitemap.xml`, `robots.txt`, and `CNAME` support search indexing and hosting.

## Local Preview

The site has no build step. Preview it from the repository root:

```sh
npm run preview
```

Then open <http://localhost:8000/>.

## Checks

Run the same lightweight checks used by CI:

```sh
npm run check
```

The checks verify local links and assets, required page metadata, sitemap
coverage, target fragments, and the repository layout rule that keeps
documentation out of the public root.

## Public Artifact

Build the exact file set that GitHub Pages publishes:

```sh
npm run build
```

The `_site/` folder is generated from an explicit allowlist so repository files
such as `TODO.md`, `package.json`, `.github/`, and `scripts/` are not published.

## Publishing Notes

- Avoid adding root-level Markdown documentation. With `.nojekyll` enabled, the
  site is served as static files from the root.
- Keep internal notes, plans, and repository docs under `.github/`.
- Update `sitemap.xml` when adding public pages.
- Keep canonical and social metadata in sync when changing page URLs or titles.
- Production is deployed to GitHub Pages from the `main` branch after CI passes.

## Staging

The current hosting model does not provide protected staging by itself. A
password-protected staging site should be implemented through the hosting layer,
for example Cloudflare Pages with Cloudflare Access, Netlify with password
protection, or another provider that can protect a preview deployment before it
serves static files.
