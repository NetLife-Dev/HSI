# Features Research — HSI

**Domain:** Self-hosted direct booking system for Brazilian vacation rental hosts
**Researched:** 2026-04-04
**Overall confidence:** HIGH (most claims verified via official sources and multiple corroborating sources)

---

## Table Stakes

Features users expect. Missing = product feels incomplete or broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Real-time availability calendar | Guests will not book if they cannot confirm dates instantly | Medium | Must show blocked dates from all OTAs merged |
| Price breakdown before checkout | Hidden fees are the #1 abandonment cause; "surprise at checkout" loses trust permanently | Low | Show nightly rate, cleaning fee, taxes, total in the widget — not just at payment step |
| Mobile-first booking flow | 60%+ of vacation rental searches happen on mobile; a broken mobile checkout loses the booking | Medium | Every tap target, scroll, and form field must be optimized for thumb navigation |
| Professional photography presentation | The hero image is the single most persuasive conversion element; amateurish photos signal a scam | Low | Full-viewport hero, gallery with editorial sequencing (wide shots first, detail shots later) |
| Secure payment with recognizable trust signals | Guests defaulting to Airbnb do so partly for buyer protection; direct must signal equal safety | Medium | SSL badge visible, Stripe logo visible, cancellation policy shown before payment button |
| Clear cancellation and refund policy | Guests refuse to pay without knowing what happens if plans change | Low | Must appear on property page AND at checkout step — not buried in footer |
| Email confirmation + booking voucher | Guests expect immediate written confirmation; no confirmation = perceived scam | Medium | Sent via Resend + React Email; PDF voucher with property address, check-in instructions |
| iCal export (HSI → OTAs) | Hosts must be able to block HSI bookings on Airbnb/Booking.com to prevent double-bookings | Medium | Standard ICS feed per property, updated on every booking state change |
| iCal import (OTAs → HSI) | Hosts need OTA bookings to block dates in HSI | Medium | Polling-based; see iCal Technical Patterns section |
| Stripe payment processing | Standard expectation for online checkout; cash/transfer-only = friction and distrust | High | Dynamic product+price creation per booking as specified in PROJECT.md |
| Booking management (confirm/cancel/modify) | Hosts need basic lifecycle control over every reservation | Medium | States: pending → confirmed → checked-in → completed / cancelled |
| Admin dashboard with KPIs | Hosts need to see revenue, occupancy, upcoming check-ins at a glance | Medium | RevPAR, ADR, occupancy rate, monthly revenue, upcoming arrivals |
| Guest contact capture | Without guest data, there is no path to repeat direct bookings | Low | Name, email, phone mandatory at booking; stored in CRM |
| Transactional email notifications | Both host and guest need event-triggered emails (new booking, cancellation, check-in reminder) | Medium | Resend + React Email; critical for perceived professionalism |
| Manual date blocking | Hosts block dates for maintenance, personal use, cleaning buffers | Low | Single-click blocking on calendar; reason field optional |
| Property CRUD with pricing | Core data management — without this nothing else works | Medium | Per-property: base price, seasonal rules, min stay, cleaning fee, check-in/out times |

---

## Differentiators

