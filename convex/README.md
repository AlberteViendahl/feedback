# convex

Backend for Keep, built with [Convex](https://www.convex.dev). Not set up yet.

This is where the database schema (`schema.ts`), queries, mutations and the generated types
(`_generated/`) go. The admin dashboard (`apps/admin`) and the widget (`packages/widget`) will
read and write feedback through these functions.

Until then, the admin dashboard uses mock data with types that mirror the planned schema
(see `apps/admin/lib/types.ts`).

Keep backend code in this folder at the repository root.
