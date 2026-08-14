# AGENTS.md

## Project

This repository contains Tyler's personal website.

The site is a modern rebuild of an older WordPress site. It is both a real personal site and a web-development learning project. Prefer implementations that are understandable, inspectable, and teach useful modern web concepts.

Do not recreate WordPress-style architecture.

## Core stack

Use:

- Astro
- TypeScript
- React islands where client-side state or interaction is genuinely useful
- Modern CSS
- SQLite
- Drizzle ORM where it improves clarity
- Node.js
- Caddy
- Git/GitHub

The production host is a small Ubuntu DigitalOcean Droplet.

Do not introduce major new frameworks or infrastructure without a concrete need.

In particular, do not add by default:

- a full React SPA
- Next.js
- Tailwind
- a large component library
- Postgres
- Docker
- Kubernetes
- Redis
- authentication
- a CMS
- an admin dashboard
- a large backend framework
- animation libraries where native browser APIs are sufficient

Prefer the browser platform and simple server-side code.

## Project goals

The site should eventually include:

- homepage
- photography gallery
- blog
- CV
- About page
- small backend
- SQLite-backed photo metadata
- locally hosted image files
- image ingestion and derivative generation
- distinctive typography and graphic design
- modern but restrained interaction and animation
- good accessibility
- very good performance

Primary routes:

```text
/
/photography
/blog
/cv
/about
```

Additional routes such as `/colophon` or `/workshop` may be introduced later if they support the design concept.

## Development philosophy

This is a learning project.

Do not respond to a task by dumping a large amount of unnecessary architecture into the repository.

Prefer:

1. small changes
2. clear components
3. native platform features
4. explicit data flow
5. understandable abstractions
6. incremental implementation

Before making a significant architectural change:

- inspect the existing repository
- determine whether the capability already exists
- explain the reason for the change
- prefer the smallest implementation that solves the actual problem
- preserve existing working behavior where possible
- run the relevant build/tests afterward

Avoid speculative abstractions.

Do not create infrastructure merely because it might become useful later.

# Architecture

## Astro first

Astro is the default rendering model.

Pages that do not require client-side state should render as HTML/CSS with little or no client JavaScript.

Typical Astro-first content:

- homepage structure
- blog posts
- CV
- About page
- photography detail pages
- static navigation
- typography
- layout

Use React only when there is a concrete interactive requirement.

Good React island candidates include:

- interactive gallery controls
- filtering/search
- stateful photo viewer controls
- complex interaction
- experiments that genuinely require client state

Do not hydrate React components unnecessarily.

Prefer:

```astro
<Component />
```

when no client JavaScript is needed.

Only use directives such as:

```astro
<Component client:load />
<Component client:idle />
<Component client:visible />
```

when hydration is required.

Choose the least aggressive hydration strategy appropriate to the interaction.

## Native browser APIs first

Prefer native HTML/CSS/browser features over JS libraries.

Use modern CSS for:

- layout
- Grid
- subgrid
- responsive behavior
- container queries
- typography
- hover/focus states
- most animation
- scroll-linked effects where appropriate
- color calculations

Prefer browser APIs such as:

- View Transitions API
- CSS scroll-driven animations
- `prefers-reduced-motion`
- `IntersectionObserver` where necessary
- native dialogs where appropriate

Do not reach for an animation framework before establishing that the native platform is insufficient.

WebGPU may be used later for isolated experimentation. It should never become a dependency for ordinary site navigation or content.

# Visual direction

There are two related but deliberately different visual modes.

## Photography: contact sheet

The photography section should visually resemble a photographic contact sheet.

Priorities:

- photography dominates the page
- dark or near-black working surface
- small utilitarian typography
- deliberate, consistent gutters
- mixed portrait and landscape images
- frame numbers
- dates
- filenames or technical metadata where useful
- minimal decorative chrome
- precise layout
- restrained interaction

Avoid the generic modern photography-portfolio aesthetic.

Do not cover photographs with unnecessary cards, rounded rectangles, gradients, badges, or UI decoration.

Use CSS Grid before considering masonry libraries.

The photography page should feel closer to a darkroom working artifact than a SaaS gallery component.

### Photo transitions

The View Transitions API is a preferred experiment here.

Desired interaction:

- a clicked thumbnail should visually transition from its position in the contact sheet into the larger photo view
- browser Back should reverse coherently
- surrounding UI should fade/move subtly rather than performing a large theatrical animation
- all motion must respect `prefers-reduced-motion`

Use native View Transitions before attempting to reproduce the effect entirely in React.

## Other pages: jewel box

The homepage, blog, CV, About page, and related non-photography pages may be much more graphically adventurous.

Primary influences:

- Arts & Crafts movement
- late nineteenth-century book design
- Gilded Age decorative arts
- Aesthetic Movement
- jewel-box interiors
- painting
- historic textiles
- framing
- stained glass
- furniture and joinery
- visible craftsmanship
- early personal websites / 1990s web

Do not interpret this as a generic "Victorian" theme.

Avoid:

- stock Victorian clip art
- steampunk aesthetics
- generic parchment backgrounds
- default beige William Morris imitation
- superficial ornamental skins applied to generic card layouts

