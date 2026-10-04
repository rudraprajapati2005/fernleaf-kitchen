# Requirements traceability

Source of truth: Heizen Engineering Assignment PDF. Status is updated after verification.

Legend: `⬜ planned` · `🟡 implemented` · `✅ implemented + tested` · `❌ not implemented`

| ID | PDF | Requirement | Priority | Backend | Frontend | Test | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| G1 | 2 | Next.js frontend talks to NestJS over HTTP | Must | apps/api | apps/web lib/api | e2e | ⬜ |
| G2 | 2 | Prisma ORM + PostgreSQL | Must | prisma | n/a | integration | ⬜ |
| G3 | 2 | Live accounts: admin/kitchen/dispatch/driver @test.com / Test@1234 | Must | seed | login | e2e | ⬜ |
| G4 | 2 | Realistic seed: companies, menu, orders past/today/week, driver today | Must | seed | all screens | seed script | ⬜ |
| G5 | 3 | Four roles; one role per staff; admin creates staff | Must | auth, staff | staff UI | auth tests | ⬜ |
| G6 | 3 | Server-side permissions; no role-name scatter | Must | permissions guard | nav hide only | authz tests | ⬜ |
| C1 | 4.1 | Dishes: name, desc, image, SKU, temp, cost, allergens, tags, station, min qty | Must | catalogue | catalogue | catalogue | ⬜ |
| C2 | 4.1 | Deactivate dishes, never hard-delete | Must | catalogue | catalogue | catalogue | ⬜ |
| C3 | 4.1 | Reusable options with cost, allergens, tags | Must | catalogue | catalogue | catalogue | ⬜ |
| C4 | 4.1 | Option groups required/optional, order, options order | Must | catalogue | catalogue | combination tests | ⬜ |
| C5 | 4.1 | Portions with extra charge; group-level on/off | Should | catalogue | catalogue | combination tests | ⬜ |
| C6 | 4.1 | Admin-managed allergens, tags, stations, portion sizes | Must | settings/ref | settings | api | ⬜ |
| C7 | 4.1 | Combinations qty sum = dish qty; required groups; price formula | Must | orders domain | order form | domain combinations | ⬜ |
| C8 | 4.1 | Combo = kitchen unit | Must | kitchen | kitchen board | kitchen tests | ⬜ |
| C9 | 4.1 | Historical snapshots of what was ordered and prices | Must | orders | order detail | snapshot test | ⬜ |
| M1 | 4.2 | Ordered categories and items; activate/deactivate | Must | menu | menu | menu | ⬜ |
| M2 | 4.2 | Hide category/item per company; secret categories | Must | menu | menu, preview | menu preview | ⬜ |
| M3 | 4.2 | Employee menu preview including pricing | Must | menu | preview | pricing+menu | ⬜ |
| P1 | 4.3 | Named tiers; prices per dish/option; one default | Must | pricing | pricing | pricing domain | ⬜ |
| P2 | 4.3 | Company tier or default; missing dish price hides dish | Must | pricing | preview | pricing domain | ⬜ |
| P3 | 4.3 | Derived prices (cost× / tier±); override; round up to 5 cents | Must | pricing | pricing | pricing domain | ⬜ |
| P4 | 4.3 | Fast tier grid; missing prices visible | Must | pricing | pricing | ui | ⬜ |
| P5 | 4.3 | Price changes affect new orders only | Must | snapshots | n/a | snapshot test | ⬜ |
| CO1 | 4.4 | Company name, unique non-public domains, addresses, billing, owner | Must | companies | companies | companies | ⬜ |
| CO2 | 4.4 | Working days default Mon–Fri + holidays; no delivery those days | Must | companies | companies | calendar | ⬜ |
| CO3 | 4.4 | Company calendar does not move cut-off | Must | cutoff | n/a | cutoff tests | ⬜ |
| CO4 | 4.4 | Delivery defaults: time, leave-minutes, packaging, driver notes, default driver | Must | companies | companies | api | ⬜ |
| CO5 | 4.4 | Price tier + hidden menu | Must | companies | companies | menu | ⬜ |
| E1 | 4.5 | Employee of exactly one company; move changes rules | Must | employees | employees | employees | ⬜ |
| E2 | 4.5 | Flags: address, time, packaging; allergies; diet | Must | employees | employees | orders validation | ⬜ |
| E3 | 4.5 | CSV bulk import with row-level errors | Should | employees | employees | import test | ⬜ |
| O1 | 4.6 | Cut-off: N kitchen working days before at configured time | Must | cutoff domain | settings | cutoff tests | ⬜ |
| O2 | 4.6 | Create order: date, menu, combos, allowed fields, prices, place/draft | Must | orders | order form | orders | ⬜ |
| O3 | 4.6 | Server validation of all rules | Must | orders | errors | orders | ⬜ |
| O4 | 4.6 | Statuses Draft→Placed→Confirmed→Delivered + Cancelled, Rejected | Must | order state | orders | state machine | ⬜ |
| O5 | 4.6 | Before cutoff: edit/cancel drafts & placed; after: admin only | Must | orders | orders | orders | ⬜ |
| O6 | 4.6 | Cut-off: cancel drafts, confirm placed (billable), idempotent, manual trigger | Must | orders | orders/settings | cutoff processing | ⬜ |
| O7 | 4.6 | Paginated searchable list: date range, status, company, invoiced | Must | orders | orders | api | ⬜ |
| O8 | 4.6 | Detail: lines, options, money, delivery, timeline | Must | orders | order detail | ui | ⬜ |
| O9 | 4.6 | Admin override time/address/packaging after confirm | Must | orders | order detail | orders | ⬜ |
| K1 | 4.7 | Kitchen board by date; units by combo; station or Unassigned | Must | kitchen | kitchen | kitchen | ⬜ |
| K2 | 4.7 | Only confirmed; start/done rules; finish unstarted records start | Must | kitchen | kitchen | kitchen domain | ⬜ |
| K3 | 4.7 | Order kitchen started = first unit start; ready = all units done | Must | kitchen | kitchen | kitchen | ⬜ |
| K4 | 4.7 | Planned times from delivery − leave minutes − 30; late/at-risk | Must | kitchen | kitchen | kitchen | ⬜ |
| K5 | 4.7 | Admin force-complete | Must | kitchen | kitchen | kitchen | ⬜ |
| D1 | 4.8 | kitchen ready → dispatch ready → out → delivered; no skip/repeat | Must | dispatch | dispatch | dispatch | ⬜ |
| D2 | 4.8 | Out for delivery requires driver | Must | dispatch | dispatch | dispatch | ⬜ |
| D3 | 4.8 | Drop = company + address + exact time | Must | dispatch | dispatch | dispatch | ⬜ |
| D4 | 4.8 | Assign driver per drop (default company driver) | Must | dispatch | dispatch | dispatch | ⬜ |
| D5 | 4.8 | Driver: own drops today, time order, note+photo, phone UX, on-time | Must | dispatch | driver | dispatch | ⬜ |
| B1 | 4.9 | Confirmed orders owed by company; group into invoice; mark paid | Must | billing | billing | invoicing | ⬜ |
| B2 | 4.9 | Order on at most one invoice | Must | billing | billing | invoicing | ⬜ |
| S1 | 4.10 | Kitchen days, holidays, cutoff time & day count editable in app | Must | settings | settings | settings | ⬜ |
| DA1 | 4.11 | Role dashboards with documented calculations | Must | dashboards | dashboards | api | ⬜ |
| N1 | 7 | Integer money; totals reconcile | Must | domain | displays cents | money tests | ⬜ |
| N2 | 7 | Timezone-safe today/cutoff | Must | kitchen-time | ISO dates | cutoff tests | ⬜ |
| N3 | 7 | Concurrency-safe unit/order actions | Must | transactions | n/a | concurrency tests | ⬜ |
| N4 | 7 | Server pagination; kitchen board for busy day | Must | pagination | lists | api | ⬜ |
| N5 | 7 | Lint + typecheck; tests for cutoff, pricing, combinations, invoicing | Must | ci scripts | n/a | test suite | ⬜ |
