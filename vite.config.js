import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { site, hero } from './src/content.js'

/**
 * Injects SEO / Open Graph values from src/content.js into index.html,
 * so every piece of copy — including meta tags — is edited in one place.
 * Placeholders in index.html look like %SITE_TITLE%.
 */
function contentMeta() {
  const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
  const url = site.url.replace(/\/$/, '')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    jobTitle: hero.role,
    worksFor: { '@type': 'Organization', name: hero.company },
    address: { '@type': 'PostalAddress', addressCountry: 'SA' },
    knowsAbout: ['Accounting', 'Procurement', 'Sales leadership', 'Client relationships', 'PPE', 'Construction materials'],
    hasCredential: [
      { '@type': 'EducationalOccupationalCredential', name: 'Bachelor of Commerce' },
      { '@type': 'EducationalOccupationalCredential', name: 'CFAP — Certified Finance and Auditing Professional' },
      { '@type': 'EducationalOccupationalCredential', name: 'AIBM — American Institute of Business Management' },
    ],
    url,
    image: url + site.ogImage,
  }
  const values = {
    SITE_TITLE: site.title,
    SITE_DESCRIPTION: site.description,
    SITE_URL: url + '/',
    SITE_NAME: site.name,
    OG_IMAGE: url + site.ogImage,
    OG_IMAGE_ALT: site.ogImageAlt,
    LOCALE: site.locale,
    THEME_COLOR: site.themeColor,
  }
  return {
    name: 'content-meta',
    transformIndexHtml(html) {
      let out = html
      for (const [k, v] of Object.entries(values)) out = out.replaceAll(`%${k}%`, escape(v))
      return out.replace('%JSON_LD%', JSON.stringify(jsonLd).replace(/</g, '\\u003c'))
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), contentMeta()],
  build: {
    target: 'es2020',
    cssMinify: true,
    rollupOptions: {
      output: {
        // Keep the animation stack in its own long-cached chunk.
        manualChunks(id) {
          if (id.includes('node_modules/gsap') || id.includes('node_modules/lenis')) return 'motion'
          if (id.includes('node_modules/react')) return 'react'
        },
      },
    },
  },
})
