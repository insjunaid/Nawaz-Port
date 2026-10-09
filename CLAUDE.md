# Nawaz Shariff — Portfolio

Bespoke, Awwwards-level personal portfolio for **Nawaz Shariff**.
Concept: **"Where Numbers Build Nations"** — finance precision meets Saudi Vision 2030 ambition.

## Working rules for this repo

- **All copy lives in `src/content.js`.** Components never hard-code user-facing text.
- Never invent numbers, client names or testimonials. Unknowns stay as bracketed
  placeholders (e.g. `[XX+]`, `[20XX]`) inside `src/content.js`.
- Colors are CSS variables in `src/index.css` (`:root`) and mirrored as Tailwind
  theme tokens. No purple gradients. No Inter / Roboto.
- Every animation must have a `prefers-reduced-motion` path (see `src/lib/motion.js`).
- Photo pipeline: `scripts/process_photos.py` (rembg → defringe → grade → WebP).
  Sources live in `assets/`, web outputs go to `public/images/`.
- Screenshots: `npm run shots` (Playwright, 360 / 768 / 1440) → `screenshots/`.

## Commands

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve the build
npm run shots      # Playwright screenshots (needs a running dev server; SHOTS_URL / SHOTS_REDUCED=1)
npm run og         # re-render public/og-image.jpg (needs `npm run preview` running)
npm run photos     # photo pipeline (needs rembg; see README)
npm run qa         # end-to-end nav / overflow / error checks on 6 devices
```

---

## Original brief (saved verbatim)

You are a world-class creative developer and art director (Awwwards level). Build a one-of-a-kind personal portfolio website for Nawaz Shariff. It must feel hand-crafted and bespoke, NOT like a template or AI-generated site.

ABOUT HIM (polish the copy, but do NOT invent numbers, client names or testimonials; use placeholders like [XX+ clients])
- Accountant & Sales Head at Exar International, Saudi Arabia (2 years)
- Supplies PPE, construction materials and consumables; manages major clients and procurement
- Education: Bachelor of Commerce, CGPA 9.2
- Certifications: CFAP (Certified Finance and Auditing Professional), AIBM (American Institute of Business Management)
- Contributes to Saudi Vision 2030 by supplying the construction and safety sector
- Strengths: client relationships, procurement, accounting, sales leadership

PHOTO
My photo is at ./assets/nawaz.png. View it first. If it has a background, remove it with Python `rembg`, check the edges visually, and fix any halos. Save a transparent PNG plus an optimized WebP. Never leave a box or hard edge around him.

DESIGN
- Concept: "Where Numbers Build Nations" (finance precision meets Vision 2030 ambition).
- Colors as CSS variables: ink #07090D, emerald #0B3D2E to #11A36A, desert gold #C9A24B, warm off-white text. No purple gradients.
- Faint 8-point-star Islamic lattice in thin gold lines as background texture and section dividers.
- Fonts: Fraunces or Cormorant (display), Manrope or Space Grotesk (body), JetBrains Mono (numbers), Amiri for an Arabic "مرحباً". No Inter or Roboto.
- Layout: editorial, asymmetric, big type, hairlines, numbered sections (01, 02...). No generic glass cards, no emoji icons, no hero + 3 identical cards.

HERO (the main wow)
- Giant outlined "NAWAZ SHARIFF" text with his cutout in front, so the text passes BEHIND his shoulders.
- Mouse parallax and tilt with layers moving at different speeds.
- Warm gold rim-light behind him, plus drifting financial numbers, ledger lines and SAR symbols that fade near his silhouette.
- A cursor spotlight that reveals hidden gold ledger lines on the dark background.
- Duotone/warm color grade on the photo to match the theme.
- On scroll, the portrait scales and shifts as the story moves on.

OTHER WOW MOMENTS
- Cinematic preloader: a ledger counter ticks 0 to 100 while gold lines draw the 8-point star, then a curtain opens into the hero.
- Custom cursor: gold dot with a lagging ring, magnetic buttons.
- Lenis smooth scroll, GSAP ScrollTrigger masked text reveals, count-up stats, horizontal-scroll career timeline.

SECTIONS
1 Hero, 2 About, 3 Journey (animated timeline), 4 Expertise (creative visual, no progress bars), 5 What I Supply (PPE, Construction Materials, Consumables, with hover-reveal line-art panels), 6 Vision 2030 (stat/quote band), 7 Credentials (premium certificate-style badges), 8 Contact (huge typographic CTA, placeholder email/phone/LinkedIn/WhatsApp, front-end-only form, footer with back-to-top animation).

TECH
Vite + React + Tailwind, GSAP + ScrollTrigger, Lenis (Three.js only if lightweight). Mobile-first and fully responsive (check 360px, 768px, 1440px). Respect prefers-reduced-motion. Semantic HTML, alt text, keyboard focus states, SEO + Open Graph tags, lazy-loaded optimized images. Put ALL copy in src/content.js so I can edit it easily. Clean, commented, modular code.

PROCESS
1. First create CLAUDE.md saving this brief, then state your design concept and 3 signature wow moments in a few lines.
2. Build everything. Run the dev server and use Playwright to screenshot at 360px, 768px and 1440px.
3. Self-review: Does anything look template-like? Is the photo fully integrated with no halos? Is mobile intentional, not just shrunk? Any console errors? Fix every failure before reporting.
4. Finish with a README containing run and deploy (Vercel/Netlify) instructions.

---

## Decisions log

- **Photos:** the brief referenced `./assets/nawaz.png`, which did not exist; two photos were
  supplied in chat. **Revision 2 (user request): the suit/sunglasses hero photo was removed
  entirely** — the hero is now typographic. Only `assets/nawaz-2.jpg` (striped shirt) remains,
  used in About.
- **Hero (rev 2):** name "a little darker and bigger" → solid deep-gold gradient fill (weight
  420) with a hairline outline echo; size = clamp(11vw, (100svh − 380px)/1.85, 21.5vw) so the
  CTAs never fall below the fold. Disciplines (01 Accounts / 02 Procurement / 03 Sales) larger,
  below-right of the name. Gold glint follows the cursor on fine pointers.
- **About (rev 2):** sketch → photo on scroll. `--draw` / `--dev` CSS vars on `.about-arch`,
  scrubbed by GSAP; engraving generated by `scripts/process_photos.py`.
- **Contact (rev 2):** real details — shariffnawaz2002@gmail.com, +966 54 107 1713 (phone +
  WhatsApp), linkedin.com/in/nawaz-shareef-b0b455415. Vision stats: 15+ clients, 15+ sites.
- **SAR symbol:** rendered as "SAR" / "ر.س" text rather than a hand-drawn glyph of the 2025
  riyal sign, so the national currency mark is never misdrawn.
- **Three.js:** not used. Canvas 2D + CSS 3D transforms cover the hero; it keeps the bundle lean.
- **Rim light:** a padded, directional glow layer (`nawaz-hero-glow.webp`) sits behind the cutout;
  its CSS insets must match the padding written to `public/images/images.json`.
- **Hero layout:** stacked (name above, head crossing line two) on phones and portrait tablets;
  side-by-side on landscape ≥768px. Portrait mask fade starts at 80% so the name never shows
  through his body.
- **Gotchas found during build:** never tween `transform` with GSAP on elements that also have a
  CSS `transition` on transform (header froze mid-tween); ScrollTriggers created before a pinned
  section (Header/Footer) need `refreshPriority: -1`; the reveal tween owns row `opacity`, so dim
  children instead.
- **More gotchas (rev 2):** reveal tweens must use `overwrite: 'auto'` — `true` killed every other
  tween on the element (it silently emptied the sketch timeline and the certificate tilt);
  never let an intro tween and a scroll tween animate the same property on the same element;
  `#top` must scroll to 0 (the pinned hero is translated after its pin ends).
- **QA:** `npm run qa` must stay 88/88 green before shipping.
