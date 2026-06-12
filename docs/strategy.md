# LieferRadar — Strategy Memo

Working document. Last updated: June 2026.

## Problem

Purchasing teams in small and mid-sized German manufacturers track open supplier
orders in their ERP, but the actual communication — "Haben Sie die Bestellung
erhalten? Bleibt der Liefertermin?" — happens over phone and email. The ERP
knows what was ordered; nobody knows reliably *when it will actually arrive*.
A missing order confirmation (AB) or a silently slipping date surfaces only
when production is already waiting for the part.

ERP systems (SAP, proAlpha, abas, SOG, VARIO, ALPHAPLAN) offer "Liefererinnerungen":
one-way dunning emails on overdue positions. They send mail into the void.
Nothing structures the supplier's answer, nothing feeds reliability data back,
and the buyer is still reconciling replies by hand.

## Who we serve first

Einkaufsleiter / purchasing clerks at machine builders and metal processors,
10–250 employees, 1–5 buyers, 30–300 open POs at any time, suppliers mostly
small German/EU firms without EDI. They will not run an integration project
and their suppliers will not adopt another portal login.

## Why the magic-link wedge

Supplier portals fail on the supplier side: industry surveys put portal
adoption failure above 60%, and a typical supplier already juggles around a
dozen customer portals. Our wedge is that the supplier never logs in: one
click from the email, four buttons, done — mobile, in German. The buyer gets a
structured status instead of a free-text reply, and every interaction feeds
the scorecard.

US validation: SourceDay sells exactly this loop (PO acknowledgment,
escalating reminders, supplier scorecards) to SMB manufacturers and reports
customers moving on-time delivery from ~68% to ~89%. There is no German-first,
SMB-priced equivalent. Tacto (€55M raised) proves Mittelstand procurement
budgets exist, but sells a broad procurement OS to larger mid-market —
adjacent, not this wedge.

## Competition, honestly

| Alternative | Why customers pick it | Why we win anyway |
|---|---|---|
| Status quo (Excel + Outlook + phone) | Free, familiar | We remove the chasing, not just record it; ROI counter makes saved work visible |
| ERP dunning module | Already paid for | One-way mail, no structured response, no scorecard, often unused because it needs ERP customizing |
| SAP Business Network / Ariba | SAP brand, deep S/4 integration | Charges *suppliers* transaction fees past trivial volume — widely resented by small vendors; our suppliers are always free and never log in. Most of our ICP doesn't run SAP at all |
| Tacto, Onventis, SupplyOn | Breadth, compliance features | Priced and scoped for bigger companies; we are live in a day at a fraction of the cost |
| Remira (LOGOMATE, S&OP suite) | Demand forecasting, inventory optimization, enterprise references (Zalando, BMW) | Different category: planning suites optimize *what and how much* to order; we close the loop on *whether it actually arrives*. A Remira customer is out-of-ICP, not a lost deal |
| SourceDay | Mature product | US-centric, English-first, ERP-integration-led sales; no DACH presence or DSGVO data-residency story |

Frequently confused non-competitors: digital agencies and SAP consultancies
(e.g. Medienwerft, part of FIS-Gruppe) build commerce platforms and ERP
projects for clients — they are a potential *referral channel*, not a rival
product.

The real competitor is the status quo. The product must be adoptable in one
afternoon from a CSV export — that constraint drives everything. The "SAP
already does this" objection is answered in the product itself: suppliers free
forever, no login, live in a day — and an API/webhook/MCP surface that drops
into n8n/Make/Zapier automations and AI-agent workflows, which ERP dunning
modules cannot do.

## Business model (hypothesis to validate)

- Per-organization subscription, staged by open-PO volume: ~€149/month up to
  100 active POs, ~€299/month above. Suppliers always free.
- 8-week free pilot, white-glove CSV setup, success metric agreed up front
  (e.g. supplier response rate, overdue POs caught early).
- Target: 10 paying customers ≈ €20–30k ARR proves willingness to pay;
  break-even on infrastructure is trivial (one VPS).

## Go-to-market

1. **Pilot phase (now):** 5 design partners via direct outreach to
   Einkaufsleiter — IHK networks, Maschinenbau clusters (VDMA regional
   groups), LinkedIn, personal referrals. The live demo is the pitch.
2. **Repeatable motion:** German-language SEO on the exact pain keywords
   ("Lieferant antwortet nicht", "Auftragsbestätigung mahnen",
   "Lieferterminverfolgung Excel"), case study with pilot numbers,
   ERP-Berater (consultants for proAlpha/abas/SAP B1) as referral channel.
3. **Expansion:** more buyers per org (seats), then adjacent workflows
   (AB matching, inbound email parsing) raise switching costs.

## Moat (built, not assumed)

Day one there is none — speed and focus are the only advantages. Durable moats
in order of attainability: (1) workflow lock-in once reminder history and
scorecards accumulate, (2) supplier familiarity — the same supplier sees
LieferRadar links from multiple customers and responds faster, (3) cross-org
supplier reliability benchmarks (opt-in, anonymized, DSGVO-reviewed) — this is
the data asset nobody else in the niche has.

## Top risks

1. **Distribution, not product.** Mittelstand buys slowly and through trust.
   Mitigation: pilots over self-serve, referral channel through ERP consultants.
2. **Supplier response rates.** If suppliers ignore the emails, the product is
   an expensive reminder tool. Measure response rate per pilot from week one;
   escalation to buyer CC and phone-fallback flags are already built.
3. **ERP "good enough".** An ERP vendor could ship a magic-link feature.
   Mitigation: speed, supplier-side UX, and cross-customer data they can't have.
4. **Email deliverability.** Reminders must land in inboxes: dedicated sending
   domain, SPF/DKIM/DMARC, per-customer sending subdomains on the roadmap.
5. **Single-founder bandwidth.** Sales and product compete for the same hours;
   the pilot phase must be timeboxed (12 weeks) with explicit kill/continue criteria.

## Kill / continue criteria after pilot phase

Continue if, across ≥3 pilots: supplier response rate ≥50% within 48h,
≥60% of weekly active buyers return unprompted in week 6+, and ≥2 pilots
convert to paid. Otherwise revisit the wedge (likely pivot: inbound
email-parsing assistant for purchasing instead of outbound chasing).

## Product roadmap (sequenced by sales need)

1. **Now (pilot-ready):** CSV import, magic links, reminders, scorecard,
   dashboard, DE/EN, status updates and link sharing by the buyer.
2. **Next (first paying customers):** team accounts (invite buyers),
   inbound email parsing (supplier replies update status), Outlook add-in,
   per-customer sending domains.
3. **Later (repeatable sales):** ERP connectors (SAP B1, proAlpha, abas —
   CSV-watch first, API second), AB/order-confirmation matching,
   supplier reliability benchmarks, SLA reports for management.
