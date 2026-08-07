---
name: Arnold Gamboa — Shipped & Unfinished
description: Speaker one-sheet personal site — matte press-kit paper, portrait plate, slate tabs, stamp-red contact.
colors:
  paper: "#F3EFE6"
  paper-deep: "#E8E2D4"
  ink: "#141412"
  ink-soft: "#2C2A26"
  rule: "#6F6A60"
  tab: "#1F3D4A"
  tab-hover: "#2A5263"
  stamp: "#B84A2E"
  stamp-hover: "#9A3D26"
  paper-on-tab: "#F3EFE6"
  white: "#FFFFFF"
  plate-backdrop: "#CFC8B8"
typography:
  display:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "clamp(2.35rem, 5.5vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "clamp(1.5rem, 2.4vw, 1.85rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  post-title:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "clamp(1.9rem, 4.2vw, 2.9rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.03em"
  post-h3:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "1.3rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  blog-item:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "normal"
  page-title:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "clamp(2rem, 4vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.08em"
rounded:
  sm: "2px"
spacing:
  gutter: "clamp(1.25rem, 4vw, 2.5rem)"
  section: "clamp(1.75rem, 4vw, 2.5rem)"
  page-max: "68rem"
  measure: "68ch"
components:
  button-primary:
    backgroundColor: "{colors.stamp}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: "0.4rem 0.95rem"
  button-primary-hover:
    backgroundColor: "{colors.stamp-hover}"
    textColor: "#FFFFFF"
  tab-active:
    backgroundColor: "{colors.tab}"
    textColor: "{colors.paper-on-tab}"
    rounded: "{rounded.sm}"
  booking-strip:
    backgroundColor: "{colors.tab}"
    textColor: "{colors.paper-on-tab}"
    rounded: "{rounded.sm}"
    padding: "0.85rem 1rem"
  contact-block:
    backgroundColor: "{colors.tab}"
    textColor: "{colors.paper-on-tab}"
    rounded: "{rounded.sm}"
    padding: "1.25rem 1.35rem"
---

# Design System — Speaker One-Sheet

## Overview

Personal site for Arnold Gamboa. Visual world is a **conference speaker / press-kit one-sheet** on matte paper stock: portrait plate, plain through-line, short role coupons, and a slate “booking” contact strip. Not a consultancy marketing page and not a dark mono blog skin.

Creative north star: **the speaker kit** — identity arrives as a printed sheet you could hand someone after a talk.

Source of tokens: `src/styles/global.css`. Layout shell: `src/layouts/BaseLayout.astro`.

## Colors

| Role | Token | Use |
|------|--------|-----|
| Paper ground | `paper` `#F3EFE6` | Page background |
| Paper deep | `paper-deep` `#E8E2D4` | Plate mount, now-cue fill |
| Ink | `ink` `#141412` | Headings, primary text |
| Ink soft | `ink-soft` `#2C2A26` | Body copy (still ≥4.5:1 on paper) |
| Rule | `rule` `#6F6A60` | Hairlines, meta, inactive chrome |
| Tab / slate | `tab` `#1F3D4A` | Active nav, booking strip, contact blocks |
| Stamp | `stamp` `#B84A2E` | Primary CTA, emphasis links |
| White | `white` `#FFFFFF` | Text on stamp buttons (contrast on `stamp`) |
| Plate backdrop | `plate-backdrop` `#CFC8B8` | Portrait plate's image pre-load mount |

Light mode only — desk-lamp paper scene. Do not invent a dark theme without a new direction.

## Typography

Single family: **Archivo** (loaded from Google Fonts). Grotesk press-kit voice — no display serif, no mono costume.

- **Display:** page name / home hello — heavy, tight tracking, balanced wrap
- **Headline:** role coupon titles
- **Post title:** blog post pages — heavy, tight tracking, balanced
- **Post h3:** sub-headings inside blog bodies
- **Blog item:** post titles on the /blog/ index list
- **Page title:** inner page h1s (Blog, Now, Contact)
- **Body:** ~1.0625rem / 1.55, measure ~68ch
- **Label:** uppercase tracked labels (FIND ME, RIGHT NOW, kit tabs)

No kicker/eyebrow above headings. Headings carry their own weight.

## Layout

- Shell max width ~68rem with fluid gutters  
- Home: two-column **sheet** — portrait plate | body (stacks to one column ≤760px)  
- Inner pages: single column ~42rem  
- Nav: kit tabs top-right; site mark top-left  
- Rhythm: more space above section breaks than below; hairline rules separate coupons  
- Mobile: plate capped (~18rem), booking strip full-width with stacked email CTA

## Elevation & Depth

Sparse. Primary depth is the **photo plate** soft offset shadow:

`0 10px 28px rgba(26,26,24,0.12), 0 2px 6px rgba(26,26,24,0.06)`

No glass, no neon glow, no hard neobrutal offsets. Surfaces otherwise flat with 1px rules.

## Shapes

Near-square corners (`2px`) — die-cut kit tabs and stamp buttons, not app pills. Hairline borders on tabs and plate. External YouPastor tab uses dashed border.

## Components

- **Kit tabs** — uppercase labels; active = filled slate; external = dashed  
- **Portrait plate** — padded mount, caption under image  
- **Booking strip** — full slate bar; social text links + stamp primary button  
- **Role coupons** — title + short paragraph, ruled list (not cards-in-cards)  
- **Now cue** — quiet bordered panel with stamp-colored text links  
- **Contact block** — slate panel repeating booking grammar on inner pages  
- **Focus** — 2px stamp outline, 3px offset  

Motion (optional, `prefers-reduced-motion: no-preference` only): short translate settle on plate and body blocks — never hide content with opacity defaults.

## Do's and Don'ts

**Do**

- Lead with person + portrait + plain first-person copy  
- Keep contact reachable early (booking strip on home)  
- Use only real links, posts, and claims from PRODUCT.md  
- Extend new pages with kit tabs + paper ground + Archivo  

**Don’t**

- Add service-grid cards, fake metrics, or testimonials  
- Switch to dark mono blog defaults or cream+serif “portfolio AI” defaults  
- Use gradient text, glass chrome, or eyebrow labels above headings  
- Invent a second type family without a deliberate system change  
