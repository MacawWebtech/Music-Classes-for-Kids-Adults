# MelodyNest Music Academy Template

A responsive multi-page frontend template for a music academy.

## Quick start
1. Extract the ZIP.
2. Open `index.html` in a browser, or serve the folder using a local web server.
3. Replace sample content, instructor profiles, contact details, and prices.
4. Update `sitemap.xml` and `robots.txt` with your production domain.

## Pages
Home 1, Home 2, About, Courses, Instructors, Gallery, Blog, Contact, Pricing, Login, Register, Student Dashboard, Admin Dashboard, 404, Coming Soon.

## Design features
- Bootstrap 5 grid and responsive layout
- Custom purple/lilac visual identity
- Dark/light mode with saved preference
- Mobile navigation
- Course category filters
- Client-side demo form validation and feedback
- RTL starter stylesheet
- Reduced-motion support

## Important backend note
This is a frontend template. Login, registration, student records, admin actions, enrollment, scheduling, and payments are demo interfaces only. Connect a secure backend, database, authentication provider, and payment gateway before production use. Never store plain-text passwords or expose API secrets in browser code.

## Integrations to configure
- Contact/newsletter: Formspree, Netlify Forms, or your API
- Maps: add your Google Maps embed/API configuration
- Payments: Stripe or PayPal server-side integration
- Calendar: connect your booking or calendar provider

## Credits
- Bootstrap 5 via jsDelivr
- Bootstrap Icons can be added as needed
- Google Fonts: DM Sans and Manrope
- Demo photography from Unsplash; replace with properly licensed academy imagery

## Changelog
- 1.0.0: Initial responsive multi-page template.

## Version 2 updates
- Added a second creative homepage (`home2.html`).
- Added a Home dropdown linking Home 1 and Home 2 throughout the site.
- Added four new designed content sections to every existing page.
- Added feature grids, info strips, quote cards, soft panels, and CTA components.

- 1.1.0: Creative redesign. Repeated sections (feature grids, info strips, soft panels, CTAs, testimonials) now use 5-6 distinct layouts assigned per page; new black page hero, refreshed steps, cards and pathway section. Palette unchanged (black / white / gold). New styles are at the end of `assets/css/style.css` (`.rx-*`).

## Version 2.0 — Redesign
- New two-row header (`.mn-*`): contact top bar, pill navigation, Home mega-dropdown, dark-mode toggle, **EN / RTL switch**, mobile drawer menu.
- RTL: the switch sets `dir="rtl"`, mirrors the layout and flips arrows, and remembers the choice (`music-dir` in localStorage). Text stays in English.
- Home 2 has a completely new banner (`.h2x-*`): split poster headline, arched photo collage, floating badges, rotating disc and a scrolling ticker.
- Full-width layout on every page with fluid left/right padding via `--mn-pad` in `assets/css/redesign.css` (change one variable to tighten or widen).
- Upgraded designs for cards, teachers, steps, split images, bands, pricing, page heroes and footer.
- New sections (`.mx-*`): stats counters, gold marquee, "why us" grid, testimonials, plans, FAQ accordion, events list, newsletter, gallery strip, journey timeline, visit cards.
- All new content (numbers, dates, testimonials, address, email) is **sample text** — replace before launch.

## Version 2.1 — Login portal + working dashboards
- Header: **RTL** button (text only) and a login icon that opens `login.html` (or the dashboard when already signed in).
- `assets/js/auth.js`: demo authentication. Passwords are stored only as salted SHA-256 hashes; sessions live in the browser. Dashboards redirect to the login page when signed out, and cross-role access is blocked.
- Demo accounts: `student@melodynest.demo` / `Student@123` and `admin@melodynest.demo` / `Admin@123`. `register.html` creates a new student account.
- Student dashboard (`assets/js/student.js`): overview, courses with lesson tracking, live weekly schedule with reschedule requests, progress, fee payments with receipts, profile and password change.
- Admin dashboard (`assets/js/admin.js`): overview charts, students (search, filter, sort, paginate, add, edit, delete, CSV export), instructors, courses, batches, payments, messages inbox and settings.
- Shared engine `assets/js/dx.js`, styles in `assets/css/dashboard.css`. Data is saved in localStorage (Settings → Reset demo data restores samples).
- This is front-end only. Replace `auth.js` and the localStorage data with a real backend before launch.
