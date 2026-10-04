# Edge cases (from the PDF)

## Catalogue / combinations

- Combination quantities that do not sum to dish quantity.
- Missing a required option group.
- Optional group left empty (allowed).
- Portion group where an option lacks a group size.
- Inactive dish cannot be newly ordered; historical lines still display.
- Minimum order quantity on a dish.

## Pricing

- Company with no tier → default tier.
- Dish with no resolvable price → omitted from menu (not $0).
- Override vs derived price.
- Round $2.11 → $2.15; already on 5 cents stays.
- Option-only missing price: combination invalid / dish still shown if dish priced? Decision: options without a price cannot be selected; if a **required** group has no priced options, the dish is omitted.

## Calendar / cutoff

- Wednesday delivery, 2 working days, 16:00 → Monday 16:00.
- Kitchen holiday Monday → count back to Friday.
- Weekend kitchen days skipped.
- Company holiday blocks delivery date but does not shift cutoff.
- Cutoff processing twice is a no-op after first success.
- Manual trigger for a past cutoff date.
- Browser in UTC vs kitchen in America/New_York around midnight.

## Orders

- Edit after cutoff as kitchen → 403; as admin → allowed.
- Draft at cutoff → cancelled, not billable.
- Placed at cutoff → confirmed, billable.
- Rejected never billable.
- Employee moved companies: new orders use new company rules; existing orders keep company snapshot.
- Employee cannot change time → server rejects time ≠ company default unless admin.

## Kitchen

- Start twice → conflict.
- Done twice → conflict.
- Done without start → start+done recorded.
- Unconfirmed order units not workable.
- Force-complete sets remaining units done and kitchen ready.
- First unit start sets order kitchenStartedAt; last unit done sets kitchenReadyAt.
- Delivery time change updates planned timestamps.

## Dispatch / driver

- Out for delivery without driver → rejected.
- Skip dispatch-ready → rejected.
- Driver A cannot complete Driver B’s drop (API).
- On-time: deliveredAt compared to delivery instant in kitchen TZ.
- Same company, same address, **different** minute → two drops.

## Billing

- Duplicate invoice of same order → conflict.
- Mix companies on one invoice → rejected.
- Unconfirmed order invoicing → rejected.
- Post-invoice cancel → rejected.

## Concurrency

- Two kitchen “done” requests; only one succeeds.
- Two invoices racing for the same order; one wins.

## Auth

- Direct API as driver to admin routes → 403.
- IDOR: driver delivery id belonging to another driver → 404/403.