The deeper design idea is visible authorship and construction.

Pages may feel composed rather than templated.

It is acceptable for different pages to have meaningfully different compositions as long as they remain recognizably part of one site.

Useful ideas include:

- decorative rules
- custom borders
- repeating patterns
- strong typography
- handmade SVG ornament
- unusual link treatments
- intentional visual density
- small animated decorative elements
- early-web-inspired badges or interface fragments
- page-specific compositions

The site should feel made by a person, not generated from a design-system template.

## Unifying rule

Use this as the primary design test:

> The photography pages should resemble photographic artifacts. The other pages should resemble objects made by a craftsperson who happens to have access to a web browser in 2026.

The site itself is a crafted object.

# Ornament

Prefer original ornament built in the repository over downloaded decorative asset packs.

Potential organization:

```text
src/
└── ornaments/
    ├── corner-leaf.svg
    ├── divider.svg
    ├── frame-corner.svg
    ├── rosette.svg
    └── rule-vine.svg
```

Use SVG deliberately.

Potential techniques:

- paths
- masks
- clipping
- transforms
- `currentColor`
- CSS variables
- CSS animation
- stroke animation
- repeated motifs

Motifs should ideally emerge from the site's actual interests and visual language:

- foliage
- textiles
- stained-glass geometry
- painted decoration
- carved frames
- joinery
- decorative borders

Do not introduce a large generic icon system for ornamental work.

# Typography

Typography is a major part of the site's identity.

Avoid defaulting to:

- Inter
- generic system sans stacks as the primary visual identity
- the standard "developer portfolio" typography treatment

A likely system includes:

1. an expressive display face
2. a high-quality reading serif
3. a monospace face for technical/metadata material

The monospace face may be used for:

- frame numbers
- timestamps
- filenames
- URLs
- navigation indexes
- metadata

The contrast between book/display typography and monospace metadata is intentional and helps connect nineteenth-century print culture with early web and contemporary computing.

Fonts should be self-hostable or otherwise appropriately licensed.

Do not commit proprietary font files without explicit authorization.

# Color

The visual system may use rich, historical/jewel-box colors.

Useful directions include:

- oxblood
- ultramarine
- deep green
- verdigris
- old gold
- parchment
- black

Prefer semantic CSS custom properties.

For example:

```css
:root {
  --color-oxblood: ...;
  --color-ultramarine: ...;
  --color-verdigris: ...;
  --color-gold: ...;
  --color-paper: ...;
  --color-ink: ...;
}
```

Modern color features such as OKLCH and `color-mix()` are encouraged where browser support is appropriate.

Different sections may emphasize different palette combinations.

Do not force every page into exactly the same background/accent pattern.

# Animation and interaction

Motion should support materiality and composition.

Good candidates:

- decorative rules drawing into place
- SVG foliage or ornament subtly revealing
- restrained page transitions
- scroll-linked changes
- tiny pattern movement
- image-to-detail transitions
- subtle gallery filtering
- small intentionally early-web animated details

Avoid:

- giant parallax sequences
- excessive spring animations
- scroll hijacking
- unnecessary custom cursors
- animation for every element
- large JS animation bundles without a clear need

The preferred response from a visitor is:

> This site feels unusually considered.

not:

> This site is demonstrating an animation library.

Always support reduced-motion preferences.

# Blog

The blog should initially use Astro content collections and Markdown or MDX.

Do not store ordinary blog posts in SQLite unless a later requirement provides a reason.

Expected metadata includes at least:

```yaml
title:
date:
description:
```

Additional metadata may be added as real requirements emerge.

Keep blog content easy to edit in Git.

# CV

`/cv` should be semantic HTML.

Do not embed a PDF as the primary CV.

Requirements:

- readable on screen
- accessible
- responsive
- printable
- good print typography
- usable with browser Print → Save as PDF

Use print CSS.

Keep content sufficiently separated from presentation that the source can later move to structured data if useful.

Do not introduce a database for CV content without a concrete need.

# Photography and media storage

Photo originals should not live in the Git repository.

Production media will likely live under a layout similar to:

```text
/srv/tyler-site/
├── app/
├── media/
│   ├── originals/
│   ├── large/
│   ├── medium/
│   └── thumbs/
├── data/
│   └── site.db
└── backups/
```

Do not hardcode this structure throughout application code.

Centralize filesystem configuration.

Do not expose original files publicly by default.

The public site should generally serve appropriately sized web derivatives.

Likely derivative formats:

- AVIF
- WebP fallback where useful

Preserve original source files.

# Database

Use SQLite for the site's small persistent backend.

Use Drizzle when it provides useful schema management/type safety, but do not hide the relational model.

Understand and preserve the underlying SQL design.

Likely eventual entities include:

```text
photos
collections
photo_collections
```

A possible `photos` shape may eventually include:

```text
id
slug
filename
title
caption
date_taken
camera
lens
width
height
orientation
featured
created_at
```

Do not create fields or tables merely because they are listed here.

Design the final schema after examining the actual photo collection and its metadata needs.

# Photo ingestion

A later photo-ingestion workflow may:

