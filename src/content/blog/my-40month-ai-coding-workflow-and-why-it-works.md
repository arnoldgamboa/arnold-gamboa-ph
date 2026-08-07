---
title: "My $40/Month AI Coding Workflow (And Why It Works)"
description: "Everyone talks about AI coding tools like you need to spend a fortune to build anything serious. I'm here to tell you that's not true — at least not for someone building on the side."
pubDate: 2026-02-15
slug: my-40month-ai-coding-workflow-and-why-it-works
tags: []
---Everyone talks about AI coding tools like you need to spend a fortune to build anything serious. I'm here to tell you that's not true — at least not for someone building on the side.

I run a three-tool workflow that costs me $40 a month. It's not perfect, but it ships things. Here's how it works.

## The Setup

I use three tools, each for a specific job:

- **Google Antigravity** ($20/mo) — Google's answer to Cursor, an AI-native code editor

- **OpenAI Codex** ($20/mo) — dedicated coding model, accessed via API or interface

- **Gemini 3 Pro** — bundled with Antigravity, no extra cost

That's it. No Claude Code at $100 or $200 a month. Not at this stage, not for side projects.

## How the Workflow Actually Runs
### Planning: Claude Opus on Google Antigravity

When I'm starting a new feature, I open Google Antigravity and work with Claude Opus. I describe what I'm trying to build — the problem, the constraints, the approach — and I ask Opus to create a detailed plan saved as a markdown file.

Think of Opus as your senior engineer. Bright, strategic, understands the full picture. Give it a hard problem and it'll think through it properly. It's expensive to run, so I don't use it for execution — just for thinking.

That markdown file becomes the source of truth for everything that follows.

### Execution: OpenAI Codex

Once the plan exists, I switch to Codex and point it at the markdown file. "Read this plan. Follow it. Build it."

Codex is the diligent worker. Methodical, precise, doesn't cut corners. Crucially — it doesn't bail on you mid-task. Claude Sonnet, as good as it is, has a habit of hitting limits and dropping context right when you need it most. Codex doesn't do that. It's slower, but it finishes what it starts.

For execution work — writing the actual code, implementing the steps from the plan — Codex is reliable in a way that matters when you're building alone.

### Debugging: Gemini 3 Pro

When Codex hits a bug it can't resolve, I bring in Gemini 3 Pro.

This one surprised me. Gemini approaches problems differently — it doesn't just retry the same strategies, it comes at bugs from a different angle. I've handed it problems that Codex went in circles on, and Gemini found the fix quickly. I can't fully explain why, but the pattern has been consistent enough that it's now my default debugging step.

Gemini 3 Pro is also a solid fallback for planning when Opus is maxed out.

## Why This Works

Each tool has a defined role. Opus thinks. Codex executes. Gemini debugs. There's no redundancy, no tool doing a job it's not suited for.

The markdown plan is the glue. It means I'm not re-explaining context every time I switch tools. The plan holds the thinking — each tool just reads it and does its job.

And the cost stays honest. $40 a month for side projects is sustainable. I'm not betting $200 a month on projects that may or may not find users.

## What I'm Considering Next

I'm looking at dropping Codex and picking up GitHub Copilot at $10 a month instead — Copilot can also run Codex under the hood, which would bring the total down to $30. Haven't pulled the trigger yet because the current setup works and I don't want to break something that's running well.

If you're running a different workflow — especially if you've found a better execution tool than Codex — I'd genuinely like to know. This setup is working for me right now, but I'm not convinced it's the best possible version of it.
