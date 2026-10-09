# Nawaz Shariff — Portfolio

**"Where Numbers Build Nations."** A bespoke one-page portfolio for Nawaz Shariff,
Accountant & Sales Head at Exar International (Kingdom of Saudi Arabia).

Built with Vite + React 19, Tailwind CSS 4, GSAP 3 (ScrollTrigger + SplitText) and Lenis.

---

## Run it locally

Requires **Node 18+** (built and tested on Node 24).

```bash
npm install
npm run dev        # http://localhost:5173
```

Production build:

```bash
npm run build      # → dist/
npm run preview    # serve dist/ at http://localhost:4173
```

## Edit the content

**All copy lives in [`src/content.js`](src/content.js).** Components never hard-code text.

- Wrap words in `*asterisks*` to set them in the gold italic display style: `'build *nations.*'`
- Stats with a numeric `value` count up on scroll; use `display: '[XX+]'` for placeholders.
- Page title, description and Open Graph tags are also read from `site` in `content.js`
  (injected into `index.html` at build time by a small plugin in `vite.config.js`).

### Placeholders to replace before launch

Search `src/content.js` for `[`. They are:

| Where | Placeholder |
| --- | --- |
| `site.url` | `https://your-domain.com` (canonical + Open Graph URLs) |
| `journey.chapters[].period` | years for B.Com, CFAP, AIBM (`[20XX]`) |
| `credentials.degree` | university name and graduation year |
| `credentials.certificates[].year` | certification years |
| `supply.items[].list` | example product lines — edit to match the real catalogue |

Contact details (email, phone, WhatsApp, LinkedIn) and the 15+ client / project-site
figures are already filled in.

The Journey chapters are shown in the order B.Com → CFAP → AIBM → Exar. If the real
chronology differs, reorder the `chapters` array.

## Photo & the sketch → photo effect

The hero is purely typographic. The only photo is the About portrait (`assets/nawaz-2.jpg`).
As you scroll to it, it is first drawn as a **gold banknote-style engraving**, then the real
photo develops over it from the face down. Both images are generated, pixel-aligned, by:

```bash
pip install "rembg[cpu]" pillow numpy scipy
python scripts/process_photos.py            # reuses cached masks in assets/processed/
python scripts/process_photos.py --remask   # re-run background removal from scratch
```

The pipeline removes the background (BiRefNet portrait model), refines the edge and
decontaminates its colours (no halo), applies the warm grade and a soft rim light, and
exports WebP (2 sizes) + PNG fallback. It then renders the engraving from the same cutout
(`nawaz-about-sketch-*.webp`; line spacing is tuned per size so phones never show moiré).
The natural-colour transparent master is saved to `assets/processed/nawaz-2-cutout.png`.

> **Windows:** if you see a Numba "No such file or directory" error, the cache path is too
> long — set a short one first, e.g. `set NUMBA_CACHE_DIR=C:\temp\numba`.

To swap the photo, replace `assets/nawaz-2.jpg`, run the script with `--remask`, and the
engraving is regenerated to match.

## Testing, screenshots & social card

```bash
npm run dev                         # in one terminal
npm run qa                          # clicks every nav path on 6 devices (phone → desktop):
                                    # Let's talk, hero CTAs, nav, menu, footer, back-to-top,
                                    # contact links, horizontal overflow, console errors
npm run shots                       # 360 / 768 / 1440 px → screenshots/, plus console-error report
SHOTS_REDUCED=1 npm run shots       # same, emulating prefers-reduced-motion

npm run build && npm run preview    # then, in another terminal:
npm run og                          # re-render public/og-image.jpg (1200×630) from the hero
```

(First run only: `npx playwright install chromium`.)

---

## Deploy

The site is fully static — any static host works. Set `site.url` in `src/content.js` to the
final domain first, so the Open Graph tags point to the right place.

### Vercel

1. Push the project to a GitHub / GitLab / Bitbucket repo.
2. In Vercel: **Add New → Project**, import the repo.
3. Vercel detects Vite automatically: build command `npm run build`, output `dist`.
4. Deploy. (`vercel.json` adds long-term caching for hashed assets.)

CLI alternative: `npm i -g vercel && vercel --prod`

### Netlify

1. Push the project to a Git repo.
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
3. Build settings are read from `netlify.toml` (`npm run build`, publish `dist`).
4. Deploy.

CLI / drag-and-drop alternative: run `npm run build`, then drag the `dist/` folder onto
<https://app.netlify.com/drop>, or `npx netlify-cli deploy --prod --dir=dist`.

### The contact form

The form is front-end only (no server): it validates, then drafts the message and offers
**Send by email** (mailto) or **Send on WhatsApp** using the details in `content.js`.
To collect submissions instead, point the form at a service such as Formspree or Netlify
Forms in `src/sections/Contact.jsx` (`onSubmit`).

---

## Project structure

```
src/
  content.js            ← all copy
  index.css             ← design tokens (:root), components, sections
  App.jsx               ← page composition
  lib/                  ← GSAP setup, Lenis, motion prefs, ornament geometry, reveal hook
  components/           ← Preloader, Cursor, Header, Footer, Magnetic, Star, LineArt…
  sections/             ← Hero (+ canvas field), About, Journey, Expertise, Supply,
                          Vision, Credentials, Contact
scripts/                ← photo pipeline, screenshots, OG image
assets/                 ← source photos + processed masks / cutouts
public/images/          ← optimised web images
```

## Accessibility & performance notes

- `prefers-reduced-motion`: no preloader animation, no smooth scroll, no pinning,
  no parallax — every section renders in its final state (the Journey becomes a vertical list).
- Custom cursor and magnetic effects only on fine pointers; touch devices keep native behaviour.
- Semantic landmarks and headings, skip link, visible gold focus rings, `lang="ar"` on Arabic text,
  alt text on both portraits, the Expertise balance sheet is a real `<table>`.
- The About photo and its engraving are lazy-loaded; fonts are self-hosted and subset by
  unicode range. With reduced motion the finished photo shows immediately (no sketch).