1. accept a high-resolution source
2. preserve the original
3. extract EXIF metadata
4. generate thumbnail/medium/large derivatives
5. generate AVIF
6. create fallback formats where useful
7. record metadata in SQLite

Do not implement this prematurely.

Before implementing ingestion, propose:

- filesystem flow
- metadata model
- duplicate handling
- naming strategy
- failure/retry behavior
- backup implications

Prefer a transparent command-line workflow over a large web admin interface.

# Backend

The backend should remain small.

A likely production shape is:

```text
Internet
   ↓
 Caddy
   ├── /media/* → static media on disk
   │
   └── application requests → Astro/Node
                                ↓
                              SQLite
```

Caddy should directly serve static media when appropriate.

Do not route large static images through application code without a reason.

Do not create microservices.

# Production and deployment

Production runs on an Ubuntu DigitalOcean Droplet.

Caddy is the public web server.

Development should normally happen in the repository rather than by directly editing production files.

Manual deployment should be understood before adding CI/CD.

A typical deployment may eventually resemble:

```bash
git pull
npm ci
npm run build
```

plus any required service restart or migration.

Do not add GitHub Actions solely because deployment automation is fashionable.

Add automation only after the manual deployment procedure is stable and documented.

# Production access

Do not commit:

- SSH private keys
- passwords
- API secrets
- database credentials
- private tokens

Prefer an SSH host alias configured outside the repository, for example:

```sshconfig
Host tyler-site
    HostName ...
    User ...
    IdentityFile ...
```

Repository instructions and scripts may assume a stable host alias once one has been established.

Do not hardcode secret-bearing SSH commands into scripts.

If a reusable server operations or deployment skill exists, use that instead of inventing a new connection procedure.

# Development server

When starting the Astro dev server, use background mode:

```bash
astro dev --background
```

Manage it with:

```bash
astro dev stop
astro dev status
astro dev logs
```

# Documentation

Keep this file concise enough to remain authoritative.

Detailed information should live in `docs/`.

Suggested documents:

```text
docs/
├── architecture.md
├── design-direction.md
├── deployment.md
└── status.md
```

Use:

- `architecture.md` for detailed system design
- `design-direction.md` for visual references, motifs, typography, and design rationale
- `deployment.md` for production topology and operational procedures
- `status.md` for changing project state and near-term work

Do not turn `AGENTS.md` into a chronological project diary.

If a decision becomes obsolete, update or remove it rather than leaving contradictory instructions.

Astro documentation: https://docs.astro.build

Useful guides:

- https://docs.astro.build/en/guides/routing/
- https://docs.astro.build/en/basics/astro-components/
- https://docs.astro.build/en/guides/framework-components/
- https://docs.astro.build/en/guides/content-collections/
- https://docs.astro.build/en/guides/styling/

# Testing and validation

For meaningful changes, run the appropriate checks.

At minimum, when relevant:

```bash
npm run build
```

Also run configured:

- type checks
- linting
- tests
- formatting checks

For visual/frontend work, inspect:

- desktop layout
- narrow/mobile layout
- keyboard navigation
- focus states
- reduced-motion behavior
- loading behavior
- broken image states

Do not claim a change works if the corresponding validation was not performed.

Report failed checks clearly.

# Performance

Performance is a design constraint.

Avoid:

- hydrating the entire page
- shipping large client bundles for static content
- eagerly loading full-resolution photography
- unnecessary third-party JS
- giant font payloads
- duplicate image downloads
- layout shifts from images without known dimensions

Prefer:

- static HTML
- lazy loading where appropriate
- responsive image sizes
- AVIF/WebP derivatives
- explicit image dimensions
- selective hydration
- preloading only high-value resources

React being present in the repository is not itself a problem. Unnecessary hydration is.

# Accessibility

Do not sacrifice accessibility for visual experimentation.

Maintain:

- semantic HTML
- keyboard operation
- visible focus states
- useful alt text
- appropriate contrast
- reduced-motion support
- sensible document hierarchy

Decorative ornament should generally be hidden from assistive technology unless it conveys meaningful information.

Do not implement custom controls when a native semantic element solves the problem.

# Current priority

The near-term priority is the site's core structure and visual language.

Before advancing into backend complexity, establish:

1. Astro/TypeScript structure
2. core routes
3. reusable layout primitives
4. typography
5. the distinction between contact-sheet photography and jewel-box content pages
6. responsive behavior
7. a strong CSS architecture

Do not jump ahead into:

- photo ingestion
- complex SQL schema
- WebGPU
- admin interfaces
- deployment automation

unless the task explicitly concerns one of those areas.

# Agent behavior

When given a task:

1. inspect relevant existing code first
2. respect the architectural and visual rules in this file
3. identify the smallest coherent change
4. implement it
5. run relevant checks
6. summarize:
   - what changed
   - what was tested
   - any unresolved issues
   - anything deliberately deferred

When several approaches are reasonable, prefer the solution that:

- uses fewer dependencies
- exposes more of the underlying web platform
- is easier to understand
- preserves performance
- better supports the site's visual identity

Do not silently replace deliberate bespoke work with generic framework conventions.
