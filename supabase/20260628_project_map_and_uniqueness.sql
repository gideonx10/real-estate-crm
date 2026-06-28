-- Adds map coordinates for projects/builders and prevents exact duplicate projects.

ALTER TABLE builders
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7);

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7);

WITH ranked_projects AS (
  SELECT
    id,
    FIRST_VALUE(id) OVER (
      PARTITION BY company_id, lower(trim(name)), lower(trim(location))
      ORDER BY created_at ASC, id ASC
    ) AS keeper_id,
    ROW_NUMBER() OVER (
      PARTITION BY company_id, lower(trim(name)), lower(trim(location))
      ORDER BY created_at ASC, id ASC
    ) AS row_number
  FROM projects
)
UPDATE units
SET project_id = ranked_projects.keeper_id
FROM ranked_projects
WHERE units.project_id = ranked_projects.id
  AND ranked_projects.row_number > 1;

WITH ranked_projects AS (
  SELECT
    id,
    FIRST_VALUE(id) OVER (
      PARTITION BY company_id, lower(trim(name)), lower(trim(location))
      ORDER BY created_at ASC, id ASC
    ) AS keeper_id,
    ROW_NUMBER() OVER (
      PARTITION BY company_id, lower(trim(name)), lower(trim(location))
      ORDER BY created_at ASC, id ASC
    ) AS row_number
  FROM projects
)
UPDATE leads
SET interested_project_id = ranked_projects.keeper_id
FROM ranked_projects
WHERE leads.interested_project_id = ranked_projects.id
  AND ranked_projects.row_number > 1;

WITH ranked_projects AS (
  SELECT
    id,
    FIRST_VALUE(id) OVER (
      PARTITION BY company_id, lower(trim(name)), lower(trim(location))
      ORDER BY created_at ASC, id ASC
    ) AS keeper_id,
    ROW_NUMBER() OVER (
      PARTITION BY company_id, lower(trim(name)), lower(trim(location))
      ORDER BY created_at ASC, id ASC
    ) AS row_number
  FROM projects
)
UPDATE project_price_history
SET project_id = ranked_projects.keeper_id
FROM ranked_projects
WHERE project_price_history.project_id = ranked_projects.id
  AND ranked_projects.row_number > 1;

WITH ranked_projects AS (
  SELECT
    id,
    FIRST_VALUE(id) OVER (
      PARTITION BY company_id, lower(trim(name)), lower(trim(location))
      ORDER BY created_at ASC, id ASC
    ) AS keeper_id,
    ROW_NUMBER() OVER (
      PARTITION BY company_id, lower(trim(name)), lower(trim(location))
      ORDER BY created_at ASC, id ASC
    ) AS row_number
  FROM projects
)
UPDATE project_brochures
SET project_id = ranked_projects.keeper_id
FROM ranked_projects
WHERE project_brochures.project_id = ranked_projects.id
  AND ranked_projects.row_number > 1;

WITH ranked_projects AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY company_id, lower(trim(name)), lower(trim(location))
      ORDER BY created_at ASC, id ASC
    ) AS row_number
  FROM projects
)
DELETE FROM projects
USING ranked_projects
WHERE projects.id = ranked_projects.id
  AND ranked_projects.row_number > 1;

CREATE INDEX IF NOT EXISTS idx_builders_coordinates
  ON builders (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_projects_coordinates
  ON projects (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS projects_company_name_location_unique
  ON projects (company_id, lower(trim(name)), lower(trim(location)));
