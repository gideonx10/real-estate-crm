-- Migration: Create project_brochures table for multi-brochure support
-- Run this against your Supabase database

CREATE TABLE IF NOT EXISTS project_brochures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'brochure.pdf',
  url TEXT NOT NULL,
  public_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE project_brochures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "v1 public read project_brochures" ON project_brochures;
DROP POLICY IF EXISTS "v1 public write project_brochures" ON project_brochures;

CREATE POLICY "v1 public read project_brochures" ON project_brochures FOR SELECT USING (true);
CREATE POLICY "v1 public write project_brochures" ON project_brochures FOR ALL USING (true) WITH CHECK (true);
