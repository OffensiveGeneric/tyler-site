# Tyler Kleint’s site

An Astro site for photographs, writing, work, and experiments on the web.

## Development

```sh
npm install
npm run dev
```

Build and preview the production output with:

```sh
npm run build
npm run preview
```

## Résumé PDF

The web résumé lives at `/resume`; `/cv` permanently redirects there. Generate the committed, plain single-column PDF after résumé content changes with:

```sh
npm run resume:pdf
```

The command requires Google Chrome or Chromium and writes `public/tyler-kleint-resume.pdf`.

## Blog images

The easiest method is the interactive helper:

```sh
npm run blog:image
```

It asks for the source image, post slug, short filename, alt text, and optional caption. Paste the Markdown line it prints into the post.

For a non-interactive invocation, provide the same information as flags:

```sh
npm run blog:image -- \
  --input "/mnt/c/Users/tyler/Downloads/wedding-album.jpg" \
  --post post-01-81426 \
  --name wedding-album \
  --alt "A descriptive account of the photograph" \
  --caption "An optional visible caption"
```

The command creates responsive AVIF and WebP files under `public/images/blog/<post>/` and prints one ordinary Markdown image line to paste into the post. During the build, that line becomes an accessible responsive `<picture>` with an optional caption. The source file remains untouched. When publishing, commit the post plus its generated image directory; do not commit the large camera original.

## Rendering approach

The normal pages are Astro components. They render to HTML and CSS at build time, so they do not require client-side JavaScript. React is installed for future interactive components, but a React component only becomes a browser-side island when we explicitly add a hydration directive such as `client:load`.

This keeps content pages fast and inspectable while leaving room for genuinely stateful interactions later.

## Project structure

```text
src/
├── components/   # reusable page pieces
├── layouts/      # shared document shells
├── pages/        # routes
├── styles/       # global CSS
└── content/      # future Markdown content collections
```
