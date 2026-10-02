import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";

export async function GET(context: APIContext) {
	const posts = (await getCollection("blog")).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
	);

	return rss({
		title: "Shipped & Unfinished",
		description:
			"Writing from Arnold Gamboa on AI, software, pastoral work, and small teams — bridging faith and technology.",
		site: context.site!,
		xmlns: { atom: "http://www.w3.org/2005/Atom" },
		customData: '<atom:link href="https://arnold.gamboa.ph/feed.xml" rel="self" type="application/rss+xml" />',
		items: posts.map((post) => ({
			title: post.data.title,
			link: new URL(`/${post.data.slug}/`, context.site).href,
			pubDate: post.data.pubDate,
			description: post.data.description,
		})),
	});
}
