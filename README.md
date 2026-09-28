# AdTech Prime Solutions — Website

Company website for **AdTech Prime Solutions**: end-to-end LED, LCD and DOOH solutions, from ideation to go live.

## Tech

Plain **HTML + CSS + vanilla JS**. There is no framework, no build step to run the site and no third-party requests.

| Budget | Size |
| --- | --- |
| HTML | ~40 KB (≈8 KB gzipped) |
| CSS | ~20 KB (≈5 KB gzipped) |
| JS | ~6 KB (≈2 KB gzipped), deferred |
| Fonts | 2 self-hosted variable WOFF2 files, ~68 KB, preloaded |
| Images | WebP + JPEG fallback, 3 responsive sizes each, lazy-loaded below the fold |

- Mobile-first responsive layout (320px → 1920px+). Breakpoints are 560 / 720 / 960 / 1100px.
- Accessible: semantic landmarks, a skip link, keyboard-friendly menu and forms, and `prefers-reduced-motion` support.
- SEO: meta and Open Graph tags, JSON-LD `LocalBusiness`, `sitemap.xml` and `robots.txt`.
- The page works fully without JavaScript. JS only adds the mobile menu, scroll reveal, form handling and the video lightbox.

## Structure

```
index.html              the page
assets/css/styles.css   all styles (tokens at the top)
assets/js/main.js       menu, reveal, contact form, video lightbox
assets/img/             generated responsive images (do not edit by hand)
assets/fonts/           self-hosted Sora + Instrument Sans
assets-src/             original images, the source for assets/img
scripts/build-assets.mjs image and font pipeline
```

## Local preview

```bash
npm run serve
```

Or open `index.html` directly in a browser.

## Updating images

Put the original image in `assets-src/`, then run:

```bash
npm install
npm run assets
```

## Contact form

The "Request a free site survey" form sends every enquiry to **sales@adtechprime.in** through [Web3Forms](https://web3forms.com).

- The access key is the hidden `access_key` field in `index.html`. It is safe to be public: it can only send email to the address it was created for.
- The email subject includes the visitor's name, city and requirement, and **Reply** goes straight to the visitor's email.
- Spam is filtered by Web3Forms plus a hidden `botcheck` honeypot field.
- To change the recipient or see submission history, log in to the Web3Forms dashboard with sales@adtechprime.in.
- Visitors who prefer chat use the WhatsApp buttons (contact section, under the form, and the floating button).

## Project videos

The "In motion" tiles become playable when you add a video file:

```html
<button class="motion ..." data-video="assets/video/ptc-news.mp4">
```

Keep the videos short, H.264 MP4 and under 5 MB each. They only load when someone clicks a tile.

## Deploying

Upload the repository root to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages or cPanel).
`node_modules/`, `assets-src/` and `scripts/` are not needed on the server.
