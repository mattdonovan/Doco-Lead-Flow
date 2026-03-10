# DOCO Exteriors — Lead Generation Website

## Overview
Lead-gen website for DOCO Exteriors, a Minneapolis exterior contractor. Features a dark cyan/black aesthetic with Montserrat font, multiple pages, and a conversational multi-step quote request form with optional post-submit detail flow.

## Tech Stack
- **Frontend**: React + Vite, Wouter (routing), Framer Motion, TanStack Query, Tailwind CSS
- **Backend**: Express.js, Drizzle ORM, PostgreSQL
- **Email**: Resend API — sends form submissions to iam.mattdonovan@gmail.com

## Design System
- **Dark background**: `#0A0A0A`
- **Cyan accent**: `#58E3EA`
- **Cyan dark**: `#3ABFC6`
- **Light sections**: `#F5F4F0`
- **Font**: Montserrat (Google Fonts)

## File Structure
- `client/src/pages/home.tsx` — Homepage (Hero, About, Services)
- `client/src/pages/about.tsx` — About Us page (founder letter, core values)
- `client/src/pages/service.tsx` — Individual service pages (Roofing, Siding, Windows, Gutters)
- `client/src/pages/estimate.tsx` — Multi-step conversational quote request form + post-submit detail flow
- `client/src/components/shared-sections.tsx` — Shared sections: SiteNav, GuidedProcess, CTASection, SiteFooter, OtherServicesSection
- `server/routes.ts` — API routes (POST/GET /api/quotes, PATCH /api/quotes/:id/details, POST /api/notify + email sending)
- `server/storage.ts` — Database CRUD via Drizzle
- `shared/schema.ts` — Database schema + Zod validation

## Routes
- `/` — Homepage
- `/about` — About Us
- `/services/:slug` — Service pages (roofing, siding, windows, gutters)
- `/estimate` — Quote request form

## Estimate Form Steps (4 steps)
1. **City** — Type-ahead autocomplete. Service/surrounding area logic with expansion prompt.
2. **Project** — Property type selection, then progressive disclosure of services (image-based cards).
3. **Details** — Insurance (yes/no), Timeline selection.
4. **Review** — Expandable accordion summary of selections + contact info form (Full Name, email, phone).

## Post-Submit Detail Flow (optional)
After initial submission, user is prompted to add more details:
- Per-service questions (Roofing: roof age + situation, Siding: material + driver, Windows: count + reason, Gutters: issue + guards)
- Home context chips (multi-select across 3 categories)
- Photo upload (optional)
- Data saved via PATCH /api/quotes/:id/details
- Sends Template 2 email to DOCO + copy to user

## Mobile Layout
- **Hero**: Full-bleed background image with dark overlay on mobile; two-column layout on desktop
- **Services**: Swipeable horizontal carousel on mobile; 4-column grid on desktop
- **Guided Process**: Swipeable card carousel on mobile; timeline + slides on desktop

## Guided Process (7 steps)
01 Free Inspection, 02 Potential Insurance Claim (with Scope Agreement callout), 03 Design Meeting, 04 Project Scheduling, 05 Project Scheduled, 06 Build Day, 07 Project Completion

## Name Policy
- All references to "Kris" / "Jenna" replaced with "Our Team" site-wide
- Exception: /about page retains personal names

## Service Area Cities
Albertville, Andover, Anoka, Becker, Big Lake, Blaine, Brooklyn Center, Brooklyn Park, Buffalo, Champlin, Coon Rapids, Crystal, Dayton, Delano, Elk River, Golden Valley, Hamel, Howard Lake, Loretto, Maple Grove, Medina, Monticello, New Hope, Osseo, Otsego, Plymouth, Ramsey, Robbinsdale, Rogers, St. Michael, Watertown, Waverly

## Surrounding Area Cities (Expanding Soon)
Afton, Apple Valley, Bayport, Belle Plaine, Bloomington, Burnsville, Cambridge, Cannon Falls, Carver, Chanhassen, Chaska, Cottage Grove, East Bethel, Eagan, Eden Prairie, Edina, Excelsior, Farmington, Forest Lake, Fridley, Hopkins, Hugo, Lake Elmo, Lakeville, Lino Lakes, Mahtomedi, Maplewood, Minnetonka, Mound, Newport, North Branch, Northfield, Oak Park Heights, Oakdale, Prior Lake, Richfield, Rosemount, Roseville, Savage, Shakopee, Shorewood, Spring Lake Park, St. Louis Park, St. Paul, Stacy, Stillwater, Victoria, Waconia, Wayzata, White Bear Lake, Woodbury, Wyoming

## Service Images (Midjourney)
- Roofing: https://cdn.midjourney.com/365218d6-e05d-4ccf-860d-234a277025fd/0_0.png
- Siding: https://cdn.midjourney.com/039404f0-2543-4e83-a864-1b8e898f73c1/0_0.png
- Windows: https://cdn.midjourney.com/15c2b54f-384d-4719-9eab-116caf3f4bc9/0_0.png
- Gutters: https://cdn.midjourney.com/10a24684-6aa4-4c97-8ad4-e6ce00a8fb6f/0_0.png

## DOCO Avatar
3x3 grid of small squares with pulsing opacity animation. Uses cyan gradient background.

## Shared Sections (on all pages)
- Our Guided Process (interactive 7-step timeline, carousel on mobile)
- Ready for a Free Estimate? (CTA with animated background)
- Footer

## Logo Assets
- `/client/public/logo-header.svg` — Nav logo (28px height)
- `/client/public/logo-footer.svg` — Footer logo (56px height)

## Email Setup
Uses Resend API for transactional emails:
- `RESEND_API_KEY` — Resend API key (configured)
- Sends from: `onboarding@resend.dev` (Resend default sender)
- Template 1: Initial lead notification (on form submit)
- Template 2: Detail update notification to DOCO + confirmation copy to user (on post-submit detail submission)
- All user input is HTML-escaped before embedding in email templates

## API Endpoints
- `POST /api/quotes` — Submit quote request (validated with Zod)
- `GET /api/quotes` — List all quote requests
- `PATCH /api/quotes/:id/details` — Update quote with post-submit details (serviceDetails, homeContext, photoUrl)
- `POST /api/notify` — Submit expansion interest notification (email + city, validated with Zod)

## Database
- PostgreSQL with `quoteRequests` table for form submissions
- Schema managed via Drizzle ORM
- Fields: firstName, lastName, email, phone (nullable), address (nullable), city, services[], propertyType, projectTimeline, additionalDetails, hasInsuranceClaim, selectedOfferings[] (nullable), serviceDetails (jsonb, nullable), homeContext[] (nullable), photoUrl (nullable)