Features that set HSI apart. Not expected from competitors, but meaningfully valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Cinematic property page — hotel boutique level | Most direct booking sites look like 2015 WordPress sites; a boutique hotel aesthetic creates perceived value and commands premium pricing | High | Full-viewport hero with Framer Motion parallax; Instrument Serif headings; no visual clutter |
| Zero OTA branding anywhere | The entire point of HSI — guests experience 100% host brand identity, not "powered by Airbnb" dilution | Low | Architectural decision: no third-party widgets, logos, or iframes on guest-facing pages |
| Instance-per-host isolation | Guests get a URL with the host's brand (e.g., casadobrasileiro.com.br) — impossible with SaaS platforms that share a domain | Low | Deployment model decision already made; ensure URL config is first-class in onboarding |
| Pix payment support | 93% of Brazilian adults use Pix; credit card-only checkout creates friction and excludes ~60M Brazilians without cards; Airbnb only added Pix in mid-2024 | High | Stripe supports Pix via EBANX partnership (launched August 2025); needs investigation for implementation path — see Open Questions |
| Price-savings callout vs OTA | Guests booking direct save 10–15% in OTA guest fees; showing this creates urgency and justifies the unfamiliar checkout | Low | "Book direct and save vs. Airbnb" banner on booking widget; calculated dynamically |
| Seasonal + length-of-stay pricing rules | Manual flat pricing is leaving money on the table; rule-based pricing increases RevPAR without a third-party dynamic pricing tool | Medium | Weekly/monthly discount tiers; seasonal date ranges with price multipliers; all calculated server-side |
| Guest CRM with stay history | Hosts can recognize returning guests, offer loyalty perks, and build direct booking pipeline — this is impossible when all guest data lives on Airbnb | Medium | Full guest profile: stay history, spend, preferences, tags; pipeline for follow-up campaigns |
| Post-stay email nurture sequence | Returning guests convert at far higher rates and book longer stays; automated follow-up at 30/90/180 days post-stay drives repeat direct bookings | Medium | Triggered from booking completion; templates editable by host; requires Resend sequences |
| Abandonment recovery email | 80%+ of guests abandon checkout; a single recovery email recovers 20–30% of lost bookings | Medium | Stripe Checkout recovery URL mechanism; email sent ~1 hour after session expiry |
| Financial reporting with Brazilian tax context | Hosts need Carnê-Leão-ready monthly revenue exports, not just generic revenue charts | Medium | Monthly revenue by property; DARF-ready summary (total gross income per month); export to CSV/PDF |
| Audit log of host actions | Professional hosts and property managers need accountability trails, especially with staff accounts | Low | Already in PROJECT.md requirements; log every sensitive action with timestamp and user |
| Staff permission model | Property managers with multiple employees need to control who can confirm bookings, see financials, etc. | Medium | owner / staff roles with granular permissions; already in scope |

---

## Anti-Features

Features to deliberately NOT build — things that sound good but create drag, complexity, or dilute the value proposition.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Guest-facing account/login required to book | Forced registration is a proven conversion killer; reduces checkout by up to 35% when removed | Guest checkout only; optionally offer account creation post-booking for return-guest convenience |
| Review and moderation system | Adds moderation overhead for the host; guests can manipulate reviews; creates a 2-sided trust problem at small scale | Manual testimonial insertion by admin (already in Out of Scope); link to Google Reviews externally |
| In-app guest chat / messaging | Adds real-time infrastructure complexity; WhatsApp is already where Brazilian guests expect to communicate | WhatsApp deep-link in confirmation email and property page; no in-app chat for v1 |
| Dynamic pricing engine (algorithmic, market-aware) | Requires market data APIs, ML models, and ongoing calibration — this is PriceLabs/Wheelhouse territory; building it poorly is worse than not having it | Rule-based seasonal pricing + length-of-stay discounts; integrate PriceLabs/DPGO via webhook later |
| Multiple currency support | Adds accounting complexity, exchange rate risk, legal compliance questions — pointless for BRL-only Brazilian market in v1 | BRL only; enforce at instance config level |
| Guest loyalty points / rewards program | Sounds nice but requires a ledger system, redemption UX, and communication about point status — heavy for v1 | Post-stay discount codes sent via email are sufficient for v1 loyalty signal |
| Marketplace / multi-host browsing | Antithetical to the product's core value; turns it into another OTA | Each instance is one host's brand universe — no cross-instance discovery |
| Native mobile app | Web-first with proper responsive design covers 95% of the use case at a fraction of the cost | PWA-quality responsive web app; add-to-homescreen meta tags |
| Automated OTA rate parity checking | Requires channel manager APIs (Airbnb API is restricted/expensive); creates maintenance burden | Manual pricing; host decides their direct booking price strategy |
| Boleto bancário payment | Boleto is slow (1–3 day confirmation), incompatible with real-time booking confirmation, and being displaced by Pix in Brazil | Pix (instant) + credit card via Stripe; skip boleto entirely |
| Integrated cleaning management / turnover scheduling | Out of scope for a booking system; dedicated tools (Breezeway, Properly) exist | Export check-in/check-out calendar as iCal; host imports into their cleaning tool |

---

## iCal Technical Patterns

### How iCal Works in This Context

iCal (ICS format / RFC 5545) is a plain-text calendar feed. Platforms publish a URL that returns a `.ics` file listing blocked date ranges as VEVENT entries. Other platforms poll that URL periodically and import the blocked dates.

**What iCal transmits:** Date ranges marked as blocked/unavailable. Summary field often contains booking reference or "Airbnb (not available)". Nothing else — no guest name, rate, contact, or booking details travel over iCal.

