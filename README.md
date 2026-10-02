# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## Navigation performance (Cloudflare Workers)

`wrangler.jsonc` serves the static `dist/` build. Astro copies `public/_headers`
into that directory; Cloudflare applies it to static responses.

- `/_astro/*`: one-year immutable browser cache. Only fingerprinted build assets
  belong here; a content change produces a new URL.
- HTML routes: 60-second browser cache, then mandatory revalidation. A visitor
  can see the previous page version for up to a minute after publishing.
- RSS, sitemaps, and unversioned images: unchanged revalidation defaults.
- Internal links prefetch on hover/focus; primary navigation prefetches when
  visible. RSS is excluded. Astro reduces prefetching on slow/save-data connections.
- No client-side router: normal browser navigation and analytics remain intact.

Verify with the actual Cloudflare local runtime, not `astro preview` (which
ignores `_headers`):

```sh
npm run build
npm exec --yes --package=wrangler@4 -- wrangler dev --local --port 8787
# In another terminal:
node scripts/check-performance.mjs
```

After deploying, run `node scripts/check-performance.mjs https://arnold.gamboa.ph`
and verify in browser DevTools that repeat navigation does not revalidate CSS,
while prefetched pages load from cache. Ordinary unprefetched pages will still
incur network latency. This configuration does not change CDN routing or fix an
ISP-to-Cloudflare connection issue.

These header rules are Cloudflare-specific; the alternative Docker/nginx host
would need equivalent nginx cache directives.

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
