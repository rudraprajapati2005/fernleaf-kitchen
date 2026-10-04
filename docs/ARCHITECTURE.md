# Architecture

```
Next.js (apps/web)
    HTTP/REST + JWT
NestJS (apps/api)
    Controller
    Application service
    Domain (packages/domain + module domain/)
    Repository
    Prisma
    PostgreSQL
```

## Layout

```
project/
  apps/web          Next.js App Router admin UI
  apps/api          NestJS HTTP API + Prisma
  packages/domain   Pure business rules (unit-tested)
  packages/types    Shared DTOs / enums
  docs/
  docker-compose.yml
```

## Request flow

1. Browser calls `NEXT_PUBLIC_API_URL` via a single `lib/api/client.ts`.
2. NestJS global `ValidationPipe` + JWT auth guard + permission guard.
3. Controllers map HTTP ↔ DTO only.
4. Services orchestrate transactions and call domain functions.
5. Prisma repositories persist. Domain never imports Prisma.

## AuthZ

`Permission` strings mapped from `StaffRole`. Guards require a permission. Driver endpoints additionally filter by `staff.id`.

## Time

All “calendar dates” are kitchen-timezone civil dates (`YYYY-MM-DD`). Instants are stored as UTC `DateTime`. Conversion is centralized in `kitchen-time.ts`.

## Modules (API)

`auth`, `staff`, `catalogue`, `menu`, `pricing`, `companies`, `employees`, `orders`, `kitchen`, `dispatch`, `billing`, `settings`, `dashboards`.