**What iCal does NOT transmit:** Rates, guest details, contact information, booking changes, cancellation reason, number of guests. iCal is availability-only.

### OTA iCal Support Matrix

| Platform | iCal Export | iCal Import | Polling Frequency | Notes |
|----------|------------|------------|-------------------|-------|
| Airbnb | Yes | Yes | ~3 hours (internal polling) | Export URL available in listing calendar settings |
| Booking.com | Yes | Yes | ~24 hours (slow) | Import via "iCal" in property extranet |
| Vrbo / Abritel | Yes | Yes | ~1 hour | Import in calendar sync settings |
| Google Calendar | Yes | Yes | ~15 min–1 day (user-configurable) | Not a booking OTA but useful for personal blocking |
| Hipcamp | Yes | Yes | Variable | Niche but relevant for cabin/nature properties |

**Confidence:** MEDIUM — polling frequencies are not officially published by OTAs; sourced from multiple community reports and tool documentation.

### HSI iCal Architecture

**HSI exports (push outward):**
- Each property has a unique, stable ICS URL: `/api/ical/[propertySlug].ics`
- The feed is regenerated on every booking state change (confirmed, cancelled, manually blocked)
- Feed includes all confirmed bookings + manual blocks as VEVENT entries with DTSTART/DTEND
- Feed must be accessible without authentication (OTAs cannot authenticate)
- Security through obscurity: use a UUID in the URL, not the slug alone

**HSI imports (pull inward):**
- Admin stores one or more iCal URLs per property (Airbnb URL, Booking.com URL, etc.)
- HSI polls each stored URL at a configurable interval (recommended: every 30 minutes)
- On each poll, parse incoming VEVENT entries and upsert external blocks in the database
- External blocks are stored separately from HSI bookings (source field: "airbnb", "booking_com", etc.)
- Calendar view merges: HSI bookings + manual blocks + external iCal blocks

### Conflict Resolution Strategy

iCal sync latency creates a window of ~15 minutes to 3 hours where a date can appear available on one platform but is actually blocked on another.

**Prevention approach (recommended for HSI v1):**
1. Poll on every public availability check request — when a guest lands on a property page, trigger a background iCal sync for that property before rendering the calendar
2. Final availability check at payment time — server-side re-validation of availability immediately before creating the Stripe checkout session
3. If conflict detected at payment: abort checkout, show friendly message, email host, prompt guest to select new dates

**Do not:** Use two-way iCal sync between OTAs (iCal → iCal creates circular lag). HSI exports to OTAs; OTAs export back to HSI. Always source-of-truth is HSI for direct bookings.

### Implementation Notes

- Use a battle-tested ICS parser: `node-ical` (npm) or `ical.js`
- Store last-polled timestamp and ETag/Last-Modified headers to avoid unnecessary re-parsing
- Implement per-source timeout (5 seconds max per external iCal URL) — OTA feeds can be slow
- If a source is unreachable, use the last valid cache; do not fail the page render
- Cron job for background polling separate from on-demand request-triggered polls
- Consider a `syncLog` table: source, property, last_success, last_error, events_imported — visible in admin for debugging

---

## Pricing Engine Patterns

### Core Pricing Model

Every HSI booking price is calculated server-side from a rule set. The formula:

```
Total = (nightly_rate × nights_applied_after_rules) + cleaning_fee + taxes
```

No pre-computed prices are stored on the booking until creation. The quote widget recalculates on every date selection.

### Pricing Rule Hierarchy (recommended implementation order)

1. **Base rate** — default nightly price per property (required)
2. **Seasonal date ranges** — price multiplier or flat override for date windows (e.g., Réveillon: +60%, July school holidays: +40%)
3. **Day-of-week rules** — weekends often priced higher (Friday/Saturday nights)
4. **Length-of-stay discounts** — 7+ nights: -10%, 14+ nights: -15%, 28+ nights: -25% (typical vacation rental market norms)
5. **Minimum stay rules** — per season (e.g., minimum 5 nights during December)
6. **Last-minute discounts** — optional: price reduction for bookings within 7 days of check-in (reduce vacancy)

**What NOT to build in v1:** Market-aware dynamic pricing (algorithmic, competitor-data-driven). This is PriceLabs/DPGO territory and requires ongoing data feeds. Rule-based pricing covers 90% of what a small host needs.

### Price Breakdown Display

Show this breakdown in the booking widget before the payment screen:

