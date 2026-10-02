// Run against a built site served by `wrangler dev --local --port 8787`.
// Astro's preview server does not apply Cloudflare's _headers rules.
import assert from 'node:assert/strict';

const base = process.argv[2] || 'http://localhost:8787';
const pagePolicy = 'public, max-age=60, must-revalidate';
const assetPolicy = 'public, max-age=31536000, immutable';

for (const path of ['/', '/about/', '/blog/', '/now/', '/contact/', '/rest-is-not-a-prize/', '/blog/tags/ai/']) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path);
  assert.equal(response.headers.get('cache-control'), pagePolicy, path);
  const html = await response.text();
  assert.match(html, /data-astro-prefetch="viewport"/, `${path}: navigation prefetch`);
  assert.match(html, /href="\/feed\.xml" data-astro-prefetch="false"/, `${path}: RSS opt-out`);
  const assets = [...new Set([...html.matchAll(/(?:href|src)="(\/_astro\/[^\"]+)"/g)].map(match => match[1]))];
  assert.ok(assets.some(path => path.endsWith('.css')), `${path}: stylesheet`);
  assert.ok(assets.some(path => path.endsWith('.js')), `${path}: prefetch script`);
  for (const asset of assets) {
    const result = await fetch(new URL(asset, base));
    assert.equal(result.status, 200, asset);
    assert.equal(result.headers.get('cache-control'), assetPolicy, asset);
    await result.arrayBuffer();
  }
}

for (const path of ['/feed.xml', '/sitemap-index.xml', '/images/arnold.jpg']) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path);
  assert.equal(response.headers.get('cache-control'), 'public, max-age=0, must-revalidate', path);
  if (path === '/feed.xml') assert.match(await response.text(), /<rss\b/);
  else await response.arrayBuffer();
}
console.log('PASS: page/asset cache policies, prefetch markup, and unchanged RSS/image/sitemap freshness.');
