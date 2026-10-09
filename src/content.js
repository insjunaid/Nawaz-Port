/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  ALL SITE COPY LIVES IN THIS FILE.
 *
 *  • Edit any string freely — components only read from here.
 *  • Anything in [square brackets] is a PLACEHOLDER waiting for a real value.
 *    Search this file for "[" to find every one of them.
 *  • Wrap words in *asterisks* to set them in the italic display style,
 *    e.g. 'build *nations.*'
 *  • Stats with a numeric `value` count up when scrolled into view; use
 *    `display` instead of `value` for placeholder text like '[XX+]'.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/* ── Site / SEO ─────────────────────────────────────────────────────────── */
export const site = {
  name: 'Nawaz Shariff',
  title: 'Nawaz Shariff — Accountant & Sales Head · Exar International, KSA',
  description:
    'Nawaz Shariff is Accountant & Sales Head at Exar International in Saudi Arabia, supplying PPE, construction materials and consumables to the projects building Vision 2030.',
  // [placeholder] Your live domain — used for canonical + Open Graph URLs.
  url: 'https://your-domain.com',
  ogImage: '/og-image.jpg',
  ogImageAlt: 'Nawaz Shariff — Where Numbers Build Nations',
  locale: 'en_US',
  themeColor: '#07090D',
  concept: 'Where Numbers Build Nations',
}

/* ── Navigation ─────────────────────────────────────────────────────────── */
export const nav = {
  brand: 'N. Shariff',
  menuLabel: 'Menu',
  closeLabel: 'Close',
  contactLabel: "Let's talk",
  skipLink: 'Skip to content',
  items: [
    { id: 'about', index: '02', label: 'About' },
    { id: 'journey', index: '03', label: 'Journey' },
    { id: 'expertise', index: '04', label: 'Expertise' },
    { id: 'supply', index: '05', label: 'Supply' },
    { id: 'vision', index: '06', label: 'Vision 2030' },
    { id: 'credentials', index: '07', label: 'Credentials' },
    { id: 'contact', index: '08', label: 'Contact' },
  ],
}

/* ── Preloader ──────────────────────────────────────────────────────────── */
export const preloader = {
  topLeft: 'Nawaz Shariff',
  topRight: 'Folio Nº 01',
  label: 'Balancing the ledger',
  done: 'Balanced',
  srLabel: 'Loading the portfolio',
}

/* ── 01 · Hero ──────────────────────────────────────────────────────────── */
export const hero = {
  greetingAr: 'مرحباً',
  greeting: "Hello — I'm",
  firstName: 'Nawaz',
  lastName: 'Shariff',
  role: 'Accountant & Sales Head',
  company: 'Exar International',
  location: 'Kingdom of Saudi Arabia',
  intro:
    'I keep the ledger honest and the sites supplied — PPE, construction materials and consumables for the projects shaping Vision 2030.',
  primaryCta: { label: 'Start a conversation', href: '#contact' },
  secondaryCta: { label: 'Read the journey', href: '#journey' },
  scrollCue: 'Scroll',
  disciplines: ['Accounts', 'Procurement', 'Sales'],
  // Decorative figures that drift through the hero (not claims — just texture).
  driftingFigures: [
    'SAR 1,240,500.00', 'ر.س', 'SAR', 'Dr 18,400.00', 'Cr 18,400.00', '+3.42%',
    'Σ 2,486,200', 'VAT 15%', 'PO-24117', 'INV-0391', 'Δ 0.00', 'Net 30',
    '12,960.00', 'ر.س ٤٥٠', '1,000,000', 'Bal. 0.00', '→ 2030', '96,250.75',
    'SAR', 'ر.س', 'Qty 1,200', 'GRN-0882',
  ],
  // Column headings revealed by the cursor spotlight.
  ledgerColumns: ['Date', 'Particulars', 'Folio', 'Debit', 'Credit', 'Balance'],
}

/* ── 02 · About ─────────────────────────────────────────────────────────── */
export const about = {
  index: '02',
  label: 'About',
  headline: ['Where numbers', 'build *nations.*'],
  greetingAr: 'مرحباً',
  lede:
    "I'm Nawaz — an accountant by training and a salesman by instinct.",
  paragraphs: [
    "For two years I've led accounts and sales at Exar International in Saudi Arabia, where every invoice ends up somewhere real: on a safety helmet, a pallet of cement, a site that opens on time.",
    'My work lives where finance meets the field. I build long-term relationships with contractors, run procurement end to end, and keep the books balanced so the business can move fast without losing precision.',
  ],
  signature: 'N. Shariff',
  imageAlt: 'Nawaz Shariff smiling, wearing a striped shirt and clear-framed glasses.',
  factsTitle: 'Account summary',
  facts: [
    { label: 'Role', value: 'Accountant & Sales Head' },
    { label: 'Company', value: 'Exar International' },
    { label: 'Based', value: 'Kingdom of Saudi Arabia' },
    { label: 'Education', value: 'B.Com — CGPA 9.2' },
    { label: 'Certified', value: 'CFAP · AIBM' },
    { label: 'Supplies', value: 'PPE · Materials · Consumables' },
  ],
}

