# Supabase Setup

Run these files in the Supabase SQL Editor for the linked project:

1. `schema.sql` creates the CRM tables, views, and permissive v1 RLS policies.
2. `seed.sql` inserts the bundled Aakash Group sample data.
3. `fix-security-invoker-views.sql` updates the summary views to use `security_invoker = true` if Supabase flags them.

After `schema.sql` has been run, the app can also seed through:

```bash
POST http://localhost:3000/api/seed?confirm=seed
```

Current v1 policy note: the SQL uses public read/write policies so the app can work with the supplied publishable key. For v2, replace those policies with authenticated, company-scoped policies before production use.
