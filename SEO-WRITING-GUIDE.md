# SEO writing guide — Arnold Gamboa (*Shipped & Unfinished*)

Follow this whenever you write a new article so every post ships SEO-ready without re‑auditing.

---

## 1. File name and slug

- Use the **exact slug** naming convention already in place: `this-is-the-article-slug.md`
- Place the file in `src/content/blog/`
- Example: `src/content/blog/why-ai-agents-need-exception-handling.md`

> The slug becomes the live URL:  
> `https://arnold.gamboa.ph/why-ai-agents-need-exception-handling/`

---

## 2. Frontmatter template

Copy this and fill in every field:

```yaml
---
title: ""
description: ""
pubDate: YYYY-MM-DD
slug: ""
tags: []
---
```

### `title`
- Use the **article headline** — exactly what the `h1` would say
- 40–70 characters is ideal
- Place the most important words near the beginning
- Avoid vague labels like “Part 2” or “Update”

### `description`
- 1–2 sentences summarising the article
- 120–155 characters (search results typically show ~155 chars)
- Must be unique — no two posts should share the same description
- Write for a real reader: what will they learn?
- Avoid: generic meta fluff, repeating the title, internal notes

### `pubDate`
- Format: `YYYY-MM-DD`
- Always use the actual publication date
- Do not backdate for SEO — write today's date and publish

### `slug`
- Lowercase, words separated by hyphens
- Keep it under 70 characters
- Must be unique across all posts

### `tags`
- 2–6 tags per post
- Use existing tags when possible (check `src/content.blog/` or the `/blog/` tag cloud)
- Create a new tag only when it represents a genuine topic cluster
- Tags become:
  - Clickable links on the post page
  - Filterable items on `/blog/`
  - Static archive pages at `/blog/tags/your-tag/`
  - Keywords in JSON-LD `BlogPosting` structured data

### `heroImage` (optional)
- Full Cloudflare R2 URL
- Example: `https://pub-5fb93d7cce1645b2b04ccbfefd6015a3.r2.dev/images/blog/your-slug.webp`
- Upload images to the R2 bucket: `arnold-gamboa-ph` → `images/blog/`
- Local copy also goes to `public/images/blog/`

### `heroAlt` (required when `heroImage` is set)
- A short, descriptive sentence about the image
- Not keyword-stuffed — describe what the image actually shows
- Example: `"Illustration of an AI exception-finding workflow in a small business operations dashboard"`
- Leave `heroAlt` out when there is no hero image (don't write an empty string)

---

## 3. Article body

### Headings
- Always start the body with your opening paragraph — **never** with a heading
- Use `##` for section headings
- Use `###` for sub-sections
- Never use `#` (that is reserved for the post page `h1`)

### Links
- Link to your own articles where relevant (the “Related posts” widget uses tags — linking builds topic clusters)
- Use descriptive link text, never “click here”
- External links open in the same tab (or add `target="_blank" rel="noopener noreferrer"` for external)

### Images inside the body
- For now, inline images are rare. When you add one:
  - Use the same R2 URL format as `heroImage`
  - Add meaningful `alt` text
  - Specify `width` and `height`

### Readability
- Paragraphs: 2–4 sentences
- Short paragraphs scan better on mobile
- Use bold for emphasis, not for decoration

---

## 4. Before publishing

### Checklist
- [ ] `title` is unique and a real headline
- [ ] `description` is unique, under 155 characters, human-readable
- [ ] `pubDate` is today or the real publication date
- [ ] `slug` is clean and unique
- [ ] `tags` include 2–6 real topic tags
- [ ] `heroImage` uses the R2 URL (not a Bear CDN or local path)
- [ ] `heroAlt` is filled in when heroImage is present
- [ ] Body starts with a paragraph, not a heading
- [ ] All links point to the correct URL
- [ ] No markdown syntax errors

### After `npm run build`
- [ ] Check `dist/<slug>/index.html` renders correctly
- [ ] Verify the page title in the browser tab reads `[Title] — Arnold Gamboa`
- [ ] Run `open http://localhost:4322/<slug>/` and scroll through the page
- [ ] Check the prev/next navigation works
- [ ] Confirm Open Graph image loads (paste the URL into a browser)
- [ ] Check the RSS feed: `open http://localhost:4322/feed.xml`

---

## 5. What the build system does automatically

You don’t need to touch these. The build adds them every time:

| Asset | Location |
|--------|----------|
| Sitemap entry | `sitemap-0.xml` (auto) |
| RSS feed entry | `feed.xml` (auto) |
| Canonical URL | `<link rel="canonical">` |
| Open Graph / Twitter cards | `<meta property="og:*">` and `<meta name="twitter:*">` |
| JSON-LD BlogPosting schema | `<script type="application/ld+json">` |
| JSON-LD BreadcrumbList schema | Same block |
| Previous / Next article links | Below the article body |
| Related posts widget | Below previous/next |
| Tag links | Below the article title |
| `/blog/tags/<tag>/` archive page | Generated automatically from all posts |

---

## 6. Topic clusters

These are the strongest search identity areas. Write toward them:

1. **Engineering leadership** (managing teams, shipping software, agency operations)
2. **Practical AI** (agents, exceptions, workflows, cost, coding tools)
3. **Pastoral technology** (sermon prep AI, church communication, bivocational ministry)
4. **Faith and tech** (bridging both worlds, wisdom, judgment)
5. **Philippine tech & agencies** (talent, outsourcing, process)

When you write a new post, tag it with the right cluster tags so it links into the existing topic pages.

---

## 7. Quick reference

```yaml
---
title: "Your Article Title in Title Case"
description: "One or two sentences that tell a reader what this article is about. Keep it under 155 characters."
pubDate: 2026-08-07
slug: your-article-slug
tags: ["AI agents", "exceptions", "small business AI"]
heroImage: "https://pub-5fb93d7cce1645b2b04ccbfefd6015a3.r2.dev/images/blog/your-article-slug.webp"
heroAlt: "Describe what the hero image shows in one clear sentence."
---

Your opening paragraph has no heading above it.