```
R$ 450/noite × 5 noites          R$ 2.250
Taxa de limpeza                      R$ 200
--------
Total                              R$ 2.450
```

Display the breakdown as soon as dates are selected — not after clicking "Book". Hiding fees until checkout is the single most-cited reason guests abandon and return to OTAs.

### Direct Booking Price Incentive

Guests are conditioned to expect OTA fees (Airbnb charges guests 14–16% service fee on top). Show the savings explicitly:

```
Reservar direto: R$ 2.450
Estimativa via Airbnb: ~R$ 2.840
Sua economia: R$ 390
```

This is a differentiator that converts skeptical guests who default to OTAs. Calculate dynamically (multiply total by 1.15 for the "OTA estimate").

### Financial Metrics Hosts Need

| Metric | Formula | Why It Matters |
|--------|---------|---------------|
| Occupancy Rate | booked_nights / available_nights × 100 | Primary demand signal; tracks calendar health |
| ADR (Average Daily Rate) | total_revenue / booked_nights | Tracks pricing effectiveness |
| RevPAR | ADR × occupancy_rate | Holistic performance metric combining price and demand |
| ALOS (Avg Length of Stay) | total_nights / number_of_bookings | Longer stays = lower turnover cost; key for operational planning |
| Monthly gross revenue | Sum of confirmed bookings per month | Cash flow planning |
| Revenue by channel | Direct vs OTA (manual tag) | Tracks progress toward OTA independence |

Display these on the admin dashboard as real-time KPIs. Monthly trend charts (last 12 months) are more useful than single numbers.

---

## Guest Trust and Conversion

### The Core Trust Problem

Guests defaulting to Airbnb are not being irrational. OTAs offer: recognized brand, buyer protection programs, review systems, and a dispute resolution mechanism. A direct booking site has none of these by default. The trust gap must be closed deliberately.

### Trust Signal Hierarchy (ordered by impact)

1. **HTTPS + visible security indicators** — table stakes; absence is catastrophic
2. **Stripe payment logo + accepted card logos** — Stripe is recognized; its presence signals professional payment infrastructure
3. **Cancellation policy in plain language, above the fold on the booking page** — "Se cancelar até X dias antes, reembolso total" removes the biggest objection
4. **Guest testimonials with real names** (manually curated by admin) — social proof that others have stayed and were happy
5. **Professional photography** — amateur photos signal risk; boutique hotel-quality photos signal legitimacy
6. **Price transparency before checkout** — showing the full breakdown before the payment step removes the "what am I actually paying" anxiety
7. **Host profile with photo and story** — humanizes the transaction; guests book people, not properties
8. **Response time indicator** — "Responde em menos de 2 horas" (even as a manually set badge) builds confidence for guests with questions

### Conversion Optimization Patterns

**Booking widget placement:** The date picker + price widget must be visible without scrolling on the property page. Guests who cannot immediately check availability leave.

**Progressive disclosure:** Show price estimate as soon as dates are entered (before the guest clicks any CTA). This surfaces value early and hooks the guest before they second-guess.

**Minimal checkout form:** Name, email, phone, number of guests, optional message. Do not ask for full address, date of birth, or identity document at booking time. Collect those post-confirmation if legally required.

**Guest checkout default:** No forced account creation. Booking with just email + name must be possible. Offer account creation as an optional step post-booking ("Save your details for future stays").

**Mobile checkout:** Test on actual devices. Common failure points: date picker unusable on mobile (use a touch-native calendar component), Stripe payment iframe not scaling correctly, form fields triggering zoom-in (font size < 16px on iOS causes auto-zoom).

**Social proof near the CTA:** Place the most recent testimonial directly above or adjacent to the "Reserve" button.

### Abandonment Recovery

Stripe Checkout exposes an abandonment recovery mechanism: when a Payment Intent is created but not completed, Stripe sends a webhook with a recovery URL. Use this to:

1. Capture the guest's email before redirecting to Stripe (on the HSI checkout form, collect email first)
2. If Stripe session expires without payment (typically after 24 hours), send one recovery email with the property photo, their selected dates, the price, and a direct link back to complete payment
3. Subject line pattern: "Sua reserva em [Nome do Imóvel] ainda está disponível"

**One recovery email only.** Two or more feels aggressive for high-value vacation bookings and damages trust.

---

## Brazilian Market Specifics

### Tax Reform Context (2024 Tax Reform — impacts 2026+)

