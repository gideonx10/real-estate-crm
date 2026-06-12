CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE app_users
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS avatar_public_id TEXT;

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS avatar_public_id TEXT;

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS brochure_url TEXT,
ADD COLUMN IF NOT EXISTS brochure_public_id TEXT;

DROP VIEW IF EXISTS dashboard_summary;
DROP VIEW IF EXISTS project_stats;

ALTER TABLE units
DROP CONSTRAINT IF EXISTS units_status_check;

ALTER TABLE units
ALTER COLUMN status TYPE VARCHAR(30),
ALTER COLUMN status SET DEFAULT 'Available';

ALTER TABLE units
ADD CONSTRAINT units_status_check
CHECK (status IN ('Available', 'Under Negotiation', 'Sold', 'Reserved'));

CREATE OR REPLACE VIEW project_stats
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.name,
  p.status,
  p.total_units,
  COUNT(u.id) FILTER (WHERE u.status = 'Available') AS available_units,
  COUNT(u.id) FILTER (WHERE u.status = 'Under Negotiation') AS under_negotiation_units,
  COUNT(u.id) FILTER (WHERE u.status = 'Sold') AS sold_units,
  COUNT(u.id) FILTER (WHERE u.status = 'Reserved') AS reserved_units,
  ROUND(COUNT(u.id) FILTER (WHERE u.status = 'Sold') * 100.0 / NULLIF(p.total_units, 0), 0) AS percent_sold
FROM projects p
LEFT JOIN units u ON u.project_id = p.id
GROUP BY p.id, p.name, p.status, p.total_units;

CREATE OR REPLACE VIEW dashboard_summary
WITH (security_invoker = true) AS
SELECT
  c.id AS company_id,
  (SELECT COUNT(*) FROM projects WHERE company_id = c.id) AS total_projects,
  (SELECT COALESCE(SUM(available_units), 0) FROM project_stats ps JOIN projects pr ON ps.id = pr.id WHERE pr.company_id = c.id) AS available_units,
  (SELECT COALESCE(SUM(sold_units), 0) FROM project_stats ps JOIN projects pr ON ps.id = pr.id WHERE pr.company_id = c.id) AS sold_units,
  (SELECT COUNT(*) FROM leads WHERE company_id = c.id) AS total_leads
FROM companies c;

CREATE TABLE IF NOT EXISTS project_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  price_from BIGINT NOT NULL,
  price_to BIGINT NOT NULL,
  note TEXT,
  effective_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE project_price_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "v1 public read project_price_history" ON project_price_history;
DROP POLICY IF EXISTS "v1 public write project_price_history" ON project_price_history;

CREATE POLICY "v1 public read project_price_history" ON project_price_history FOR SELECT USING (true);
CREATE POLICY "v1 public write project_price_history" ON project_price_history FOR ALL USING (true) WITH CHECK (true);

DROP FUNCTION IF EXISTS get_app_user_profile(UUID);
DROP FUNCTION IF EXISTS update_app_user_profile(UUID, TEXT);

CREATE OR REPLACE FUNCTION get_app_user_profile(input_user_id UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  username VARCHAR,
  role VARCHAR,
  is_active BOOLEAN,
  avatar_url TEXT,
  avatar_public_id TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT au.id, au.name, au.username, au.role, au.is_active, au.avatar_url, au.avatar_public_id, au.created_at, au.updated_at
  FROM app_users au
  WHERE au.id = input_user_id
    AND au.is_active = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION update_app_user_profile(input_user_id UUID, input_name TEXT)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  username VARCHAR,
  role VARCHAR,
  is_active BOOLEAN,
  avatar_url TEXT,
  avatar_public_id TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE app_users
  SET name = input_name,
      updated_at = NOW()
  WHERE id = input_user_id
    AND is_active = true
  RETURNING app_users.id, app_users.name, app_users.username, app_users.role, app_users.is_active, app_users.avatar_url, app_users.avatar_public_id, app_users.created_at, app_users.updated_at;
$$;

REVOKE ALL ON FUNCTION get_app_user_profile(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION update_app_user_profile(UUID, TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION get_app_user_profile(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_app_user_profile(UUID, TEXT) TO anon, authenticated, service_role;
