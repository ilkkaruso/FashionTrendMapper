-- migrations/003_add_current_score.sql
-- Add current_score column to trends table for tracking normalized scores

ALTER TABLE trends
ADD COLUMN current_score NUMERIC(5,2) DEFAULT 0;

-- Index for sorting trends by score
CREATE INDEX idx_trends_current_score ON trends(current_score DESC);
