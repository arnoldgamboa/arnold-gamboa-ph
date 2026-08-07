#!/usr/bin/env node
/**
 * Migrate arnold.gamboa.ph blog posts → Markdown content collection.
 * - Fetches each post from the live Bear site
 * - Converts HTML body → Markdown (preserving h2/h3/ul/ol/li/strong/em/a/img/blockquote)
 * - Downloads header images, uploads them to Cloudflare R2 (S3-compatible, SigV4)
 * - Writes src/content/blog/<slug>.md with frontmatter (title, date, tags, hero, description)
 *
 * Usage: node scripts/migrate-blog.mjs
 * Requires: .env with R2_* credentials.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, createHmac } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BLOG_DIR = join(ROOT, "src", "content", "blog");
const IMG_DIR = join(ROOT, "public", "images", "blog");

// ---- .env loader (no deps) ----
function loadEnv() {
	const envPath = join(ROOT, ".env");
	if (!existsSync(envPath)) throw new Error(".env not found");
	for (const line of readFileSync(envPath, "utf8").split("\n")) {
		const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
		if (m) process.env[m[1]] = m[2];
	}
	const need = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME"];
	for (const k of need) {
		if (!process.env[k] || process.env[k].startsWith("REPLACE_WITH"))
			throw new Error(`Missing .env value: ${k}`);
	}
}

// ---- R2 S3-compatible upload (SigV4) ----
function sha256hex(data) {
	return createHash("sha256").update(data).digest("hex");
}
function hmac(key, data) {
	return createHmac("sha256", key).update(data).digest();
}
function hmacHex(key, data) {
	return createHmac("sha256", key).update(data).digest("hex");
}

async function r2Put(key, body, contentType) {
	const account = process.env.R2_ACCOUNT_ID;
	const accessKey = process.env.R2_ACCESS_KEY_ID;
	const secret = process.env.R2_SECRET_ACCESS_KEY;
	const bucket = process.env.R2_BUCKET_NAME;
	const region = "auto";
	const service = "s3";
	const host = `${account}.r2.cloudflarestorage.com`;
	const endpoint = `https://${host}/${bucket}/${key}`;

	const now = new Date();
	const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
	const dateStamp = amzDate.slice(0, 8);
	const payloadHash = sha256hex(body);

	const canonicalHeaders = [
		`host:${host}`,
		`x-amz-content-sha256:${payloadHash}`,
		`x-amz-date:${amzDate}`,
	].join("\n");
	const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
	const canonicalRequest = [
		"PUT",
		`/${bucket}/${key}`,
		"",
		canonicalHeaders,
		"",
		signedHeaders,
		payloadHash,
	].join("\n");

	const scope = `${dateStamp}/${region}/${service}/aws4_request`;
	const stringToSign = [
		"AWS4-HMAC-SHA256",
		amzDate,
		scope,
		sha256hex(canonicalRequest),
	].join("\n");

	const kDate = hmac(`AWS4${secret}`, dateStamp);
	const kRegion = hmac(kDate, region);
	const kService = hmac(kRegion, service);
	const kSigning = hmac(kService, "aws4_request");
	const signature = hmacHex(kSigning, stringToSign);

	const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

	const res = await fetch(endpoint, {
		method: "PUT",
		headers: {
			host,
			"x-amz-content-sha256": payloadHash,
			"x-amz-date": amzDate,
			authorization,
			"content-type": contentType,
		},
		body,
	});
	if (!res.ok) {
		const err = await res.text();
		throw new Error(`R2 upload failed (${res.status}) for ${key}: ${err.slice(0, 300)}`);
	}
	return true;
}

// ---- HTML → Markdown (covers Bear's simple markup) ----
function htmlToMarkdown(html) {
	let s = html;
	// strip comments
	s = s.replace(/<!--[\s\S]*?-->/g, "");
	// images first (keep alt + src)
	s = s.replace(/<img[^>]*src="([^"]+)"[^>]*>/g, (m, src) => {
		const alt = (m.match(/alt="([^"]*)"/) || [])[1] || "";
		return `![${alt}](${src})`;
	});
	// links
	s = s.replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (m, href, text) => {
		const inner = htmlToMarkdown(text).trim();
		return `[${inner}](${href})`;
	});
	// strong/b
	s = s.replace(/<(strong|b)>([\s\S]*?)<\/(?:strong|b)>/g, "**$2**");
	// em/i
	s = s.replace(/<(em|i)>([\s\S]*?)<\/(?:em|i)>/g, "*$2*");
	// code
	s = s.replace(/<code>([\s\S]*?)<\/code>/g, "`$1`");
	// headings
	s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/g, "### $1\n");
	s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/g, "## $1\n");
	s = s.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/g, "#### $1\n");
	// lists
	s = s.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/g, (m, inner) => {
		const items = inner
			.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, (im, it) => `- ${it.trim()}\n`)
			.trim();
		return `\n${items}\n`;
	});
	s = s.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/g, (m, inner) => {
		let i = 1;
		const items = inner
			.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, (im, it) => `${i++}. ${it.trim()}\n`)
			.trim();
		return `\n${items}\n`;
	});
	// blockquote
	s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/g, (m, inner) => {
		const quoted = inner
			.trim()
			.split("\n")
			.map((l) => `> ${l}`)
			.join("\n");
		return `\n${quoted}\n`;
	});
	// hr
	s = s.replace(/<hr[^>]*\/?>/g, "\n---\n");
	// paragraphs
	s = s.replace(/<p[^>]*>([\s\S]*?)<\/p>/g, (m, inner) => `\n${inner.trim()}\n`);
	// br
	s = s.replace(/<br\s*\/?>/g, "\n");
	// leftovers
	s = s.replace(/<\/?(?:div|span|section|article|figure|figcaption|header|footer)[^>]*>/g, "");
	// decode entities
	const entities = {
		"&amp;": "&",
		"&lt;": "<",
		"&gt;": ">",
		"&quot;": '"',
		"&#39;": "'",
		"&apos;": "'",
		"&nbsp;": " ",
		"&rsquo;": "’",
		"&lsquo;": "‘",
		"&ldquo;": "“",
		"&rdquo;": "”",
		"&mdash;": "—",
		"&ndash;": "–",
		"&hellip;": "…",
		"&#x27;": "'",
		"&copy;": "©",
	};
	s = s.replace(/&[a-z#0-9]+;/gi, (m) => entities[m] || m);
	// normalize whitespace: collapse 3+ newlines to 2, trim
	s = s.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
	return s + "\n";
}

// ---- decode HTML entities ----
function decodeEntities(s) {
	const entities = {
		"&amp;": "&",
		"&lt;": "<",
		"&gt;": ">",
		"&quot;": '"',
		"&#39;": "'",
		"&apos;": "'",
		"&nbsp;": " ",
		"&rsquo;": "’",
		"&lsquo;": "‘",
		"&ldquo;": "“",
		"&rdquo;": "”",
		"&mdash;": "—",
		"&ndash;": "–",
		"&hellip;": "…",
		"&#x27;": "'",
		"&#x2019;": "’",
		"&#x201C;": "“",
		"&#x201D;": "”",
		"&copy;": "©",
	};
	return s.replace(/&[a-z#0-9]+;/gi, (m) => entities[m] || m);
}

// ---- fetch one post ----
async function fetchPost(slug) {
	const url = `https://arnold.gamboa.ph/${slug}/`;
	const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
	if (!res.ok) throw new Error(`fetch ${slug} → ${res.status}`);
	const html = await res.text();

	const title = decodeEntities(
		(html.match(/<main>[\s\S]*?<h1>([\s\S]*?)<\/h1>/) || [])[1]?.trim() || slug
	);
	const dateMatch = html.match(/<time datetime="([^"]+)"/);
	const date = dateMatch ? new Date(dateMatch[1]).toISOString().slice(0, 10) : "";

	// tags
	const tags = [
		...html.matchAll(/<a rel="nofollow" href="\/blog\/\?q=[^"]*"[^>]*>#?([^<]+)<\/a>/g),
	].map((m) => decodeEntities(m[1].trim()));

	// description: derive from the first real paragraph of the body content,
	// falling back to meta description when the body is empty
	const descMeta = (() => {
		const raw =
			(html.match(/<meta name="description" content="([^"]+)"/) || [])[1] ||
			(html.match(/<meta property="og:description" content="([^"]+)"/) || [])[1] ||
			"";
		return decodeEntities(raw).replace(/\s+/g, " ").trim();
	})();
	// keep the raw body (before htmlToMarkdown) for description extraction in main()
	let desc = "";

	// main content: between <main> and </main>, drop trailing tags/upvote/nav
	const main = (html.match(/<main>([\s\S]*?)<\/main>/) || [])[1] || "";
	let body = main
		.replace(/<h1>[\s\S]*?<\/h1>/, "") // drop title (it's the filename)
		.replace(/<p>\s*<i>\s*<time[\s\S]*?<\/time>\s*<\/i>\s*<\/p>/, "") // drop date
		.replace(/<p class="tags">[\s\S]*?<\/p>/, "") // drop tags block
		.replace(/<form[\s\S]*?<\/form>/g, "") // drop upvote
		.replace(/<script[\s\S]*?<\/script>/g, "")
		.replace(/<style[\s\S]*?<\/style>/g, "");

	// header image: if the first non-empty element is an img (bare or wrapped in <p>),
	// treat as hero and drop from body
	let hero = null;
	const bodyTrim = body.trimStart();
	const imgAtStart = bodyTrim.match(/^(?:<p[^>]*>\s*)?(<img[^>]*>)/);
	if (imgAtStart) {
		const src = (imgAtStart[1].match(/src="([^"]+)"/) || [])[1];
		if (src) {
			hero = src;
			const escSrc = src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			body = body.replace(new RegExp(`<p[^>]*>\s*<img[^>]*src=["']${escSrc}["'][^>]*>\s*<\/p>`), "");
			// if not wrapped, try bare img
			body = body.replace(new RegExp(`<img[^>]*src=["']${escSrc}["'][^>]*>`), "");
		}
	}
	// fallback: any img in body (if not at start)
	if (!hero) {
		const anyImg = body.match(/<img[^>]*src="([^"]+)"/);
		if (anyImg) hero = anyImg[1];
	}

	return { slug, title, date, tags, desc, body, hero };
}

// ---- main ----
async function main() {
	loadEnv();
	mkdirSync(BLOG_DIR, { recursive: true });
	mkdirSync(IMG_DIR, { recursive: true });

	const slugs = [
		"23-years-running-agencies-and-basecamp-is-still-the-only-tool-that-gets-it",
		"ai-agent-business-operations-exceptions",
		"ai-for-bivocational-pastors",
		"ai-sermon-research-needs-source-trail",
		"ai-should-help-pastors-not-replace-them",
		"ai-without-outsourcing-pastoral-calling",
		"ai-workspace-pastors-actually-need",
		"client-communication-is-a-feature-not-a-courtesy",
		"dont-throw-away-the-baby-with-the-woocommerce",
		"generic-chatbots-sermon-preparation",
		"good-clients-bad-clients-and-a-christmas-day-call",
		"hire-a-digital-employee-not-another-ai-tool",
		"my-40month-ai-coding-workflow-and-why-it-works",
		"pastors-ai-context-switching",
		"pastors-ai-pastoral-judgment",
		"pastors-need-approval-gates-not-autopilot-ai",
		"prompt-fatigue-is-why-pastors-stop-using-ai",
		"real-cost-of-ai-adoption-is-friction",
		"sermon-is-not-the-whole-pastoral-workflow",
		"the-filipino-agency-advantage-and-why-most-waste-it",
		"what-ai-employee-can-do-small-business",
		"why-ai-is-killing-the-hourly-rate",
		"why-i-started-building-again",
		"why-i-wont-build-your-website-in-wordpress-and-what-i-recommend-instead",
		"why-im-building-an-open-source-alternative-to-basecamp",
		"youpastor-ai-pastoral-rhythm",
		"youpastor-ai-sermon-preparation-without-losing-your-voice",
		"youpastor-ai-sermon-series-context",
		"youpastor-approval-gates-real-sermon-prep-workflow",
		"youpastor-church-context-belongs-in-workflow",
		"youpastor-sermon-notes-before-ai-prompts",
		"your-first-ai-agent-should-be-boring",
	];

	const publicBase = (process.env.R2_PUBLIC_URL || "").replace(/\/+$/, "");
	const results = [];
	let imageCount = 0;

	for (const slug of slugs) {
		process.stdout.write(`· ${slug} … `);
		try {
			const post = await fetchPost(slug);

			// Handle hero image: download → upload to R2 → local cache copy
			let heroLocal = null;
			let heroRemote = null;
			if (post.hero) {
				const extMatch = post.hero.match(/\.(webp|png|jpe?g|gif|avif)(\?|$)/i);
				const ext = extMatch ? extMatch[1].toLowerCase().replace("jpeg", "jpg") : "webp";
				const fname = `${slug}.${ext}`;
				const localPath = join(IMG_DIR, fname);
				const imgRes = await fetch(post.hero, { headers: { "user-agent": "Mozilla/5.0" } });
				if (imgRes.ok) {
					const buf = Buffer.from(await imgRes.arrayBuffer());
					writeFileSync(localPath, buf);
					heroLocal = `/images/blog/${fname}`;
					// upload to R2
					const ct =
						ext === "jpg"
							? "image/jpeg"
							: ext === "webp"
								? "image/webp"
								: ext === "png"
									? "image/png"
									: ext === "avif"
										? "image/avif"
										: "image/gif";
					await r2Put(`images/blog/${fname}`, buf, ct);
					heroRemote = publicBase ? `${publicBase}/images/blog/${fname}` : heroLocal;
					imageCount++;
					process.stdout.write(`img→R2 `);
				}
			}

			const md = htmlToMarkdown(post.body);

			// description: first meaningful paragraph from the markdown body
			const firstPara = (md.match(/^([^#\-!\n][^\n]{40,})/m) || [])[1] || "";
			const derivedDesc = firstPara
				.replace(/[*_`\[\]()]/g, "")
				.replace(/\s+/g, " ")
				.trim();
			const description = (derivedDesc || post.desc).slice(0, 300);

			const frontmatter = [
				"---",
				`title: "${post.title.replace(/"/g, '\\"')}"`,
				`description: "${description.replace(/"/g, '\\"')}"`,
				`pubDate: ${post.date}`,
				`slug: ${slug}`,
				post.hero
					? `heroImage: "${heroRemote || heroLocal}"`
					: null,
				`tags: [${post.tags.map((t) => `"${t.replace(/"/g, '\\"')}"`).join(", ")}]`,
				"---",
				"",
			]
				.filter(Boolean)
				.join("\n");

			writeFileSync(join(BLOG_DIR, `${slug}.md`), `${frontmatter}${md}`);
			results.push({ slug, title: post.title, date: post.date, tags: post.tags, hero: !!heroRemote });
			process.stdout.write("ok\n");
		} catch (e) {
			results.push({ slug, error: e.message });
			process.stdout.write(`FAIL: ${e.message}\n`);
		}
	}

	console.log("\n=== SUMMARY ===");
	console.log(`Posts: ${results.length} | OK: ${results.filter((r) => !r.error).length} | FAIL: ${results.filter((r) => r.error).length}`);
	console.log(`Images uploaded to R2: ${imageCount}`);
	for (const r of results.filter((r) => r.error)) console.log(`  ✗ ${r.slug}: ${r.error}`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
