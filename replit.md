# DOCO Exteriors — Lead Generation Website

## Overview
Lead-gen website for DOCO Exteriors, a Minneapolis exterior contractor owned by Kris & Jenna Donovan. Features a dark cyan/black aesthetic with Montserrat font, multiple pages, and a conversational multi-step quote request form.

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
- `client/src/pages/home.tsx` — Homepage (Hero, About, Numbers, Services)
- `client/src/pages/about.tsx` — About Us page (founder letter, core values)
- `client/src/pages/service.tsx` — Individual service pages (Roofing, Siding, Windows, Gutters)
- `client/src/pages/estimate.tsx` — Multi-step conversational quote request form
- `client/src/components/shared-sections.tsx` — Shared sections: SiteNav, GuidedProcess, CTASection, SiteFooter
- `server/routes.ts` — API routes (POST/GET /api/quotes + email sending)
- `server/storage.ts` — Database CRUD via Drizzle
- `shared/schema.ts` — Database schema + Zod validation

## Routes
- `/` — Homepage
- `/about` — About Us
- `/services/:slug` — Service pages (roofing, siding, windows, gutters)
- `/estimate` — Quote request form

## Shared Sections (on all pages)
- Our Guided Process (interactive 8-step timeline)
- Ready for a Free Estimate? (CTA)
- Footer

## Logo Assets
- `/client/public/logo-header.svg` — Nav logo (28px height)
- `/client/public/logo-footer.svg` — Footer logo (56px height)

## Email Setup
Uses Resend API for transactional emails:
- `RESEND_API_KEY` — Resend API key (configured)
- Sends from: `onboarding@resend.dev` (Resend default sender)
- Once a custom domain is verified in Resend, update the `from` address in `server/routes.ts`

## Database
- PostgreSQL with `quoteRequests` table for form submissions
- Schema managed via Drizzle ORM
