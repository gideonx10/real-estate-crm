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
