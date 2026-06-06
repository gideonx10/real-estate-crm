CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  initials VARCHAR(5),
  logo_url TEXT,
  brand_color VARCHAR(7) DEFAULT '#0D1B3E',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS builders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  legal_name VARCHAR(255),
  brand_tagline TEXT,
  brand_color VARCHAR(7) DEFAULT '#0D1B3E',
  logo_url TEXT,
  website VARCHAR(255),
  established_year INT,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  office_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brokers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  agency_firm VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  commission_rate DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  builder_id UUID REFERENCES builders(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(500) NOT NULL,
  description TEXT,
  price_from BIGINT,
  price_to BIGINT,
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Upcoming', 'Completed')),
  amenities TEXT[],
  total_units INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  unit_number VARCHAR(50),
  floor INT,
  area_sqft DECIMAL(10,2),
  price BIGINT,
  status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'Sold', 'Reserved')),
  buyer_lead_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  lead_source VARCHAR(20) DEFAULT 'Walk-in' CHECK (lead_source IN ('Walk-in', 'Broker', 'Online', 'Referral', 'Other')),
  broker_id UUID REFERENCES brokers(id) ON DELETE SET NULL,
  budget BIGINT,
  interested_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Site Visit', 'Converted', 'Lost')),
  notes TEXT,
  photo_url TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  location_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  activity_type VARCHAR(50),
  description TEXT,
  old_status VARCHAR(20),
  new_status VARCHAR(20),
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION authenticate_app_user(input_username TEXT, input_password TEXT)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  username VARCHAR,
  role VARCHAR,
  is_active BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT au.id, au.name, au.username, au.role, au.is_active
  FROM app_users au
  WHERE au.username = input_username
    AND au.password = input_password
    AND au.is_active = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_app_user_profile(input_user_id UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  username VARCHAR,
  role VARCHAR,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT au.id, au.name, au.username, au.role, au.is_active, au.created_at, au.updated_at
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
  RETURNING app_users.id, app_users.name, app_users.username, app_users.role, app_users.is_active, app_users.created_at, app_users.updated_at;
$$;

CREATE OR REPLACE VIEW project_stats
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.name,
  p.status,
  p.total_units,
  COUNT(u.id) FILTER (WHERE u.status = 'Available') AS available_units,
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

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE builders ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "v1 public read companies" ON companies;
DROP POLICY IF EXISTS "v1 public write companies" ON companies;
DROP POLICY IF EXISTS "v1 public read builders" ON builders;
DROP POLICY IF EXISTS "v1 public write builders" ON builders;
DROP POLICY IF EXISTS "v1 public read brokers" ON brokers;
DROP POLICY IF EXISTS "v1 public write brokers" ON brokers;
DROP POLICY IF EXISTS "v1 public read projects" ON projects;
DROP POLICY IF EXISTS "v1 public write projects" ON projects;
DROP POLICY IF EXISTS "v1 public read units" ON units;
DROP POLICY IF EXISTS "v1 public write units" ON units;
DROP POLICY IF EXISTS "v1 public read leads" ON leads;
DROP POLICY IF EXISTS "v1 public write leads" ON leads;
DROP POLICY IF EXISTS "v1 public read lead_activities" ON lead_activities;
DROP POLICY IF EXISTS "v1 public write lead_activities" ON lead_activities;
DROP POLICY IF EXISTS "v1 public read app_users" ON app_users;
DROP POLICY IF EXISTS "v1 public write app_users" ON app_users;

CREATE POLICY "v1 public read companies" ON companies FOR SELECT USING (true);
CREATE POLICY "v1 public write companies" ON companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "v1 public read builders" ON builders FOR SELECT USING (true);
CREATE POLICY "v1 public write builders" ON builders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "v1 public read brokers" ON brokers FOR SELECT USING (true);
CREATE POLICY "v1 public write brokers" ON brokers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "v1 public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "v1 public write projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "v1 public read units" ON units FOR SELECT USING (true);
CREATE POLICY "v1 public write units" ON units FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "v1 public read leads" ON leads FOR SELECT USING (true);
CREATE POLICY "v1 public write leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "v1 public read lead_activities" ON lead_activities FOR SELECT USING (true);
CREATE POLICY "v1 public write lead_activities" ON lead_activities FOR ALL USING (true) WITH CHECK (true);

REVOKE ALL ON FUNCTION authenticate_app_user(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION get_app_user_profile(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION update_app_user_profile(UUID, TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION authenticate_app_user(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_app_user_profile(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_app_user_profile(UUID, TEXT) TO anon, authenticated, service_role;