/* ── 03 · Journey ───────────────────────────────────────────────────────── */
export const journey = {
  index: '03',
  label: 'Journey',
  title: ['Five entries', 'in the *ledger.*'],
  intro: 'A career read the way an accountant reads a book: in order, line by line, every entry accounted for.',
  hint: 'Scroll to turn the page',
  // `period` values in [brackets] are placeholders — replace with real years.
  chapters: [
    {
      numeral: 'I',
      tag: 'Foundations',
      title: 'Bachelor of Commerce',
      body: 'Learning the grammar of business — accounting, audit, economics and law — and graduating at the top of the ledger.',
      period: '[20XX – 20XX]',
      stat: { value: 9.2, decimals: 1, label: 'CGPA' },
    },
    {
      numeral: 'II',
      tag: 'Certified',
      title: 'CFAP',
      body: 'Certified Finance and Auditing Professional — sharpening the discipline of controls, verification and clean reporting.',
      period: '[20XX]',
    },
    {
      numeral: 'III',
      tag: 'Certified',
      title: 'AIBM',
      body: 'American Institute of Business Management — widening the lens from the ledger to the whole business.',
      period: '[20XX]',
    },
    {
      numeral: 'IV',
      tag: 'Into the Kingdom',
      title: 'Exar International',
      body: 'Accountant & Sales Head. Running the books and the sales floor at once: key accounts, procurement and supply of PPE, construction materials and consumables.',
      period: '2 years · Present',
      stat: { value: 2, decimals: 0, label: 'Years' },
    },
    {
      numeral: 'V',
      tag: 'Towards 2030',
      title: 'The next entry',
      body: 'Supplying the construction and safety sectors that are building Saudi Vision 2030 — and writing the next chapter with partners who build.',
      period: 'Next',
    },
  ],
}

/* ── 04 · Expertise ─────────────────────────────────────────────────────── */
export const expertise = {
  index: '04',
  label: 'Expertise',
  title: ['A balance sheet', 'of *strengths.*'],
  intro:
    "Everything on the left is what I bring. Everything on the right is what it's worth to you. Double-entry, as it should be.",
  columns: { code: 'Acc.', debit: 'Debit — What I bring', credit: 'Credit — What you get' },
  rows: [
    {
      code: '101',
      skill: 'Accounting',
      debit: 'Reconciled books, receivables & payables, a clean month-end close.',
      credit: 'Numbers you can make decisions on.',
    },
    {
      code: '102',
      skill: 'Procurement',
      debit: 'Sourcing, vendor negotiation and delivery scheduling.',
      credit: 'The right materials on site, on the day.',
    },
    {
      code: '103',
      skill: 'Client Relationships',
      debit: 'Major accounts handled personally, from quotation to after-sales.',
      credit: 'One accountable person who picks up the phone.',
    },
    {
      code: '104',
      skill: 'Sales Leadership',
      debit: 'Leading the sales function, from pipeline to payment.',
      credit: 'Growth that shows up in the ledger.',
    },
  ],
  total: { label: 'Total', debit: 'Precision', credit: 'Trust', stamp: 'Balanced' },
  compassCenter: 'Acc.',
}

/* ── 05 · What I Supply ─────────────────────────────────────────────────── */
export const supply = {
  index: '05',
  label: 'What I Supply',
  title: ['Everything a site needs,', '*before* it needs it.'],
  intro: 'Three supply lines, one accountable contact — sourced, scheduled and delivered.',
  hoverHint: 'Hover a line to open its drawing',
  // Example product lines — edit to match the actual catalogue.
  items: [
    {
      key: 'ppe',
      letter: 'A',
      title: 'PPE',
      full: 'Personal Protective Equipment',
      desc: 'Head, eye, hand and high-visibility protection that keeps crews safe and sites compliant.',
      list: ['Safety helmets', 'Eye protection', 'Work gloves', 'Hi-vis vests', 'Safety footwear', 'Fall protection'],
      figure: 'Fig. A — Personal protection',
    },
    {
      key: 'construction',
      letter: 'B',
      title: 'Construction Materials',
      full: 'Construction Materials',
      desc: 'Structural and finishing materials sourced to specification and delivered to schedule.',
      list: ['Steel sections', 'Rebar', 'Blocks & bricks', 'Cement', 'Timber & ply', 'Fixings'],
      figure: 'Fig. B — Structure',
    },
    {
      key: 'consumables',
      letter: 'C',
      title: 'Consumables',
      full: 'Site Consumables',
      desc: 'The everyday essentials that quietly keep work moving, replenished before they run out.',
      list: ['Cutting & grinding discs', 'Fasteners', 'Tapes & sealants', 'Welding consumables', 'Cable ties', 'Site supplies'],
      figure: 'Fig. C — Consumables',
    },
  ],
}

