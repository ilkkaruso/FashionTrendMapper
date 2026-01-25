-- migrations/002_trend_sources_junction.sql
-- Fix trend_sources to be a junction table for trend-source scores

-- Drop the old trend_sources table (was just a simple registry)
DROP TABLE IF EXISTS trend_sources CASCADE;

-- Recreate as a proper junction table for trend-source score tracking
CREATE TABLE trend_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id UUID REFERENCES trends(id) ON DELETE CASCADE NOT NULL,
  source_name TEXT NOT NULL,
  source_score NUMERIC(5,2) DEFAULT 0,
  source_url TEXT,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trend_id, source_name)
);

-- Index for efficient lookups by trend
CREATE INDEX idx_trend_sources_trend ON trend_sources(trend_id);

-- Index for efficient lookups by source
CREATE INDEX idx_trend_sources_source ON trend_sources(source_name);

-- Enable RLS
ALTER TABLE trend_sources ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read on trend_sources" ON trend_sources FOR SELECT USING (true);