The Brazilian 2024 tax reform reclassifies short-stay rentals (up to 90 days) as hospitality services for hosts who:
- Own more than 3 rented properties, OR
- Earn more than R$ 240.000/year from rentals

These hosts become subject to IBS + CBS on top of existing IRPF (income tax), with effective rates potentially reaching 35.9%–44.3%. This is the **business driver for HSI** — hosts need a direct channel to control their fiscal exposure.

**What this means for HSI reporting:**
- Monthly revenue reports must be clear, per-property, with gross amounts
- The system does not generate NF-e / NFS-e (this is out of scope for v1 — requires integration with fiscal authorities)
- But the financial export must be in a format a contador (accountant) can use directly: monthly gross revenue per property, per booking, with dates — CSV export sufficient
- Carnê-Leão compatible: monthly totals by income source allow the host to self-declare via the Receita Federal system

**Confidence:** HIGH — confirmed via multiple Brazilian tax and legal sources; Receita Federal official communications.

### Pix Payment (Critical for Brazilian Market)

Pix has 93% adult adoption in Brazil. 60 million Brazilians lack a credit card. Airbnb only added Pix support in mid-2024 — a direct booking system that supports Pix has a meaningful advantage.

**Implementation path:** Stripe added Pix support in August 2025 via EBANX partnership. This requires the host's Stripe account to be configured for Brazil and EBANX enabled. For HSI v1, this is a configuration concern, not an architectural one — Stripe's Payment Intents API accepts `pix` as a payment method type. The HSI checkout flow creates a PaymentIntent with `payment_method_types: ['card', 'pix']` and renders Stripe Elements or redirects to Stripe Checkout with Pix enabled.

**Important constraint:** Pix payments via Stripe/EBANX currently support a maximum of ~$3,000 USD per transaction. Most Brazilian vacation rental bookings are within this range. Verify per-instance if the host has premium properties with bookings above this threshold.

**Recommendation for v1:** Build with Pix support from day one. The alternative (card-only) is a material conversion problem in Brazil.

**Confidence:** HIGH for Pix market adoption data. MEDIUM for Stripe/EBANX implementation details — verify against current Stripe Brazil documentation before building.

### WhatsApp as Support Channel

Brazilian guests default to WhatsApp for any question. A direct booking site without a WhatsApp contact creates anxiety. This does not require building in-app messaging — a floating WhatsApp button with the host's number (configurable in instance settings) is sufficient. Deep link: `https://wa.me/55[number]?text=Olá, tenho uma dúvida sobre minha reserva`

### Language and Currency

- All guest-facing UI must be in Portuguese (pt-BR)
- Admin UI can be pt-BR with eventual English option
- Currency: BRL only, formatted as `R$ 1.450,00` (Brazilian convention: dot as thousands separator, comma as decimal — opposite of US format)
- Dates: DD/MM/YYYY (Brazilian convention)

### Trust Patterns Specific to Brazilian Guests

- CPF at checkout is sometimes expected for vacation rentals (legal requirement for fiscal notes if host issues them). For v1, make CPF an optional field, not required.
- Guests booking for New Year (Réveillon), Carnaval, and July school holidays book 3–6 months in advance. The calendar must handle far-future date ranges cleanly.
- Split payment (pagar em parcelas) is a strong cultural expectation in Brazil. Credit card installments (parcelamento) are a Stripe Brazil feature — investigate if Stripe supports installments for the host's Brazilian account. If yes, offer 2x and 3x sem juros as options.

---

## Feature Dependencies

```
Property CRUD (base prices, media) → Availability Calendar → iCal Export
iCal Import (OTA feeds) → Availability Calendar (merged view)
Availability Calendar → Booking Widget (date selection + price quote)
Pricing Rules → Booking Widget (price calculation)
Booking Widget → Stripe Checkout → Booking record creation
Booking record creation → iCal Export (feed updates) + Email confirmation
Email confirmation → Guest CRM (guest record created/updated)
Guest CRM → Financial Reports (revenue attributed to guest)
Financial Reports → Tax export (monthly CSV)
```

---

## MVP Feature Priority

**Must ship for any host to use HSI in production:**

1. Property management (CRUD, images, base pricing)
2. Availability calendar with manual blocking
3. iCal export (so OTAs stay updated)
4. iCal import (so OTA bookings block HSI calendar)
5. Booking widget with real-time pricing
6. Stripe checkout (card + Pix)
7. Booking confirmation email + voucher PDF
8. Admin dashboard with booking list and basic KPIs
9. Guest CRM (basic — name, email, stay history)