/* ── 06 · Vision 2030 ───────────────────────────────────────────────────── */
export const vision = {
  index: '06',
  label: 'Vision 2030',
  arabic: 'رؤية ٢٠٣٠',
  quote: [
    'A nation is built twice —',
    'first in the plan, then in the ledger.',
    'I make sure the second one *balances.*',
  ],
  attribution: 'Nawaz Shariff',
  body:
    'Saudi Vision 2030 is rebuilding a country at remarkable speed. I contribute where it counts on the ground — supplying the construction and safety sectors that turn plans into skylines.',
  timeline: {
    start: 2016,
    end: 2030,
    startLabel: 'Vision launched',
    endLabel: 'The horizon',
    nowLabel: 'Today',
    yearOf: 'Year {n} of {total}',
  },
  // For stats: `value` counts up (plus an optional `suffix`); `display` shows text as-is.
  stats: [
    { value: 2, label: "Years supplying the Kingdom's build" },
    { value: 3, label: 'Supply lines — PPE, materials, consumables' },
    { value: 100, suffix: '+', label: 'Clients served' },
    { value: 100, suffix: '+', label: 'Project sites supplied' },
  ],
}

/* ── 07 · Credentials ───────────────────────────────────────────────────── */
export const credentials = {
  index: '07',
  label: 'Credentials',
  title: ['Certified —', 'on paper *and* in practice.'],
  degree: {
    eyebrow: 'Degree certificate',
    title: 'Bachelor of Commerce',
    conferred: 'conferred upon',
    name: 'Nawaz Shariff',
    metricLabel: 'Cumulative grade point average',
    metric: 9.2,
    metricDecimals: 1,
    outOf: '/ 10',
    institution: '[University name]', // placeholder
    year: '[20XX]', // placeholder
    seal: 'B.COM',
  },
  certificates: [
    {
      acronym: 'CFAP',
      name: 'Certified Finance and Auditing Professional',
      ring: 'Certified Finance and Auditing Professional',
      note: 'Finance · Audit · Controls',
      year: '[20XX]', // placeholder
    },
    {
      acronym: 'AIBM',
      name: 'American Institute of Business Management',
      ring: 'American Institute of Business Management',
      note: 'Business Management',
      year: '[20XX]', // placeholder
    },
  ],
}

/* ── 08 · Contact ───────────────────────────────────────────────────────── */
export const contact = {
  index: '08',
  label: 'Contact',
  headline: ["Let's put your", 'next project', '*on the books.*'],
  sub: 'Sourcing PPE, materials or consumables for a site — or need a sharp pair of eyes on the numbers? Send a note.',
  channels: [
    { key: 'email', label: 'Email', value: 'shariffnawaz2002@gmail.com', href: 'mailto:shariffnawaz2002@gmail.com' },
    { key: 'phone', label: 'Phone', value: '+966 54 107 1713', href: 'tel:+966541071713' },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      value: 'in/nawaz-shareef',
      href: 'https://www.linkedin.com/in/nawaz-shareef-b0b455415',
    },
    { key: 'whatsapp', label: 'WhatsApp', value: '+966 54 107 1713', href: 'https://wa.me/966541071713' },
  ],
  form: {
    title: 'Ledger slip',
    fields: {
      name: { label: 'Name', placeholder: 'Your full name', error: 'Please add your name.' },
      email: { label: 'Email', placeholder: 'you@company.com', error: 'Please add a valid email.' },
      company: { label: 'Company', placeholder: 'Optional' },
      message: { label: 'Message', placeholder: 'Quantities, timelines, specifications…', error: 'A short message helps.' },
    },
    interestLegend: 'What do you need?',
    interests: ['PPE', 'Construction materials', 'Consumables', 'Accounting', 'Something else'],
    submit: 'Post entry',
    // The form is front-end only: on submit it drafts the message and lets the
    // visitor send it by email or WhatsApp (no server needed).
    success: {
      title: 'Entry drafted.',
      body: 'Choose how to send it — your message is ready to go.',
      email: 'Send by email',
      whatsapp: 'Send on WhatsApp',
      again: 'Write another',
      subject: 'New enquiry from your portfolio',
    },
  },
}

/* ── Footer ─────────────────────────────────────────────────────────────── */
export const footer = {
  bigLine: 'Where numbers build nations.',
  copyright: 'Nawaz Shariff',
  rights: 'All entries reserved.',
  timeLabel: 'KSA',
  timeZone: 'Asia/Riyadh',
  backToTop: 'Back to top',
  credit: 'Designed & built with precision.',
}
