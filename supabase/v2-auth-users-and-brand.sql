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

ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "v1 public read app_users" ON app_users;
DROP POLICY IF EXISTS "v1 public write app_users" ON app_users;

INSERT INTO app_users (id, name, username, password, role, is_active, created_at, updated_at) VALUES
('00000000-0000-4000-8000-000000000701', 'Axay', 'admin@axay', 'axaykhokhar', 'admin', true, NOW(), NOW()),
('00000000-0000-4000-8000-000000000702', 'Axay2', 'gideonx10', 'jaimataji', 'admin', true, NOW(), NOW())
ON CONFLICT (username) DO UPDATE SET
  name = EXCLUDED.name,
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

UPDATE companies
SET name = 'Aakarsh Group',
    logo_url = '/aakarsh-group-logo.png'
WHERE id = '00000000-0000-4000-8000-000000000001';

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

REVOKE ALL ON FUNCTION authenticate_app_user(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION get_app_user_profile(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION update_app_user_profile(UUID, TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION authenticate_app_user(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_app_user_profile(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_app_user_profile(UUID, TEXT) TO anon, authenticated, service_role;
