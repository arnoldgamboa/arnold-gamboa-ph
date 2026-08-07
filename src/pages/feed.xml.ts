import { getCollection } from "astro:content";

export async function GET() {
	const posts = (await getCollection("blog")).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
	);

	const items = posts
		.map(
			(post) => `
<item>
  <title>${escapeXml(post.data.title)}</title>
  <link>https://arnold.gamboa.ph/${post.data.slug}/</link>
  <guid isPermaLink="true">https://arnold.gamboa.ph/${post.data.slug}/</guid>
  <description>${escapeXml(post.data.description || "")}</description>
  <pubDate>${new Date(post.data.pubDate).toUTCString()}</pubDate>
</item>`
		)
		.join("\n");

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Shipped &amp; Unfinished</title>
  <description>Writing from Arnold Gamboa on AI, software, pastoral work, and small teams — bridging faith and technology.</description>
  <link>https://arnold.gamboa.ph/</link>
  <atom:link href="https://arnold.gamboa.ph/feed.xml" rel="self" type="application/rss+xml"/>
  ${items}
</channel>
</rss>`;

	return new Response(xml, {
		headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
	});
}

function escapeXml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}
