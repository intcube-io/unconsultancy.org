# Site Improvement Ideas

## Content

- Add a short "How to contribute" section with a contact link for manifesto
  feedback.
- Add a changelog for manifesto revisions so visitors can see what changed
  between versions.
- Add a dedicated page for examples of Unconsulting practices in cybersecurity,
  AI, and cloud work.
- Add author bios or a brief origin story near the blog article.

## Trust And Discoverability

- Add Open Graph images for the homepage and blog post.
- Add structured data for the FAQ section.
- Add a `/blog/` index page instead of linking directly to a single post from
  the homepage.
- Add a simple 404 page with links back to the manifesto and intcube.

## UX

- Add a sticky "Back to manifesto" link on long article pages.
- Improve the blog card by using a real article image or branded visual instead
  of a gradient placeholder.
- [x] Add visible focus states for keyboard navigation.
- [x] Respect `prefers-reduced-motion` for smooth scrolling.

## Operations

- [x] Use local preview for pre-publish review.
- [x] Add lightweight CI checks for internal links, metadata, sitemap coverage,
  and repository layout.
- Add a protected staging deployment through the hosting provider if shareable
  private previews become necessary.
- Add a link checker in CI for external links.
- Add full HTML validation in CI.
- Add a lightweight visual smoke test for desktop and mobile viewports.
