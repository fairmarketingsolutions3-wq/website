# Fair Agro Group — deployable static site

Fast, self-contained static build of the Fair Agro website. Just upload the
contents of this `deploy/` folder to any static host (Netlify, Vercel,
Cloudflare Pages, GitHub Pages, S3, cPanel, etc.). No build step, no server.

## What's inside
- `index.html` — the page (~79 KB), all content in real HTML for SEO/AI crawlers.
- `assets/` — images (WebP), fonts (woff2), and the vanilla motion script.
- `favicon.svg`, `robots.txt`, `sitemap.xml`, `llms.txt`, `llm.txt`.

## Notes / to-do before go-live
1. **Domain**: files reference `https://fair-agro.com/`. If your domain differs,
   find-and-replace it in `index.html`, `sitemap.xml`, `robots.txt`, `llms.txt`.
2. **Social preview image**: add a `og-image.jpg` (1200×630) to this folder —
   `index.html` already points `og:image` / `twitter:image` at `/og-image.jpg`.
3. **HTTPS**: serve over HTTPS (every host above does this automatically).

## Performance
- Total ~2.75 MB (was 8.2 MB): images converted to WebP (~52% smaller) and the
  ~4.3 MB in-browser React/Babel editor tooling removed (it only powered the
  builder's Tweaks panel, not the live site). Images lazy-load below the fold.
