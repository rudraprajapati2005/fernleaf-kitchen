# Out of scope

Source: Heizen Engineering Assignment, section 5.

Do **not** implement these. Where a workflow depends on one, simulate as specified.

| Out of scope | What we do instead |
| --- | --- |
| Payments by employees (cards, charging, refunds) | Every order is billed to the company (4.9). |
| Multiple order types (family style, catering trays, …) | One kind of order: individual boxed meals. |
| Individual customers without a company | Every customer belongs to a company. |
| Options included free with a dish | Every option is chosen (and priced via tiers). |
| Date-based menu scheduling (seasonal or festive menus) | Visibility is only `active` plus company hiding. |
| Pausing an employee's ordering | Not required. |
| Exports (CSV, prep sheets, labels, reports) | Not required. Employee CSV **import** [Should] is in scope. |
| Accounting software integration | Invoices are internal records only. |
| Recipe or costing software integration | Costs are entered by hand in the catalogue. |
| Promotional and coupon codes | Not required. |
| Sales tax calculation | No tax. Totals are pre-tax. |
| Delivery fees and delivery zones | No fees. Order total = sum of lines. |
| Audit logs | Not required. Order timeline events are operational, not a full audit log product. |
| Customer-facing ordering app | Staff create orders in the admin panel. |
| Email and notifications | Not required. Cut-off / notable actions log to the console. |
| Marketing campaigns and banners | Not required. |
