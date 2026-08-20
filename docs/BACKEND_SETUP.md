# Connecting the Backend (Phase 2)

This is the concrete path from static mock data to a real Postgres-backed platform.

The frontend is already set up to expect this flow. The missing work is the database config, the Prisma client wiring, and then replacing the static repository functions with Prisma queries.

---

## 1. Stand up Postgres

Pick one:

- Neon
- Supabase
- Railway

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL`
- `DIRECT_URL`

## 2. Migrate the schema

The schema lives in `prisma/schema.prisma`.

```bash
npx prisma migrate dev --name init
npx prisma generate
```

This creates the tables and generates the Prisma client in `generated/prisma`.

## 3. Add Prisma config and client

Create `prisma.config.ts`:

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
    shadowDatabaseUrl: env("DIRECT_URL"),
  },
});
```

Create `lib/prisma.ts`:

```ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL");
}

const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });
```

## 4. Swap the repository layer

`lib/data/repository.ts` still reads static arrays today. Replace each function body with the equivalent Prisma query.

The first target should be:

- `getProducts`
- `getProductBySlug`
- `getProductBySerial`
- `getCategories`
- `getBrandBySlug`
- `getBrands`
- `getRelatedProducts`

## 5. Serial number + QR generation

These are already scaffolded:

- `lib/serial.ts`
- `lib/qr.ts`
- `app/api/products/[id]/approve/route.ts`
- `app/api/verify/route.ts`

Once Prisma is wired, the approval route should:

- verify the product is awaiting review
- generate a unique serial number
- generate the QR code
- save both to the database
- mark the product approved

## 6. Auth and roles

Not built yet.

We still need:

- brand login/signup
- admin login
- role-based route protection
- httpOnly cookie auth

## 7. File storage

Not built yet.

We still need storage for:

- product images
- evidence files
- generated OriginCard files

## 8. Suggested build order

1. Database connection and Prisma client
2. Repository swap from static data to Prisma
3. Brand auth
4. Product submission form
5. Admin review and approval flow
6. QR generation and scan tracking
