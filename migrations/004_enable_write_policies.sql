-- migrations/004_enable_write_policies.sql
-- Enable write operations for trends, trend_sources, and trend_history tables

-- Add UNIQUE constraint on trends.title for upsert support
ALTER TABLE trends ADD CONSTRAINT trends_title_unique UNIQUE (title);

-- INSERT policies (service_role only)
CREATE POLICY "Allow service role insert on trends"
  ON trends FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Allow service role insert on trend_sources"
  ON trend_sources FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Allow service role insert on trend_history"
  ON trend_history FOR INSERT
  TO service_role
  WITH CHECK (true);

-- UPDATE policies (service_role only)
CREATE POLICY "Allow service role update on trends"
  ON trends FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role update on trend_sources"
  ON trend_sources FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role update on trend_history"
  ON trend_history FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);
