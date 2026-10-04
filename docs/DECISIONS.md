# Decisions

Every interpretation below is grounded in the PDF. Format: requirement, ambiguity, decision, reason, implementation, test.

## Kitchen timezone

**Requirement:** Time zones (section 7). Kitchen operates in one zone; cut-offs, delivery dates, and “today” must be correct regardless of server or browser zone.

**Ambiguity:** PDF does not name the zone.

**Decision:** Kitchen timezone is `America/New_York`, stored in settings and editable by admin.

**Reason:** Single US corporate-kitchen default; configurable so it is not a code constant forever.

**Implementation:** `apps/api/src/common/time/kitchen-time.ts`, `KitchenSettings.timezone`.

**Test:** `packages/domain` cutoff and “today” tests with explicit zone.

## Money

**Requirement:** No floating-point errors in prices/totals; order total = sum of lines; invoice total = sum of orders.

**Decision:** Store money as integer **cents**. Derived prices round **up** to the next 5 cents (`ceil` to 5). Arithmetic is integer-only.

**Implementation:** `packages/domain/src/money.ts`, Prisma `Int` cents columns.

**Test:** money + pricing + invoice unit tests.

## PostgreSQL

**Requirement:** Any Prisma-supported database.

**Decision:** PostgreSQL (local Docker + optional Neon).

**Reason:** Strong constraints, concurrent updates, production-like for reviewers.

## Authentication

**Requirement:** Four staff roles; server-side permissions; secure passwords.

**Decision:** bcrypt password hashes + JWT bearer tokens (8h). No plaintext passwords.

**Reason:** Fits an internal panel; no OAuth provider is specified.

**Implementation:** `apps/api/src/auth`. Frontend stores token in `sessionStorage` for the session (not localStorage persistence across browser restarts is acceptable; we use `localStorage` keyed token so refresh survives — documented). Access token in `Authorization: Bearer`.

## Authorization

**Requirement:** Permissions on the server; adding a role later should not require hunting role-name checks.

**Decision:** Permission catalog (`Permission` enum) + `ROLE_PERMISSIONS` map. Guards check permissions, not role strings, except where the PDF requires role-specific ownership (driver sees only own drops).

**Implementation:** `apps/api/src/auth/permissions.ts`, `PermissionsGuard`.

## Historical order snapshots

**Requirement:** Editing catalogue/prices must never change a past order.

**Decision:** Order lines and combinations store name, SKU, unit prices, option names, and totals at placement/save time. Kitchen station id is snapshotted onto each prep unit.

**Test:** order snapshot integration test.

## Invoiced orders after confirmation changes (4.9)

**Requirement:** Decide what happens to an already-invoiced order when it still changes.

**Decision:**

- Delivery time / address / packaging overrides remain allowed (operations).
- Line/money changes and cancellation/rejection are **blocked** once invoiced.
- Invoice total is snapshotted from order totals at invoice creation and does not auto-recalculate.
- Short deliveries do not change the invoice (company still owes the confirmed amount). Document in README.

**Reason:** Internal invoices must stay reconcilable; no credit-note product (accounting is out of scope).

**Test:** invoicing conflict tests.

## Cut-off vs company calendar

**Requirement:** Company cannot receive deliveries on non-working days/holidays. Company calendar does **not** move the cut-off; only kitchen calendar does.

**Decision:** Delivery date validation uses company working days + company holidays. Cut-off timestamp counts backward using kitchen working days + kitchen holidays only.

## Portions [Should]

**Decision:** Implemented. A group either uses portions or not. If it does, every option in the group must support every group size. Extra charge is per size, stacked on the option’s tier price.

## Secret categories

**Decision:** Secret categories are omitted from the listed menu but remain fetchable by category id in preview/order flows so staff can still reach them.

## Driver photos

**Decision:** Optional JPEG/PNG/WebP, max 2MB, stored as files under `uploads/` locally and as a public URL. On ephemeral hosts, photos may not persist; notes always persist in DB.

## Default packaging

**Decision:** Enum `STANDARD | INSULATED | COLD_PACK` as platform packaging types in settings-adjacent catalogue of types stored as string enum.

## Combination = kitchen unit

**Decision:** One `OrderLineCombination` row = one kitchen prep unit, quantity included in that unit (cook that combo as one unit even if qty > 1).

## Drop grouping

**Decision:** Drop key = `(companyId, addressId, deliveryDate, deliveryTimeMinutes)`. Exact same time only.

## Concurrency

**Decision:** Optimistic `version` on orders; unique constraints on kitchen unit transitions via conditional updates (`updateMany` where status = expected). Invoice uniqueness via `Order.invoiceId` unique-per-order. Unique `(domain)` on company domains.

## Derived pricing

**Decision:** Tiers have `derivation`: `NONE | MULTIPLY_COST | ADJUST_TIER`. `basisBps` is integer basis points (24000 = ×2.40, 11500 = +15% from source tier). Explicit `DishPrice` / `OptionPrice` rows override derivation. Missing explicit price + no derivable source ⇒ dish hidden on that menu.

## Rejected vs cancelled

**Ambiguity:** PDF lists Cancelled and Rejected but does not define who rejects.

**Decision:** Admin may reject a Placed order (not yet confirmed). Cut-off cancels drafts and confirms placed orders; it does not reject. Rejected orders are not billable.