**Defer to next milestone:**
- Post-stay nurture email sequences (valuable but not blocking for launch)
- Abandonment recovery (valuable but requires email capture pre-Stripe redirect)
- Financial export (nice-to-have; hosts can calculate manually initially)
- Seasonal pricing rules (valuable but hosts can launch with manual override)
- Staff/permission system (valuable for multi-staff operations, not blocking for solo host)

---

## Sources

- [StayFi: 14 Ways to Increase Direct Bookings (2025)](https://stayfi.com/vrm-insider/2025/08/11/how-to-increase-vacation-rental-bookings/)
- [hostAI: Vacation Rental Website Design](https://gethostai.com/blog/vacation-rental-website-design)
- [Vacation Rental Formula: 3 Trust Signals](https://www.vacationrentalformula.com/blogs/3-trust-signals-every-vacation-rental-website-must-have)
- [Smoobu: Sync Airbnb & Booking.com Calendars](https://www.smoobu.com/en/blog/how-to-sync-airbnb-booking-com-calendars-to-avoid-double-bookings/)
- [Hotelub: iCal Guide for Vacation Rentals](https://hotelub.fr/en/ical-the-key-to-synchronized-calendar-management-for-vacation-rentals/)
- [AirROI: What Is iCal Sync](https://www.airroi.com/glossary/ical-sync)
- [Hostaway: Vacation Rental Pricing Factors](https://www.hostaway.com/blog/vacation-rental-pricing-factors/)
- [Guesty: Vacation Rental Pricing Strategies](https://www.guesty.com/blog/smarter-pricing-for-short-term-rentals/)
- [AvantStay: Dynamic Pricing Impact (Feb 2026)](https://avantstay.com/blog/dynamic-pricing-revenue-impact-vacation-rentals/)
- [Stripe: Recover Abandoned Carts](https://docs.stripe.com/payments/checkout/abandoned-carts)
- [Direct Booking Tools: Cart Abandonment](https://directbookingtools.com/cart-abandonment-the-hidden-revenue-killer/)
- [Baymard Institute: Checkout UX Best Practices 2025](https://baymard.com/blog/current-state-of-checkout-ux)
- [Vello: Occupancy Rate vs ADR vs RevPAR](https://stayvello.com/occupancy-rate-vs-adr-vs-revpar-the-3-metrics-every-owner-must-track/)
- [PriceLabs: Vacation Rental KPIs](https://hello.pricelabs.co/vacation-rental-kpis/)
- [Wander: Direct Booking vs OTA Hidden Costs](https://www.wander.com/article/the-hidden-cost-otas-why-the-smartest-property-managers-are-investing-in-direc)
- [Stripe: Pix Payments Documentation](https://docs.stripe.com/payments/pix)
- [Stripe/EBANX: Pix for Brazil (Aug 2025)](https://www.prnewswire.com/news-releases/stripe-users-can-now-accept-pix-in-brazil-via-ebanx-302526007.html)
- [Airbnb Pix Brazil announcement](https://news.airbnb.com/br/airbnb-anuncia-pix-para-pagamento-de-reservas/)
- [Brazil Tax Reform: Rentals above R$240k](https://en.clickpetroleoegas.com.br/nova-regra-pode-elevar-impostos-de-alugueis-no-airbnb-para-ate-443-com-tributacao-pelo-ibs-e-cbs-para-quem-fatura-acima-de-r-240-mil-ao-ano-ou-possui-mais-de-3-imoveis-alugados-ctl01/)
- [Receita Federal: Tax Reform Clarification 2026](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2026/janeiro/receita-federal-alerta-e-falso-que-201ctodo-proprietario-que-aluga-por-temporada-pagara-novo-imposto-imediato-sobre-o-aluguel-em-2026)
- [DPC: Tax Reform Changes for Individuals](https://www.dpc.com.br/tax-reform-what-changes-for-individuals-in-the-rent-and-sale-of-real-estate/?lang=en)
- [Breezeway: Repeat Guest Strategies](https://www.breezeway.io/blog/vacation-rental-repeat-guests)
- [Hosthub: Guest Retention](https://www.hosthub.com/blog/guest-retention-increase-repeat-guests-to-your-vacation-rentals/)
