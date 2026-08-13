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
